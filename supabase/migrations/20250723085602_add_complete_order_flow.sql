-- 1. Membuat fungsi RPC untuk MUA menandai pesanan sebagai selesai
CREATE OR REPLACE FUNCTION public.complete_booking(p_booking_id UUID)
RETURNS void AS $$
DECLARE
  v_mua_profile_id UUID;
BEGIN
  -- Dapatkan ID profil MUA dari pengguna yang sedang login
  SELECT mp.id INTO v_mua_profile_id
  FROM public.mua_profiles mp
  JOIN public.profiles p ON mp.profile_id = p.id
  WHERE p.user_id = auth.uid();

  -- Pastikan MUA ini adalah pemilik pesanan dan statusnya 'accepted'
  IF EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE id = p_booking_id AND mua_profile_id = v_mua_profile_id AND status = 'accepted'
  ) THEN
    -- Jika ya, perbarui statusnya menjadi 'completed'
    UPDATE public.bookings
    SET status = 'completed'
    WHERE id = p_booking_id;
  ELSE
    RAISE EXCEPTION 'Permission denied or booking is not in accepted state.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Berikan izin agar fungsi ini bisa dipanggil
GRANT EXECUTE ON FUNCTION public.complete_booking(UUID) TO authenticated;


-- 2. Fungsi untuk membuat notifikasi saat PESANAN SELESAI (untuk Pelanggan)
CREATE OR REPLACE FUNCTION public.handle_booking_completed_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_user_id UUID;
  v_mua_business_name TEXT;
BEGIN
  -- Hanya berjalan jika status berubah menjadi 'completed'
  IF OLD.status <> 'completed' AND NEW.status = 'completed' THEN
    -- Dapatkan user_id pelanggan
    SELECT user_id INTO v_customer_user_id FROM public.profiles WHERE id = NEW.customer_id;
    -- Dapatkan nama bisnis MUA
    SELECT business_name INTO v_mua_business_name FROM public.mua_profiles WHERE id = NEW.mua_profile_id;

    -- Buat notifikasi untuk Pelanggan
    INSERT INTO public.notifications (user_id, message, link)
    VALUES (v_customer_user_id, 'Pesanan Anda dengan ' || v_mua_business_name || ' telah selesai. Jangan lupa berikan ulasan!', '/aktivitas');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger untuk UPDATE STATUS PESANAN menjadi COMPLETED
-- Hapus trigger lama jika ada untuk menghindari duplikasi
DROP TRIGGER IF EXISTS on_booking_completed_create_notification ON public.bookings;

CREATE TRIGGER on_booking_completed_create_notification
AFTER UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.handle_booking_completed_notification();