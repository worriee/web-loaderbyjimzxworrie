import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from './auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { authenticated } = verifyAdmin(req);
    if (!authenticated) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json(data);
    } catch (error) {
        console.error('Fetch transactions error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
