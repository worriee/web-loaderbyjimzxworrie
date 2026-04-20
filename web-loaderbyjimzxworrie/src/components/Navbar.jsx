import React from 'react';
import userIcon from '../assets/userr.png';

const Navbar = ({ isAdmin, onUserIconClick }) => {
    const handleIconClick = () => {
        onUserIconClick();
    };

    return (
        <nav className="flex justify-between items-center px-5 h-[60px] bg-gray-100 border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
            <div>
                <span className="text-2xl font-bold">Worrie</span>
            </div>
            <div className="flex items-center">
                <span className="mr-4">{isAdmin ? 'Admin Panel' : 'User Panel'}</span>
                <div className="relative">
                    <img src={userIcon} alt="User" className="w-10 h-10 cursor-pointer rounded-full" onClick={handleIconClick} />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
