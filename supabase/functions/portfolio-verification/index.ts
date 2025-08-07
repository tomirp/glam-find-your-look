import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = "https://xvkdnyxcdcxwpdgkijpy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2a2RueXhjZGN4d3BkZ2tpanB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTI1NTEsImV4cCI6MjA2NzE2ODU1MX0.OCHT7ZJRgZbIty0kW6n1vxh43MjPTYefalA42jJboXI";

const supabase = createClient(supabaseUrl, supabaseKey);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (req.method === 'GET') {
    // Display verification page
    if (!token) {
      return new Response('Invalid verification link', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Get verification details
    const { data: verification, error } = await supabase
      .from('portfolio_verifications')
      .select(`
        *,
        mua_profiles (
          business_name,
          profiles (
            full_name
          )
        )
      `)
      .eq('verification_token', token)
      .single();

    if (error || !verification) {
      return new Response('Verification not found or expired', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    if (verification.verification_status !== 'pending') {
      const statusText = verification.verification_status === 'verified' ? 'sudah diverifikasi' : 
                        verification.verification_status === 'rejected' ? 'ditolak' : 'kedaluwarsa';
      return new Response(`Verifikasi ini ${statusText}`, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    if (new Date(verification.expires_at) < new Date()) {
      return new Response('Link verifikasi sudah kedaluwarsa', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifikasi Portofolio</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 min-h-screen py-8 px-4">
        <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 class="text-2xl font-bold text-center mb-6 text-gray-800">Verifikasi Portofolio</h1>
          
          <div class="mb-6 text-center">
            <img src="${verification.portfolio_image_url}" alt="Portfolio" class="w-full h-64 object-cover rounded-lg mb-4">
            <p class="text-gray-600 mb-2">Halo <strong>${verification.client_name}</strong>,</p>
            <p class="text-gray-600 mb-4">Apakah ini karya makeup yang dibuat untuk Anda oleh <strong>${verification.mua_profiles.business_name || verification.mua_profiles.profiles.full_name}</strong>?</p>
          </div>

          <div class="space-y-3">
            <button 
              onclick="submitVerification('verified')" 
              class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              ✅ Ya, Benar
            </button>
            <button 
              onclick="submitVerification('rejected')" 
              class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              ❌ Tidak, Bukan
            </button>
          </div>

          <div id="message" class="mt-4 text-center hidden"></div>
        </div>

        <script>
          async function submitVerification(status) {
            const messageDiv = document.getElementById('message');
            
            try {
              const response = await fetch(window.location.href, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  status,
                  message: status === 'rejected' ? 'Ditolak oleh klien' : 'Diverifikasi oleh klien'
                }),
              });

              const result = await response.json();
              
              if (result.success) {
                messageDiv.className = 'mt-4 text-center text-green-600 font-medium';
                messageDiv.textContent = 'Terima kasih! Verifikasi berhasil disimpan.';
                messageDiv.classList.remove('hidden');
                
                // Hide buttons
                document.querySelectorAll('button').forEach(btn => btn.style.display = 'none');
              } else {
                throw new Error(result.message || 'Terjadi kesalahan');
              }
            } catch (error) {
              messageDiv.className = 'mt-4 text-center text-red-600 font-medium';
              messageDiv.textContent = 'Terjadi kesalahan: ' + error.message;
              messageDiv.classList.remove('hidden');
            }
          }
        </script>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        ...corsHeaders,
      },
    });
  }

  if (req.method === 'POST') {
    // Handle verification submission
    if (!token) {
      return new Response(JSON.stringify({ success: false, message: 'Token required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { status, message } = await req.json();

    // Call the database function to confirm verification
    const { data, error } = await supabase.rpc('confirm_portfolio_verification', {
      p_token: token,
      p_status: status,
      p_message: message
    });

    if (error) {
      console.error('Verification error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Failed to update verification' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }

  return new Response('Method not allowed', { 
    status: 405,
    headers: corsHeaders 
  });
};

serve(handler);