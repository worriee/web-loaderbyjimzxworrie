import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get the cookies sent by the browser
    const cookies = req.headers.cookie;
    
    if (!cookies) {
        // No wristband found!
        return res.status(401).json({ isAuthenticated: false });
    }

    // Read the specific auth_token cookie
    const parsedCookies = parse(cookies);
    const token = parsedCookies.auth_token;

    if (!token) {
        return res.status(401).json({ isAuthenticated: false });
    }

    try {
        // Verify the magical wristband is real and hasn't been tampered with
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role === 'admin') {
            // They are allowed in!
            return res.status(200).json({ isAuthenticated: true });
        } else {
            return res.status(401).json({ isAuthenticated: false });
        }
    } catch {
        // Wristband is fake or expired
        return res.status(401).json({ isAuthenticated: false });
    }
}
