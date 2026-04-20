import React from 'react';

const NotificationPopup = ({ isOpen, onClose, message }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center relative w-full max-w-[300px]" onClick={(e) => e.stopPropagation()}>
                <div className="mb-6 text-lg font-semibold text-gray-700 text-center">
                    {message}
                </div>
                <button 
                    onClick={onClose} 
                    className="bg-gray-500 text-white border-none py-2 px-6 rounded cursor-pointer text-base transition-colors duration-200 hover:bg-gray-600"
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default NotificationPopup;
