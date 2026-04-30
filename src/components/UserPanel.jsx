import React, { useState, useEffect } from 'react';
import TransactionsTable from './TransactionsTable';
import { supabase } from '../utils/supabaseClient';

const UserPanel = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [network, setNetwork] = useState('');
    const [modeOfPayment, setModeOfPayment] = useState('');
    const [notes, setNotes] = useState('');
    const [receipt, setReceipt] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [lastTransactionId, setLastTransactionId] = useState('');
    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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


    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId) return;

        setIsSearching(true);
        setSearchResult(null);

        try {
            const { data, error } = await supabase
                .rpc('search_transaction', { t_id: searchId });

            if (error) throw error;

            if (data && data.length > 0) {
                setSearchResult(data[0]);
            } else {
                alert('Transaction not found. Please check your ID.');
            }
        } catch (error) {
            console.error('Error searching transaction:', error);
            alert('An error occurred while searching. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!receipt) {
            alert('Please upload a proof of payment.');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('file', receipt);
            formData.append('fileName', receipt.name);
            formData.append('phoneNumber', phoneNumber);
            formData.append('network', network);
            formData.append('modeOfPayment', modeOfPayment);
            formData.append('notes', notes);

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
            if (!data || !data.transactionId) throw new Error('No transaction ID returned');
            setSubmitted(true);

            setLastTransactionId(data.transactionId);
            setPhoneNumber('');
            setNetwork('');
            setModeOfPayment('');
            setNotes('');
            setReceipt(null);
        } catch (error) {
            console.error('Error adding transaction:', error);
            alert(error.message || 'Failed to add transaction. Please try again.');
            setSubmitted(false); // Revert to form on error
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
        <div className="w-full max-w-3xl bg-white p-5 rounded-lg shadow-md mx-auto">
            {!submitted ? (
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
                            <select id="network" value={network} onChange={(e) => setNetwork(e.target.value)} required className="w-full p-2.5 border border-gray-300 rounded">
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
                            <select id="mode-of-payment" value={modeOfPayment} onChange={handlePaymentChange} required className="w-full p-2.5 border border-gray-300 rounded">
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
                                required
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
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full p-2.5 text-white border-none rounded cursor-pointer text-base transition-colors ${isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600'}`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Add Transaction'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Transaction Submitted!</h2>
                    <p className="text-gray-600 mb-6">Your transaction has been added. Please don't spam adding a transaction and wait for your order to be processed.</p>
                    <div className="bg-gray-100 p-3 rounded-lg mb-6 w-full max-w-xs">
                        <span className="text-sm text-gray-500 block">Transaction ID:</span>
                        <span className="font-mono font-bold text-gray-800">{lastTransactionId}</span>
                    </div>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600 transition-colors"
                    >
                        Submit Another Transaction
                    </button>
                </div>
            )}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Check Transaction Status</h3>
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        placeholder="Enter Transaction ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="flex-1 p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors disabled:bg-gray-300 w-full sm:w-auto"
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </form>
                {searchResult && (
                    <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg flex justify-between items-center">
                        <span className="text-gray-600">Current Status:</span>
                        <span className={`font-bold ${
                            searchResult.status === 'Completed' ? 'text-green-600' :
                            searchResult.status === 'Cancelled' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                            {searchResult.status}
                        </span>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default UserPanel;
