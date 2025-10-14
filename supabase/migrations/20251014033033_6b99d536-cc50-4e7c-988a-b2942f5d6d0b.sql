-- ============================================================================
-- CRITICAL SECURITY FIX: Secure MUA Profiles and Admin Access
-- ============================================================================

-- PART 1: Fix MUA Profiles Public Data Exposure
-- ============================================================================

-- Drop the overly permissive "Public can view business info" policy
DROP POLICY IF EXISTS "Public can view business info" ON public.mua_profiles;

-- Create helper function to check if user is MUA owner
CREATE OR REPLACE FUNCTION public.is_mua_owner(p_mua_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM mua_profiles mp
    JOIN profiles p ON mp.profile_id = p.id
    WHERE mp.id = p_mua_profile_id
      AND p.user_id = auth.uid()
  );
$$;

-- Create policy for MUA owners to see their complete profile (including sensitive data)
CREATE POLICY "MUA owners can view their complete profile"
ON public.mua_profiles
FOR SELECT
TO authenticated
USING (is_mua_owner(id));

-- Create secure function to return only safe public fields for all MUA profiles
CREATE OR REPLACE FUNCTION public.get_public_mua_profiles()
RETURNS TABLE (
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
  specializations text[],
  cover_image_url text,
  experience_years integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Returns only safe public fields, excluding:
  -- bank_account_number, bank_account_name, bank_name
  -- whatsapp_number, instagram_url, tiktok_url
  -- profile_id, onboarding_completed, price_range
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
    mp.specializations,
    mp.cover_image_url,
    mp.experience_years,
    mp.created_at,
    mp.updated_at
  FROM mua_profiles mp
  WHERE mp.onboarding_completed = true;
$$;

-- Create secure function to return safe public fields for a single MUA profile
CREATE OR REPLACE FUNCTION public.get_public_mua_profile(p_profile_id uuid)
RETURNS TABLE (
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
  specializations text[],
  cover_image_url text,
  experience_years integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Returns only safe public fields for a specific profile
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
    mp.specializations,
    mp.cover_image_url,
    mp.experience_years,
    mp.created_at,
    mp.updated_at
  FROM mua_profiles mp
  WHERE mp.id = p_profile_id;
$$;

-- PART 2: Ensure admin role infrastructure is ready
-- ============================================================================

-- Ensure app_role enum exists (may already exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

-- Ensure user_roles table exists with proper structure
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles if not already enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Recreate RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Ensure has_role and is_admin functions exist
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
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin');
$$;