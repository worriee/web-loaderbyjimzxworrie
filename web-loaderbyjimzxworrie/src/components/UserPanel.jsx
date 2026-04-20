import React, { useState } from 'react';
import TransactionsTable from './TransactionsTable';

const UserPanel = () => {
    const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('transactions')) || []);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [network, setNetwork] = useState('');
    const [modeOfPayment, setModeOfPayment] = useState('');
    const [notes, setNotes] = useState('');
    const [receipt, setReceipt] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState('');

    const paymentInfo = {
        Gcash: 'Gcash Number: 09123456789',
        Maya: 'Maya Number: 09987654321'
    };

    const handlePaymentChange = (e) => {
        const selectedPayment = e.target.value;
        setModeOfPayment(selectedPayment);
        if (selectedPayment === 'Gcash' || selectedPayment === 'Maya') {
            setPaymentDetails(paymentInfo[selectedPayment]);
        } else {
            setPaymentDetails('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const processTransaction = (receiptData) => {
            const newTransaction = {
                phoneNumber,
                network,
                modeOfPayment,
                notes,
                receipt: receiptData,
                status: 'Pending'
            };
            const updatedTransactions = [...transactions, newTransaction];
            setTransactions(updatedTransactions);
            localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

            setPhoneNumber('');
            setNetwork('');
            setModeOfPayment('');
            setNotes('');
            setReceipt(null);
            document.getElementById('receipt').value = '';
        };

        if (receipt) {
            const reader = new FileReader();
            reader.onload = (event) => {
                processTransaction(event.target.result);
            };
            reader.readAsDataURL(receipt);
        } else {
            processTransaction(null);
        }
    };

    return (
        <div className="w-full max-w-3xl bg-white p-5 rounded-lg shadow-md mx-auto">
            <div className="mb-5">
                <form id="transaction-form" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="phone-number" className="block mb-1 font-bold">Phone Number</label>
                        <input
                            type="tel"
                            id="phone-number"
                            placeholder="Enter phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="w-full p-2.5 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="network" className="block mb-1 font-bold">Network</label>
                        <select id="network" value={network} onChange={(e) => setNetwork(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded">
                            <option value="" disabled>Select a network</option>
                            <option value="DITO">DITO</option>
                            <option value="SMART">SMART</option>
                            <option value="TNT">TNT</option>
                            <option value="GLOBE">GLOBE</option>
                            <option value="TM">TM</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="mode-of-payment" className="block mb-1 font-bold">Mode of Payment</label>
                        <select id="mode-of-payment" value={modeOfPayment} onChange={handlePaymentChange} className="w-full p-2.5 border border-gray-300 rounded">
                            <option value="" disabled>Select a payment method</option>
                            <option value="Gcash">Gcash</option>
                            <option value="Maya">Maya</option>
                        </select>
                    </div>
                    {paymentDetails && <div id="payment-details" className="mb-4">{paymentDetails}</div>}
                    <div className="mb-4">
                        <label htmlFor="notes" className="block mb-1 font-bold">Notes</label>
                        <textarea
                            id="notes"
                            placeholder="Type the amount of gb (eg. 1GB, 5GB, 10GB, etc)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded"
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <span className="block mb-2 font-bold">Upload Proof of Payment:</span>
                        <div className="flex items-center">
                            <label htmlFor="receipt" className="cursor-pointer bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors">
                                Upload Files
                            </label>
                            <input
                                id="receipt"
                                type="file"
                                name="receipt"
                                accept="image/*"
                                onChange={(e) => setReceipt(e.target.files[0])}
                                className="hidden"
                            />
                            <span className="ml-4 text-gray-600 truncate max-w-xs">
                                {receipt ? receipt.name : 'No file chosen'}
                            </span>
                        </div>
                    </div>
                    <button type="submit" className="w-full p-2.5 bg-gray-500 text-white border-none rounded cursor-pointer text-base hover:bg-gray-600">Add Transaction</button>
                </form>
            </div>
            <div className="overflow-x-auto">
                <TransactionsTable transactions={transactions} isAdmin={false} />
            </div>
        </div>
    );
};

export default UserPanel;