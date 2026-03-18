import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import UserPanel from './components/UserPanel';
import AdminPanel from './components/AdminPanel';
import './index.css';

function App() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    useEffect(() => {
        const adminStatus = sessionStorage.getItem('isAdmin') === 'true';
        setIsAdmin(adminStatus);
    }, []);

    const handleLogin = (status) => {
        setIsAdmin(status);
        setShowLogin(false);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('isAdmin');
        setIsAdmin(false);
        setShowLogin(false);
    };

    const handleAdminLoginClick = () => {
        setShowLogin(true);
    };

    if (showLogin) {
        return <Login onLogin={handleLogin} />;
    }

    if (isAdmin) {
        return <AdminPanel onLogout={handleLogout} />;
    }

    return <UserPanel onLogout={handleAdminLoginClick} />;
}

export default App;
