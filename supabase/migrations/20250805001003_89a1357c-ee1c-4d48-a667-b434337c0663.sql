-- First, drop all versions of update_booking_status_by_mua to fix the function overload issue
DROP FUNCTION IF EXISTS public.update_booking_status_by_mua(uuid, booking_status);
DROP FUNCTION IF EXISTS public.update_booking_status_by_mua(uuid, booking_status, text);
DROP FUNCTION IF EXISTS public.update_booking_status_by_mua(uuid, uuid, booking_status, text);

-- Create the correct version of update_booking_status_by_mua
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

-- Fix the notification function to properly get user_id from auth.users
DROP TRIGGER IF EXISTS on_booking_status_change ON public.bookings;
DROP FUNCTION IF EXISTS public.handle_booking_status_notification();

CREATE OR REPLACE FUNCTION public.handle_booking_status_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    notification_message TEXT;
    target_user_id UUID;
    mua_name TEXT;
    customer_name TEXT;
    customer_user_id UUID;
    mua_user_id UUID;
BEGIN
    -- Get MUA business name
    SELECT mp.business_name INTO mua_name 
    FROM public.mua_profiles mp 
    WHERE mp.id = NEW.mua_profile_id;
    
    -- Get customer name and user_id
    SELECT p.full_name, p.user_id INTO customer_name, customer_user_id
    FROM public.profiles p 
    WHERE p.id = NEW.customer_id;
    
    -- Get MUA user_id
    SELECT p.user_id INTO mua_user_id
    FROM public.mua_profiles mp
    JOIN public.profiles p ON mp.profile_id = p.id
    WHERE mp.id = NEW.mua_profile_id;

    -- Notification for rejected booking
    IF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
        IF customer_user_id IS NOT NULL THEN
            notification_message := 'Pesanan Anda telah ditolak oleh ' || COALESCE(mua_name, 'MUA');
            INSERT INTO public.notifications(user_id, message, link)
            VALUES (customer_user_id, notification_message, '/aktivitas');
        END IF;
    END IF;

    -- Notification for cancelled booking
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
        IF mua_user_id IS NOT NULL THEN
            notification_message := 'Pelanggan ' || COALESCE(customer_name, 'Pelanggan') || ' telah membatalkan pesanannya.';
            INSERT INTO public.notifications(user_id, message, link)
            VALUES (mua_user_id, notification_message, '/mua/profile?tab=dashboard');
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_booking_status_change
    AFTER UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_booking_status_notification();