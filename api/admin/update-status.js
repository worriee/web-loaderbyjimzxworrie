import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from './auth.js';

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

    const { id, status } = req.body;

    if (!id || !status) {
        return res.status(400).json({ error: 'Transaction ID and status are required' });
    }

    try {
        const updateData = { status };
        if (status === 'Completed') {
            updateData.completed_at = new Date().toISOString();
        } else {
            updateData.completed_at = null;
        }

        const { data, error } = await supabaseAdmin
            .from('transactions')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Update status error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
