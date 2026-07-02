import React, { useState, useEffect } from 'react';
import TransactionsTable from './TransactionsTable';
import { supabase } from '../utils/supabaseClient';

const AdminPanel = () => {
    const [transactions, setTransactions] = useState([]);

    const fetchTransactions = async () => {
        try {
            const response = await fetch('/api/admin/transactions');
            if (!response.ok) throw new Error('Failed to fetch transactions');
            const data = await response.json();
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    useEffect(() => {
        fetchTransactions();

        // Set up Realtime subscription to automatically refresh when data changes
        const channel = supabase
            .channel('transactions-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions',
                },
                () => {
                    fetchTransactions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        const updateData = { status: newStatus };
        if (newStatus === 'Completed') {
            updateData.completed_at = new Date().toISOString();
        } else {
            updateData.completed_at = null;
        }

        try {
            const response = await fetch('/api/admin/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update status');
            }
            await fetchTransactions();
        } catch (error) {
            console.error('Error updating transaction status:', error);
            alert(`Failed to update status: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                const response = await fetch('/api/admin/delete-transaction', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id }),
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete transaction');
                }
                await fetchTransactions();
            } catch (error) {
                console.error('Error deleting transaction:', error);
                alert(`Failed to delete transaction: ${error.message}`);
            }
        }
    };

    return (
        <div className="w-full max-w-3xl bg-white p-5 rounded-lg shadow-md mx-auto">
            <div className="overflow-x-auto">
                <TransactionsTable
                    transactions={transactions}
                    isAdmin={true}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
};

export default AdminPanel;
