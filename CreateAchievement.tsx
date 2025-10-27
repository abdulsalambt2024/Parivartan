import React, { useState, useEffect } from 'react';
import type { Achievement } from '../types';

interface CreateAchievementProps {
  onClose: () => void;
  onSave: (achievement: Omit<Achievement, 'id'> | Achievement) => void;
  achievementToEdit?: Achievement | null;
}

const CreateAchievement: React.FC<CreateAchievementProps> = ({ onClose, onSave, achievementToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const isEditing = !!achievementToEdit;

  useEffect(() => {
    if (isEditing) {
        setTitle(achievementToEdit.title);
        setDescription(achievementToEdit.description);
        setDate(new Date(achievementToEdit.date).toISOString().split('T')[0]);
        setImage(achievementToEdit.imageUrl || null);
    }
  }, [achievementToEdit, isEditing]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !date || !image) {
        alert("Please fill out all required fields, including the image.");
        return;
    };
    
    const achievementData = {
      title,
      description,
      date: new Date(date),
      imageUrl: image,
    };

     if (isEditing) {
      onSave({ ...achievementToEdit, ...achievementData });
    } else {
      onSave(achievementData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-dark dark:text-light">{isEditing ? 'Edit Achievement' : 'Add New Achievement'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4  max-h-[70vh] overflow-y-auto">
            <input
              type="text"
              placeholder="Achievement Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
              required
            />
            <textarea
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-transparent dark:border-gray-600 dark:placeholder-gray-400 dark:[color-scheme:dark]"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                required={!isEditing}
              />
            </div>
            {image && <img src={image} alt="Preview" className="mt-4 rounded-lg max-h-48 w-auto object-cover" />}
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end space-x-3 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-light dark:hover:bg-gray-500 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-secondary text-dark rounded-lg font-bold hover:opacity-90 transition">{isEditing ? 'Save Changes' : 'Add Achievement'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAchievement;