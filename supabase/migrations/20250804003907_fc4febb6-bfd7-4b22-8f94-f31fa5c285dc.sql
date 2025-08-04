-- Drop trigger first, then recreate function and trigger
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
BEGIN
    -- Get MUA name through correct join path using mua_profile_id
    SELECT mp.business_name INTO mua_name 
    FROM public.bookings b 
    JOIN public.mua_profiles mp ON b.mua_profile_id = mp.id 
    WHERE b.id = NEW.id;
    
    -- Get customer name
    SELECT p_cust.full_name INTO customer_name 
    FROM public.bookings b 
    JOIN public.profiles p_cust ON b.customer_id = p_cust.id 
    WHERE b.id = NEW.id;

    IF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
        target_user_id := NEW.customer_id;
        notification_message := 'Pesanan Anda telah ditolak oleh ' || COALESCE(mua_name, 'MUA');
        INSERT INTO public.notifications(user_id, message, link)
        VALUES (target_user_id, notification_message, '/aktivitas');
    END IF;

    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
        -- Get MUA user_id through correct join path
        SELECT p.user_id INTO target_user_id
        FROM public.mua_profiles mp
        JOIN public.profiles p ON mp.profile_id = p.id
        WHERE mp.id = NEW.mua_profile_id;
        
        notification_message := 'Pelanggan ' || COALESCE(customer_name, 'Pelanggan') || ' telah membatalkan pesanannya.';
        INSERT INTO public.notifications(user_id, message, link)
        VALUES (target_user_id, notification_message, '/mua/profile?tab=dashboard');
    END IF;

    RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_booking_status_change
    AFTER UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_booking_status_notification();