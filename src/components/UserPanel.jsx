import React, { useState, useEffect } from 'react';
import TransactionsTable from './TransactionsTable';
import { supabase } from '../utils/supabaseClient';

const UserPanel = () => {
    const [transactions, setTransactions] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [network, setNetwork] = useState('');
    const [modeOfPayment, setModeOfPayment] = useState('');
    const [notes, setNotes] = useState('');
    const [receipt, setReceipt] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState('');

    const paymentInfo = {
        Gcash: 'Gcash Number: 09859722995 JM',
        Maya: 'Maya Number: 09859722995'
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

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        const { data, error } = await supabase
            .rpc('get_recent_transactions');

        if (error) {
            console.error('Error fetching transactions:', error);
        } else {
            setTransactions(data);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

    const processTransaction = async (receiptUrl) => {
        const newTransaction = {
            phone_number: phoneNumber,
            network,
            mode_of_payment: modeOfPayment,
            notes,
            receipt: receiptUrl,
            status: 'Pending'
        };

        const { data, error } = await supabase
            .from('transactions')
                .insert([newTransaction])
                .select();

            if (error) {
                console.error('Error inserting transaction:', error);
                alert('Failed to add transaction. Please try again.');
                return;
            }

                setTransactions([ ...data, ...transactions].slice(0, 10));
                setPhoneNumber('');
            setNetwork('');
            setModeOfPayment('');
            setNotes('');
            setReceipt(null);
            document.getElementById('receipt').value = '';
        };

        if (receipt) {
            try {
                const formData = new FormData();
                formData.append('file', receipt);
                formData.append('fileName', receipt.name);
                formData.append('transactionId', Math.random().toString(36).substring(2, 15));

                const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-receipt`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Edge Function error: ${response.status} ${response.statusText} - ${errorText}`);
                }

                const data = await response.json();
                if (!data || !data.url) throw new Error('No upload URL returned');

                await processTransaction(data.url);
            } catch (error) {
                console.error('Error uploading receipt via Edge Function:', error);
                alert(error.message || 'Failed to upload receipt. Please try again.');
            }
        } else {
            await processTransaction(null);
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
