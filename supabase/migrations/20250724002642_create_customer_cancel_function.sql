-- Fungsi RPC agar pelanggan bisa membatalkan pesanannya sendiri
CREATE OR REPLACE FUNCTION public.cancel_booking_by_customer(p_booking_id UUID)
RETURNS void AS $$
DECLARE
  v_customer_profile_id UUID;
BEGIN
  -- Dapatkan ID profil pelanggan dari pengguna yang sedang login
  SELECT id INTO v_customer_profile_id
  FROM public.profiles
  WHERE user_id = auth.uid();

  -- Pastikan pengguna ini adalah pemilik pesanan dan statusnya masih bisa dibatalkan
  IF EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE id = p_booking_id
      AND customer_id = v_customer_profile_id
      AND (status = 'pending' OR status = 'accepted')
  ) THEN
    -- Jika ya, perbarui statusnya menjadi 'cancelled'
    UPDATE public.bookings
    SET status = 'cancelled'
    WHERE id = p_booking_id;
  ELSE
    RAISE EXCEPTION 'Permission denied or booking cannot be cancelled.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Berikan izin agar fungsi ini bisa dipanggil
GRANT EXECUTE ON FUNCTION public.cancel_booking_by_customer(UUID) TO authenticated;