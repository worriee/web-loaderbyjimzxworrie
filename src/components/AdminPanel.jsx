import React, { useState, useEffect } from 'react';
import TransactionsTable from './TransactionsTable';
import './AdminPanel.css';

const AdminPanel = ({ onLogout }) => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const storedTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
        setTransactions(storedTransactions);
        checkCompletedTransactions(storedTransactions);
    }, []);

    const saveTransactions = (transactions) => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
        setTransactions(transactions);
    };

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

    const checkCompletedTransactions = (transactions) => {
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
    };

    return (
        <div className="container">
            <div className="header">
                <h1>Worrie</h1>
                <div id="auth-container">
                    <span id="user-status">Admin Panel</span>
                    <button id="auth-button" onClick={onLogout}>Logout</button>
                </div>
            </div>
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
