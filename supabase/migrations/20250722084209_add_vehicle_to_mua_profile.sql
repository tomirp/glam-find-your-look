-- Membuat tipe data baru untuk pilihan kendaraan
CREATE TYPE public.vehicle_type AS ENUM (
    'none',
    'motorcycle',
    'car'
);

-- Menambahkan kolom baru ke tabel mua_profiles untuk menyimpan ketersediaan kendaraan
ALTER TABLE public.mua_profiles
ADD COLUMN vehicle_availability public.vehicle_type NOT NULL DEFAULT 'none';

-- Menambahkan komentar untuk kejelasan
COMMENT ON COLUMN public.mua_profiles.vehicle_availability IS 'Specifies the type of vehicle the MUA has available for transport.';