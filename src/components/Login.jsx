import React, { useState } from 'react';

import { supabase } from '../utils/supabaseClient';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        try {
            // Call the Vercel Serverless Function for Admin Login
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Login failed');
            }

            if (result.success) {
                // The API has set a secure HttpOnly cookie.
                // We tell the app the user is now an admin.
                onLogin(true);
            } else {
                setErrorMessage("Invalid admin credentials.");
            }
        } catch (error) {
            console.error("Login fetch error:", error);
            setErrorMessage(error.message || "Server error. Please try again later.");
        }
    };

    return (
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md mx-auto">
            <form id="login-form" onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Admin Login</h2>
                

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email Address
                    </label>
                    <input
                        className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-8">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button 
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-white-300 transition-all shadow-md active:transform active:scale-[0.98]" 
                    type="submit"
                >
                    Login
                </button>

                <p id="error-message" className="text-red-500 text-xs italic mt-4 text-center">
                    {errorMessage}
                </p>

            </form>
        </div>
    );
};

export default Login;
