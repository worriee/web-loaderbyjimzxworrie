import { serialize } from 'cookie';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Snip the wristband by setting the cookie to instantly expire
    res.setHeader('Set-Cookie', serialize('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: -1, // Expires immediately
        path: '/'
    }));

    return res.status(200).json({ success: true });
}
