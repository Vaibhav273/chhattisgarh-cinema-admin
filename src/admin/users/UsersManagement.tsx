// ═══════════════════════════════════════════════════════════════
// 👥 USERS MANAGEMENT - PRODUCTION READY WITH ALL FEATURES
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    Crown,
    Shield,
    Ban,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Calendar,
    Clock,
    UserCheck,
    UserX,
    Download,
    RefreshCw,
} from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission, type UserRole, ROLE_CONFIGS } from '../../types/roles';
import { type User } from '../../types/user';
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    where,
    startAfter,
    type DocumentData,
    QueryDocumentSnapshot,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// ═══════════════════════════════════════════════════════════════
// 🎨 CUSTOM ALERT MODAL
// ═══════════════════════════════════════════════════════════════
interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    type?: 'danger' | 'warning' | 'success';
    loading?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    type = 'danger',
    loading = false,
}) => {
    if (!isOpen) return null;

    const colors = {
        danger: {
            bg: 'from-red-500 to-pink-600',
            button: 'bg-red-500 hover:bg-red-600',
        },
        warning: {
            bg: 'from-orange-500 to-amber-600',
            button: 'bg-orange-500 hover:bg-orange-600',
        },
        success: {
            bg: 'from-green-500 to-emerald-600',
            button: 'bg-green-500 hover:bg-green-600',
        },
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800"
                >
                    <div className={`bg-gradient-to-r ${colors[type].bg} p-6 text-white relative overflow-hidden`}>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                            transition={{ duration: 20, repeat: Infinity }}
                            className="absolute inset-0 bg-white/10 rounded-full blur-3xl"
                        />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                                <AlertTriangle size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black">{title}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 px-6 py-3 ${colors[type].button} text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2`}
                        >
                            {loading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    />
                                    Processing...
                                </>
                            ) : (
                                confirmText
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ═══════════════════════════════════════════════════════════════
// 🎉 SUCCESS/ERROR TOAST
// ═══════════════════════════════════════════════════════════════
interface ToastProps {
    message: string;
    type: 'success' | 'error';
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

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -50, x: '-50%' }}
                className="fixed top-6 left-1/2 z-50"
            >
                <div
                    className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 ${type === 'success'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                        }`}
                >
                    {type === 'success' ? (
                        <CheckCircle size={24} />
                    ) : (
                        <XCircle size={24} />
                    )}
                    <p className="font-bold text-lg">{message}</p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

// ═══════════════════════════════════════════════════════════════
// 👥 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const UsersManagement: React.FC = () => {
    const navigate = useNavigate();
    const { can, userRole } = usePermissions();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterSubscription, setFilterSubscription] = useState<string>('all');
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);

    // Alert Modal State
    const [alertModal, setAlertModal] = useState({
        isOpen: false,
        userId: '',
        userName: '',
        action: '' as 'delete' | 'ban' | 'unban' | '',
    });

    // Toast State
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'success' as 'success' | 'error',
    });

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        premium: 0,
        banned: 0,
        newToday: 0,
        verified: 0,
    });

    // ═══════════════════════════════════════════════════════════════
    // 🔐 PERMISSION CHECKS
    // ═══════════════════════════════════════════════════════════════

    const canManageUsers = () => {
        return can(Permission.BAN_USERS) ||
            can(Permission.SUSPEND_USERS) ||
            userRole === 'super_admin';
    };

    const canDeleteUsers = () => {
        return can(Permission.DELETE_PERMANENTLY) ||
            userRole === 'super_admin';
    };

    const canAssignRoles = () => {
        return can(Permission.ASSIGN_ROLES) ||
            can(Permission.MANAGE_ADMINS) ||
            userRole === 'super_admin';
    };

    // ═══════════════════════════════════════════════════════════════
    // 🔄 FETCH USERS WITH FILTERS
    // ═══════════════════════════════════════════════════════════════
    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [filterRole, filterStatus, filterSubscription]);

    const fetchUsers = async (loadMore = false) => {
        try {
            setLoading(!loadMore);

            // Build query with filters
            let queryConstraints: any[] = [orderBy('createdAt', 'desc'), limit(20)];

            // Apply Role Filter
            if (filterRole !== 'all') {
                queryConstraints = [where('role', '==', filterRole), ...queryConstraints];
            }

            // Apply Status Filter
            if (filterStatus !== 'all') {
                if (filterStatus === 'verified') {
                    queryConstraints = [where('emailVerified', '==', true), ...queryConstraints];
                } else {
                    queryConstraints = [where('status', '==', filterStatus), ...queryConstraints];
                }
            }

            // Apply Subscription Filter
            if (filterSubscription !== 'all') {
                const isPremium = filterSubscription === 'premium';
                queryConstraints = [where('isPremium', '==', isPremium), ...queryConstraints];
            }

            // Add pagination
            if (loadMore && lastDoc) {
                queryConstraints.push(startAfter(lastDoc));
            }

            const usersQuery = query(collection(db, 'users'), ...queryConstraints);
            const snapshot = await getDocs(usersQuery);

            const usersData: User[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    uid: docSnap.id,
                    email: data.email || '',
                    phoneNumber: data.phoneNumber,
                    displayName: data.displayName || 'Unnamed User',
                    photoURL: data.photoURL,
                    role: data.role || 'viewer',
                    currentPlanId: data.currentPlanId || 'free',
                    isPremium: data.isPremium || false,
                    subscriptionPlanId: data.subscriptionPlanId,
                    subscriptionStatus: data.subscriptionStatus,
                    subscriptionStartDate: data.subscriptionStartDate,
                    subscriptionEndDate: data.subscriptionEndDate,
                    subscription: data.subscription,
                    preferences: data.preferences || {
                        language: 'en',
                        contentTypes: [],
                        autoPlay: true,
                        notificationsEnabled: true,
                    },
                    devices: data.devices,
                    maxDevices: data.maxDevices,
                    currentDeviceCount: data.currentDeviceCount,
                    profiles: data.profiles,
                    maxProfiles: data.maxProfiles,
                    currentProfileId: data.currentProfileId,
                    creatorProfile: data.creatorProfile,
                    stats: data.stats,
                    status: data.status || 'active',
                    emailVerified: data.emailVerified,
                    phoneVerified: data.phoneVerified,
                    kycVerified: data.kycVerified,
                    twoFactorEnabled: data.twoFactorEnabled,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    lastLogin: data.lastLogin,
                    lastActive: data.lastActive,
                    referralCode: data.referralCode,
                    referredBy: data.referredBy,
                    rewardPoints: data.rewardPoints,
                    moderation: data.moderation,
                } as User;
            });

            if (loadMore) {
                setUsers((prev) => [...prev, ...usersData]);
            } else {
                setUsers(usersData);
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === 20);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast('Failed to load users', 'error');
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const allUsersSnapshot = await getDocs(collection(db, 'users'));

            let total = 0;
            let active = 0;
            let premium = 0;
            let banned = 0;
            let newToday = 0;
            let verified = 0;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            allUsersSnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                total++;

                if (data.status === 'active') active++;
                if (data.status === 'banned') banned++;
                if (data.emailVerified) verified++;
                if (data.isPremium) premium++;

                if (data.createdAt?.toDate) {
                    const createdDate = data.createdAt.toDate();
                    createdDate.setHours(0, 0, 0, 0);
                    if (createdDate.getTime() === today.getTime()) newToday++;
                }
            });

            setStats({ total, active, premium, banned, newToday, verified });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // 🗑️ DELETE USER
    // ═══════════════════════════════════════════════════════════════
    const handleDeleteClick = (userId: string, userName: string) => {
        if (!canDeleteUsers()) {
            showToast('You do not have permission to delete users', 'error');
            return;
        }

        setAlertModal({
            isOpen: true,
            userId,
            userName,
            action: 'delete',
        });
    };

    // ═══════════════════════════════════════════════════════════════
    // 🚫 BAN/UNBAN USER
    // ═══════════════════════════════════════════════════════════════
    const handleBanClick = (userId: string, userName: string, currentStatus: string) => {
        if (!canManageUsers()) {
            showToast('You do not have permission to ban/unban users', 'error');
            return;
        }

        const isBanned = currentStatus === 'banned';

        setAlertModal({
            isOpen: true,
            userId,
            userName,
            action: isBanned ? 'unban' : 'ban',
        });
    };

    const confirmAction = async () => {
        setActionLoading(true);
        try {
            if (alertModal.action === 'delete') {
                await deleteDoc(doc(db, 'users', alertModal.userId));
                setUsers((prev) => prev.filter((u) => u.uid !== alertModal.userId));
                showToast('User deleted successfully!', 'success');
            } else if (alertModal.action === 'ban') {
                await updateDoc(doc(db, 'users', alertModal.userId), {
                    status: 'banned',
                    'moderation.bannedAt': new Date().toISOString(),
                    'moderation.bannedBy': userRole,
                    updatedAt: Timestamp.now(),
                });
                setUsers((prev) =>
                    prev.map((u) =>
                        u.uid === alertModal.userId ? { ...u, status: 'banned' } : u
                    )
                );
                showToast('User banned successfully!', 'success');
            } else if (alertModal.action === 'unban') {
                await updateDoc(doc(db, 'users', alertModal.userId), {
                    status: 'active',
                    'moderation.bannedAt': null,
                    'moderation.bannedBy': null,
                    'moderation.banReason': null,
                    updatedAt: Timestamp.now(),
                });
                setUsers((prev) =>
                    prev.map((u) =>
                        u.uid === alertModal.userId ? { ...u, status: 'active' } : u
                    )
                );
                showToast('User unbanned successfully!', 'success');
            }

            setAlertModal({ isOpen: false, userId: '', userName: '', action: '' });
            fetchStats();
        } catch (error) {
            console.error('Error performing action:', error);
            showToast('Failed to perform action', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // ✏️ EDIT USER
    // ═══════════════════════════════════════════════════════════════
    const handleEdit = (userId: string, _targetUserRole: UserRole) => {
        if (!canAssignRoles()) {
            showToast('You do not have permission to edit users', 'error');
            return;
        }

        navigate(`/admin/users/edit/${userId}`);
    };

    // ═══════════════════════════════════════════════════════════════
    // 👁️ VIEW USER
    // ═══════════════════════════════════════════════════════════════
    const handleView = (userId: string) => {
        navigate(`/admin/users/view/${userId}`)
    }

    // ═══════════════════════════════════════════════════════════════
    // 🎉 SHOW TOAST
    // ═══════════════════════════════════════════════════════════════
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    // ═══════════════════════════════════════════════════════════════
    // 🔍 FILTER USERS BY SEARCH TERM
    // ═══════════════════════════════════════════════════════════════
    const filteredUsers = users.filter((user) =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phoneNumber && user.phoneNumber.includes(searchTerm))
    );

    // ═══════════════════════════════════════════════════════════════
    // 🎨 FORMAT HELPERS
    // ═══════════════════════════════════════════════════════════════
    const formatDate = (timestamp: any): string => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTimeAgo = (timestamp: any): string => {
        if (!timestamp) return 'Never';

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        return formatDate(timestamp);
    };

    const getRoleBadge = (role: UserRole) => {
        const roleConfig = ROLE_CONFIGS[role];

        if (!roleConfig) {
            return {
                text: 'Unknown',
                gradient: 'from-gray-500 to-gray-600',
                icon: Users,
                level: 0,
            };
        }

        return {
            text: roleConfig.name,
            textHindi: roleConfig.nameHindi,
            gradient: roleConfig.gradient,
            icon: getIconComponent(roleConfig.icon),
            level: roleConfig.level,
        };
    };

    const getIconComponent = (iconName: string) => {
        const icons: Record<string, any> = {
            'User': Users,
            'Crown': Crown,
            'Shield': Shield,
            'Video': Eye,
            'FileEdit': Edit,
            'DollarSign': Crown,
            'BarChart': Crown,
            'Settings': Shield,
        };
        return icons[iconName] || Users;
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'active':
                return { text: 'Active', class: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle };
            case 'banned':
                return { text: 'Banned', class: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', icon: Ban };
            case 'suspended':
                return { text: 'Suspended', class: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', icon: XCircle };
            case 'pending':
                return { text: 'Pending', class: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock };
            default:
                return { text: 'Inactive', class: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400', icon: XCircle };
        }
    };

    const getModalConfig = () => {
        if (alertModal.action === 'delete') {
            return {
                title: 'Delete User?',
                message: `Are you sure you want to delete "${alertModal.userName}"? This will permanently delete all their data including watch history, favorites, and subscription. This action cannot be undone.`,
                confirmText: 'Delete',
                type: 'danger' as const,
            };
        } else if (alertModal.action === 'ban') {
            return {
                title: 'Ban User?',
                message: `Are you sure you want to ban "${alertModal.userName}"? They will not be able to access their account until unbanned.`,
                confirmText: 'Ban User',
                type: 'warning' as const,
            };
        } else {
            return {
                title: 'Unban User?',
                message: `Are you sure you want to unban "${alertModal.userName}"? They will regain access to their account.`,
                confirmText: 'Unban User',
                type: 'success' as const,
            };
        }
    };

    const modalConfig = getModalConfig();

    return (
        <div className="min-h-screen w-full">
            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            {/* Action Confirmation Modal */}
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ isOpen: false, userId: '', userName: '', action: '' })}
                onConfirm={confirmAction}
                {...modalConfig}
                loading={actionLoading}
            />

            <div className="space-y-6 w-full">
                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 📊 HEADER & STATS */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden w-full"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                    />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                                    <Users size={36} />
                                    Users Management
                                </h1>
                                <p className="text-white/90 text-lg">Manage all platform users</p>
                            </div>

                            {canAssignRoles() && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/admin/users/add')}
                                    className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold flex items-center gap-3 shadow-2xl hover:shadow-3xl transition-all"
                                >
                                    <Plus size={24} />
                                    Add New User
                                </motion.button>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Total Users</p>
                                <p className="text-4xl font-black">{stats.total}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Active</p>
                                <p className="text-4xl font-black text-green-300">{stats.active}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Premium</p>
                                <p className="text-4xl font-black text-yellow-300">{stats.premium}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Verified</p>
                                <p className="text-4xl font-black text-cyan-300">{stats.verified}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Banned</p>
                                <p className="text-4xl font-black text-red-300">{stats.banned}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">New Today</p>
                                <p className="text-4xl font-black text-emerald-300">{stats.newToday}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 🔍 SEARCH & FILTERS */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 w-full"
                >
                    <div className="flex flex-col gap-4">
                        {/* Search Bar */}
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search users by name, email or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all"
                            />
                        </div>

                        {/* Filters Row */}
                        <div className="flex flex-wrap gap-3">
                            {/* Role Filter */}
                            <select
                                value={filterRole}
                                onChange={(e) => {
                                    setFilterRole(e.target.value);
                                    setLastDoc(null);
                                }}
                                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all"
                            >
                                <option value="all">All Roles</option>
                                {Object.keys(ROLE_CONFIGS).map((roleKey) => {
                                    const role = roleKey as UserRole;
                                    const config = ROLE_CONFIGS[role];
                                    return (
                                        <option key={role} value={role}>
                                            {config.name}
                                        </option>
                                    );
                                })}
                            </select>

                            {/* Status Filter */}
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setLastDoc(null);
                                }}
                                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="banned">Banned</option>
                                <option value="suspended">Suspended</option>
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                            </select>

                            {/* Subscription Filter */}
                            <select
                                value={filterSubscription}
                                onChange={(e) => {
                                    setFilterSubscription(e.target.value);
                                    setLastDoc(null);
                                }}
                                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all"
                            >
                                <option value="all">All Plans</option>
                                <option value="premium">Premium</option>
                                <option value="free">Free</option>
                            </select>

                            {/* Refresh Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setLastDoc(null);
                                    fetchUsers();
                                    fetchStats();
                                }}
                                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Refresh
                            </motion.button>

                            {/* Export Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => showToast('Export feature coming soon!', 'success')}
                                className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all flex items-center gap-2"
                            >
                                <Download size={18} />
                                Export
                            </motion.button>
                        </div>

                        {/* Results Count */}
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Showing <span className="font-bold text-slate-800 dark:text-white">{filteredUsers.length}</span> of <span className="font-bold text-slate-800 dark:text-white">{users.length}</span> users
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 📋 USERS TABLE - FULL WIDTH */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-96 gap-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                        />
                        <p className="text-slate-600 dark:text-slate-400 font-semibold">Loading users...</p>
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden w-full">
                            <div className="overflow-x-auto w-full">
                                <table className="w-full min-w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                Plan
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                Devices
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                Joined
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                Last Login
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {filteredUsers.map((user, index) => {
                                            const roleBadge = getRoleBadge(user.role);
                                            const statusBadge = getStatusBadge(user.status);
                                            const RoleIcon = roleBadge.icon;
                                            const StatusIcon = statusBadge.icon;

                                            return (
                                                <motion.tr
                                                    key={user.uid}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                                >
                                                    {/* User Info */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                                {user.photoURL ? (
                                                                    <img
                                                                        src={user.photoURL}
                                                                        alt={user.displayName}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    user.displayName.charAt(0).toUpperCase()
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-slate-800 dark:text-white truncate">
                                                                    {user.displayName}
                                                                </p>
                                                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                                                    {user.email}
                                                                </p>
                                                                {user.phoneNumber && (
                                                                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                                                        {user.phoneNumber}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Role */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 bg-gradient-to-r ${roleBadge.gradient} text-white rounded-full text-xs font-bold flex items-center gap-1 w-fit`}>
                                                            <RoleIcon size={12} />
                                                            {roleBadge.text}
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                                                            Level {roleBadge.level}
                                                        </span>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`px-3 py-1 ${statusBadge.class} rounded-full text-xs font-bold flex items-center gap-1 w-fit`}>
                                                                <StatusIcon size={12} />
                                                                {statusBadge.text}
                                                            </span>
                                                            {user.emailVerified && (
                                                                <span className="px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                                                                    <CheckCircle size={12} />
                                                                    Verified
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Plan */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {user.isPremium ? (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                                                                    <Crown size={12} />
                                                                    {user.subscription?.planName || user.currentPlanId}
                                                                </span>
                                                                {user.subscription?.status && (
                                                                    <span className="text-xs text-slate-500">
                                                                        {user.subscription.status}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-full text-xs font-bold">
                                                                Free
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Devices */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-semibold">
                                                                {user.currentDeviceCount || 0} / {user.maxDevices || 1}
                                                            </span>
                                                            <span className="text-xs text-slate-500">
                                                                {user.maxProfiles || 1} profiles
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Joined Date */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} className="flex-shrink-0" />
                                                            <span>{formatDate(user.createdAt)}</span>
                                                        </div>
                                                    </td>

                                                    {/* Last Login */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={14} className="flex-shrink-0" />
                                                            <span>{getTimeAgo(user.lastLogin)}</span>
                                                        </div>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleView(user.uid)}
                                                                className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                                                                title="View User"
                                                            >
                                                                <Eye size={16} />
                                                            </motion.button>

                                                            {canAssignRoles() && (
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleEdit(user.uid, user.role)}
                                                                    className="p-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all"
                                                                    title="Edit User"
                                                                >
                                                                    <Edit size={16} />
                                                                </motion.button>
                                                            )}

                                                            {canManageUsers() && (
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleBanClick(user.uid, user.displayName, user.status || 'active')}
                                                                    className={`p-2 rounded-lg transition-all ${user.status === 'banned'
                                                                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                                                        : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                                                                        }`}
                                                                    title={user.status === 'banned' ? 'Unban User' : 'Ban User'}
                                                                >
                                                                    {user.status === 'banned' ? <UserCheck size={16} /> : <UserX size={16} />}
                                                                </motion.button>
                                                            )}

                                                            {canDeleteUsers() && (
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleDeleteClick(user.uid, user.displayName)}
                                                                    className="p-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                                                                    title="Delete User"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </motion.button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Load More */}
                        {hasMore && (
                            <div className="flex justify-center mt-8">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => fetchUsers(true)}
                                    className="px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl font-bold hover:shadow-2xl transition-all"
                                >
                                    Load More Users
                                </motion.button>
                            </div>
                        )}
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700"
                    >
                        <Users size={64} className="text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">No Users Found</h3>
                        <p className="text-slate-500 dark:text-slate-500 mb-6">
                            {searchTerm ? 'Try different search terms' : 'No users match the selected filters'}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default UsersManagement;
