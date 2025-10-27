import React, { useState } from 'react';
import { DonationInfo, User, Role } from '../types';
import { EditIcon } from './Icons';

interface EditDonationInfoModalProps {
    info: DonationInfo;
    onClose: () => void;
    onSave: (newInfo: DonationInfo) => void;
}

const EditDonationInfoModal: React.FC<EditDonationInfoModalProps> = ({ info, onClose, onSave }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState(info.qrCodeUrl);
    const [upiId, setUpiId] = useState(info.upiId);
    const [contactInfo, setContactInfo] = useState(info.contactInfo);
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrCodeUrl(reader.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ qrCodeUrl, upiId, contactInfo });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-dark dark:text-light">Edit Donation Information</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">QR Code Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code Preview" className="mt-4 rounded-lg w-32 h-32 object-contain" />}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">UPI ID</label>
                            <input
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-transparent dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Information</label>
                            <textarea
                                value={contactInfo}
                                onChange={(e) => setContactInfo(e.target.value)}
                                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-transparent dark:border-gray-600"
                            />
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


interface DonationsPageProps {
    donationInfo: DonationInfo;
    currentUser: User;
    onSave: (newInfo: DonationInfo) => void;
}

const DonationsPage: React.FC<DonationsPageProps> = ({ donationInfo, currentUser, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const isAdmin = currentUser.role === Role.ADMIN;
    
    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark dark:text-light">Support Our Cause</h1>
                {isAdmin && (
                    <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 bg-secondary text-dark font-bold px-4 py-2 rounded-full shadow-lg hover:opacity-90 transition">
                        <EditIcon className="w-5 h-5"/>
                        <span>Edit Info</span>
                    </button>
                )}
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg dark:border dark:border-gray-700 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 text-center">
                    <img src={donationInfo.qrCodeUrl} alt="Donation QR Code" className="w-64 h-64 rounded-lg object-contain bg-white p-2 shadow-md"/>
                    <p className="mt-4 font-mono text-lg text-dark dark:text-light bg-gray-100 dark:bg-gray-700 py-2 px-4 rounded-lg">{donationInfo.upiId}</p>
                </div>
                <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-primary mb-4">Make a Donation</h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Your contribution helps us provide education and resources to underprivileged students. Scan the QR code with any UPI app or use the UPI ID to donate.</p>
                    <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">Contact for Assistance:</p>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{donationInfo.contactInfo}</p>
                    </div>
                </div>
            </div>
            {isEditing && <EditDonationInfoModal info={donationInfo} onClose={() => setIsEditing(false)} onSave={onSave} />}
        </div>
    );
};

export default DonationsPage;
