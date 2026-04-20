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
    // Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse the request body
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      throw new Error('Missing required field: file')
    }

    // Upload file to 'receipts' bucket
    // Using a timestamp and random string since we are not requiring a user session
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('receipts')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const filePath = uploadData.path
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabaseClient.storage
      .from('receipts')
      .getPublicUrl(filePath)

    return new Response(
      JSON.stringify({ message: 'Upload successful', url: publicUrl, path: filePath }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})
