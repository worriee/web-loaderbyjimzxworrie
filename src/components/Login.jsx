import React, { useState } from 'react';
import { verifyAdminPassword } from '../utils/auth';

const Login = ({ onLogin }) => {
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage("");

        const isValid = verifyAdminPassword(password);

        if (isValid) {
            sessionStorage.setItem("isAdmin", "true");
            onLogin(true);
        } else {
            setErrorMessage("Invalid password.");
        }
    };

    return (
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md mx-auto">
            <form id="login-form" onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Admin Login</h2>
                

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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all shadow-md active:transform active:scale-[0.98]" 
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
