-- supabase/migrations/20250728100000_add_rls_to_payments.sql

-- Mengaktifkan RLS (Row Level Security) pada tabel payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Menghapus kebijakan lama jika ada untuk menghindari konflik
DROP POLICY IF EXISTS "Users can manage their own payments" ON public.payments;

-- Membuat kebijakan baru yang memberikan izin penuh (SELECT, INSERT, UPDATE, DELETE)
-- kepada pengguna HANYA untuk record pembayaran yang menjadi milik mereka.
CREATE POLICY "Users can manage their own payments"
ON public.payments
FOR ALL
USING (
  -- Memeriksa apakah customer_id di tabel payments sama dengan ID profil pengguna yang sedang login
  (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()) = customer_id
)
WITH CHECK (
  -- Memastikan aturan yang sama berlaku saat membuat atau mengubah data
  (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()) = customer_id
);