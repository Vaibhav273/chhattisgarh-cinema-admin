// ═══════════════════════════════════════════════════════════════
// 👁️ VIEW USER DETAILS - PRODUCTION READY (FIXED)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    Clock,
    Shield,
    Crown,
    CheckCircle,
    XCircle,
    Ban,
    Smartphone,
    Monitor,
    Tv,
    CreditCard,
    Eye,
    Heart,
    MessageSquare,
    Edit,
    Trash2,
    Activity,
    Lock,
    Unlock,
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { User as UserType, WatchHistory } from '../../types/user';
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
        info: Eye,
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
// 📊 STATS CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
interface StatsCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    gradient: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, label, value, gradient }) => (
    <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 text-white relative overflow-hidden`}
    >
        <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute inset-0 bg-white/10 rounded-full blur-3xl"
        />
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                    <Icon size={24} />
                </div>
            </div>
            <p className="text-white/80 text-sm mb-1">{label}</p>
            <p className="text-3xl font-black">{value}</p>
        </div>
    </motion.div>
);

// ═══════════════════════════════════════════════════════════════
// 🎯 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const ViewUser: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { can } = usePermissions();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserType | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'devices' | 'subscription'>('overview');

    // Toast State
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'success' as 'success' | 'error' | 'info',
    });

    // Activity data
    const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);

    useEffect(() => {
        console.log('ViewUser mounted with userId:', userId); // Debug log
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

            // Fetch additional data
            fetchWatchHistory();

            setLoading(false);
        } catch (error) {
            console.error('Error fetching user:', error);
            showToast('Failed to load user details', 'error');
            setLoading(false);
        }
    };

    const fetchWatchHistory = async () => {
        if (!userId) return;

        try {
            // Fetch recent watch history
            const historyQuery = query(
                collection(db, 'watchHistory'),
                where('userId', '==', userId),
                orderBy('watchedAt', 'desc'),
                limit(10)
            );

            const historySnapshot = await getDocs(historyQuery);
            const history = historySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as WatchHistory[];

            setWatchHistory(history);
        } catch (error) {
            console.error('Error fetching watch history:', error);
        }
    };

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    const formatDate = (timestamp: any): string => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTimeAgo = (timestamp: any): string => {
        if (!timestamp) return 'Never';

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        return formatDate(timestamp);
    };

    const getRoleBadge = () => {
        if (!user) return null;
        const roleConfig = ROLE_CONFIGS[user.role];
        if (!roleConfig) return null;

        return (
            <span className={`px-4 py-2 bg-gradient-to-r ${roleConfig.gradient} text-white rounded-full text-sm font-bold flex items-center gap-2 w-fit`}>
                <Shield size={16} />
                {roleConfig.name}
            </span>
        );
    };

    const getStatusBadge = () => {
        if (!user) return null;

        const statusConfig = {
            active: { icon: CheckCircle, class: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', text: 'Active' },
            banned: { icon: Ban, class: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', text: 'Banned' },
            suspended: { icon: Lock, class: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', text: 'Suspended' },
            pending: { icon: Clock, class: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', text: 'Pending' },
        };

        const status = user.status || 'active';
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
        const StatusIcon = config.icon;

        return (
            <span className={`px-4 py-2 ${config.class} rounded-full text-sm font-bold flex items-center gap-2 w-fit`}>
                <StatusIcon size={16} />
                {config.text}
            </span>
        );
    };

    const getDeviceIcon = (deviceType: string) => {
        const icons: Record<string, any> = {
            mobile: Smartphone,
            tablet: Smartphone,
            web: Monitor,
            tv: Tv,
        };
        return icons[deviceType.toLowerCase()] || Monitor;
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
                    <p className="text-slate-600 dark:text-slate-400 mb-6">The user you're looking for doesn't exist.</p>
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

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Eye },
        { id: 'activity', label: 'Activity', icon: Activity },
        { id: 'devices', label: 'Devices', icon: Smartphone },
        { id: 'subscription', label: 'Subscription', icon: Crown },
    ];

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
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                    />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.1, x: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => navigate('/admin/users')}
                                    className="p-3 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-white/30 transition-all"
                                >
                                    <ArrowLeft size={24} />
                                </motion.button>
                                <div>
                                    <h1 className="text-4xl font-black mb-2">User Details</h1>
                                    <p className="text-white/90">Complete user profile and activity</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {can(Permission.BAN_USERS) && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate(`/admin/users/edit/${userId}`)}
                                        className="px-6 py-3 bg-white/20 backdrop-blur-xl text-white rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                                    >
                                        <Edit size={20} />
                                        Edit User
                                    </motion.button>
                                )}
                                {can(Permission.DELETE_PERMANENTLY) && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => showToast('Delete user feature coming soon', 'info')}
                                        className="px-6 py-3 bg-red-500/20 backdrop-blur-xl text-white rounded-xl font-bold hover:bg-red-500/30 transition-all flex items-center gap-2"
                                    >
                                        <Trash2 size={20} />
                                        Delete
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        {/* User Header Info */}
                        <div className="flex items-start gap-6">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-white/20 backdrop-blur-xl flex items-center justify-center text-white text-5xl font-black border-4 border-white/30">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    user.displayName.charAt(0).toUpperCase()
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                    <h2 className="text-3xl font-black">{user.displayName}</h2>
                                    {user.emailVerified && (
                                        <CheckCircle size={24} className="text-green-300" />
                                    )}
                                    {user.isPremium && (
                                        <Crown size={24} className="text-yellow-300" />
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-3 mb-4">
                                    {getRoleBadge()}
                                    {getStatusBadge()}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-white/60" />
                                        <span className="text-white/90">{user.email}</span>
                                    </div>
                                    {user.phoneNumber && (
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} className="text-white/60" />
                                            <span className="text-white/90">{user.phoneNumber}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-white/60" />
                                        <span className="text-white/90">Joined {formatDate(user.createdAt).split(',')[0]}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-white/60" />
                                        <span className="text-white/90">Last active {getTimeAgo(user.lastActive)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 📊 STATS CARDS */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        icon={Eye}
                        label="Watch Time (min)"
                        value={user.stats?.totalWatchTime ? Math.floor(user.stats.totalWatchTime) : 0}
                        gradient="from-purple-500 to-indigo-600"
                    />
                    <StatsCard
                        icon={Heart}
                        label="Total Likes"
                        value={user.stats?.totalLikes || 0}
                        gradient="from-pink-500 to-rose-600"
                    />
                    <StatsCard
                        icon={MessageSquare}
                        label="Comments"
                        value={user.stats?.totalComments || 0}
                        gradient="from-blue-500 to-cyan-600"
                    />
                    <StatsCard
                        icon={Smartphone}
                        label="Active Devices"
                        value={`${user.currentDeviceCount || 0}/${user.maxDevices || 1}`}
                        gradient="from-green-500 to-emerald-600"
                    />
                </div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 📑 TABS */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="flex border-b border-slate-200 dark:border-slate-800">
                        {tabs.map((tab) => {
                            const TabIcon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 px-6 py-4 font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                                        ? 'bg-blue-500 text-white'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <TabIcon size={20} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-6">
                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Personal Information */}
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6">
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                            <User size={24} className="text-blue-500" />
                                            Personal Information
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Full Name</p>
                                                <p className="font-semibold text-slate-800 dark:text-white">{user.displayName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                                                <p className="font-semibold text-slate-800 dark:text-white">{user.email}</p>
                                            </div>
                                            {user.phoneNumber && (
                                                <div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                                                    <p className="font-semibold text-slate-800 dark:text-white">{user.phoneNumber}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">User ID</p>
                                                <p className="font-mono text-xs text-slate-600 dark:text-slate-400">{user.uid}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Status */}
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6">
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                            <Shield size={24} className="text-green-500" />
                                            Account Status
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Email Verified</p>
                                                {user.emailVerified ? (
                                                    <CheckCircle size={20} className="text-green-500" />
                                                ) : (
                                                    <XCircle size={20} className="text-red-500" />
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Phone Verified</p>
                                                {user.phoneVerified ? (
                                                    <CheckCircle size={20} className="text-green-500" />
                                                ) : (
                                                    <XCircle size={20} className="text-red-500" />
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Premium Member</p>
                                                {user.isPremium ? (
                                                    <Crown size={20} className="text-yellow-500" />
                                                ) : (
                                                    <XCircle size={20} className="text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">2FA Enabled</p>
                                                {user.twoFactorEnabled ? (
                                                    <Lock size={20} className="text-green-500" />
                                                ) : (
                                                    <Unlock size={20} className="text-slate-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Subscription Info */}
                                {user.subscription && (
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <Crown size={24} />
                                            Active Subscription
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-white/80 text-sm mb-1">Plan</p>
                                                <p className="text-lg font-bold">{user.subscription.planName}</p>
                                            </div>
                                            <div>
                                                <p className="text-white/80 text-sm mb-1">Status</p>
                                                <p className="text-lg font-bold capitalize">{user.subscription.status}</p>
                                            </div>
                                            <div>
                                                <p className="text-white/80 text-sm mb-1">Started</p>
                                                <p className="text-lg font-bold">{user.subscription.startDate}</p>
                                            </div>
                                            <div>
                                                <p className="text-white/80 text-sm mb-1">Expires</p>
                                                <p className="text-lg font-bold">{user.subscription.endDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ACTIVITY TAB */}
                        {activeTab === 'activity' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Recent Watch History</h3>
                                {watchHistory.length > 0 ? (
                                    <div className="space-y-3">
                                        {watchHistory.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                                            >
                                                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                                    <Eye size={24} className="text-slate-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-slate-800 dark:text-white">
                                                        {item.contentTitle || 'Unknown Content'}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        Watched {getTimeAgo(item.watchedAt)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                        {Math.floor((item.progress || 0) / 60)} min
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Eye size={48} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                        <p className="text-slate-500 dark:text-slate-400">No watch history available</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DEVICES TAB */}
                        {activeTab === 'devices' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Active Devices</h3>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {user.currentDeviceCount || 0} of {user.maxDevices || 1} devices
                                    </span>
                                </div>
                                {user.devices && user.devices.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {user.devices.map((device, index) => {
                                            const DeviceIcon = getDeviceIcon(device.deviceType);
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                                                >
                                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                                        <DeviceIcon size={24} className="text-blue-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-slate-800 dark:text-white">
                                                            {device.deviceName || 'Unknown Device'}
                                                        </p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            {device.os || 'Unknown OS'}
                                                        </p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                                            Last active: {getTimeAgo(device.lastUsed)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Smartphone size={48} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                        <p className="text-slate-500 dark:text-slate-400">No devices registered</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SUBSCRIPTION TAB */}
                        {activeTab === 'subscription' && (
                            <div className="space-y-6">
                                {user.isPremium && user.subscription ? (
                                    <>
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white">
                                            <div className="flex items-center gap-3 mb-6">
                                                <Crown size={32} />
                                                <h3 className="text-2xl font-black">Premium Subscription</h3>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                <div>
                                                    <p className="text-white/80 mb-2">Plan Name</p>
                                                    <p className="text-xl font-bold">{user.subscription.planName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/80 mb-2">Status</p>
                                                    <p className="text-xl font-bold capitalize">{user.subscription.status}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/80 mb-2">Billing Cycle</p>
                                                    <p className="text-xl font-bold capitalize">{user.subscription.billingCycle || 'Monthly'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/80 mb-2">Start Date</p>
                                                    <p className="text-xl font-bold">{user.subscription.startDate}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/80 mb-2">Next Billing</p>
                                                    <p className="text-xl font-bold">{user.subscription.endDate}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/80 mb-2">Auto Renew</p>
                                                    <p className="text-xl font-bold">{user.subscription.autoRenew ? 'Yes' : 'No'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment History */}
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                                <CreditCard size={24} className="text-green-500" />
                                                Payment History
                                            </h3>
                                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                                <CreditCard size={48} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                                <p className="text-slate-500 dark:text-slate-400">Payment history coming soon</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <Crown size={64} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">Free Plan</h3>
                                        <p className="text-slate-500 dark:text-slate-500">User is on the free plan</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewUser;
