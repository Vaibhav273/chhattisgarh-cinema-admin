// ═══════════════════════════════════════════════════════════════
// ✏️ EDIT USER - PRODUCTION READY
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    X,
    User,
    Mail,
    Phone,
    Shield,
    Crown,
    Lock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Smartphone,
    Settings,
    Key,
} from 'lucide-react';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { User as UserType, UserRole } from '../../types/user';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission, ROLE_CONFIGS } from '../../types/roles';

// ═══════════════════════════════════════════════════════════════
// 🎉 TOAST NOTIFICATION
// ═══════════════════════════════════════════════════════════════
interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    };

    const icons = {
        success: CheckCircle,
        error: XCircle,
        info: AlertTriangle,
    };

    const Icon = icons[type];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -50, x: '-50%' }}
                className="fixed top-6 left-1/2 z-50"
            >
                <div className={`${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3`}>
                    <Icon size={24} />
                    <p className="font-bold text-lg">{message}</p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

// ═══════════════════════════════════════════════════════════════
// 🎯 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const EditUser: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { can, userRole } = usePermissions();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<UserType | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        phoneNumber: '',
        role: 'viewer' as UserRole,
        status: 'active',
        isPremium: false,
        maxDevices: 1,
        maxProfiles: 1,
        emailVerified: false,
        phoneVerified: false,
        twoFactorEnabled: false,
    });

    // Toast State
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'success' as 'success' | 'error' | 'info',
    });

    // Validation Errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (userId) {
            fetchUser();
        }
    }, [userId]);

    const fetchUser = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            const userDoc = await getDoc(doc(db, 'users', userId));

            if (!userDoc.exists()) {
                showToast('User not found', 'error');
                navigate('/admin/users');
                return;
            }

            const userData = {
                uid: userDoc.id,
                ...userDoc.data(),
            } as UserType;

            setUser(userData);

            // Populate form
            setFormData({
                displayName: userData.displayName || '',
                email: userData.email || '',
                phoneNumber: userData.phoneNumber || '',
                role: userData.role || 'viewer',
                status: userData.status || 'active',
                isPremium: userData.isPremium || false,
                maxDevices: userData.maxDevices || 1,
                maxProfiles: userData.maxProfiles || 1,
                emailVerified: userData.emailVerified || false,
                phoneVerified: userData.phoneVerified || false,
                twoFactorEnabled: userData.twoFactorEnabled || false,
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching user:', error);
            showToast('Failed to load user details', 'error');
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.displayName.trim()) {
            newErrors.displayName = 'Display name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (formData.phoneNumber && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Invalid phone number format';
        }

        if (formData.maxDevices < 1 || formData.maxDevices > 10) {
            newErrors.maxDevices = 'Max devices must be between 1 and 10';
        }

        if (formData.maxProfiles < 1 || formData.maxProfiles > 10) {
            newErrors.maxProfiles = 'Max profiles must be between 1 and 10';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!userId || !user) return;

        if (!validateForm()) {
            showToast('Please fix the errors before saving', 'error');
            return;
        }

        try {
            setSaving(true);

            const updateData: any = {
                displayName: formData.displayName.trim(),
                email: formData.email.trim(),
                phoneNumber: formData.phoneNumber.trim() || null,
                role: formData.role,
                status: formData.status,
                isPremium: formData.isPremium,
                maxDevices: formData.maxDevices,
                maxProfiles: formData.maxProfiles,
                emailVerified: formData.emailVerified,
                phoneVerified: formData.phoneVerified,
                twoFactorEnabled: formData.twoFactorEnabled,
                updatedAt: Timestamp.now(),
            };

            await updateDoc(doc(db, 'users', userId), updateData);

            showToast('User updated successfully!', 'success');

            // Refresh user data
            setTimeout(() => {
                fetchUser();
            }, 1000);

        } catch (error) {
            console.error('Error updating user:', error);
            showToast('Failed to update user', 'error');
        } finally {
            setSaving(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const canEditRole = () => {
        return can(Permission.MANAGE_USER_ROLES) ||
            can(Permission.ASSIGN_ROLES) ||
            userRole === 'super_admin';
    };

    const canEditStatus = () => {
        return can(Permission.BAN_USERS) ||
            can(Permission.SUSPEND_USERS) ||
            userRole === 'super_admin';
    };

    const canEditSubscription = () => {
        return can(Permission.MANAGE_SUBSCRIPTIONS) ||
            userRole === 'super_admin';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">User Not Found</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">The user you're trying to edit doesn't exist.</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/admin/users')}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold"
                    >
                        Back to Users
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full">
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            <div className="space-y-6 w-full">
                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 🔝 HEADER */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                    />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.1, x: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => navigate(`/admin/users/view/${userId}`)}
                                    className="p-3 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-white/30 transition-all"
                                >
                                    <ArrowLeft size={24} />
                                </motion.button>
                                <div>
                                    <h1 className="text-4xl font-black mb-2">Edit User</h1>
                                    <p className="text-white/90">Update user information and settings</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate(`/admin/users/view/${userId}`)}
                                    className="px-6 py-3 bg-white/20 backdrop-blur-xl text-white rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                                >
                                    <X size={20} />
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-8 py-3 bg-white text-green-600 rounded-xl font-bold hover:shadow-2xl transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full"
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            Save Changes
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 📝 FORM */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - User Preview */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sticky top-6"
                        >
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <User size={24} className="text-blue-500" />
                                User Preview
                            </h3>

                            <div className="text-center mb-6">
                                <div className="w-32 h-32 mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-5xl font-black border-4 border-blue-200 dark:border-blue-800 mb-4">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt={formData.displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        formData.displayName.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                    {formData.displayName || 'User Name'}
                                </h4>
                                <p className="text-slate-500 dark:text-slate-400 mb-4">{formData.email || 'email@example.com'}</p>

                                {/* Role Badge */}
                                {formData.role && ROLE_CONFIGS[formData.role] && (
                                    <span className={`px-4 py-2 bg-gradient-to-r ${ROLE_CONFIGS[formData.role].gradient} text-white rounded-full text-sm font-bold inline-flex items-center gap-2`}>
                                        <Shield size={16} />
                                        {ROLE_CONFIGS[formData.role].name}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <span className="text-slate-600 dark:text-slate-400">Status</span>
                                    <span className={`font-bold ${formData.status === 'active' ? 'text-green-600' :
                                        formData.status === 'banned' ? 'text-red-600' :
                                            'text-orange-600'
                                        }`}>
                                        {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <span className="text-slate-600 dark:text-slate-400">Premium</span>
                                    <span className="font-bold">
                                        {formData.isPremium ? (
                                            <Crown size={20} className="text-yellow-500" />
                                        ) : (
                                            <XCircle size={20} className="text-slate-400" />
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <span className="text-slate-600 dark:text-slate-400">Max Devices</span>
                                    <span className="font-bold text-slate-800 dark:text-white">{formData.maxDevices}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <span className="text-slate-600 dark:text-slate-400">Max Profiles</span>
                                    <span className="font-bold text-slate-800 dark:text-white">{formData.maxProfiles}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Form Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6"
                        >
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <User size={24} className="text-blue-500" />
                                Basic Information
                            </h3>

                            <div className="space-y-4">
                                {/* Display Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Display Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.displayName}
                                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.displayName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all`}
                                        placeholder="Enter display name"
                                    />
                                    {errors.displayName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className={`w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all`}
                                            placeholder="user@example.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                    )}
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                            className={`w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.phoneNumber ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all`}
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                    {errors.phoneNumber && (
                                        <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Account Settings */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6"
                        >
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <Settings size={24} className="text-purple-500" />
                                Account Settings
                            </h3>

                            <div className="space-y-4">
                                {/* Role */}
                                {canEditRole() && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            User Role
                                        </label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <select
                                                value={formData.role}
                                                onChange={(e) => handleInputChange('role', e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all appearance-none"
                                            >
                                                {Object.keys(ROLE_CONFIGS).map((roleKey) => {
                                                    const role = roleKey as UserRole;
                                                    const config = ROLE_CONFIGS[role];
                                                    return (
                                                        <option key={role} value={role}>
                                                            {config.name} - {config.nameHindi}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Status */}
                                {canEditStatus() && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            Account Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => handleInputChange('status', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all"
                                        >
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="banned">Banned</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>
                                )}

                                {/* Max Devices */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Maximum Devices
                                    </label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={formData.maxDevices}
                                            onChange={(e) => handleInputChange('maxDevices', parseInt(e.target.value))}
                                            className={`w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.maxDevices ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all`}
                                        />
                                    </div>
                                    {errors.maxDevices && (
                                        <p className="text-red-500 text-sm mt-1">{errors.maxDevices}</p>
                                    )}
                                </div>

                                {/* Max Profiles */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Maximum Profiles
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={formData.maxProfiles}
                                            onChange={(e) => handleInputChange('maxProfiles', parseInt(e.target.value))}
                                            className={`w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.maxProfiles ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all`}
                                        />
                                    </div>
                                    {errors.maxProfiles && (
                                        <p className="text-red-500 text-sm mt-1">{errors.maxProfiles}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Verification & Security */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6"
                        >
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <Key size={24} className="text-green-500" />
                                Verification & Security
                            </h3>

                            <div className="space-y-4">
                                {/* Email Verified */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Mail size={20} className="text-slate-400" />
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-white">Email Verified</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">User's email is verified</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.emailVerified}
                                            onChange={(e) => handleInputChange('emailVerified', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {/* Phone Verified */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Phone size={20} className="text-slate-400" />
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-white">Phone Verified</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">User's phone is verified</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.phoneVerified}
                                            onChange={(e) => handleInputChange('phoneVerified', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {/* 2FA Enabled */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Lock size={20} className="text-slate-400" />
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-white">Two-Factor Authentication</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Enhanced security with 2FA</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.twoFactorEnabled}
                                            onChange={(e) => handleInputChange('twoFactorEnabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </motion.div>

                        {/* Subscription Management */}
                        {canEditSubscription() && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6"
                            >
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <Crown size={24} className="text-yellow-500" />
                                    Subscription Management
                                </h3>

                                <div className="space-y-4">
                                    {/* Premium Status */}
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Crown size={20} className="text-yellow-500" />
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-white">Premium Member</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Grant premium access</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isPremium}
                                                onChange={(e) => handleInputChange('isPremium', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-yellow-500"></div>
                                        </label>
                                    </div>

                                    {formData.isPremium && user.subscription && (
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 text-white">
                                            <p className="text-sm mb-2">Current Plan: <strong>{user.subscription.planName}</strong></p>
                                            <p className="text-sm">Status: <strong className="capitalize">{user.subscription.status}</strong></p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Save Button (Bottom) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-end gap-4"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/admin/users/view/${userId}`)}
                        className="px-8 py-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-2xl transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Save All Changes
                            </>
                        )}
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
};

export default EditUser;
