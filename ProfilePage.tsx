import React, { useState, useMemo, useRef, useEffect } from 'react';
// FIX: Changed import for 'Role' from type-only to a value import to allow its use in runtime enum comparisons.
import { Role } from '../types';
import type { User, Post, Comment } from '../types';
import { PlusIcon, TrashIcon, VerifiedIcon, SpeakerIcon, EditIcon, CopyIcon, HeartIcon, CommentIcon, SendIcon } from './Icons';
import CreateMember from './CreateMember';
import { generateSpeech } from '../services/geminiService';

// FIX: Add AudioContext and helper functions for decoding and playing raw PCM audio from the text-to-speech API.
const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


// --- SHARED POST CARD COMPONENT ---
interface PostCardProps {
    post: Post;
    author?: User;
    onDelete: (postId: string) => void;
    canDelete: boolean;
    highlightedItemId: string | null;
    onCopy?: (post: Post) => void;
    onLikePost: (postId: string) => void;
    onAddComment: (postId: string, content: string) => void;
    currentUser: User;
    usersById: Map<string, User>;
}

export const PostCard: React.FC<PostCardProps> = ({ post, author, onDelete, canDelete, highlightedItemId, onCopy, onLikePost, onAddComment, currentUser, usersById }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const TRUNCATE_LENGTH = 280;
    const isLongPost = post.content.length > TRUNCATE_LENGTH;
    const isLikedByCurrentUser = currentUser ? post.likes.includes(currentUser.id) : false;
    
    useEffect(() => {
        if (post.id === highlightedItemId) {
            cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightedItemId, post.id]);

    const handlePlaySound = async (text: string) => {
        if (isPlaying) return;
        setIsPlaying(true);
        try {
            // FIX: Correctly decode and play raw PCM audio data using the Web Audio API as per guidelines.
            const base64Audio = await generateSpeech(text);
            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioBytes, outputAudioContext, 24000, 1);
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);
            source.start();
            source.onended = () => setIsPlaying(false);
        } catch (error) {
            console.error("Failed to play audio", error);
            setIsPlaying(false);
        }
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() && currentUser.role !== Role.GUEST) {
            onAddComment(post.id, newComment.trim());
            setNewComment('');
        }
    };
    
    return (
    <div ref={cardRef} className={`bg-white dark:bg-gray-800 rounded-xl dark:border dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-500 ${post.id === highlightedItemId ? 'ring-4 ring-secondary ring-offset-2 dark:ring-offset-gray-900 shadow-xl' : 'shadow-md hover:shadow-xl'}`}>
        <div className="p-6">
             <div className="flex items-start mb-4">
                <img className="w-10 h-10 rounded-full mr-4 object-cover" src={author?.avatarUrl} alt={author?.name} />
                <div className="flex-grow">
                    <div className="flex items-center space-x-2">
                        <div className="font-bold text-dark dark:text-light text-lg">{author?.name}</div>
                        {author?.role === Role.ADMIN && <VerifiedIcon className="w-5 h-5 text-blue-500" title="Admin" />}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{post.createdAt.toLocaleString()}</p>
                </div>
                <div className="flex items-center">
                    {onCopy && (
                        <button onClick={() => onCopy(post)} title="Copy Post" className="text-gray-500 hover:text-primary dark:text-gray-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <CopyIcon className="w-5 h-5" />
                        </button>
                    )}
                    <button onClick={() => handlePlaySound(post.content)} disabled={isPlaying} className="text-gray-500 hover:text-primary dark:text-gray-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
                        <SpeakerIcon className="w-5 h-5" />
                    </button>
                    {canDelete && (
                        <button onClick={() => onDelete(post.id)} className="text-gray-500 hover:text-red-700 dark:text-gray-400 p-2 rounded-full hover:bg-red-100 dark:hover:bg-gray-700">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {isLongPost && !isExpanded ? `${post.content.substring(0, TRUNCATE_LENGTH)}...` : post.content}
            </p>
            {isLongPost && (
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm font-semibold text-primary hover:underline mt-2 text-left">
                    {isExpanded ? 'Show Less' : 'Show More'}
                </button>
            )}
        </div>
        {post.imageUrl && (
            <img className="max-h-96 w-full object-cover" src={post.imageUrl} alt="Post image" />
        )}
        <div className="p-6">
            <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
                <button onClick={() => onLikePost(post.id)} className={`flex items-center space-x-2 hover:text-red-500 transition-colors ${isLikedByCurrentUser ? 'text-red-500' : ''}`} disabled={currentUser.role === Role.GUEST}>
                    <HeartIcon filled={isLikedByCurrentUser} />
                    <span>{post.likes.length} Like{post.likes.length !== 1 ? 's' : ''}</span>
                </button>
                <button onClick={() => setShowComments(s => !s)} className="flex items-center space-x-2 hover:text-primary transition-colors">
                    <CommentIcon />
                    <span>{post.comments.length} Comment{post.comments.length !== 1 ? 's' : ''}</span>
                </button>
            </div>
             {showComments && (
                <div className="mt-4 pt-4 border-t dark:border-gray-700 space-y-4">
                    {post.comments.map(comment => {
                        const commentAuthor = usersById.get(comment.authorId);
                        return (
                            <div key={comment.id} className="flex items-start space-x-3">
                                <img src={commentAuthor?.avatarUrl} alt={commentAuthor?.name} className="w-8 h-8 rounded-full object-cover"/>
                                <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                    <p className="font-semibold text-sm text-dark dark:text-light">{commentAuthor?.name}</p>
                                    <p className="text-gray-800 dark:text-gray-200">{comment.content}</p>
                                </div>
                            </div>
                        );
                    })}
                    {currentUser.role !== Role.GUEST && (
                        <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2 pt-2">
                            <img src={currentUser.avatarUrl} alt="Your avatar" className="w-8 h-8 rounded-full object-cover"/>
                            <input 
                                type="text" 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-primary focus:border-primary rounded-full px-4 py-2"
                            />
                            <button type="submit" className="bg-primary text-white rounded-full p-2 hover:bg-opacity-90 transition-colors disabled:bg-gray-400" disabled={!newComment.trim()}>
                                <SendIcon className="w-5 h-5" />
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    </div>
)};


// --- EDIT PROFILE MODAL ---
interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (user: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatarUrl);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...user, name, username, avatarUrl: avatar });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-dark dark:text-light">Edit Profile</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="flex flex-col items-center space-y-2">
                <img src={avatar} alt="Avatar preview" className="w-24 h-24 rounded-full object-cover"/>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} id="avatar-upload" className="hidden"/>
                <label htmlFor="avatar-upload" className="cursor-pointer text-sm text-primary hover:underline">Change Photo</label>
            </div>
            <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-transparent dark:border-gray-600"/>
            </div>
             <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-transparent dark:border-gray-600"/>
            </div>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end space-x-3 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-light dark:hover:bg-gray-500 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-secondary text-dark rounded-lg font-bold hover:opacity-90 transition">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const AdminPanel = ({ users, currentUser, onAddUser, onDeleteUser, onUpdateUserRole, onEditUser }: { users: User[], currentUser: User, onAddUser: (user: Omit<User, 'id' | 'role' | 'avatarUrl' | 'email'>) => void, onDeleteUser: (userId: string) => void, onUpdateUserRole: (userId: string, newRole: Role) => void, onEditUser: (user: User) => void }) => {
    const [isAddingMember, setIsAddingMember] = useState(false);
    return (
        <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-dark dark:text-light">Member Management</h2>
                <button
                    onClick={() => setIsAddingMember(true)}
                    className="flex items-center space-x-2 bg-secondary text-dark font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Member</span>
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden dark:border dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.filter(u => u.role !== Role.GUEST).map(user => (
                        <li key={user.id} className="p-4 flex items-center space-x-4">
                            <img className="w-12 h-12 rounded-full object-cover" src={user.avatarUrl} alt={user.name} />
                            <div className="flex-grow">
                                <p className="font-semibold text-dark dark:text-light">{user.name}</p>
                                <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${user.role === Role.ADMIN ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>{user.role}</span>
                            <div className="flex items-center space-x-2 w-52 justify-end">
                                {user.role === Role.MEMBER && (
                                    <button
                                        onClick={() => onUpdateUserRole(user.id, Role.ADMIN)}
                                        className="text-xs bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900"
                                    >
                                        Promote to Admin
                                    </button>
                                )}
                                <button
                                    onClick={() => onEditUser(user)}
                                    className="text-gray-500 hover:text-primary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    aria-label={`Edit ${user.name}`}
                                >
                                    <EditIcon className="w-5 h-5" />
                                </button>
                                {user.id !== currentUser.id && ( // Prevent self-deletion
                                    <button
                                        onClick={() => onDeleteUser(user.id)}
                                        className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-red-100 dark:hover:bg-gray-700 transition"
                                        aria-label={`Remove ${user.name}`}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            {isAddingMember && <CreateMember onClose={() => setIsAddingMember(false)} onSave={onAddUser} />}
        </div>
    );
};

interface ProfilePageProps {
    currentUser: User;
    users: User[];
    posts: Post[];
    onAddUser: (user: Omit<User, 'id' | 'role' | 'avatarUrl' | 'email'>) => void;
    onDeleteUser: (userId: string) => void;
    onUpdateUserRole: (userId: string, newRole: Role) => void;
    onDeletePost: (postId: string) => void;
    onUpdateUser: (user: User) => void;
    highlightedItemId: string | null;
    onLikePost: (postId: string) => void;
    onAddComment: (postId: string, content: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, users, posts, onAddUser, onDeleteUser, onUpdateUserRole, onDeletePost, onUpdateUser, highlightedItemId, onLikePost, onAddComment }) => {
    const userPosts = useMemo(() => posts.filter(p => p.authorId === currentUser.id), [posts, currentUser.id]);
    const usersById = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const isAdmin = currentUser.role === Role.ADMIN;
    const [editingUser, setEditingUser] = useState<User | null>(null);

    return (
        <div className="p-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex items-center space-x-8 mb-8 dark:border dark:border-gray-700 relative">
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-32 h-32 rounded-full object-cover border-4 border-secondary"/>
                <div>
                    <h1 className="text-4xl font-extrabold text-dark dark:text-light">{currentUser.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">@{currentUser.username}</p>
                    <span className={`mt-2 inline-block px-4 py-1 text-md font-semibold rounded-full ${isAdmin ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                        {currentUser.role}
                    </span>
                </div>
                <div className="absolute top-4 right-4">
                    <button 
                        onClick={() => setEditingUser(currentUser)} 
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Edit your profile"
                    >
                        <EditIcon className="w-6 h-6"/>
                    </button>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-dark dark:text-light mb-6">My Posts</h2>
            <div className="grid gap-8">
                {userPosts.length > 0 ? userPosts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        author={usersById.get(post.authorId)}
                        onDelete={onDeletePost}
                        canDelete={true} // It's their own post
                        highlightedItemId={highlightedItemId}
                        onLikePost={onLikePost}
                        onAddComment={onAddComment}
                        currentUser={currentUser}
                        usersById={usersById}
                    />
                )) : <p className="text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:border dark:border-gray-700">You haven't created any posts yet.</p>}
            </div>

            {isAdmin && (
                <AdminPanel users={users} currentUser={currentUser} onAddUser={onAddUser} onDeleteUser={onDeleteUser} onUpdateUserRole={onUpdateUserRole} onEditUser={setEditingUser} />
            )}
            
            {editingUser && <EditProfileModal user={editingUser} onClose={() => setEditingUser(null)} onSave={onUpdateUser} />}
        </div>
    )
};

export default ProfilePage;