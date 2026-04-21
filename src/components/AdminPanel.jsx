import React, { useState, useEffect } from 'react';
import TransactionsTable from './TransactionsTable';
import { supabase } from '../utils/supabaseClient';

const AdminPanel = () => {
    const [transactions, setTransactions] = useState([]);

    const fetchTransactions = async () => {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching transactions:', error);
        } else {
            setTransactions(data);
        }
    };

    useEffect(() => {
        fetchTransactions();
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

        const { data, error } = await supabase
            .from('transactions')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error || !data || data.length === 0) {
            const msg = error ? error.message : 'Permission denied or transaction not found.';
            console.error('Error updating transaction status:', error);
            alert(`Failed to update status: ${msg}`);
            setTransactions(previousTransactions); // Revert on error
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            const previousTransactions = [...transactions];

            // Optimistic Update: Remove from UI immediately
            setTransactions(prev => prev.filter(t => t.id !== id));

            const { data, error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id)
                .select();

            if (error || !data || data.length === 0) {
                const msg = error ? error.message : 'Permission denied or transaction not found.';
                console.error('Error deleting transaction:', error);
                alert(`Failed to delete transaction: ${msg}`);
                setTransactions(previousTransactions); // Revert on error
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
