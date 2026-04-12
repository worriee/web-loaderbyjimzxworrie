import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

// The password from environment variables.
// It can be a bcrypt hash (starts with $2a$, $2b$, or $2y$) OR a plain-text password.
const adminAuth = process.env.ADMIN_HASH || process.env.ADMIN_PASSWORD || "$2b$10$1sp1CSmytryEtrpHgYNFbeoH.8/zDnemzZSsO/WKfzUDsXRMUG0t2";

// A secret key used to sign the JWT tokens.
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    try {
        let isValid = false;
        
        // Check if the environment variable is a bcrypt hash
        if (adminAuth.startsWith('$2a$') || adminAuth.startsWith('$2b$') || adminAuth.startsWith('$2y$')) {
            isValid = await bcrypt.compare(password, adminAuth);
        } else {
            // Fallback to direct string comparison if the user entered a plain-text password
            // in their Vercel environment variables.
            isValid = (password === adminAuth);
        }
        
        if (isValid) {
            // Create the magical wristband (JWT token)
            const token = jwt.sign({ role: 'admin' }, JWT_SECRET, {
                expiresIn: '24h' // Wristband disappears in 24 hours
            });

            // Put the wristband on the user securely using an HttpOnly Cookie
            // This ensures JavaScript cannot read it, preventing many attacks.
            res.setHeader('Set-Cookie', serialize('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/'
            }));

            // Success
            return res.status(200).json({ success: true });
        } else {
            return res.status(401).json({ success: false, error: 'Invalid password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
