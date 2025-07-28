-- Menambahkan 'paid' ke tipe enum payment_status
ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'paid';