
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
    message: string;
    user?: string;
    userId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
}

interface Toast {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isVisible: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 TOAST COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const Toast: React.FC<Toast & { onClose: () => void }> = ({
    message,
    type,
    isVisible,
    onClose,
}) => {
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
                    <div
                        className={`bg-gradient-to-r ${getLevelColor(
                            log.level
                        )} p-6 text-white sticky top-0 z-10`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                                    <FileText size={24} />
                                </div>
                                <h3 className="text-2xl font-black">Log Details</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-xl transition-all"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Level & Module */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Level</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-white uppercase">
                                    {log.level}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Module</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-white">
                                    {log.module}
                                </p>
                            </div>
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

                        {/* Message */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Info size={20} className="text-slate-500" />
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Message
                                </span>
                            </div>
                            <p className="text-slate-800 dark:text-white">{log.message}</p>
                        </div>

                        {/* User */}
                        {log.user && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <User size={20} className="text-slate-500" />
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        User
                                    </span>
                                </div>
                                <p className="text-slate-800 dark:text-white">{log.user}</p>
                                {log.userId && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        ID: {log.userId}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* IP Address & User Agent */}
                        {(log.ipAddress || log.userAgent) && (
                            <div className="grid grid-cols-1 gap-4">
                                {log.ipAddress && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                            IP Address
                                        </p>
                                        <p className="text-sm text-slate-800 dark:text-white font-mono">
                                            {log.ipAddress}
                                        </p>
                                    </div>
                                )}
                                {log.userAgent && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                            User Agent
                                        </p>
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
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState<string>('all');
    const [moduleFilter, setModuleFilter] = useState<string>('all');
    const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [toast, setToast] = useState<Toast>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    // Available modules (can be fetched from Firestore)
    const modules = ['Auth', 'Payment', 'Content', 'CDN', 'Upload', 'Admin', 'API', 'System'];

    useEffect(() => {
        fetchLogs();
    }, []);

    // Filter logs
    useEffect(() => {
        let filtered = logs;

        if (levelFilter !== 'all') {
            filtered = filtered.filter((log) => log.level === levelFilter);
        }

        if (moduleFilter !== 'all') {
            filtered = filtered.filter((log) => log.module === moduleFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(
                (log) =>
                    log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    log.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    log.module.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredLogs(filtered);
    }, [logs, levelFilter, moduleFilter, searchQuery]);

    const fetchLogs = async (loadMore = false) => {
        try {
            setLoading(!loadMore);

            let queryConstraints: any[] = [orderBy('timestamp', 'desc'), limit(50)];

            if (loadMore && lastDoc) {
                queryConstraints.push(startAfter(lastDoc));
            }

            const q = query(collection(db, 'systemLogs'), ...queryConstraints);
            const snapshot = await getDocs(q);

            const logsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as SystemLog[];

            if (loadMore) {
                setLogs((prev) => [...prev, ...logsData]);
            } else {
                setLogs(logsData);
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === 50);
        } catch (error) {
            console.error('Error fetching logs:', error);
            showToast('Failed to load logs', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: Toast['type']) => {
        setToast({ message, type, isVisible: true });
    };

    const handleExport = () => {
        const csv = [
            ['Timestamp', 'Level', 'Module', 'Message', 'User'],
            ...filteredLogs.map((log) => [
                log.timestamp.toDate().toLocaleString(),
                log.level,
                log.module,
                log.message,
                log.user || 'System',
            ]),
        ]
            .map((row) => row.map((cell) => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-logs-${new Date().toISOString()}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('Logs exported successfully', 'success');
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

    // Stats
    const stats = {
        total: logs.length,
        errors: logs.filter((l) => l.level === 'error').length,
        warnings: logs.filter((l) => l.level === 'warning').length,
        info: logs.filter((l) => l.level === 'info').length,
    };

    return (
        <div className="min-h-screen w-full">
            {/* Toast */}
            <Toast {...toast} onClose={() => setToast({ ...toast, isVisible: false })} />

            {/* Log Detail Modal */}
            <LogDetailModal
                log={selectedLog}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <div className="space-y-6 w-full">
                {/* Header & Stats */}
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
                                <p className="text-white/90 text-lg">Monitor system activity and errors</p>
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
                                    className="px-6 py-3 bg-white text-gray-800 rounded-xl font-bold hover:bg-white/90 transition-all flex items-center gap-2"
                                >
                                    <Download size={18} />
                                    Export
                                </motion.button>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                <p className="text-white/80 text-sm mb-1">Info</p>
                                <p className="text-4xl font-black text-blue-300">{stats.info}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 w-full"
                >
                    <div className="flex flex-col gap-4">
                        {/* Search */}
                        <div className="relative w-full">
                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                size={20}
                            />
                            <input
                                type="text"
                                placeholder="Search logs by message, user, or module..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white"
                            />
                        </div>

                        {/* Filter Row */}
                        <div className="flex flex-wrap gap-3">
                            {/* Level Filter */}
                            <select
                                value={levelFilter}
                                onChange={(e) => setLevelFilter(e.target.value)}
                                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white"
                            >
                                <option value="all">All Levels</option>
                                <option value="error">Errors</option>
                                <option value="warning">Warnings</option>
                                <option value="info">Info</option>
                                <option value="success">Success</option>
                            </select>

                            {/* Module Filter */}
                            <select
                                value={moduleFilter}
                                onChange={(e) => setModuleFilter(e.target.value)}
                                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white"
                            >
                                <option value="all">All Modules</option>
                                {modules.map((module) => (
                                    <option key={module} value={module}>
                                        {module}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Results Count */}
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Showing <span className="font-bold text-slate-800 dark:text-white">{filteredLogs.length}</span> of{' '}
                            <span className="font-bold text-slate-800 dark:text-white">{logs.length}</span> logs
                        </div>
                    </div>
                </motion.div>

                {/* Logs Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-16 h-16 border-4 border-gray-700 border-t-transparent rounded-full"
                            />
                            <p className="text-slate-600 dark:text-slate-400 font-semibold mt-4">
                                Loading logs...
                            </p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <FileText className="text-slate-300 dark:text-slate-600" size={64} />
                            <p className="text-xl font-bold text-slate-400 dark:text-slate-500 mt-4">
                                No logs found
                            </p>
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
                                            Message
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredLogs.map((log) => {
                                        const levelBadge = getLevelBadge(log.level);

                                        return (
                                            <motion.tr
                                                key={log.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                {/* Timestamp */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {log.timestamp.toDate().toLocaleString()}
                                                    </p>
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
                                                    <p className="font-semibold text-slate-800 dark:text-white">
                                                        {log.module}
                                                    </p>
                                                </td>

                                                {/* Message */}
                                                <td className="px-6 py-4">
                                                    <p className="text-slate-800 dark:text-white max-w-md truncate">
                                                        {log.message}
                                                    </p>
                                                </td>

                                                {/* User */}
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {log.user || 'System'}
                                                    </p>
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
                    {hasMore && !loading && filteredLogs.length > 0 && (
                        <div className="p-6 flex justify-center border-t border-slate-200 dark:border-slate-800">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => fetchLogs(true)}
                                className="px-8 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition-all"
                            >
                                Load More
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemLogs;
