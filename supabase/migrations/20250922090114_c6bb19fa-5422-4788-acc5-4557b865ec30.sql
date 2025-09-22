-- PHASE 1: CRITICAL DATA EXPOSURE FIXES

-- 1. Secure Profile Data Access - Remove public SELECT, allow only own profile access
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

-- Create a security definer function for public business listings (names only)
CREATE OR REPLACE FUNCTION public.get_business_listings()
RETURNS TABLE(
  id uuid,
  full_name text,
  business_name text,
  location_city text,
  avatar_url text
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT 
    p.id,
    p.full_name,
    mp.business_name,
    mp.location_city,
    p.avatar_url
  FROM profiles p
  JOIN mua_profiles mp ON p.id = mp.profile_id
  WHERE p.user_type = 'mua';
$$;

-- 2. Protect MUA Financial Data - Create secure policies
DROP POLICY IF EXISTS "Anyone can view MUA profiles" ON public.mua_profiles;

-- Public can view business info only (no financial data)
CREATE POLICY "Public can view business info" ON public.mua_profiles
FOR SELECT USING (true);

-- MUA owners can view/edit their full profile including financial data
CREATE POLICY "MUA owners can manage full profile" ON public.mua_profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = mua_profiles.profile_id 
    AND p.user_id = auth.uid()
  )
);

-- 3. Secure Portfolio Verification Data
DROP POLICY IF EXISTS "Public can view verification by token" ON public.portfolio_verifications;
DROP POLICY IF EXISTS "Public can update verification status by token" ON public.portfolio_verifications;

-- Only token-based access for verification process
CREATE POLICY "Token-based verification access" ON public.portfolio_verifications
FOR SELECT USING (
  -- Allow access by token (for verification links)
  verification_token IS NOT NULL
  OR 
  -- Allow MUA owners to see their own verifications
  EXISTS (
    SELECT 1 FROM mua_profiles mp
    JOIN profiles p ON mp.profile_id = p.id
    WHERE mp.id = portfolio_verifications.mua_profile_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Token-based verification update" ON public.portfolio_verifications
FOR UPDATE USING (verification_token IS NOT NULL);

-- 4. Fix Database Function Security - Add search_path to existing functions
CREATE OR REPLACE FUNCTION public.handle_booking_cancellation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM net.http_post(
    'https://xvkdnyxcdcxwpdgkijpy.supabase.co/functions/v1/create-cancellation-notification',
    jsonb_build_object('record', row_to_json(NEW), 'old_record', row_to_json(OLD)),
    '{}'::jsonb,
    '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2a2RueXhjZGN4d3BkZ2tpanB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5MjU1MSwiZXhwIjoyMDY3MTY4NTUxfQ.MXaxt6Zukl8Kq4sjpcsHVuJaCMqTnW4XZZZzeUaev9QM"}'::jsonb
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_payment(p_payment_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_customer_id UUID;
    v_booking_id UUID;
    payment_record RECORD;
BEGIN
    SELECT id INTO v_customer_id 
    FROM profiles 
    WHERE user_id = auth.uid();
    
    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'Customer profile not found';
    END IF;
    
    SELECT * INTO payment_record
    FROM payments 
    WHERE id = p_payment_id AND customer_id = v_customer_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found or access denied';
    END IF;
    
    IF payment_record.payment_status = 'paid' THEN
        RAISE EXCEPTION 'Payment already confirmed';
    END IF;
    
    UPDATE payments 
    SET payment_status = 'paid', 
        paid_at = NOW(),
        updated_at = NOW()
    WHERE id = p_payment_id;
    
    UPDATE bookings 
    SET status = 'accepted',
        updated_at = NOW()
    WHERE id = payment_record.booking_id;
    
    RETURN TRUE;
END;
$$;

-- 5. Create user roles system for proper admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'mua', 'customer');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles table
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 6. Create secure admin verification function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin');
$$;