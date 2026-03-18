import React from 'react';
import './TransactionsTable.css';

const TransactionsTable = ({ transactions, isAdmin, onStatusChange, onDelete }) => {

    const maskPhoneNumber = (phoneNumber) => {
        if (phoneNumber.length > 4) {
            return `${phoneNumber.substring(0, 2)}...${phoneNumber.substring(phoneNumber.length - 2)}`;
        }
        return phoneNumber;
    };

    return (
        <div className="transactions-container">
            <h2>Recent Transactions</h2>
            <table id="transaction-table">
                <thead>
                    <tr>
                        <th>Phone Number</th>
                        <th>Network</th>
                        <th>Mode of Payment</th>
                        <th>Notes</th>
                        {isAdmin && <th>Receipt</th>}
                        <th>Status</th>
                        {isAdmin && <th>Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction, index) => (
                        <tr key={index}>
                            <td>{isAdmin ? transaction.phoneNumber : maskPhoneNumber(transaction.phoneNumber)}</td>
                            <td>{transaction.network}</td>
                            <td>{transaction.modeOfPayment}</td>
                            <td>{transaction.notes}</td>
                            {isAdmin && (
                                <td>
                                    {transaction.receipt ? <a href={transaction.receipt} target="_blank" rel="noopener noreferrer"><img src={transaction.receipt} width="100" alt="Receipt" /></a> : ''}
                                </td>
                            )}
                            <td>
                                {isAdmin ? (
                                    <select
                                        className="status-select"
                                        value={transaction.status}
                                        onChange={(e) => onStatusChange(index, e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                ) : (
                                    transaction.status
                                )}
                            </td>
                            {isAdmin && (
                                <td>
                                    {transaction.status === 'Completed' && (
                                        <button onClick={() => onDelete(index)}>Delete</button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionsTable;
