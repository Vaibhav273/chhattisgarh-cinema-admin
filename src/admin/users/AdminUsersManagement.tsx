// ═══════════════════════════════════════════════════════════════
// 👨‍💼 ADMIN USERS MANAGEMENT - PRODUCTION READY
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Shield,
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    Crown,
    Lock,
    Unlock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    RefreshCw,
    Download,
    Activity,
    Settings,
} from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission, type UserRole, ROLE_CONFIGS } from '../../types/roles';
import { type AdminUser } from '../../types/user';
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
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
// 👨‍💼 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const AdminUsersManagement: React.FC = () => {
    const navigate = useNavigate();
    const { can, userRole } = usePermissions();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [allAdmins, setAllAdmins] = useState<AdminUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterDepartment, setFilterDepartment] = useState<string>('all');

    // Alert Modal State
    const [alertModal, setAlertModal] = useState({
        isOpen: false,
        adminId: '',
        adminName: '',
        action: '' as 'delete' | 'suspend' | 'activate' | '',
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
        suspended: 0,
        superAdmins: 0,
        contentManagers: 0,
        moderators: 0,
    });

    // Admin Roles
    const adminRoles: UserRole[] = ['super_admin', 'tech_admin', 'analyst', 'finance', 'moderator', 'content_manager'];

    // ═══════════════════════════════════════════════════════════════
    // 🔐 PERMISSION CHECKS
    // ═══════════════════════════════════════════════════════════════

    const canManageAdmins = () => {
        return can(Permission.MANAGE_ADMINS) || userRole === 'super_admin';
    };

    // const canAssignRoles = () => {
    //     return can(Permission.ASSIGN_ROLES) || userRole === 'super_admin';
    // };

    const canDeleteAdmins = () => {
        return can(Permission.DELETE_PERMANENTLY) || userRole === 'super_admin';
    };

    // ═══════════════════════════════════════════════════════════════
    // 🔄 FETCH ADMINS
    // ═══════════════════════════════════════════════════════════════
    useEffect(() => {
        fetchAdmins();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterRole, filterStatus, filterDepartment, allAdmins]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);

            // Simple query - no composite index needed
            const adminsRef = collection(db, 'admins');
            const baseQuery = query(adminsRef, orderBy('createdAt', 'desc'), limit(100));
            const snapshot = await getDocs(baseQuery);

            if (snapshot.empty) {
                setAllAdmins([]);
                setAdmins([]);
                setLoading(false);
                return;
            }

            const adminsData: AdminUser[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    uid: docSnap.id,
                    email: data.email || '',
                    name: data.name || data.displayName || '',
                    displayName: data.displayName || data.name || 'Unnamed Admin',
                    photoURL: data.photoURL,
                    role: data.role || 'moderator',
                    department: data.department,
                    permissions: data.permissions,
                    assignedBy: data.assignedBy,
                    assignedAt: data.assignedAt,
                    phone: data.phone,
                    emergencyContact: data.emergencyContact,
                    status: data.status || 'active',
                    isActive: data.isActive !== false,
                    lastLogin: data.lastLogin,
                    lastActive: data.lastActive,
                    loginAttempts: data.loginAttempts || 0,
                    lockedUntil: data.lockedUntil,
                    activityLogs: data.activityLogs,
                    createdAt: data.createdAt || Timestamp.now(),
                    updatedAt: data.updatedAt || Timestamp.now(),
                } as AdminUser;
            });

            setAllAdmins(adminsData);
            fetchStats(adminsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching admins:', error);
            showToast('Failed to load admins', 'error');
            setAllAdmins([]);
            setAdmins([]);
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allAdmins];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(admin =>
                admin.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (admin.phone && admin.phone.includes(searchTerm)) ||
                (admin.department && admin.department.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Role filter
        if (filterRole !== 'all') {
            filtered = filtered.filter(admin => admin.role === filterRole);
        }

        // Status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(admin => admin.status === filterStatus);
        }

        // Department filter
        if (filterDepartment !== 'all') {
            filtered = filtered.filter(admin => admin.department === filterDepartment);
        }

        setAdmins(filtered);
    };

    const fetchStats = (adminsData: AdminUser[]) => {
        let total = 0;
        let active = 0;
        let suspended = 0;
        let superAdmins = 0;
        let contentManagers = 0;
        let moderators = 0;

        adminsData.forEach((admin) => {
            total++;
            if (admin.status === 'active') active++;
            if (admin.status === 'suspended') suspended++;
            if (admin.role === 'super_admin') superAdmins++;
            if (admin.role === 'content_manager') contentManagers++;
            if (admin.role === 'moderator') moderators++;
        });

        setStats({ total, active, suspended, superAdmins, contentManagers, moderators });
    };

    // ═══════════════════════════════════════════════════════════════
    // 🗑️ DELETE ADMIN
    // ═══════════════════════════════════════════════════════════════
    const handleDeleteClick = (adminId: string, adminName: string) => {
        if (!canDeleteAdmins()) {
            showToast('You do not have permission to delete admins', 'error');
            return;
        }

        setAlertModal({
            isOpen: true,
            adminId,
            adminName,
            action: 'delete',
        });
    };

    // ═══════════════════════════════════════════════════════════════
    // 🔒 SUSPEND/ACTIVATE ADMIN
    // ═══════════════════════════════════════════════════════════════
    const handleStatusClick = (adminId: string, adminName: string, currentStatus: string) => {
        if (!canManageAdmins()) {
            showToast('You do not have permission to change admin status', 'error');
            return;
        }

        const isSuspended = currentStatus === 'suspended';

        setAlertModal({
            isOpen: true,
            adminId,
            adminName,
            action: isSuspended ? 'activate' : 'suspend',
        });
    };

    const confirmAction = async () => {
        setActionLoading(true);
        try {
            if (alertModal.action === 'delete') {
                await deleteDoc(doc(db, 'admins', alertModal.adminId));
                setAllAdmins((prev) => prev.filter((a) => a.uid !== alertModal.adminId));
                showToast('Admin deleted successfully!', 'success');
            } else if (alertModal.action === 'suspend') {
                await updateDoc(doc(db, 'admins', alertModal.adminId), {
                    status: 'suspended',
                    isActive: false,
                    updatedAt: Timestamp.now(),
                });
                setAllAdmins((prev) =>
                    prev.map((a) =>
                        a.uid === alertModal.adminId ? { ...a, status: 'suspended', isActive: false } : a
                    )
                );
                showToast('Admin suspended successfully!', 'success');
            } else if (alertModal.action === 'activate') {
                await updateDoc(doc(db, 'admins', alertModal.adminId), {
                    status: 'active',
                    isActive: true,
                    updatedAt: Timestamp.now(),
                });
                setAllAdmins((prev) =>
                    prev.map((a) =>
                        a.uid === alertModal.adminId ? { ...a, status: 'active', isActive: true } : a
                    )
                );
                showToast('Admin activated successfully!', 'success');
            }

            setAlertModal({ isOpen: false, adminId: '', adminName: '', action: '' });
        } catch (error) {
            console.error('Error performing action:', error);
            showToast('Failed to perform action', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // ✏️ EDIT ADMIN
    // ═══════════════════════════════════════════════════════════════
    const handleEdit = (adminId: string) => {
        if (!canManageAdmins()) {
            showToast('You do not have permission to edit admins', 'error');
            return;
        }
        navigate(`/admin/admins/edit/${adminId}`);
    };

    // ═══════════════════════════════════════════════════════════════
    // 👁️ VIEW ADMIN
    // ═══════════════════════════════════════════════════════════════
    const handleView = (adminId: string) => {
        navigate(`/admin/admins/view/${adminId}`);
    };

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
    // 🎨 FORMAT HELPERS
    // ═══════════════════════════════════════════════════════════════
    const formatDate = (timestamp: any): string => {
        if (!timestamp) return 'N/A';
        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTimeAgo = (timestamp: any): string => {
        if (!timestamp) return 'Never';

        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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
                icon: Shield,
                level: 0,
            };
        }

        return {
            text: roleConfig.name,
            gradient: roleConfig.gradient,
            icon: getIconComponent(roleConfig.icon),
            level: roleConfig.level,
        };
    };

    const getIconComponent = (iconName: string) => {
        const icons: Record<string, any> = {
            'User': Shield,
            'Crown': Crown,
            'Shield': Shield,
            'Video': Eye,
            'FileEdit': Edit,
            'DollarSign': Crown,
            'BarChart': Activity,
            'Settings': Settings,
        };
        return icons[iconName] || Shield;
    };

    const getStatusBadge = (status: string, isActive: boolean) => {
        if (status === 'suspended' || !isActive) {
            return { text: 'Suspended', class: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', icon: Lock };
        } else if (status === 'active') {
            return { text: 'Active', class: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle };
        } else {
            return { text: 'Inactive', class: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400', icon: XCircle };
        }
    };

    const getModalConfig = () => {
        if (alertModal.action === 'delete') {
            return {
                title: 'Delete Admin?',
                message: `Are you sure you want to delete "${alertModal.adminName}"? This will revoke all their admin privileges and access. This action cannot be undone.`,
                confirmText: 'Delete Admin',
                type: 'danger' as const,
            };
        } else if (alertModal.action === 'suspend') {
            return {
                title: 'Suspend Admin?',
                message: `Are you sure you want to suspend "${alertModal.adminName}"? They will lose access to the admin panel until reactivated.`,
                confirmText: 'Suspend Admin',
                type: 'warning' as const,
            };
        } else {
            return {
                title: 'Activate Admin?',
                message: `Are you sure you want to activate "${alertModal.adminName}"? They will regain access to the admin panel.`,
                confirmText: 'Activate Admin',
                type: 'success' as const,
            };
        }
    };

    const modalConfig = getModalConfig();

    // Get unique departments
    const departments = Array.from(new Set(allAdmins.map(a => a.department).filter(Boolean))) as string[];

    return (
        <div className="min-h-screen w-full">
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ isOpen: false, adminId: '', adminName: '', action: '' })}
                onConfirm={confirmAction}
                {...modalConfig}
                loading={actionLoading}
            />

            <div className="space-y-6 w-full">
                {/* Header & Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden w-full"
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
                                    <Shield size={36} />
                                    Admin Users Management
                                </h1>
                                <p className="text-white/90 text-lg">Manage admin team and permissions</p>
                            </div>

                            {canManageAdmins() && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/admin/admins/add')}
                                    className="px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold flex items-center gap-3 shadow-2xl hover:shadow-3xl transition-all"
                                >
                                    <Plus size={24} />
                                    Add New Admin
                                </motion.button>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Total Admins</p>
                                <p className="text-4xl font-black">{stats.total}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Active</p>
                                <p className="text-4xl font-black text-green-300">{stats.active}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Suspended</p>
                                <p className="text-4xl font-black text-red-300">{stats.suspended}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Super Admins</p>
                                <p className="text-4xl font-black text-yellow-300">{stats.superAdmins}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Moderators</p>
                                <p className="text-4xl font-black text-cyan-300">{stats.moderators}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Content Mgrs</p>
                                <p className="text-4xl font-black text-emerald-300">{stats.contentManagers}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Search & Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 w-full"
                >
                    <div className="flex flex-col gap-4">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search admins by name, email, phone or department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white transition-all"
                            >
                                <option value="all">All Roles</option>
                                {adminRoles.map((role) => {
                                    const config = ROLE_CONFIGS[role];
                                    return (
                                        <option key={role} value={role}>
                                            {config.name}
                                        </option>
                                    );
                                })}
                            </select>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white transition-all"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            {departments.length > 0 && (
                                <select
                                    value={filterDepartment}
                                    onChange={(e) => setFilterDepartment(e.target.value)}
                                    className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white transition-all"
                                >
                                    <option value="all">All Departments</option>
                                    {departments.map((dept) => (
                                        <option key={dept} value={dept}>
                                            {dept}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={fetchAdmins}
                                className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Refresh
                            </motion.button>

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

                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Showing <span className="font-bold text-slate-800 dark:text-white">{admins.length}</span> of <span className="font-bold text-slate-800 dark:text-white">{allAdmins.length}</span> admins
                        </div>
                    </div>
                </motion.div>

                {/* Admins Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-96 gap-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
                        />
                        <p className="text-slate-600 dark:text-slate-400 font-semibold">Loading admins...</p>
                    </div>
                ) : admins.length > 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden w-full">
                        <div className="overflow-x-auto w-full">
                            <table className="w-full min-w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Admin
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Department
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Status
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
                                    {admins.map((admin, index) => {
                                        const roleBadge = getRoleBadge(admin.role);
                                        const statusBadge = getStatusBadge(admin.status, admin.isActive);
                                        const RoleIcon = roleBadge.icon;
                                        const StatusIcon = statusBadge.icon;

                                        return (
                                            <motion.tr
                                                key={admin.uid}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                            {admin.photoURL ? (
                                                                <img
                                                                    src={admin.photoURL}
                                                                    alt={admin.displayName}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                                    }}
                                                                />
                                                            ) : (
                                                                admin.displayName.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-slate-800 dark:text-white truncate flex items-center gap-2">
                                                                {admin.displayName}
                                                                {admin.role === 'super_admin' && (
                                                                    <Crown size={14} className="text-yellow-500" />
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                                                {admin.email}
                                                            </p>
                                                            {admin.phone && (
                                                                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                                                    {admin.phone}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 bg-gradient-to-r ${roleBadge.gradient} text-white rounded-full text-xs font-bold flex items-center gap-1 w-fit`}>
                                                        <RoleIcon size={12} />
                                                        {roleBadge.text}
                                                    </span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                                                        Level {roleBadge.level}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {admin.department ? (
                                                        <span className="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full text-xs font-semibold">
                                                            {admin.department}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm">N/A</span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 ${statusBadge.class} rounded-full text-xs font-bold flex items-center gap-1 w-fit`}>
                                                        <StatusIcon size={12} />
                                                        {statusBadge.text}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} className="flex-shrink-0" />
                                                        <span>{getTimeAgo(admin.lastLogin)}</span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleView(admin.uid)}
                                                            className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                                                            title="View Admin"
                                                        >
                                                            <Eye size={16} />
                                                        </motion.button>

                                                        {canManageAdmins() && (
                                                            <>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleEdit(admin.uid)}
                                                                    className="p-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all"
                                                                    title="Edit Admin"
                                                                >
                                                                    <Edit size={16} />
                                                                </motion.button>

                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleStatusClick(admin.uid, admin.displayName, admin.status)}
                                                                    className={`p-2 rounded-lg transition-all ${admin.status === 'suspended'
                                                                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                                                            : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                                                                        }`}
                                                                    title={admin.status === 'suspended' ? 'Activate Admin' : 'Suspend Admin'}
                                                                >
                                                                    {admin.status === 'suspended' ? <Unlock size={16} /> : <Lock size={16} />}
                                                                </motion.button>
                                                            </>
                                                        )}

                                                        {canDeleteAdmins() && admin.role !== 'super_admin' && (
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleDeleteClick(admin.uid, admin.displayName)}
                                                                className="p-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                                                                title="Delete Admin"
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
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700"
                    >
                        <Shield size={64} className="text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">No Admins Found</h3>
                        <p className="text-slate-500 dark:text-slate-500 mb-6">
                            {searchTerm ? 'Try different search terms' : 'No admins match the selected filters'}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AdminUsersManagement;
