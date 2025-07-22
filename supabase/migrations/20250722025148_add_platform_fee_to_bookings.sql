-- Menambahkan kolom untuk menyimpan biaya platform per pesanan
ALTER TABLE public.bookings
ADD COLUMN platform_fee INTEGER NOT NULL DEFAULT 0;

-- Menambahkan komentar untuk kejelasan
COMMENT ON COLUMN public.bookings.platform_fee IS 'The fee taken by the platform for each booking.';