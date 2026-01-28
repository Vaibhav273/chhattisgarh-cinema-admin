import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Search,
    Download,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info,
    Eye,
    Calendar,
    User,
    Terminal,
    Filter,
    X,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    Timestamp,
    startAfter,
    QueryDocumentSnapshot,
    type DocumentData,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface SystemLog {
    id: string;
    timestamp: Timestamp;
    level: 'info' | 'warning' | 'error' | 'success';
    module: string;
    subModule?: string;
    action?: string;
    message: string;
    user?: string;
    userId?: string;
    performedBy?: {
        uid: string;
        email: string;
        name: string;
        role: string;
    };
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    status?: string;
}

interface Toast {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isVisible: boolean;
}

interface FilterOptions {
    searchQuery: string;
    level: string;
    module: string;
    action: string;
    admin: string;
    status: string;
    dateFrom: string;
    dateTo: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 TOAST COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const Toast: React.FC<Toast & { onClose: () => void }> = ({ message, type, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
    };

    const icons = {
        success: CheckCircle,
        error: XCircle,
        info: Info,
        warning: AlertTriangle,
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
                <div
                    className={`${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 min-w-[300px]`}
                >
                    <Icon size={24} />
                    <p className="font-bold text-lg">{message}</p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📄 LOG DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface LogDetailModalProps {
    log: SystemLog | null;
    isOpen: boolean;
    onClose: () => void;
}

const LogDetailModal: React.FC<LogDetailModalProps> = ({ log, isOpen, onClose }) => {
    if (!isOpen || !log) return null;

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error':
                return 'from-red-500 to-red-600';
            case 'warning':
                return 'from-orange-500 to-orange-600';
            case 'success':
                return 'from-green-500 to-green-600';
            default:
                return 'from-blue-500 to-blue-600';
        }
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
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className={`bg-gradient-to-r ${getLevelColor(log.level)} p-6 text-white sticky top-0 z-10`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                                    <FileText size={24} />
                                </div>
                                <h3 className="text-2xl font-black">Log Details</h3>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                                <XCircle size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Level, Module & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Level</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-white uppercase">{log.level}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Module</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-white">{log.module}</p>
                            </div>
                            {log.status && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                                        {log.status}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Timestamp */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={20} className="text-slate-500" />
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Timestamp
                                </span>
                            </div>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">
                                {log.timestamp.toDate().toLocaleString()}
                            </p>
                        </div>

                        {/* Action */}
                        {log.action && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info size={20} className="text-slate-500" />
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        Action
                                    </span>
                                </div>
                                <p className="text-slate-800 dark:text-white font-semibold">
                                    {log.action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                </p>
                            </div>
                        )}

                        {/* Message */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Info size={20} className="text-slate-500" />
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Message</span>
                            </div>
                            <p className="text-slate-800 dark:text-white">{log.message}</p>
                        </div>

                        {/* Performed By */}
                        {log.performedBy && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <User size={20} className="text-slate-500" />
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        Performed By
                                    </span>
                                </div>
                                <p className="text-slate-800 dark:text-white font-bold">{log.performedBy.name}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {log.performedBy.email}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                    Role: {log.performedBy.role}
                                </p>
                            </div>
                        )}

                        {/* User (Legacy) */}
                        {log.user && !log.performedBy && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <User size={20} className="text-slate-500" />
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">User</span>
                                </div>
                                <p className="text-slate-800 dark:text-white">{log.user}</p>
                                {log.userId && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ID: {log.userId}</p>
                                )}
                            </div>
                        )}

                        {/* IP Address & User Agent */}
                        {(log.ipAddress || log.userAgent) && (
                            <div className="grid grid-cols-1 gap-4">
                                {log.ipAddress && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">IP Address</p>
                                        <p className="text-sm text-slate-800 dark:text-white font-mono">
                                            {log.ipAddress}
                                        </p>
                                    </div>
                                )}
                                {log.userAgent && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">User Agent</p>
                                        <p className="text-sm text-slate-800 dark:text-white font-mono break-all">
                                            {log.userAgent}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Details (JSON) */}
                        {log.details && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Terminal size={20} className="text-slate-500" />
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        Additional Details
                                    </span>
                                </div>
                                <pre className="text-xs text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-900 p-4 rounded-lg overflow-x-auto">
                                    {JSON.stringify(log.details, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="px-8 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-all"
                        >
                            Close
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const SystemLogs: React.FC = () => {
    // State
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Toast
    const [toast, setToast] = useState<Toast>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    // Filters
    const [filters, setFilters] = useState<FilterOptions>({
        searchQuery: '',
        level: 'all',
        module: 'all',
        action: 'all',
        admin: 'all',
        status: 'all',
        dateFrom: '',
        dateTo: '',
    });

    // Dynamic filter options
    const [availableModules, setAvailableModules] = useState<string[]>([]);
    const [availableActions, setAvailableActions] = useState<string[]>([]);
    const [availableAdmins, setAvailableAdmins] = useState<string[]>([]);

    // ═══════════════════════════════════════════════════════════════
    // 🔄 EFFECTS
    // ═══════════════════════════════════════════════════════════════

    useEffect(() => {
        fetchLogs();
    }, []);

    // Extract unique filter options from logs
    useEffect(() => {
        const modules = [...new Set(logs.map((log) => log.module))].sort();
        const actions = [...new Set(logs.map((log) => log.action).filter(Boolean))].sort();
        const admins = [
            ...new Set(logs.map((log) => log.performedBy?.name || log.user).filter(Boolean)),
        ].sort();

        setAvailableModules(modules);
        setAvailableActions(actions as string[]);
        setAvailableAdmins(admins as string[]);
    }, [logs]);

    // Apply filters
    useEffect(() => {
        let filtered = [...logs];

        // Search query
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(
                (log) =>
                    log.message.toLowerCase().includes(query) ||
                    log.module.toLowerCase().includes(query) ||
                    log.action?.toLowerCase().includes(query) ||
                    log.performedBy?.name.toLowerCase().includes(query) ||
                    log.user?.toLowerCase().includes(query)
            );
        }

        // Level filter
        if (filters.level !== 'all') {
            filtered = filtered.filter((log) => log.level === filters.level);
        }

        // Module filter
        if (filters.module !== 'all') {
            filtered = filtered.filter((log) => log.module === filters.module);
        }

        // Action filter
        if (filters.action !== 'all') {
            filtered = filtered.filter((log) => log.action === filters.action);
        }

        // Admin filter
        if (filters.admin !== 'all') {
            filtered = filtered.filter(
                (log) => log.performedBy?.name === filters.admin || log.user === filters.admin
            );
        }

        // Status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter((log) => log.status === filters.status);
        }

        // Date range filter
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter((log) => log.timestamp.toDate() >= fromDate);
        }

        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter((log) => log.timestamp.toDate() <= toDate);
        }

        setFilteredLogs(filtered);
    }, [logs, filters]);

    // ═══════════════════════════════════════════════════════════════
    // 🔧 FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    const fetchLogs = async (loadMore = false) => {
        try {
            setLoading(!loadMore);
            console.log('📋 Fetching system logs...');

            let queryConstraints: any[] = [orderBy('timestamp', 'desc'), limit(100)];

            if (loadMore && lastDoc) {
                queryConstraints.push(startAfter(lastDoc));
            }

            const q = query(collection(db, 'systemLogs'), ...queryConstraints);
            const snapshot = await getDocs(q);

            const logsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as SystemLog[];

            console.log('✅ Logs fetched:', logsData.length);

            if (loadMore) {
                setLogs((prev) => [...prev, ...logsData]);
            } else {
                setLogs(logsData);
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === 100);
        } catch (error) {
            console.error('❌ Error fetching logs:', error);
            showToast('Failed to load logs', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: Toast['type']) => {
        setToast({ message, type, isVisible: true });
    };

    const handleExport = () => {
        try {
            const csv = [
                [
                    'Timestamp',
                    'Level',
                    'Module',
                    'Action',
                    'Message',
                    'Performed By',
                    'Status',
                    'Details',
                ],
                ...filteredLogs.map((log) => [
                    log.timestamp.toDate().toLocaleString(),
                    log.level,
                    log.module,
                    log.action || '-',
                    log.message,
                    log.performedBy?.name || log.user || 'System',
                    log.status || '-',
                    log.details ? JSON.stringify(log.details) : '-',
                ]),
            ]
                .map((row) => row.map((cell) => `"${cell}"`).join(','))
                .join('\n');

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);

            showToast(`Exported ${filteredLogs.length} logs successfully`, 'success');
        } catch (error) {
            console.error('❌ Export error:', error);
            showToast('Failed to export logs', 'error');
        }
    };

    const openLogDetail = (log: SystemLog) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'error':
                return {
                    text: 'ERROR',
                    class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    icon: XCircle,
                };
            case 'warning':
                return {
                    text: 'WARNING',
                    class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                    icon: AlertTriangle,
                };
            case 'success':
                return {
                    text: 'SUCCESS',
                    class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    icon: CheckCircle,
                };
            default:
                return {
                    text: 'INFO',
                    class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                    icon: Info,
                };
        }
    };

    const clearFilters = () => {
        setFilters({
            searchQuery: '',
            level: 'all',
            module: 'all',
            action: 'all',
            admin: 'all',
            status: 'all',
            dateFrom: '',
            dateTo: '',
        });
        showToast('Filters cleared', 'info');
    };

    const hasActiveFilters = () => {
        return (
            filters.searchQuery ||
            filters.level !== 'all' ||
            filters.module !== 'all' ||
            filters.action !== 'all' ||
            filters.admin !== 'all' ||
            filters.status !== 'all' ||
            filters.dateFrom ||
            filters.dateTo
        );
    };

    // Stats
    const stats = {
        total: logs.length,
        errors: logs.filter((l) => l.level === 'error').length,
        warnings: logs.filter((l) => l.level === 'warning').length,
        success: logs.filter((l) => l.level === 'success').length,
        info: logs.filter((l) => l.level === 'info').length,
        filtered: filteredLogs.length,
    };
    return (
        <div className="min-h-screen w-full pb-8">
            {/* Toast */}
            <Toast {...toast} onClose={() => setToast({ ...toast, isVisible: false })} />

            {/* Log Detail Modal */}
            <LogDetailModal log={selectedLog} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <div className="space-y-6 w-full">
                {/* ═══════════════════════════════════════════════════════════ */}
                {/* HEADER & STATS */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden w-full"
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
                                    <FileText size={36} />
                                    System Logs
                                </h1>
                                <p className="text-white/90 text-lg">
                                    Monitor system activity and track all admin actions
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => fetchLogs()}
                                    className="px-6 py-3 bg-white/20 backdrop-blur-xl text-white rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                                >
                                    <RefreshCw size={18} />
                                    Refresh
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleExport}
                                    disabled={filteredLogs.length === 0}
                                    className="px-6 py-3 bg-white text-gray-800 rounded-xl font-bold hover:bg-white/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download size={18} />
                                    Export CSV
                                </motion.button>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Total Logs</p>
                                <p className="text-4xl font-black">{stats.total}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Errors</p>
                                <p className="text-4xl font-black text-red-300">{stats.errors}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Warnings</p>
                                <p className="text-4xl font-black text-orange-300">{stats.warnings}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Success</p>
                                <p className="text-4xl font-black text-green-300">{stats.success}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Info</p>
                                <p className="text-4xl font-black text-blue-300">{stats.info}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* FILTERS */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden w-full"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Filter size={20} className="text-slate-600 dark:text-slate-400" />
                                <h3 className="text-lg font-black text-slate-800 dark:text-white">Filters</h3>
                                {hasActiveFilters() && (
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">
                                        Active
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {hasActiveFilters() && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={clearFilters}
                                        className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all flex items-center gap-2"
                                    >
                                        <X size={16} />
                                        Clear All
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                                >
                                    {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
                                    {showAdvancedFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Basic Filters - Always Visible */}
                        <div className="space-y-4">
                            {/* Search */}
                            <div className="relative w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search logs by message, user, module, or action..."
                                    value={filters.searchQuery}
                                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white"
                                />
                            </div>

                            {/* Quick Filters Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Level Filter */}
                                <select
                                    value={filters.level}
                                    onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                                    className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white font-semibold"
                                >
                                    <option value="all">All Levels</option>
                                    <option value="error">🔴 Errors</option>
                                    <option value="warning">🟠 Warnings</option>
                                    <option value="success">🟢 Success</option>
                                    <option value="info">🔵 Info</option>
                                </select>

                                {/* Module Filter */}
                                <select
                                    value={filters.module}
                                    onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                                    className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white font-semibold"
                                >
                                    <option value="all">All Modules</option>
                                    {availableModules.map((module) => (
                                        <option key={module} value={module}>
                                            {module}
                                        </option>
                                    ))}
                                </select>

                                {/* Status Filter */}
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white font-semibold"
                                >
                                    <option value="all">All Status</option>
                                    <option value="success">Success</option>
                                    <option value="failed">Failed</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>

                        {/* Advanced Filters - Collapsible */}
                        <AnimatePresence>
                            {showAdvancedFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Action Filter */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                Action Type
                                            </label>
                                            <select
                                                value={filters.action}
                                                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white"
                                            >
                                                <option value="all">All Actions</option>
                                                {availableActions.map((action) => (
                                                    <option key={action} value={action}>
                                                        {action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Admin Filter */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                Performed By
                                            </label>
                                            <select
                                                value={filters.admin}
                                                onChange={(e) => setFilters({ ...filters, admin: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white"
                                            >
                                                <option value="all">All Admins</option>
                                                {availableAdmins.map((admin) => (
                                                    <option key={admin} value={admin}>
                                                        {admin}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Date From */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                From Date
                                            </label>
                                            <input
                                                type="date"
                                                value={filters.dateFrom}
                                                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white"
                                            />
                                        </div>

                                        {/* Date To */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                To Date
                                            </label>
                                            <input
                                                type="date"
                                                value={filters.dateTo}
                                                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Results Count */}
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    Showing{' '}
                                    <span className="font-bold text-slate-800 dark:text-white">{stats.filtered}</span> of{' '}
                                    <span className="font-bold text-slate-800 dark:text-white">{stats.total}</span> logs
                                    {stats.filtered !== stats.total && (
                                        <span className="ml-2 text-blue-600 dark:text-blue-400 font-semibold">
                                            (Filtered)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
                {/* ═══════════════════════════════════════════════════════════ */}
                {/* LOGS TABLE */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-16 h-16 border-4 border-gray-700 border-t-transparent rounded-full"
                            />
                            <p className="text-slate-600 dark:text-slate-400 font-semibold mt-4">Loading logs...</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <FileText className="text-slate-300 dark:text-slate-600" size={64} />
                            <p className="text-xl font-bold text-slate-400 dark:text-slate-500 mt-4">
                                {hasActiveFilters() ? 'No logs match your filters' : 'No logs found'}
                            </p>
                            {hasActiveFilters() && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Timestamp
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Level
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Module
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Action
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Message
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Performed By
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredLogs.map((log, index) => {
                                        const levelBadge = getLevelBadge(log.level);

                                        return (
                                            <motion.tr
                                                key={log.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.02 }}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                {/* Timestamp */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={14} className="text-slate-400" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                                                {log.timestamp.toDate().toLocaleDateString()}
                                                            </p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                {log.timestamp.toDate().toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Level */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 w-fit ${levelBadge.class}`}
                                                    >
                                                        <levelBadge.icon size={14} />
                                                        {levelBadge.text}
                                                    </span>
                                                </td>

                                                {/* Module */}
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white">
                                                            {log.module}
                                                        </p>
                                                        {log.subModule && (
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                {log.subModule}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Action */}
                                                <td className="px-6 py-4">
                                                    {log.action ? (
                                                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold">
                                                            {log.action
                                                                .replace(/_/g, ' ')
                                                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">-</span>
                                                    )}
                                                </td>

                                                {/* Message */}
                                                <td className="px-6 py-4">
                                                    <p className="text-slate-800 dark:text-white max-w-md truncate">
                                                        {log.message}
                                                    </p>
                                                </td>

                                                {/* Performed By */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <User size={14} className="text-slate-400" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                                                {log.performedBy?.name || log.user || 'System'}
                                                            </p>
                                                            {log.performedBy?.role && (
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                                                    {log.performedBy.role}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    {log.status ? (
                                                        <span
                                                            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${log.status === 'success'
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                : log.status === 'failed'
                                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                }`}
                                                        >
                                                            {log.status}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">-</span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => openLogDetail(log)}
                                                        className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </motion.button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Load More */}
                    {hasMore && !loading && filteredLogs.length > 0 && filteredLogs.length === logs.length && (
                        <div className="p-6 flex justify-center border-t border-slate-200 dark:border-slate-800">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => fetchLogs(true)}
                                className="px-8 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Load More Logs
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default SystemLogs;
