-- Seed initial real MUA profiles for Jakarta and Bandung focus
-- Note: Uses fixed UUIDs so services can reference them. Safe to run once.

-- 1) Insert MUA profiles (Jakarta & Bandung)
WITH new_muas AS (
  SELECT * FROM (VALUES
    ('8b4b0a7e-3a6a-4f7c-9c0a-01a1f9a1a001'::uuid, gen_random_uuid(), 'Jakarta Glow Studio', 'Jakarta Selatan', ARRAY['Bridal','Party Makeup'], 4.8, 124, 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=1200&auto=format&fit=crop'),
    ('e9a3c9ad-2b8c-4d4a-8a4f-02b2f0b2b002'::uuid, gen_random_uuid(), 'Menteng Beauty Lab', 'Jakarta Pusat', ARRAY['Photoshoot','Natural Look'], 4.9, 203, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop'),
    ('a7c2e015-93f3-4f70-bd5b-03c3f1c3c003'::uuid, gen_random_uuid(), 'Kebayoran Glam', 'Jakarta Selatan', ARRAY['Bridal','Korean Style'], 4.6, 87, 'https://images.unsplash.com/photo-1522335789203-b1c4f1d2b2d6?q=80&w=1200&auto=format&fit=crop'),
    ('b6d8f2a4-2db0-43c0-95c4-04d4f2d4d004'::uuid, gen_random_uuid(), 'Sunda Glam Bandung', 'Bandung', ARRAY['Graduation','Party Makeup'], 4.7, 98, 'https://images.unsplash.com/photo-1595475038784-bbe439ff41e1?q=80&w=1200&auto=format&fit=crop'),
    ('c5e1a3b2-4c6d-4d2b-8f7e-05e5f3e5e005'::uuid, gen_random_uuid(), 'Dago Artistry', 'Bandung Utara', ARRAY['Bridal','Photoshoot'], 4.8, 156, 'https://images.unsplash.com/photo-1598514983050-7f4bd7e43a42?q=80&w=1200&auto=format&fit=crop'),
    ('d4f9b1c3-5e7f-40a1-9e2d-06f6f4f6f006'::uuid, gen_random_uuid(), 'Cihampelas Makeup Co', 'Bandung', ARRAY['Natural Look','Event'], 4.5, 64, 'https://images.unsplash.com/photo-1600948612227-86d1df6c6949?q=80&w=1200&auto=format&fit=crop')
  ) AS t(id, profile_id, business_name, location_city, specializations, rating, total_reviews, cover_image_url)
)
INSERT INTO public.mua_profiles (id, profile_id, business_name, location_city, specializations, rating, total_reviews, cover_image_url, is_available)
SELECT id, profile_id, business_name, location_city, specializations, rating, total_reviews, cover_image_url, true FROM new_muas
ON CONFLICT (id) DO NOTHING;

-- 2) Insert services for each MUA
INSERT INTO public.services (mua_profile_id, name, description, price_min, price_max, duration_minutes, is_active, image_url)
VALUES
  -- Jakarta Glow Studio
  ('8b4b0a7e-3a6a-4f7c-9c0a-01a1f9a1a001', 'Makeup Party', 'Glam look untuk acara malam', 350000, 700000, 90, true, NULL),
  ('8b4b0a7e-3a6a-4f7c-9c0a-01a1f9a1a001', 'Makeup Wisuda', 'Natural glowing untuk wisuda', 300000, 600000, 75, true, NULL),
  ('8b4b0a7e-3a6a-4f7c-9c0a-01a1f9a1a001', 'Bridal Trial', 'Trial sebelum hari-H', 500000, 900000, 120, true, NULL),

  -- Menteng Beauty Lab
  ('e9a3c9ad-2b8c-4d4a-8a4f-02b2f0b2b002', 'Photoshoot Makeup', 'Makeup profesional untuk sesi foto', 450000, 900000, 90, true, NULL),
  ('e9a3c9ad-2b8c-4d4a-8a4f-02b2f0b2b002', 'Natural Daily', 'Tampilan natural untuk kegiatan sehari-hari', 250000, 450000, 60, true, NULL),

  -- Kebayoran Glam
  ('a7c2e015-93f3-4f70-bd5b-03c3f1c3c003', 'Korean Style', 'Soft glam ala Korea', 400000, 800000, 90, true, NULL),
  ('a7c2e015-93f3-4f70-bd5b-03c3f1c3c003', 'Bridal Makeup', 'Paket rias pengantin (tanpa busana)', 1500000, 3500000, 180, true, NULL),

  -- Sunda Glam Bandung
  ('b6d8f2a4-2db0-43c0-95c4-04d4f2d4d004', 'Graduation Look', 'Riasan wisuda elegan', 300000, 550000, 75, true, NULL),
  ('b6d8f2a4-2db0-43c0-95c4-04d4f2d4d004', 'Party Makeup', 'Glam untuk pesta', 350000, 700000, 90, true, NULL),

  -- Dago Artistry
  ('c5e1a3b2-4c6d-4d2b-8f7e-05e5f3e5e005', 'Bridal Makeup', 'Rias pengantin lengkap (tanpa busana)', 1800000, 4000000, 210, true, NULL),
  ('c5e1a3b2-4c6d-4d2b-8f7e-05e5f3e5e005', 'Photoshoot Makeup', 'Makeup untuk pemotretan outdoor/indoor', 500000, 1000000, 90, true, NULL),

  -- Cihampelas Makeup Co
  ('d4f9b1c3-5e7f-40a1-9e2d-06f6f4f6f006', 'Natural Look', 'Riasan ringan natural', 200000, 400000, 60, true, NULL),
  ('d4f9b1c3-5e7f-40a1-9e2d-06f6f4f6f006', 'Event Makeup', 'Riasan untuk berbagai acara', 300000, 650000, 75, true, NULL);
