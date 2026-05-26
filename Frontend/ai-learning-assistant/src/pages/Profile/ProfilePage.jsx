import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { User, Mail, Lock, CheckCircle2, Loader2, Save, Camera, Eye, EyeOff, X } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    
    // Form states
    const [formData, setFormData] = useState({
        username: user?.username || "",
        email: user?.email || ""
    });

    // Password states
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [pwdLoading, setPwdLoading] = useState(false);
    
    // Show password states
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Avatar state
    const fileInputRef = useRef(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [previewImage, setPreviewImage] = useState(false);
    
    // Server base URL
    const BASE_URL = "http://localhost:8000";

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authService.updateProfile(formData);
            updateUser(res.data);
            toast.success("Your personal profile has been updated successfully!");
        } catch (error) {
            toast.error(error.error || error.message || "Could not update profile details.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error("The new passwords you entered do not match. Please verify and try again.");
        }
        if (passwords.newPassword.length < 6) {
            return toast.error("For security, your new password must be at least 6 characters long.");
        }

        setPwdLoading(true);
        try {
            await authService.changePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast.success("Your password has been changed successfully!");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            toast.error(error.error || error.message || "Could not update password. Please check your current password and try again.");
        } finally {
            setPwdLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset file input
        e.target.value = null;

        const formData = new FormData();
        formData.append("image", file);

        setUploadingAvatar(true);
        try {
            const res = await authService.uploadAvatar(formData);
            updateUser({ profilePicture: res.data.profilePicture });
            toast.success("Your profile picture has been updated successfully!");
        } catch (error) {
            toast.error(error.error || error.message || "Unable to upload image. Please verify it is a valid JPEG/PNG and try again.");
        } finally {
            setUploadingAvatar(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Manage your profile and security preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-50 text-blue-500 w-10 h-10 rounded-xl flex items-center justify-center font-bold">
                                <User size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <User size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={formData.username}
                                        onChange={e => setFormData(prev => ({...prev, username: e.target.value}))}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <Mail size={18} />
                                    </div>
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        onChange={e => setFormData(prev => ({...prev, email: e.target.value}))}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button 
                                    type="submit"
                                    disabled={loading || (formData.username === user?.username && formData.email === user?.email)}
                                    className="bg-primary hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2 text-sm"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-emerald-50 text-emerald-500 w-10 h-10 rounded-xl flex items-center justify-center font-bold">
                                <Lock size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Current Password</label>
                                <div className="relative group">
                                    <input 
                                        type={showCurrent ? "text" : "password"}
                                        required
                                        value={passwords.currentPassword}
                                        onChange={e => setPasswords(p => ({...p, currentPassword: e.target.value}))}
                                        placeholder="••••••••"
                                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-500 transition-colors"
                                    >
                                        {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">New Password</label>
                                    <div className="relative group">
                                        <input 
                                            type={showNew ? "text" : "password"}
                                            required
                                            value={passwords.newPassword}
                                            onChange={e => setPasswords(p => ({...p, newPassword: e.target.value}))}
                                            placeholder="Min. 6 characters"
                                            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNew(!showNew)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-500 transition-colors"
                                        >
                                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                                    <div className="relative group">
                                        <input 
                                            type={showConfirm ? "text" : "password"}
                                            required
                                            value={passwords.confirmPassword}
                                            onChange={e => setPasswords(p => ({...p, confirmPassword: e.target.value}))}
                                            placeholder="Repeat new password"
                                            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-500 transition-colors"
                                        >
                                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button 
                                    type="submit"
                                    disabled={pwdLoading || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
                                    className="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2 text-sm"
                                >
                                    {pwdLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary to-orange-400 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                        <div className="relative z-10 text-center">
                            
                            <input 
                                type="file"
                                accept="image/jpeg, image/png, image/webp"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                            />
                            
                            <div className="relative w-24 h-24 mx-auto mb-4">
                                <div 
                                    onClick={() => {
                                        if (user?.profilePicture) {
                                            setPreviewImage(true);
                                        } else {
                                            fileInputRef.current?.click();
                                        }
                                    }}
                                    className="w-full h-full bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold shadow-inner backdrop-blur-md border-2 border-white/30 cursor-pointer overflow-hidden group"
                                    title={user?.profilePicture ? "Click to view picture" : "Click to upload profile picture"}
                                >
                                    {user?.profilePicture ? (
                                        <img src={`${BASE_URL}${user.profilePicture}`} alt="Avatar" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    ) : (
                                        user?.username ? user.username[0].toUpperCase() : "U"
                                    )}
                                </div>
                                
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-1.5 bg-white text-orange-500 rounded-full shadow-lg hover:bg-gray-50 transition-colors z-10"
                                    title="Upload new picture"
                                >
                                    {uploadingAvatar ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Camera size={16} />
                                    )}
                                </button>
                            </div>

                            <h3 className="text-xl font-bold mb-1">{user?.username}</h3>
                            <p className="text-white/80 text-sm font-medium mb-6">{user?.email}</p>
                            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-sm font-bold border border-white/20 backdrop-blur-md">
                                <CheckCircle2 size={16} className="text-white" /> Active Student
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Picture Preview Modal */}
            {previewImage && user?.profilePicture && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(false)}
                >
                    <div className="relative max-w-2xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setPreviewImage(false)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2"
                        >
                            <X size={28} />
                        </button>
                        <img 
                            src={`${BASE_URL}${user.profilePicture}`} 
                            alt="Profile Preview" 
                            className="w-full max-w-md h-auto rounded-2xl shadow-2xl object-contain max-h-[80vh] border-4 border-white/10"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;