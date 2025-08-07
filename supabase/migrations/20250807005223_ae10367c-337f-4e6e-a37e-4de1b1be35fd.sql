-- Create portfolio verification system
CREATE TABLE public.portfolio_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mua_profile_id UUID NOT NULL,
  portfolio_image_url TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_whatsapp TEXT NOT NULL,
  verification_token UUID NOT NULL DEFAULT gen_random_uuid(),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  verification_message TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

-- Create index for faster lookups
CREATE INDEX idx_portfolio_verifications_token ON public.portfolio_verifications(verification_token);
CREATE INDEX idx_portfolio_verifications_mua ON public.portfolio_verifications(mua_profile_id);

-- Enable RLS
ALTER TABLE public.portfolio_verifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "MUA can view their own verification requests" 
ON public.portfolio_verifications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM mua_profiles mp 
  JOIN profiles p ON mp.profile_id = p.id 
  WHERE mp.id = portfolio_verifications.mua_profile_id 
  AND p.user_id = auth.uid()
));

CREATE POLICY "MUA can create verification requests" 
ON public.portfolio_verifications 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM mua_profiles mp 
  JOIN profiles p ON mp.profile_id = p.id 
  WHERE mp.id = portfolio_verifications.mua_profile_id 
  AND p.user_id = auth.uid()
));

CREATE POLICY "Public can view verification by token" 
ON public.portfolio_verifications 
FOR SELECT 
USING (true);

CREATE POLICY "Public can update verification status by token" 
ON public.portfolio_verifications 
FOR UPDATE 
USING (true);

-- Add verified portfolio images to mua_profiles
ALTER TABLE public.mua_profiles 
ADD COLUMN verified_portfolio_images JSONB DEFAULT '[]'::jsonb;

-- Function to handle verification confirmation
CREATE OR REPLACE FUNCTION public.confirm_portfolio_verification(
  p_token UUID,
  p_status TEXT,
  p_message TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_verification RECORD;
  v_updated_portfolio JSONB;
BEGIN
  -- Get verification record
  SELECT * INTO v_verification 
  FROM public.portfolio_verifications 
  WHERE verification_token = p_token 
  AND verification_status = 'pending'
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired verification token');
  END IF;
  
  -- Update verification status
  UPDATE public.portfolio_verifications 
  SET 
    verification_status = p_status,
    verification_message = p_message,
    verified_at = CASE WHEN p_status = 'verified' THEN now() ELSE NULL END,
    updated_at = now()
  WHERE verification_token = p_token;
  
  -- If verified, add to verified portfolio images
  IF p_status = 'verified' THEN
    -- Get current verified portfolio images
    SELECT verified_portfolio_images INTO v_updated_portfolio
    FROM public.mua_profiles 
    WHERE id = v_verification.mua_profile_id;
    
    -- Add new verified image
    v_updated_portfolio = COALESCE(v_updated_portfolio, '[]'::jsonb) || 
      jsonb_build_object(
        'image_url', v_verification.portfolio_image_url,
        'verified_at', now(),
        'client_name', v_verification.client_name
      );
    
    -- Update mua_profiles
    UPDATE public.mua_profiles 
    SET verified_portfolio_images = v_updated_portfolio
    WHERE id = v_verification.mua_profile_id;
  END IF;
  
  RETURN jsonb_build_object('success', true, 'message', 'Verification updated successfully');
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_portfolio_verifications_updated_at
  BEFORE UPDATE ON public.portfolio_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();