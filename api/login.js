import bcrypt from 'bcryptjs';

// The hashed password from auth.js. 
// It is now securely on the backend where users cannot inspect it!
const adminHash = process.env.ADMIN_HASH || "$2b$10$xQ1hUX4auSlT1q4FQlgEreDlhtf9xOyTb5IeHQNbRLF50N1Yv0zyi";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    try {
        const isValid = await bcrypt.compare(password, adminHash);
        
        if (isValid) {
            // Success
            return res.status(200).json({ success: true });
        } else {
            return res.status(401).json({ success: false, error: 'Invalid password' });
        }
    } catch (error) {
        console.error('Bcrypt error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
