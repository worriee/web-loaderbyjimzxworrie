import React from 'react';

const TransactionsTable = ({ transactions, isAdmin, onStatusChange, onDelete }) => {

    const maskPhoneNumber = (phoneNumber) => {
        if (phoneNumber.length > 4) {
            return `${phoneNumber.substring(0, 2)}...${phoneNumber.substring(phoneNumber.length - 2)}`;
        }
        return phoneNumber;
    };

    return (
        <>
            <h2 className="text-center mb-4 sticky left-0 right-0">Recent Transactions</h2>
            <table className="w-full border-collapse table-auto">
                <thead>
                    <tr>
                        <th className="p-3 border border-gray-300 text-left bg-gray-100">Phone Number</th>
                        <th className="p-3 border border-gray-300 text-left bg-gray-100">Network</th>
                        <th className="p-3 border border-gray-300 text-left bg-gray-100">Mode of Payment</th>
                        <th className="p-3 border border-gray-300 text-left bg-gray-100">Notes</th>
                        {isAdmin && <th className="p-3 border border-gray-300 text-left bg-gray-100">Receipt</th>}
                        <th className="p-3 border border-gray-300 text-left bg-gray-100">Status</th>
                        {isAdmin && <th className="p-3 border border-gray-300 text-left bg-gray-100">Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                        <tr key={transaction.id} className="even:bg-gray-50">
                            <td className="p-3 border border-gray-300 text-left">{isAdmin ? transaction.phone_number : maskPhoneNumber(transaction.phone_number)}</td>
                            <td className="p-3 border border-gray-300 text-left">{transaction.network}</td>
                            <td className="p-3 border border-gray-300 text-left">{transaction.mode_of_payment}</td>
                            <td className="p-3 border border-gray-300 text-left">{transaction.notes}</td>
                            {isAdmin && (
                                <td className="p-3 border border-gray-300 text-left">
                                    {transaction.receipt ? <a href={transaction.receipt} target="_blank" rel="noopener noreferrer"><img src={transaction.receipt} width="100" alt="Receipt" /></a> : ''}
                                </td>
                            )}
                            <td className="p-3 border border-gray-300 text-left">
                                {isAdmin ? (
                                    <select
                                        className="w-full p-1 rounded"
                                        value={transaction.status}
                                         onChange={(e) => onStatusChange(transaction.id, e.target.value)}
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
                                <td className="p-3 border border-gray-300 text-left">
                                     {(transaction.status === 'Completed' || transaction.status === 'Cancelled') && (
                                         <button onClick={() => onDelete(transaction.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete</button>
                                     )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default TransactionsTable;
