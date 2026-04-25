import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyAdmin(req) {
    const cookies = req.headers.cookie;
    if (!cookies) return { authenticated: false };

    const parsedCookies = parse(cookies);
    const token = parsedCookies.auth_token;

    if (!token) return { authenticated: false };

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role === 'admin') {
            return { authenticated: true, user: decoded };
        }
    } catch (error) {
        return { authenticated: false };
    }

    return { authenticated: false };
}
