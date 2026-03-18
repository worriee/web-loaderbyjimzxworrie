import React, { useState, useEffect } from 'react';
import TransactionsTable from './TransactionsTable';
import './UserPanel.css';

const UserPanel = ({ onLogout }) => {
    const [transactions, setTransactions] = useState([]);
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

    useEffect(() => {
        const storedTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
        setTransactions(storedTransactions);
    }, []);

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
        <div className="container">
            <div className="header">
                <h1>Worrie</h1>
                <div id="auth-container">
                    <span id="user-status">User Panel</span>
                    <button id="auth-button" onClick={onLogout}>Admin Login</button>
                </div>
            </div>
            <div className="form-container">
                <form id="transaction-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="phone-number">Phone Number</label>
                        <input
                            type="tel"
                            id="phone-number"
                            placeholder="Enter phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="network">Network</label>
                        <select id="network" value={network} onChange={(e) => setNetwork(e.target.value)}>
                            <option value="" disabled>Select a network</option>
                            <option value="DITO">DITO</option>
                            <option value="SMART">SMART</option>
                            <option value="TNT">TNT</option>
                            <option value="GLOBE">GLOBE</option>
                            <option value="TM">TM</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="mode-of-payment">Mode of Payment</label>
                        <select id="mode-of-payment" value={modeOfPayment} onChange={handlePaymentChange}>
                            <option value="" disabled>Select a payment method</option>
                            <option value="Gcash">Gcash</option>
                            <option value="Maya">Maya</option>
                        </select>
                    </div>
                    {paymentDetails && <div id="payment-details" className="form-group">{paymentDetails}</div>}
                    <div className="form-group">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            placeholder="Type the promo or gb of selected network. eg. SAYAALL99 or 1GB"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="receipt">Upload Proof of Payment:</label>
                        <input type="file" id="receipt" name="receipt" accept="image/*" onChange={(e) => setReceipt(e.target.files[0])} />
                    </div>
                    <button type="submit">Add Transaction</button>
                </form>
            </div>
            <TransactionsTable transactions={transactions} isAdmin={false} />
        </div>
    );
};

export default UserPanel;
