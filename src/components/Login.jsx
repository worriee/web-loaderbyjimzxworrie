import React, { useState } from 'react';

const Login = ({ onLogin }) => {
    const [password, setPassword] = useState(""); // This will now hold the 6-digit Authenticator code
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(""); // Clear previous errors

        // Frontend validation for code format
        if (password.length !== 6 || !/^\d{6}$/.test(password)) {
            setErrorMessage("Please enter a valid 6-digit code from your Authenticator app.");
            return;
        }

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code: password }), // Send only the 6-digit code
            });

            const data = await response.json();

            if (response.ok && data.isAdmin) {
                sessionStorage.setItem("isAdmin", "true");
                onLogin(true);
            } else {
                setErrorMessage(data.message || "Login failed. Please check your Authenticator code.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage("Connection Error: Could not reach the login service.");
        }
    };

    return (
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md mx-auto">
            <form id="login-form" onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Admin Login</h2>
                

                <div className="mb-8">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        6-Digit Authenticator Code
                    </label>
                    <input
                        className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        type="password"
                        id="password"
                        placeholder="Enter 6-digit code"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        maxLength="6"
                        required
                    />
                </div>

                <button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all shadow-md active:transform active:scale-[0.98]" 
                    type="submit"
                >
                    Login
                </button>

                <p id="error-message" className="text-red-500 text-xs italic mt-4 text-center">
                    {errorMessage}
                </p>

                <div className="mt-10 p-5 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 leading-relaxed">
                    <p className="font-bold mb-2 text-blue-900 uppercase tracking-wider text-[10px]">How to Log In:</p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Get the current 6-digit code from your Google Authenticator app.</li>
                        <li>Enter the full 6-digit code.</li>
                    </ol>
                </div>
            </form>
        </div>
    );
};

export default Login;
