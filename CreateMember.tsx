import React, { useState } from 'react';
import type { User } from '../types';

interface CreateMemberProps {
  onClose: () => void;
  onSave: (userData: Omit<User, 'id' | 'role' | 'avatarUrl' | 'email'>) => void;
}

const CreateMember: React.FC<CreateMemberProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      alert("Please fill out all fields.");
      return;
    }
    onSave({ name, username, password });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-dark dark:text-light">Add New Member</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
              required
            />
             <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
              required
            />
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end space-x-3 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-light dark:hover:bg-gray-500 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-secondary text-dark rounded-lg font-bold hover:opacity-90 transition">Add Member</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMember;