import React, { useState, useCallback, useReducer, useEffect } from 'react';
import { generatePostContent, quickEdit } from '../services/geminiService';
import { SparklesIcon, EditIcon } from './Icons';
import type { Post, User } from '../types';
import ImageEditModal from './ImageEditModal';


const CreatePost: React.FC<{
  currentUser: User;
  onClose: () => void;
  onAddPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => void;
  initialData?: { content: string; imageUrl?: string; } | null;
}> = ({ currentUser, onClose, onAddPost, initialData }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [quickEditState, setQuickEditState] = useReducer((s, a) => ({...s, ...a}), { loading: false, type: '' });

  useEffect(() => {
    if (initialData) {
        setContent(initialData.content || '');
        setImage(initialData.imageUrl || null);
    }
  }, [initialData]);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleGenerateContent = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const generatedText = await generatePostContent(aiPrompt);
      setContent(generatedText);
    } catch (error) {
      console.error(error);
      // You might want to show an error to the user
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickEdit = async (type: 'hashtags' | 'grammar' | 'engaging') => {
      if (!content) return;
      setQuickEditState({ loading: true, type });
      try {
          const result = await quickEdit(content, type);
          setContent(result);
      } catch (error) {
          console.error(error);
      } finally {
          setQuickEditState({ loading: false, type: '' });
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddPost({
      authorId: currentUser.id,
      content,
      imageUrl: image || undefined,
    });
    onClose();
  };

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-dark dark:text-light">Create a New Post</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="relative">
                <textarea
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
                  placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                ></textarea>
                <div className="absolute bottom-2 right-2 flex space-x-1">
                    {['hashtags', 'grammar', 'engaging'].map((type) => (
                        <button key={type} type="button" onClick={() => handleQuickEdit(type as any)} disabled={quickEditState.loading} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md disabled:opacity-50">
                            {quickEditState.loading && quickEditState.type === type ? '...' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">✨ Generate with AI</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 dark:border-gray-600"
                  placeholder="e.g., A post about our weekend teaching drive"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleGenerateContent}
                  disabled={isGenerating || !aiPrompt}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? 'Generating...' : <><SparklesIcon /><span>Generate</span></>}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 dark:hover:file:bg-primary/30"
              />
            </div>
            
            {image && 
                <div className="relative mt-4">
                    <img src={image} alt="Preview" className="rounded-lg max-h-48 w-auto object-cover" />
                    <button type="button" onClick={() => setIsEditingImage(true)} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition">
                        <EditIcon className="w-5 h-5"/>
                    </button>
                </div>
            }
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end space-x-3 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-light dark:hover:bg-gray-500 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-secondary text-dark rounded-lg font-bold hover:opacity-90 transition">Post</button>
          </div>
        </form>
      </div>
    </div>
    {isEditingImage && image && (
        <ImageEditModal
            image={image}
            onClose={() => setIsEditingImage(false)}
            onSave={(newImage) => {
                setImage(newImage);
                setIsEditingImage(false);
            }}
        />
    )}
    </>
  );
};

export default CreatePost;