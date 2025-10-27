import React, { useState } from 'react';
import type { Announcement } from '../types';

interface CreateAnnouncementProps {
  onClose: () => void;
  onSave: (announcement: Omit<Announcement, 'id' | 'createdAt'> | Announcement) => void;
  announcementToEdit?: Announcement | null;
}

const CreateAnnouncement: React.FC<CreateAnnouncementProps> = ({ onClose, onSave, announcementToEdit }) => {
  const [title, setTitle] = useState(announcementToEdit?.title || '');
  const [content, setContent] = useState(announcementToEdit?.content || '');

  const isEditing = !!announcementToEdit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Please fill out all required fields.");
      return;
    }
    
    const announcementData = {
      title,
      content,
    };

    if (isEditing) {
      onSave({ ...announcementToEdit, ...announcementData });
    } else {
      onSave(announcementData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-dark dark:text-light">{isEditing ? 'Edit Announcement' : 'Create New Announcement'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <input
              type="text"
              placeholder="Announcement Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
              required
            />
            <textarea
              className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
              placeholder="Announcement Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end space-x-3 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-light dark:hover:bg-gray-500 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-secondary text-dark rounded-lg font-bold hover:opacity-90 transition">{isEditing ? 'Save Changes' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncement;