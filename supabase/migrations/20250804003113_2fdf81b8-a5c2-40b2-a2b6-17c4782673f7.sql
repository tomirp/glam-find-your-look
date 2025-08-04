-- Fix the update_booking_status_by_mua function parameter mismatch
DROP FUNCTION IF EXISTS public.update_booking_status_by_mua(uuid, booking_status, text);

CREATE OR REPLACE FUNCTION public.update_booking_status_by_mua(
  p_booking_id uuid, 
  p_new_status booking_status, 
  cancellation_reason_param text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_mua_profile_id UUID;
BEGIN
  -- Dapatkan profil MUA dari pengguna yang sedang login
  SELECT mp.id INTO v_mua_profile_id
  FROM public.mua_profiles mp
  JOIN public.profiles p ON mp.profile_id = p.id
  WHERE p.user_id = auth.uid();

  -- Pastikan MUA ini adalah pemilik pesanan yang akan diubah
  IF EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE id = p_booking_id AND mua_profile_id = v_mua_profile_id
  ) THEN
    -- Jika ya, perbarui statusnya
    UPDATE public.bookings
    SET 
      status = p_new_status,
      cancellation_reason = cancellation_reason_param,
      updated_at = now()
    WHERE id = p_booking_id;
  ELSE
    -- Jika tidak, lemparkan error
    RAISE EXCEPTION 'Permission denied to update this booking status';
  END IF;
END;
$function$;

-- Fix the cancel_booking_by_customer function parameter mismatch
DROP FUNCTION IF EXISTS public.cancel_booking_by_customer(uuid, text);

CREATE OR REPLACE FUNCTION public.cancel_booking_by_customer(
  p_booking_id uuid, 
  cancellation_reason_param text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_customer_profile_id UUID;
  v_current_status booking_status;
BEGIN
  -- Dapatkan ID profil pelanggan dari pengguna yang sedang login
  SELECT id INTO v_customer_profile_id
  FROM public.profiles
  WHERE user_id = auth.uid();

  -- Dapatkan status pesanan saat ini
  SELECT status INTO v_current_status 
  FROM public.bookings 
  WHERE id = p_booking_id AND customer_id = v_customer_profile_id;

  -- Pastikan pesanan bisa dibatalkan
  IF v_current_status IN ('completed', 'cancelled') THEN
    RAISE EXCEPTION 'Cannot cancel a completed or already cancelled booking';
  END IF;

  -- Pastikan pengguna ini adalah pemilik pesanan
  IF EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE id = p_booking_id
      AND customer_id = v_customer_profile_id
      AND status IN ('pending', 'accepted')
  ) THEN
    -- Jika ya, perbarui statusnya menjadi 'cancelled'
    UPDATE public.bookings
    SET 
      status = 'cancelled',
      cancellation_reason = cancellation_reason_param,
      updated_at = now()
    WHERE id = p_booking_id;
  ELSE
    RAISE EXCEPTION 'Permission denied or booking cannot be cancelled';
  END IF;
END;
$function$;