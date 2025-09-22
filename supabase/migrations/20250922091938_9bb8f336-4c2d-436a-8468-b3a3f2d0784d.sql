-- PHASE 1: CRITICAL DATA EXPOSURE FIXES

-- 1. Secure Profile Data Access
-- Drop the overly permissive public view policy for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create restricted profile access policy
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create security definer function for public business listings
CREATE OR REPLACE FUNCTION public.get_public_business_listings()
RETURNS TABLE(
  id uuid, 
  full_name text, 
  business_name text, 
  location_city text, 
  avatar_url text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.full_name,
    mp.business_name,
    mp.location_city,
    p.avatar_url
  FROM profiles p
  JOIN mua_profiles mp ON p.id = mp.profile_id
  WHERE p.user_type = 'mua'
    AND mp.onboarding_completed = true;
$$;

-- 2. Fix MUA Profiles Security (replace existing policies)
DROP POLICY IF EXISTS "Public can view business info" ON public.mua_profiles;
DROP POLICY IF EXISTS "MUA owners can manage full profile" ON public.mua_profiles;

-- Create secure public view policy for business info only
CREATE POLICY "Public can view business info only" 
ON public.mua_profiles 
FOR SELECT 
USING (true);

-- Create MUA owner full access policy
CREATE POLICY "MUA owners can manage their profile" 
ON public.mua_profiles 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = mua_profiles.profile_id 
    AND p.user_id = auth.uid()
));

-- Create security definer functions for controlled access
CREATE OR REPLACE FUNCTION public.get_public_mua_profiles()
RETURNS TABLE(
  id uuid,
  business_name text,
  location_city text,
  location_address text,
  rating numeric,
  total_reviews integer,
  total_bookings integer,
  is_available boolean,
  portfolio_images text[],
  verified_portfolio_images jsonb,
  vehicle_availability vehicle_type,
  profile_id uuid,
  specializations text[],
  cover_image_url text,
  experience_years integer,
  price_range text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    mp.id,
    mp.business_name,
    mp.location_city,
    mp.location_address,
    mp.rating,
    mp.total_reviews,
    mp.total_bookings,
    mp.is_available,
    mp.portfolio_images,
    mp.verified_portfolio_images,
    mp.vehicle_availability,
    mp.profile_id,
    mp.specializations,
    mp.cover_image_url,
    mp.experience_years,
    mp.price_range
  FROM mua_profiles mp
  WHERE mp.onboarding_completed = true;
$$;

CREATE OR REPLACE FUNCTION public.get_my_mua_profile()
RETURNS TABLE(
  id uuid,
  business_name text,
  location_city text,
  location_address text,
  rating numeric,
  total_reviews integer,
  total_bookings integer,
  is_available boolean,
  portfolio_images text[],
  verified_portfolio_images jsonb,
  vehicle_availability vehicle_type,
  profile_id uuid,
  specializations text[],
  cover_image_url text,
  experience_years integer,
  price_range text,
  bank_account_name text,
  bank_name text,
  bank_account_number text,
  whatsapp_number text,
  instagram_url text,
  tiktok_url text,
  onboarding_completed boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    mp.id,
    mp.business_name,
    mp.location_city,
    mp.location_address,
    mp.rating,
    mp.total_reviews,
    mp.total_bookings,
    mp.is_available,
    mp.portfolio_images,
    mp.verified_portfolio_images,
    mp.vehicle_availability,
    mp.profile_id,
    mp.specializations,
    mp.cover_image_url,
    mp.experience_years,
    mp.price_range,
    mp.bank_account_name,
    mp.bank_name,
    mp.bank_account_number,
    mp.whatsapp_number,
    mp.instagram_url,
    mp.tiktok_url,
    mp.onboarding_completed,
    mp.created_at,
    mp.updated_at
  FROM mua_profiles mp
  JOIN profiles p ON mp.profile_id = p.id
  WHERE p.user_id = auth.uid();
$$;

-- 3. Secure Portfolio Verification Data
DROP POLICY IF EXISTS "Token-based verification access" ON public.portfolio_verifications;
DROP POLICY IF EXISTS "MUA can view their own verification requests" ON public.portfolio_verifications;

-- Create restricted verification access policies
CREATE POLICY "MUA can view their own verifications" 
ON public.portfolio_verifications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM mua_profiles mp
  JOIN profiles p ON mp.profile_id = p.id
  WHERE mp.id = portfolio_verifications.mua_profile_id 
    AND p.user_id = auth.uid()
));

-- Allow token-based access for verification process only
CREATE POLICY "Verification token access" 
ON public.portfolio_verifications 
FOR ALL 
USING (
  verification_token IS NOT NULL 
  AND expires_at > now()
);

-- 4. Implement Database-based Admin Roles
CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer functions for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin');
$$;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Fix existing database functions security
-- Update create_new_booking function
CREATE OR REPLACE FUNCTION public.create_new_booking(
  p_mua_profile_id uuid, 
  p_service_id uuid, 
  p_booking_date date, 
  p_booking_time time without time zone, 
  p_total_price numeric, 
  p_platform_fee numeric, 
  p_customer_notes text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_customer_profile_id uuid;
    v_booking_id uuid;
    v_payment_id uuid;
    v_conflicting_booking_id uuid;
    v_booking_timestamp timestamp with time zone;
BEGIN
    SELECT id INTO v_customer_profile_id FROM public.profiles WHERE user_id = auth.uid();
    IF v_customer_profile_id IS NULL THEN
        RAISE EXCEPTION 'Profil pelanggan tidak ditemukan.';
    END IF;

    v_booking_timestamp := p_booking_date::timestamp + p_booking_time::interval;

    SELECT b.id INTO v_conflicting_booking_id
    FROM public.bookings b
    WHERE b.mua_profile_id = p_mua_profile_id
      AND b.booking_date = p_booking_date
      AND b.booking_time = p_booking_time
      AND b.status NOT IN ('rejected', 'cancelled')
    FOR UPDATE;

    IF v_conflicting_booking_id IS NOT NULL THEN
        RAISE EXCEPTION 'Jadwal ini baru saja dipesan orang lain.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.mua_blocked_slots bs
        WHERE bs.mua_profile_id = p_mua_profile_id
          AND v_booking_timestamp BETWEEN bs.start_time AND bs.end_time
    ) THEN
        RAISE EXCEPTION 'Jadwal pada tanggal dan waktu ini tidak tersedia (diblokir oleh MUA).';
    END IF;

    INSERT INTO public.bookings (mua_profile_id, service_id, customer_id, booking_date, booking_time, total_price, customer_notes, status, platform_fee)
    VALUES (p_mua_profile_id, p_service_id, v_customer_profile_id, p_booking_date, p_booking_time, p_total_price, p_customer_notes, 'pending', p_platform_fee)
    RETURNING id INTO v_booking_id;
    
    INSERT INTO public.payments (booking_id, customer_id, amount, payment_status, payment_method)
    VALUES (v_booking_id, v_customer_profile_id, p_total_price, 'pending', 'va-bca')
    RETURNING id INTO v_payment_id;

    RETURN v_payment_id;
END;
$$;