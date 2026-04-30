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

    useEffect(() => {
        const timer = setTimeout(async () => {
            const twelveHours = 12 * 60 * 60 * 1000;
            const now = Date.now();

            const transactionsToDelete = transactions.filter(transaction => {
                if (transaction.status === 'Completed' && transaction.completed_at) {
                    const completedAt = new Date(transaction.completed_at).getTime();
                    return now - completedAt > twelveHours;
                }
                return false;
            });

            if (transactionsToDelete.length > 0) {
                if (window.confirm(`There are ${transactionsToDelete.length} completed transactions older than 12 hours. Do you want to delete them?`)) {
                    const idsToDelete = transactionsToDelete.map(t => t.id);
                    const { error } = await supabase
                        .from('transactions')
                        .delete()
                        .in('id', idsToDelete);

                    if (error) {
                        console.error('Error deleting old transactions:', error);
                    } else {
                        fetchTransactions();
                    }
                }
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [transactions]);

    const handleStatusChange = async (id, newStatus) => {
        const previousTransactions = [...transactions];
        
        // Optimistic Update: Update UI immediately
        setTransactions(prev => prev.map(t =>
            t.id === id
                ? { ...t, status: newStatus, completed_at: newStatus === 'Completed' ? new Date().toISOString() : null }
                : t
        ));

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
        } catch (error) {
            console.error('Error updating transaction status:', error);
            alert(`Failed to update status: ${error.message}`);
            setTransactions(previousTransactions); // Revert on error
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
