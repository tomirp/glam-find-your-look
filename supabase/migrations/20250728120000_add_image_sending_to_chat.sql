-- supabase/migrations/20250728120000_add_image_sending_to_chat.sql

-- Langkah 1: Tambahkan kolom baru ke tabel messages untuk menyimpan URL gambar.
-- Kolom ini bisa kosong (NULL) karena tidak semua pesan akan berisi gambar.
ALTER TABLE public.messages
ADD COLUMN image_url TEXT;

-- Langkah 2: Buat sebuah "ember" penyimpanan (storage bucket) baru bernama 'chat_images'.
-- Bucket ini akan kita buat publik agar gambar mudah diakses melalui URL, 
-- namun keamanannya akan kita atur melalui RLS di Langkah 3.
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_images', 'chat_images', true)
ON CONFLICT (id) DO NOTHING;

-- Langkah 3: Atur Kebijakan Keamanan (RLS) untuk bucket 'chat_images'.
-- Kebijakan ini memastikan bahwa hanya pengguna yang terautentikasi dan terlibat 
-- dalam sebuah percakapan yang bisa mengelola gambar di dalamnya.

-- Hapus kebijakan lama jika ada untuk menghindari konflik
DROP POLICY IF EXISTS "Authenticated users can manage their own chat images" ON storage.objects;

-- Kebijakan untuk SELECT (Melihat Gambar):
-- Pengguna dapat melihat sebuah gambar jika ID profil mereka ada di dalam daftar 
-- peserta percakapan (participant_ids) yang terkait dengan gambar tersebut.
-- Kita mengambil conversation_id dari path file, contoh: /public/conversation_id/image.png
CREATE POLICY "Users can view images in their conversations"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat_images' AND
  (SELECT id FROM public.profiles WHERE user_id = auth.uid()) IN (
    SELECT unnest(participant_ids) 
    FROM public.conversations 
    WHERE id = (storage.foldername(name))[1]::uuid
  )
);

-- Kebijakan untuk INSERT (Mengunggah Gambar):
-- Pengguna dapat mengunggah gambar ke sebuah folder percakapan jika ID profil mereka 
-- adalah salah satu peserta dalam percakapan tersebut.
CREATE POLICY "Users can upload images to their conversations"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat_images' AND
  (SELECT id FROM public.profiles WHERE user_id = auth.uid()) IN (
    SELECT unnest(participant_ids) 
    FROM public.conversations 
    WHERE id = (storage.foldername(name))[1]::uuid
  )
);