import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import UserPanel from './components/UserPanel';
import AdminPanel from './components/AdminPanel';
import Navbar from './components/Navbar';
import Popup from './components/Popup';
import './index.css';

function App() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const [showUserPopup, setShowUserPopup] = useState(false);
    const [showAdminPopup, setShowAdminPopup] = useState(false);

    // Verify authentication status on load by checking if the browser has a valid token
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/verify');
                if (response.ok) {
                    const data = await response.json();
                    setIsAdmin(data.isAuthenticated);
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Auth verification failed", error);
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleLogin = (status) => {
        setIsAdmin(status);
        setShowLogin(false);
    };

    const handleLogout = async () => {
        // Call the backend to destroy the cookie token
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch (error) {
            console.error("Logout failed", error);
        }
        setIsAdmin(false);
        setShowAdminPopup(false);
    };

    const handleAdminLoginClick = () => {
        setShowLogin(true);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading application...</div>;
    }

    if (showLogin) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div>
            <Navbar
                isAdmin={isAdmin}
                onUserIconClick={() => isAdmin ? setShowAdminPopup(true) : setShowUserPopup(true)}
            />
            <Popup
                isOpen={showUserPopup}
                onClose={() => setShowUserPopup(false)}
                onAdminLoginClick={handleAdminLoginClick}
            />
            <Popup
                isOpen={showAdminPopup}
                onClose={() => setShowAdminPopup(false)}
                onAdminLogout={handleLogout}
                isAdmin={true}
            />
            <div className="pt-[60px]">
                {isAdmin ? <AdminPanel /> : <UserPanel />}
            </div>
        </div>
    );
}

export default App;
