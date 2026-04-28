import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Security check: Only allow requests with the correct CRON_SECRET
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { error } = await supabaseAdmin.rpc('delete_old_transactions');
        
        if (error) throw error;

        return res.status(200).json({ success: true, message: 'Old transactions cleaned up successfully' });
    } catch (error) {
        console.error('Cleanup error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
