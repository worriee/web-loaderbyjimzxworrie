import React from 'react';
import userIcon from '../assets/userr.png';

const Popup = ({ isOpen, onClose, onAdminLoginClick, isAdmin, onAdminLogout }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center relative w-[300px]" onClick={(e) => e.stopPropagation()}>
                <img src={userIcon} alt="User" className="w-20 h-20 rounded-full mb-4" />
                {isAdmin ? (
                    <>
                        <span className="mb-5 text-base text-gray-500">Logged In as Admin</span>
                        <button onClick={onAdminLogout} className="bg-gray-500 text-white border-none py-3 px-6 rounded cursor-pointer text-lg transition-colors duration-200 hover:bg-gray-600">
                            Logout As Admin
                        </button>
                    </>
                ) : (
                    <>
                        <span className="mb-5 text-base text-gray-500">Logged In as User</span>
                        <button onClick={() => { onAdminLoginClick(); onClose(); }} className="bg-gray-500 text-white border-none py-3 px-6 rounded cursor-pointer text-lg transition-colors duration-200 hover:bg-gray-600">
                            Login as Admin
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Popup;
