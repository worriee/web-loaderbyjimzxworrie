import React, { useState, useEffect, useCallback } from 'react';
import TransactionsTable from './TransactionsTable';

const AdminPanel = () => {
    const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('transactions')) || []);

    const saveTransactions = useCallback((transactions) => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
        setTransactions(transactions);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            const twelveHours = 12 * 60 * 60 * 1000;
            const now = new Date().getTime();

            const transactionsToDelete = transactions.filter(transaction => {
                if (transaction.status === 'Completed' && transaction.completedAt) {
                    return now - transaction.completedAt > twelveHours;
                }
                return false;
            });

            if (transactionsToDelete.length > 0) {
                if (window.confirm(`There are ${transactionsToDelete.length} completed transactions older than 12 hours. Do you want to delete them?`)) {
                    const updatedTransactions = transactions.filter(t => !transactionsToDelete.includes(t));
                    saveTransactions(updatedTransactions);
                }
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [saveTransactions, transactions]);

    const handleStatusChange = (index, newStatus) => {
        const updatedTransactions = [...transactions];
        updatedTransactions[index].status = newStatus;
        if (newStatus === 'Completed') {
            updatedTransactions[index].completedAt = new Date().getTime();
        } else {
            delete updatedTransactions[index].completedAt;
        }
        saveTransactions(updatedTransactions);
    };

    const handleDelete = (index) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            const updatedTransactions = [...transactions];
            updatedTransactions.splice(index, 1);
            saveTransactions(updatedTransactions);
        }
    };

    return (
<<<<<<< HEAD
        <div className="w-full max-w-3xl bg-white p-5 rounded-lg shadow-md mx-auto">
=======
        <div className="w-full max-w-3xl bg-white p-5 rounded-lg shadow-md mx-auto overflow-x-auto">
>>>>>>> 058a4ba (initial commit)
            <TransactionsTable
                transactions={transactions}
                isAdmin={true}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default AdminPanel;
