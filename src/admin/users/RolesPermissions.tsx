// ═══════════════════════════════════════════════════════════════
// 🔐 ROLES & PERMISSIONS MANAGEMENT - PRODUCTION READY
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Crown,
    Key,
    Users,
    CheckCircle,
    XCircle,
    Edit,
    Plus,
    Minus,
    Search,
    Settings,
    BarChart,
    FileEdit,
    DollarSign,
    Video,
    RefreshCw,
    Info,
} from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission, type UserRole, ROLE_CONFIGS, PERMISSION_DESCRIPTIONS } from '../../types/roles';

// ═══════════════════════════════════════════════════════════════
// 🎉 SUCCESS/ERROR TOAST
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

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -50, x: '-50%' }}
                className="fixed top-6 left-1/2 z-50"
            >
                <div className={`${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3`}>
                    {type === 'success' && <CheckCircle size={24} />}
                    {type === 'error' && <XCircle size={24} />}
                    {type === 'info' && <Info size={24} />}
                    <p className="font-bold text-lg">{message}</p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

// ═══════════════════════════════════════════════════════════════
// 📋 ROLE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
interface RoleCardProps {
    role: UserRole;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: () => void;
    canEdit: boolean;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, isExpanded, onToggle, onEdit, canEdit }) => {
    const roleConfig = ROLE_CONFIGS[role];

    if (!roleConfig) return null;

    const getIconComponent = (iconName: string) => {
        const icons: Record<string, any> = {
            'User': Users,
            'Crown': Crown,
            'Shield': Shield,
            'Video': Video,
            'FileEdit': FileEdit,
            'DollarSign': DollarSign,
            'BarChart': BarChart,
            'Settings': Settings,
        };
        return icons[iconName] || Shield;
    };

    const RoleIcon = getIconComponent(roleConfig.icon);

    // Group permissions by category
    const permissionsByCategory: Record<string, Permission[]> = {};

    roleConfig.permissions.forEach(permission => {
        const desc = PERMISSION_DESCRIPTIONS[permission];
        if (desc) {
            const category = desc.category;
            if (!permissionsByCategory[category]) {
                permissionsByCategory[category] = [];
            }
            permissionsByCategory[category].push(permission);
        }
    });

    const categories = Object.keys(permissionsByCategory);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
            {/* Role Header */}
            <div className={`bg-gradient-to-r ${roleConfig.gradient} p-6 text-white relative overflow-hidden cursor-pointer`} onClick={onToggle}>
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute inset-0 bg-white/10 rounded-full blur-3xl"
                />

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                            <RoleIcon size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black mb-1">{roleConfig.name}</h3>
                            <p className="text-white/90 text-sm">{roleConfig.nameHindi}</p>
                            <p className="text-white/80 text-xs mt-1">Level {roleConfig.level}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-3xl font-black">{roleConfig.permissions.length}</p>
                            <p className="text-white/80 text-sm">Permissions</p>
                        </div>

                        {canEdit && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="p-3 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-white/30 transition-all"
                            >
                                <Edit size={20} />
                            </motion.button>
                        )}

                        <motion.button
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-3 bg-white/20 backdrop-blur-xl rounded-xl"
                        >
                            <motion.div>
                                {isExpanded ? <Minus size={20} /> : <Plus size={20} />}
                            </motion.div>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Role Description */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <p className="text-slate-600 dark:text-slate-400">{roleConfig.description}</p>
            </div>

            {/* Permissions List */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 space-y-6">
                            {categories.map((category) => (
                                <div key={category}>
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Key size={16} className="text-purple-500" />
                                        {category}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {permissionsByCategory[category].map((permission) => {
                                            const permDesc = PERMISSION_DESCRIPTIONS[permission];
                                            return (
                                                <div
                                                    key={permission}
                                                    className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
                                                >
                                                    <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-800 dark:text-white text-sm">
                                                            {permDesc?.name || permission}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            {permDesc?.description || 'No description'}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════
// 🎯 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const RolesPermissions: React.FC = () => {
    const { can, userRole } = usePermissions();
    const [expandedRoles, setExpandedRoles] = useState<Set<UserRole>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Toast State
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'success' as 'success' | 'error' | 'info',
    });

    // Stats
    const [stats, setStats] = useState({
        totalRoles: 0,
        totalPermissions: 0,
        adminRoles: 0,
        userRoles: 0,
    });

    useEffect(() => {
        calculateStats();
    }, []);

    const calculateStats = () => {
        const roles = Object.keys(ROLE_CONFIGS) as UserRole[];
        const totalRoles = roles.length;

        let allPermissions = new Set<Permission>();
        let adminRoles = 0;
        let userRoles = 0;

        roles.forEach(role => {
            const config = ROLE_CONFIGS[role];
            config.permissions.forEach(p => allPermissions.add(p));

            if (config.level >= 80) adminRoles++;
            else userRoles++;
        });

        setStats({
            totalRoles,
            totalPermissions: allPermissions.size,
            adminRoles,
            userRoles,
        });
    };

    const canManageRoles = () => {
        return can(Permission.MANAGE_ROLES) || userRole === 'super_admin';
    };

    const toggleRole = (role: UserRole) => {
        setExpandedRoles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(role)) {
                newSet.delete(role);
            } else {
                newSet.add(role);
            }
            return newSet;
        });
    };

    const handleEditRole = (_role: UserRole) => {
        if (!canManageRoles()) {
            showToast('You do not have permission to edit roles', 'error');
            return;
        }
        showToast('Role editing coming soon!', 'info');
    };

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    // Filter roles
    const roles = Object.keys(ROLE_CONFIGS) as UserRole[];
    const filteredRoles = roles.filter(role => {
        const config = ROLE_CONFIGS[role];

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            if (
                !config.name.toLowerCase().includes(searchLower) &&
                !config.nameHindi.toLowerCase().includes(searchLower) &&
                !config.description.toLowerCase().includes(searchLower)
            ) {
                return false;
            }
        }

        // Level filter
        if (filterLevel !== 'all') {
            const level = parseInt(filterLevel);
            if (level === 90 && config.level < 90) return false;
            if (level === 80 && (config.level < 80 || config.level >= 90)) return false;
            if (level === 50 && (config.level < 50 || config.level >= 80)) return false;
            if (level === 10 && config.level >= 50) return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
            const hasCategory = config.permissions.some(permission => {
                const desc = PERMISSION_DESCRIPTIONS[permission];
                return desc && desc.category === selectedCategory;
            });
            if (!hasCategory) return false;
        }

        return true;
    });

    // Get all permission categories
    const allCategories = new Set<string>();
    Object.values(PERMISSION_DESCRIPTIONS).forEach(desc => {
        allCategories.add(desc.category);
    });
    const categories = Array.from(allCategories);

    const expandAll = () => {
        setExpandedRoles(new Set(filteredRoles));
    };

    const collapseAll = () => {
        setExpandedRoles(new Set());
    };

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
                {/* 📊 HEADER & STATS */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden w-full"
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
                                    Roles & Permissions
                                </h1>
                                <p className="text-white/90 text-lg">Manage access control and permissions</p>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={expandAll}
                                    className="px-6 py-3 bg-white/20 backdrop-blur-xl text-white rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                                >
                                    <Plus size={20} />
                                    Expand All
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={collapseAll}
                                    className="px-6 py-3 bg-white/20 backdrop-blur-xl text-white rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                                >
                                    <Minus size={20} />
                                    Collapse All
                                </motion.button>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Total Roles</p>
                                <p className="text-4xl font-black">{stats.totalRoles}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Permissions</p>
                                <p className="text-4xl font-black text-green-300">{stats.totalPermissions}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Admin Roles</p>
                                <p className="text-4xl font-black text-yellow-300">{stats.adminRoles}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">User Roles</p>
                                <p className="text-4xl font-black text-cyan-300">{stats.userRoles}</p>
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
                                placeholder="Search roles by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white transition-all"
                            />
                        </div>

                        {/* Filters Row */}
                        <div className="flex flex-wrap gap-3">
                            {/* Level Filter */}
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white transition-all"
                            >
                                <option value="all">All Levels</option>
                                <option value="90">Super Admin (90+)</option>
                                <option value="80">Admin (80-89)</option>
                                <option value="50">Manager (50-79)</option>
                                <option value="10">User (0-49)</option>
                            </select>

                            {/* Category Filter */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white transition-all"
                            >
                                <option value="all">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>

                            {/* Refresh Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={calculateStats}
                                className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Refresh
                            </motion.button>
                        </div>

                        {/* Results Count */}
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Showing <span className="font-bold text-slate-800 dark:text-white">{filteredRoles.length}</span> of <span className="font-bold text-slate-800 dark:text-white">{roles.length}</span> roles
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 📋 ROLES LIST */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {filteredRoles.length > 0 ? (
                    <div className="space-y-4">
                        {filteredRoles.map((role, index) => (
                            <motion.div
                                key={role}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <RoleCard
                                    role={role}
                                    isExpanded={expandedRoles.has(role)}
                                    onToggle={() => toggleRole(role)}
                                    onEdit={() => handleEditRole(role)}
                                    canEdit={canManageRoles()}
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700"
                    >
                        <Shield size={64} className="text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">No Roles Found</h3>
                        <p className="text-slate-500 dark:text-slate-500">
                            Try adjusting your search or filters
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default RolesPermissions;
