import React, { useState, useEffect } from 'react';
import { Task, User, Role } from '../types';
import { SparklesIcon } from './Icons';
import { generateTaskDescription } from '../services/geminiService';

interface CreateTaskProps {
  onClose: () => void;
  onSaveTask: (task: Omit<Task, 'id' | 'createdAt' | 'creatorId' | 'status'> | Task) => void;
  taskToEdit?: Task | null;
  users: User[];
}

const CreateTask: React.FC<CreateTaskProps> = ({ onClose, onSaveTask, taskToEdit, users }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);

  const isEditing = !!taskToEdit;
  const memberUsers = users.filter(u => u.role !== Role.GUEST);

  useEffect(() => {
    if (isEditing) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setDueDate(new Date(taskToEdit.dueDate).toISOString().split('T')[0]);
      setAssigneeId(taskToEdit.assigneeId);
    }
  }, [taskToEdit, isEditing]);

  const handleGenerateDescription = async () => {
    if (!title) return;
    setIsGenerating(true);
    try {
        const generatedDesc = await generateTaskDescription(title);
        setDescription(generatedDesc);
    } catch (error) {
        console.error(error);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
        alert("Please provide at least a title and a due date.");
        return;
    };
    
    const taskData = {
      title,
      description,
      dueDate: new Date(dueDate),
      assigneeId,
    };

    if (isEditing) {
        onSaveTask({ ...taskToEdit, ...taskData });
    } else {
        onSaveTask(taskData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-dark dark:text-light">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
              required
            />
            <div className="relative">
                <textarea
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-transparent dark:border-gray-600 dark:placeholder-gray-400"
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <button 
                    type="button" 
                    onClick={handleGenerateDescription}
                    disabled={!title || isGenerating}
                    className="absolute bottom-2 right-2 flex items-center space-x-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate description from title"
                >
                    <SparklesIcon className="w-4 h-4" />
                    <span>{isGenerating ? 'Generating...' : 'AI ✨'}</span>
                </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-transparent dark:border-gray-600 dark:placeholder-gray-400 dark:[color-scheme:dark]"
                        required
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To</label>
                     <select
                        value={assigneeId || ''}
                        onChange={(e) => setAssigneeId(e.target.value || undefined)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white dark:bg-gray-700 dark:border-gray-600"
                     >
                        <option value="">Unassigned</option>
                        {memberUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                     </select>
                </div>
            </div>
            
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end space-x-3 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-light dark:hover:bg-gray-500 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-secondary text-dark rounded-lg font-bold hover:opacity-90 transition">{isEditing ? 'Save Changes' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;