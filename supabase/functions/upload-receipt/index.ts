import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN");

  const headers = new Headers({
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  });

  if (origin && origin === allowedOrigin) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  return headers;
};

// Rate Limiter Helper for Deno
async function isRateLimited(ip: string) {
  const REDIS_URL = Deno.env.get("UPSTASH_REDIS_REST_URL");
  const REDIS_TOKEN = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");
  const key = `ratelimit:upload:${ip}`;
  const limit = 10;
  const windowSeconds = 60 * 60; // 1 hour

  const response = await fetch(`${REDIS_URL}/incr/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  const data = await response.json();
  const count = typeof data === "object" ? data.result : data;

  if (count === 1) {
    await fetch(
      `${REDIS_URL}/expire/${encodeURIComponent(key)}/${windowSeconds}`,
      {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      },
    );
  }

  return count > limit;
}

serve(async (req) => {
  const origin = req.headers.get("origin");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(origin) });
  }

  // --- RATE LIMITING START ---
  // Get IP from Supabase request headers
  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for") ||
    "unknown";
  if (await isRateLimited(ip)) {
    return new Response(
      JSON.stringify({
        error: "Too many uploads. Please try again in an hour.",
      }),
      {
        status: 429,
        headers: {
          ...Object.fromEntries(getCorsHeaders(origin)),
          "Content-Type": "application/json",
        },
      },
    );
  }
  // --- RATE LIMITING END ---

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const network = formData.get("network") as string;
    const modeOfPayment = formData.get("modeOfPayment") as string;
    const notes = formData.get("notes") as string;

    if (!file || !phoneNumber || !network || !modeOfPayment || !notes) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            ...Object.fromEntries(getCorsHeaders(req.headers.get("origin"))),
            "Content-Type": "application/json",
          },
        },
      );
    }

    // File Validation: Max 5MB and Image types only
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 5MB." }),
        {
          status: 400,
          headers: {
            ...Object.fromEntries(getCorsHeaders(req.headers.get("origin"))),
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error: "Invalid file type. Please upload an actual receipt.",
        }),
        {
          status: 400,
          headers: {
            ...Object.fromEntries(getCorsHeaders(req.headers.get("origin"))),
            "Content-Type": "application/json",
          },
        },
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // 1. Upload file to 'receipts' bucket
    const filePath = `receipts/${Date.now()}_${fileName}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("receipts")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 2. Get the public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("receipts").getPublicUrl(filePath);

    // 3. Insert transaction into database (Bypasses RLS)
    const { data: transactionData, error: insertError } = await supabaseAdmin
      .from("transactions")
      .insert([
        {
          phone_number: phoneNumber,
          network: network,
          mode_of_payment: modeOfPayment,
          notes: notes,
          receipt: publicUrl,
          status: "Pending",
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        url: publicUrl,
        transactionId: transactionData.id,
      }),
      {
        status: 200,
        headers: {
          ...Object.fromEntries(getCorsHeaders(req.headers.get("origin"))),
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...Object.fromEntries(getCorsHeaders(req.headers.get("origin"))),
        "Content-Type": "application/json",
      },
    });
  }
});
