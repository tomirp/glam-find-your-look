// supabase/functions/seed-mua/index.ts
// Seeds 6 MUA accounts (auth users, profiles, mua_profiles, services)
// Also fills missing services for existing MUAs in Jakarta/Bandung that have none.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
  throw new Error("Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY envs");
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

interface SeedMUA {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  business_name: string;
  location_city: string;
  specializations: string[];
  cover_image_url: string;
  services: Array<{
    name: string;
    description: string;
    price_min: number;
    price_max?: number | null;
    duration_minutes?: number | null;
  }>;
}

const DEFAULT_DATA: SeedMUA[] = [
  {
    email: "jakarta.glow@example.com",
    password: "Password123!",
    full_name: "Jakarta Glow Studio (Owner)",
    business_name: "Jakarta Glow Studio",
    location_city: "Jakarta Selatan",
    specializations: ["Bridal", "Party Makeup"],
    cover_image_url: "https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=1200&auto=format&fit=crop",
    services: [
      { name: "Makeup Party", description: "Glam look untuk acara malam", price_min: 350000, price_max: 700000, duration_minutes: 90 },
      { name: "Makeup Wisuda", description: "Natural glowing untuk wisuda", price_min: 300000, price_max: 600000, duration_minutes: 75 },
      { name: "Bridal Trial", description: "Trial sebelum hari-H", price_min: 500000, price_max: 900000, duration_minutes: 120 },
    ]
  },
  {
    email: "menteng.beauty@example.com",
    password: "Password123!",
    full_name: "Menteng Beauty Lab (Owner)",
    business_name: "Menteng Beauty Lab",
    location_city: "Jakarta Pusat",
    specializations: ["Photoshoot", "Natural Look"],
    cover_image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
    services: [
      { name: "Photoshoot Makeup", description: "Makeup profesional untuk sesi foto", price_min: 450000, price_max: 900000, duration_minutes: 90 },
      { name: "Natural Daily", description: "Tampilan natural untuk kegiatan sehari-hari", price_min: 250000, price_max: 450000, duration_minutes: 60 },
    ]
  },
  {
    email: "kebayoran.glam@example.com",
    password: "Password123!",
    full_name: "Kebayoran Glam (Owner)",
    business_name: "Kebayoran Glam",
    location_city: "Jakarta Selatan",
    specializations: ["Bridal", "Korean Style"],
    cover_image_url: "https://images.unsplash.com/photo-1522335789203-b1c4f1d2b2d6?q=80&w=1200&auto=format&fit=crop",
    services: [
      { name: "Korean Style", description: "Soft glam ala Korea", price_min: 400000, price_max: 800000, duration_minutes: 90 },
      { name: "Bridal Makeup", description: "Paket rias pengantin (tanpa busana)", price_min: 1500000, price_max: 3500000, duration_minutes: 180 },
    ]
  },
  {
    email: "sunda.glam@example.com",
    password: "Password123!",
    full_name: "Sunda Glam Bandung (Owner)",
    business_name: "Sunda Glam Bandung",
    location_city: "Bandung",
    specializations: ["Graduation", "Party Makeup"],
    cover_image_url: "https://images.unsplash.com/photo-1595475038784-bbe439ff41e1?q=80&w=1200&auto=format&fit=crop",
    services: [
      { name: "Graduation Look", description: "Riasan wisuda elegan", price_min: 300000, price_max: 550000, duration_minutes: 75 },
      { name: "Party Makeup", description: "Glam untuk pesta", price_min: 350000, price_max: 700000, duration_minutes: 90 },
    ]
  },
  {
    email: "dago.artistry@example.com",
    password: "Password123!",
    full_name: "Dago Artistry (Owner)",
    business_name: "Dago Artistry",
    location_city: "Bandung Utara",
    specializations: ["Bridal", "Photoshoot"],
    cover_image_url: "https://images.unsplash.com/photo-1598514983050-7f4bd7e43a42?q=80&w=1200&auto=format&fit=crop",
    services: [
      { name: "Bridal Makeup", description: "Rias pengantin lengkap (tanpa busana)", price_min: 1800000, price_max: 4000000, duration_minutes: 210 },
      { name: "Photoshoot Makeup", description: "Makeup untuk pemotretan", price_min: 500000, price_max: 1000000, duration_minutes: 90 },
    ]
  },
  {
    email: "cihampelas.makeup@example.com",
    password: "Password123!",
    full_name: "Cihampelas Makeup Co (Owner)",
    business_name: "Cihampelas Makeup Co",
    location_city: "Bandung",
    specializations: ["Natural Look", "Event"],
    cover_image_url: "https://images.unsplash.com/photo-1600948612227-86d1df6c6949?q=80&w=1200&auto=format&fit=crop",
    services: [
      { name: "Natural Look", description: "Riasan ringan natural", price_min: 200000, price_max: 400000, duration_minutes: 60 },
      { name: "Event Makeup", description: "Riasan untuk berbagai acara", price_min: 300000, price_max: 650000, duration_minutes: 75 },
    ]
  },
];

async function getOrCreateUserByEmail(email: string, password: string, metadata: Record<string, any>) {
  // Try create user
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  } as any);

  if (!createErr && created?.user) return created.user;

  // If exists, find via listUsers
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) throw listErr;
  const user = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error(`Unable to create or find user for ${email}`);
  return user;
}

async function getOrCreateProfile(userId: string, full_name: string, phone?: string) {
  // Check existing profile by user_id
  const { data: existing, error: selErr } = await admin
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing?.id) return existing.id as string;

  const { data: inserted, error: insErr } = await admin
    .from('profiles')
    .insert({ user_id: userId, user_type: 'mua', full_name, phone })
    .select('id')
    .single();
  if (insErr) throw insErr;
  return inserted.id as string;
}

async function getOrCreateMUA(profileId: string, business: Omit<SeedMUA, 'email' | 'password' | 'full_name' | 'phone' | 'services'>) {
  const { data: existing, error: selErr } = await admin
    .from('mua_profiles')
    .select('id')
    .eq('profile_id', profileId)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing?.id) return existing.id as string;

  const { data: inserted, error: insErr } = await admin
    .from('mua_profiles')
    .insert({
      profile_id: profileId,
      business_name: business.business_name,
      location_city: business.location_city,
      specializations: business.specializations,
      cover_image_url: business.cover_image_url,
      is_available: true,
      rating: 0,
      total_reviews: 0
    })
    .select('id')
    .single();
  if (insErr) throw insErr;
  return inserted.id as string;
}

async function ensureServices(muaProfileId: string, services: SeedMUA['services']) {
  const { data: existing, error: countErr } = await admin
    .from('services')
    .select('id', { count: 'exact', head: false })
    .eq('mua_profile_id', muaProfileId);
  if (countErr) throw countErr;
  if ((existing?.length ?? 0) > 0) return 0;

  const payload = services.map(s => ({
    mua_profile_id: muaProfileId,
    name: s.name,
    description: s.description,
    price_min: s.price_min,
    price_max: s.price_max ?? null,
    duration_minutes: s.duration_minutes ?? null,
    is_active: true,
  }));
  const { error: insErr } = await admin.from('services').insert(payload);
  if (insErr) throw insErr;
  return payload.length;
}

async function fillMissingServicesForExistingJakartaBandung() {
  // Find MUAs in Jakarta/Bandung without any services
  const { data: muas, error } = await admin
    .from('mua_profiles')
    .select('id, location_city')
    .or('location_city.ilike.Jakarta%,location_city.ilike.Bandung%');
  if (error) throw error;

  let filled = 0;
  for (const m of muas ?? []) {
    const { data: svc, error: sErr } = await admin
      .from('services')
      .select('id', { count: 'exact', head: false })
      .eq('mua_profile_id', m.id);
    if (sErr) throw sErr;
    if ((svc?.length ?? 0) === 0) {
      const defaults = [
        { name: 'Natural Look', description: 'Riasan ringan natural', price_min: 200000, price_max: 400000, duration_minutes: 60 },
        { name: 'Party Makeup', description: 'Glam untuk pesta', price_min: 350000, price_max: 700000, duration_minutes: 90 },
      ];
      const payload = defaults.map(s => ({ ...s, mua_profile_id: m.id, is_active: true }));
      const { error: insErr } = await admin.from('services').insert(payload);
      if (insErr) throw insErr;
      filled += payload.length;
    }
  }
  return filled;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Require auth JWT
  const authHeader = req.headers.get('Authorization');
  const jwt = authHeader?.replace('Bearer ', '');
  if (!jwt) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // Verify user and email
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user?.email) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // Check if user is admin using database role
  const { data: isAdminData, error: adminError } = await userClient.rpc('is_admin');
  if (adminError || !isAdminData) {
    console.error('Admin check error:', adminError);
    return new Response(JSON.stringify({ success: false, error: 'Forbidden: Only admin can run seeding' }), { 
      status: 403, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const dataset: SeedMUA[] = Array.isArray(body?.data) && body.data.length ? body.data : DEFAULT_DATA;

    let createdUsers = 0;
    let createdMua = 0;
    let createdServices = 0;

    for (const item of dataset) {
      const user = await getOrCreateUserByEmail(item.email, item.password, {
        full_name: item.full_name,
        phone: item.phone ?? null,
        user_type: 'mua'
      });
      if (user?.created_at === user?.updated_at) createdUsers += 1; // heuristic

      const profileId = await getOrCreateProfile(user.id, item.full_name, item.phone);
      const muaId = await getOrCreateMUA(profileId, item);
      if (muaId) createdMua += 1;
      const added = await ensureServices(muaId, item.services);
      createdServices += added;
    }

    const filledExisting = await fillMissingServicesForExistingJakartaBandung();

    return new Response(
      JSON.stringify({ success: true, createdUsers, createdMua, createdServices, filledExisting }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ success: false, error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
