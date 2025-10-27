import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, User, Role } from '../types';
import { PlusIcon, EditIcon, TrashIcon, FilterIcon, SortAscendingIcon, SortDescendingIcon } from './Icons';
import CreateTask from './CreateTask';

interface TaskCardProps {
    task: Task;
    assignee?: User;
    canManage: boolean;
    canDrag: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, assignee, canManage, canDrag, onEdit, onDelete, onDragStart }) => {
    const isOverdue = !task.dueDate ? false : new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;
    return (
        <div 
            draggable={canDrag}
            onDragStart={(e) => onDragStart(e, task.id)}
            className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        >
            <h4 className="font-bold text-dark dark:text-light mb-2">{task.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    {assignee && <img src={assignee.avatarUrl} alt={assignee.name} className="w-6 h-6 rounded-full" title={`Assigned to ${assignee.name}`} />}
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                </div>
                {canManage && (
                    <div className="flex items-center space-x-1">
                        <button onClick={onEdit} className="p-1 text-gray-500 hover:text-primary dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><EditIcon className="w-4 h-4" /></button>
                        <button onClick={onDelete} className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 rounded-full hover:bg-red-100 dark:hover:bg-gray-700"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
        </div>
    );
};

interface TaskColumnProps {
    status: TaskStatus;
    title: string;
    tasks: Task[];
    usersById: Map<string, User>;
    currentUser: User;
    onEditTask: (task: Task) => void;
    onDeleteTask: (taskId: string) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ status, title, tasks, usersById, currentUser, onEditTask, onDeleteTask, onDrop, onDragStart }) => {
    const [isOver, setIsOver] = useState(false);
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        onDrop(e, status);
        setIsOver(false);
    };

    const statusColors = {
        [TaskStatus.TODO]: 'bg-red-100 text-red-800',
        [TaskStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
        [TaskStatus.DONE]: 'bg-green-100 text-green-800',
    };

    return (
        <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex-1 bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl transition-colors ${isOver ? 'bg-primary/10' : ''}`}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-dark dark:text-light">{title}</h3>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[status]}`}>{tasks.length}</span>
            </div>
            <div className="space-y-4 h-full">
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        assignee={usersById.get(task.assigneeId || '')}
                        onEdit={() => onEditTask(task)}
                        onDelete={() => onDeleteTask(task.id)}
                        canManage={currentUser.role === Role.ADMIN}
                        canDrag={currentUser.role !== Role.GUEST}
                        onDragStart={onDragStart}
                    />
                ))}
            </div>
        </div>
    );
};


interface TasksPageProps {
    tasks: Task[];
    users: User[];
    currentUser: User;
    onSaveTask: (task: Omit<Task, 'id' | 'createdAt' | 'creatorId' | 'status'> | Task) => void;
    onDeleteTask: (taskId: string) => void;
}

const TasksPage: React.FC<TasksPageProps> = ({ tasks, users, currentUser, onSaveTask, onDeleteTask }) => {
    const [editingTask, setEditingTask] = useState<Task | 'new' | null>(null);
    const [filterAssigneeId, setFilterAssigneeId] = useState('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const usersById = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    const tasksByStatus = useMemo(() => {
        const processedTasks = tasks
            .filter(task => filterAssigneeId === 'all' || task.assigneeId === filterAssigneeId)
            .sort((a, b) => {
                const dateA = new Date(a.dueDate).getTime();
                const dateB = new Date(b.dueDate).getTime();
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });

        return processedTasks.reduce((acc, task) => {
            if (!acc[task.status]) acc[task.status] = [];
            acc[task.status].push(task);
            return acc;
        }, {} as Record<TaskStatus, Task[]>);
    }, [tasks, filterAssigneeId, sortOrder]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
        e.dataTransfer.setData("taskId", taskId);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
        if (currentUser.role === Role.GUEST) return;
        const taskId = e.dataTransfer.getData("taskId");
        const taskToUpdate = tasks.find(t => t.id === taskId);
        if (taskToUpdate && taskToUpdate.status !== newStatus) {
            onSaveTask({ ...taskToUpdate, status: newStatus });
        }
    };


    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-dark dark:text-light">Tasks Board</h1>
                {currentUser.role !== Role.GUEST && (
                    <button
                        onClick={() => setEditingTask('new')}
                        className="flex items-center space-x-2 bg-secondary text-dark font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Create Task</span>
                    </button>
                )}
            </div>
             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <FilterIcon className="w-5 h-5 text-gray-500" />
                    <label htmlFor="assignee-filter" className="font-semibold text-gray-700 dark:text-gray-300">Filter by Assignee:</label>
                    <select
                        id="assignee-filter"
                        value={filterAssigneeId}
                        onChange={(e) => setFilterAssigneeId(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary"
                    >
                        <option value="all">All Members</option>
                        {users.filter(u => u.role !== Role.GUEST).map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                     <span className="font-semibold text-gray-700 dark:text-gray-300">Sort by Due Date:</span>
                    <button onClick={() => setSortOrder('desc')} className={`p-2 rounded-md ${sortOrder === 'desc' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        <SortDescendingIcon className="w-5 h-5" title="Due Soonest"/>
                    </button>
                     <button onClick={() => setSortOrder('asc')} className={`p-2 rounded-md ${sortOrder === 'asc' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        <SortAscendingIcon className="w-5 h-5" title="Due Latest"/>
                    </button>
                </div>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                <TaskColumn 
                    status={TaskStatus.TODO}
                    title="To Do"
                    tasks={tasksByStatus[TaskStatus.TODO] || []}
                    usersById={usersById}
                    currentUser={currentUser}
                    onEditTask={setEditingTask}
                    onDeleteTask={onDeleteTask}
                    onDrop={handleDrop}
                    onDragStart={handleDragStart}
                />
                 <TaskColumn 
                    status={TaskStatus.IN_PROGRESS}
                    title="In Progress"
                    tasks={tasksByStatus[TaskStatus.IN_PROGRESS] || []}
                    usersById={usersById}
                    currentUser={currentUser}
                    onEditTask={setEditingTask}
                    onDeleteTask={onDeleteTask}
                    onDrop={handleDrop}
                    onDragStart={handleDragStart}
                />
                 <TaskColumn 
                    status={TaskStatus.DONE}
                    title="Done"
                    tasks={tasksByStatus[TaskStatus.DONE] || []}
                    usersById={usersById}
                    currentUser={currentUser}
                    onEditTask={setEditingTask}
                    onDeleteTask={onDeleteTask}
                    onDrop={handleDrop}
                    onDragStart={handleDragStart}
                />
            </div>
            {editingTask && <CreateTask users={users} onClose={() => setEditingTask(null)} onSaveTask={onSaveTask} taskToEdit={editingTask === 'new' ? null : editingTask} />}
        </div>
    );
};

export default TasksPage;