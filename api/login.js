import { authenticator } from "otplib";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { code } = req.body;
  const SECRET_KEY = process.env.TOTP_SECRET;

  if (!SECRET_KEY) {
    console.error("TOTP_SECRET is not set in environment variables.");
    return res.status(500).json({ isAdmin: false, message: "Server configuration error." });
  }

  if (!code || typeof code !== "string" || code.length !== 6 || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ isAdmin: false, message: "Invalid 6-digit authenticator code format." });
  }

  const isValid = authenticator.check(code, SECRET_KEY);

  if (isValid) {
    return res.status(200).json({ isAdmin: true, message: "Login successful!" });
  } else {
    return res.status(401).json({ isAdmin: false, message: "Invalid authenticator code." });
  }
}