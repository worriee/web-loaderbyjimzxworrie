import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const network = formData.get('network') as string;
    const modeOfPayment = formData.get('modeOfPayment') as string;
    const notes = formData.get('notes') as string;

    if (!file || !phoneNumber || !network || !modeOfPayment || !notes) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Upload file to 'receipts' bucket
    const filePath = `receipts/${Date.now()}_${fileName}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('receipts')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 2. Get the public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('receipts')
      .getPublicUrl(filePath);

    // 3. Insert transaction into database (Bypasses RLS)
    const { data: transactionData, error: insertError } = await supabaseAdmin
      .from('transactions')
      .insert([{
        phone_number: phoneNumber,
        network: network,
        mode_of_payment: modeOfPayment,
        notes: notes,
        receipt: publicUrl,
        status: 'Pending'
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ 
      url: publicUrl, 
      transactionId: transactionData.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
