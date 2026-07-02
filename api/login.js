import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// The password from environment variables.
// It can be a bcrypt hash (starts with $2a$, $2b$, or $2y$) OR a plain-text password.
const adminAuth = process.env.ADMIN_HASH;

// A secret key used to sign the JWT tokens.
const JWT_SECRET = process.env.JWT_SECRET;

// Rate Limiter Helper for Vercel
async function checkRateLimit(ip) {
  const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
  const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
  const key = `ratelimit:login:${ip}`;
  const limit = 5;
  const windowSeconds = 15 * 60; // 15 minutes

  const response = await fetch(`${REDIS_URL}/incr/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  const data = await response.json();
  const count = typeof data === "object" ? data.result : data;

  if (count === 1) {
    // Set expiration on the first request of the window
    await fetch(
      `${REDIS_URL}/expire/${encodeURIComponent(key)}/${windowSeconds}`,
      {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      },
    );
  }

  return count > limit;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // --- RATE LIMITING START ---
  // Get IP from Vercel headers
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const isLimited = await checkRateLimit(ip);

  if (isLimited) {
    return res.status(429).json({
      success: false,
      error: "Too many login attempts. Please try again in 15 minutes.",
    });
  }
  // --- RATE LIMITING END ---

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // 1. Verify Password first
    const isPasswordValid = await bcrypt.compare(password, adminAuth);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // 2. Verify Email and Admin Role via Supabase Admin API
    // Optimized: Using a direct query via RPC or a filtered list is better.
    // For now, we keep the logic but ensure it's streamlined.
    const {
      data: { users },
      error: listError,
    } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const adminUser = users.find((user) => user.email === email);

    if (!adminUser) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Check if the user has the 'admin' role in app_metadata
    const isAdmin = adminUser.app_metadata?.role === "admin";

    if (!isAdmin) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized: Admin access required" });
    }

    // 3. Issue JWT if both password and admin-email are verified
    const token = jwt.sign({ role: "admin", email: email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.setHeader(
      "Set-Cookie",
      serialize("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
        path: "/",
      }),
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
