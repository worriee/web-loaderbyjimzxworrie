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

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse the request body
    const formData = await req.formData()
    const file = formData.get('file') as File
    const amount = formData.get('amount') as string
    const category = formData.get('category') as string
    const date = formData.get('date') as string

    if (!file || !amount || !category || !date) {
      throw new Error('Missing required fields')
    }

    // 1. Upload file to 'receipts' bucket
    const fileName = `${user.id}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('receipts')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const filePath = uploadData.path

    // 2. Insert transaction record into 'transactions' table
    const { error: insertError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: parseFloat(amount),
        category: category,
        date: date,
        receipt_url: filePath,
      })

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ message: 'Upload successful', path: filePath }),
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
