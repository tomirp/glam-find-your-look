import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = "https://xvkdnyxcdcxwpdgkijpy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2a2RueXhjZGN4d3BkZ2tpanB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTI1NTEsImV4cCI6MjA2NzE2ODU1MX0.OCHT7ZJRgZbIty0kW6n1vxh43MjPTYefalA42jJboXI";

const supabase = createClient(supabaseUrl, supabaseKey);

interface VerificationRequest {
  muaProfileId: string;
  portfolioImageUrl: string;
  clientName: string;
  clientPhone: string;
  clientWhatsapp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { muaProfileId, portfolioImageUrl, clientName, clientPhone, clientWhatsapp }: VerificationRequest = await req.json();

    console.log('Creating verification request for MUA:', muaProfileId);

    // Create verification record
    const { data: verification, error: dbError } = await supabase
      .from('portfolio_verifications')
      .insert({
        mua_profile_id: muaProfileId,
        portfolio_image_url: portfolioImageUrl,
        client_name: clientName,
        client_phone: clientPhone,
        client_whatsapp: clientWhatsapp,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to create verification request');
    }

    console.log('Verification created:', verification.id);

    // Send WhatsApp message
    const whatsappToken = Deno.env.get('WHATSAPP_API_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    
    if (!whatsappToken || !phoneNumberId) {
      throw new Error('WhatsApp credentials not configured');
    }

    const verificationUrl = `https://xvkdnyxcdcxwpdgkijpy.supabase.co/functions/v1/portfolio-verification?token=${verification.verification_token}`;
    
    const whatsappMessage = {
      messaging_product: "whatsapp",
      to: clientWhatsapp,
      type: "text",
      text: {
        body: `Halo ${clientName}! 👋\n\nAnda diminta untuk memverifikasi karya makeup yang dibuat untuk Anda. Silakan klik link berikut untuk konfirmasi:\n\n${verificationUrl}\n\nLink ini berlaku selama 7 hari. Terima kasih!`
      }
    };

    const whatsappResponse = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(whatsappMessage),
    });

    if (!whatsappResponse.ok) {
      const errorText = await whatsappResponse.text();
      console.error('WhatsApp API error:', errorText);
      throw new Error('Failed to send WhatsApp message');
    }

    const whatsappResult = await whatsappResponse.json();
    console.log('WhatsApp message sent:', whatsappResult);

    return new Response(JSON.stringify({ 
      success: true, 
      verificationId: verification.id,
      message: 'Verification request sent successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-verification-whatsapp function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);