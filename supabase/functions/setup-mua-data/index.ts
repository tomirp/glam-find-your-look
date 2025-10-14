import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const muaProfileId = '672edecc-0764-480a-ae2e-47ac084bcb02';

    // Update MUA Profile
    const { error: updateError } = await supabaseClient
      .from('mua_profiles')
      .update({
        onboarding_completed: true,
        location_city: 'Jakarta',
        location_address: 'Jakarta Selatan',
        specializations: ['Bridal Makeup', 'Party Makeup', 'Natural Makeup'],
        vehicle_availability: 'motorcycle',
        experience_years: 3,
        is_available: true,
        cover_image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
        portfolio_images: [
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
          'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400'
        ],
        updated_at: new Date().toISOString()
      })
      .eq('id', muaProfileId);

    if (updateError) throw updateError;

    // Insert Services
    const services = [
      {
        mua_profile_id: muaProfileId,
        name: 'Bridal Makeup Premium',
        description: 'Paket makeup pengantin lengkap dengan penataan rambut dan aksesoris. Menggunakan produk high-end untuk hasil tahan lama sepanjang hari.',
        price_min: 1500000,
        price_max: 2500000,
        duration_minutes: 180,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'
      },
      {
        mua_profile_id: muaProfileId,
        name: 'Party Makeup',
        description: 'Makeup untuk acara pesta, ulang tahun, atau gathering. Look glamor dan fresh yang cocok untuk foto dan video.',
        price_min: 500000,
        price_max: 800000,
        duration_minutes: 90,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=400'
      },
      {
        mua_profile_id: muaProfileId,
        name: 'Natural Daily Makeup',
        description: 'Makeup natural untuk sehari-hari, interview, atau acara formal. Terlihat fresh dan tidak berlebihan.',
        price_min: 300000,
        price_max: 500000,
        duration_minutes: 60,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400'
      },
      {
        mua_profile_id: muaProfileId,
        name: 'Graduation Makeup',
        description: 'Makeup wisuda yang tahan lama dan photogenic. Cocok untuk sesi foto outdoor maupun indoor.',
        price_min: 400000,
        price_max: 600000,
        duration_minutes: 75,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400'
      },
      {
        mua_profile_id: muaProfileId,
        name: 'Pre-Wedding Makeup',
        description: 'Makeup untuk sesi foto pre-wedding. Dapat disesuaikan dengan konsep foto indoor/outdoor.',
        price_min: 800000,
        price_max: 1200000,
        duration_minutes: 120,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400'
      }
    ];

    const { error: insertError } = await supabaseClient
      .from('services')
      .insert(services);

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, message: 'MUA data setup completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
