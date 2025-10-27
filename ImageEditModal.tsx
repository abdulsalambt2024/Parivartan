import React, { useState } from 'react';
import { SparklesIcon } from './Icons';
import { editImage } from '../services/geminiService';

interface ImageEditModalProps {
  image: string;
  onClose: () => void;
  onSave: (newImage: string) => void;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({ image, onClose, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await editImage(image, prompt);
      setEditedImage(result);
    } catch (err) {
      setError('Failed to edit image. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = () => {
    if (editedImage) {
        onSave(editedImage);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-dark dark:text-light">Edit Image with AI</h2>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 dark:text-light">Original</h3>
              <img src={image} alt="Original" className="rounded-lg w-full h-auto object-contain" />
            </div>
            <div>
              <h3 className="font-semibold mb-2 dark:text-light">Edited</h3>
              <div className="rounded-lg w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center aspect-square">
                {isLoading ? (
                  <div className="text-gray-500 dark:text-gray-400">Generating...</div>
                ) : editedImage ? (
                  <img src={editedImage} alt="Edited" className="rounded-lg w-full h-auto object-contain" />
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 p-4 text-center">Your edited image will appear here.</div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-4">
            <input
              type="text"
              className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
              placeholder="e.g., Add a retro filter, remove the background..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading || !prompt}
              className="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Generating...' : <><SparklesIcon /><span>Generate</span></>}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end space-x-3 border-t dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-light dark:hover:bg-gray-500 transition">Cancel</button>
          <button type="button" onClick={handleSave} disabled={!editedImage || isLoading} className="px-6 py-2 bg-secondary text-dark rounded-lg font-bold hover:opacity-90 transition disabled:bg-yellow-200 disabled:cursor-not-allowed">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditModal;