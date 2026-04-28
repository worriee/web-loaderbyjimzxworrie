import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from './auth';

const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { authenticated } = verifyAdmin(req);
    if (!authenticated) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Transaction ID is required' });
    }

    try {
        const { error } = await supabaseAdmin
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Delete transaction error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
