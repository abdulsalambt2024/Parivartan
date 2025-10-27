import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-dark dark:text-light mb-4">{title}</h2>
          <p className="text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end space-x-3 border-t dark:border-gray-700">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-light dark:hover:bg-gray-500 transition">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
