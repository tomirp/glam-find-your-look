-- Fungsi untuk mengambil semua spesialisasi unik untuk filter
CREATE OR REPLACE FUNCTION get_all_specializations()
RETURNS TABLE(specialization TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT unnest(specializations) as specialization
    FROM public.mua_profiles
    WHERE specializations IS NOT NULL
    ORDER BY specialization;
END;
$$ LANGUAGE plpgsql;

-- Fungsi utama untuk pencarian MUA yang canggih
CREATE OR REPLACE FUNCTION advanced_mua_search(
    p_query TEXT,
    p_min_price INT DEFAULT 0,
    p_max_price INT DEFAULT 10000000,
    p_min_rating REAL DEFAULT 0,
    p_specializations TEXT[] DEFAULT '{}',
    p_sort_by TEXT DEFAULT 'popular'
)
RETURNS TABLE (
    id UUID,
    business_name TEXT,
    location_city TEXT,
    specializations TEXT[],
    rating REAL,
    total_reviews INT,
    cover_image_url TEXT,
    min_service_price INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        mp.id,
        mp.business_name,
        mp.location_city,
        mp.specializations,
        mp.rating,
        mp.total_reviews,
        mp.cover_image_url,
        (SELECT MIN(s.price_min) FROM services s WHERE s.mua_profile_id = mp.id) as min_service_price
    FROM
        public.mua_profiles mp
    WHERE
        -- Filter berdasarkan query pencarian (nama atau kota)
        (mp.business_name ILIKE '%' || p_query || '%' OR mp.location_city ILIKE '%' || p_query || '%')
        -- Filter berdasarkan rating
        AND mp.rating >= p_min_rating
        -- Filter berdasarkan spesialisasi (jika ada yang dipilih)
        AND (array_length(p_specializations, 1) IS NULL OR mp.specializations @> p_specializations)
        -- Filter berdasarkan rentang harga dari layanan yang dimiliki
        AND EXISTS (
            SELECT 1
            FROM public.services s
            WHERE s.mua_profile_id = mp.id
              AND s.price_min BETWEEN p_min_price AND p_max_price
        )
    ORDER BY
        -- Logika untuk sortir
        CASE WHEN p_sort_by = 'popular' THEN mp.rating END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'price_asc' THEN (SELECT MIN(s.price_min) FROM services s WHERE s.mua_profile_id = mp.id) END ASC NULLS LAST,
        mp.id -- Urutan default
    ;
END;
$$ LANGUAGE plpgsql;