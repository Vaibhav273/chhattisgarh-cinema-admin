// ═══════════════════════════════════════════════════════════════════════════════
// 🚨 REPORTS MANAGEMENT - PRODUCTION READY
// Path: src/pages/admin/ReportsManagement.tsx
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    Search,
    CheckCircle,
    XCircle,
    Eye,
    Flag,
    Trash2,
    MessageSquare,
    User,
    Film,
    Calendar,
    RefreshCw,
} from 'lucide-react';
import {
    collection,
    query,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    orderBy,
    limit,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../types/roles';

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Report {
    id: string;
    type: 'comment' | 'user' | 'content' | 'spam' | 'inappropriate' | 'copyright' | 'other';
    reportedContentId: string;
    reportedContentTitle: string;
    reportedContentType?: 'movie' | 'series' | 'shortfilm' | 'comment' | 'user';
    reporterId: string;
    reporterName: string;
    reportedUserId?: string;
    reportedUserName?: string;
    reason: string;
    description?: string;
    status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    createdAt: Timestamp;
    updatedAt: Timestamp;
    reviewedBy?: string;
    reviewedAt?: Timestamp;
    resolution?: string;
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
        info: AlertTriangle,
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
// 📋 REPORT DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface ReportDetailModalProps {
    report: Report | null;
    isOpen: boolean;
    onClose: () => void;
    onResolve: (id: string, resolution: string) => void;
    onDismiss: (id: string) => void;
    onDelete: (id: string) => void;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
    report,
    isOpen,
    onClose,
    onResolve,
    onDismiss,
    onDelete,
}) => {
    const [resolution, setResolution] = useState('');

    if (!isOpen || !report) return null;

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            case 'high':
                return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
            default:
                return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
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
                    <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-2xl font-black">Report Details</h3>
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
                        {/* Priority Badge */}
                        <div className="flex items-center gap-3">
                            <span
                                className={`px-4 py-2 rounded-xl text-sm font-bold uppercase ${getPriorityColor(
                                    report.priority
                                )}`}
                            >
                                {report.priority} Priority
                            </span>
                            <span
                                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize ${report.status === 'pending'
                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                    : report.status === 'resolved'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : report.status === 'dismissed'
                                            ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}
                            >
                                {report.status}
                            </span>
                        </div>

                        {/* Reporter Info */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <User size={20} className="text-red-500" />
                                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    Reporter
                                </span>
                            </div>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">
                                {report.reporterName}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                ID: {report.reporterId}
                            </p>
                        </div>

                        {/* Report Type & Reason */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Flag size={20} className="text-red-500" />
                                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                        Type
                                    </span>
                                </div>
                                <p className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                                    {report.type}
                                </p>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={20} className="text-red-500" />
                                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                        Date
                                    </span>
                                </div>
                                <p className="text-lg font-bold text-slate-800 dark:text-white">
                                    {report.createdAt.toDate().toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Reported Content */}
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Film size={20} className="text-red-600" />
                                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                    Reported Content
                                </span>
                            </div>
                            <p className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                                {report.reportedContentTitle}
                            </p>
                            {report.reportedContentType && (
                                <span className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                                    {report.reportedContentType}
                                </span>
                            )}
                        </div>

                        {/* Reason */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <MessageSquare size={20} className="text-red-500" />
                                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    Reason
                                </span>
                            </div>
                            <p className="text-slate-800 dark:text-white font-bold mb-2">{report.reason}</p>
                            {report.description && (
                                <p className="text-slate-600 dark:text-slate-400">{report.description}</p>
                            )}
                        </div>

                        {/* Resolution (if resolved) */}
                        {report.status === 'resolved' && report.resolution && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle size={20} className="text-green-600" />
                                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                        Resolution
                                    </span>
                                </div>
                                <p className="text-slate-800 dark:text-white">{report.resolution}</p>
                            </div>
                        )}

                        {/* Resolution Input (if pending) */}
                        {report.status === 'pending' && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Resolution Notes
                                </label>
                                <textarea
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value)}
                                    placeholder="Enter resolution details..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white"
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    {report.status === 'pending' && (
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    onDelete(report.id);
                                    onClose();
                                }}
                                className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all flex items-center gap-2"
                            >
                                <Trash2 size={20} />
                                Delete
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    onDismiss(report.id);
                                    onClose();
                                }}
                                className="px-6 py-3 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-all flex items-center gap-2"
                            >
                                <XCircle size={20} />
                                Dismiss
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    if (resolution.trim()) {
                                        onResolve(report.id, resolution);
                                        onClose();
                                        setResolution('');
                                    }
                                }}
                                disabled={!resolution.trim()}
                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <CheckCircle size={20} />
                                Resolve
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🚨 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const ReportsManagement: React.FC = () => {
    const { can } = usePermissions();

    // State
    const [reports, setReports] = useState<Report[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState<Toast>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    // Fetch Reports
    useEffect(() => {
        fetchReports();
    }, []);

    // Filter Reports
    useEffect(() => {
        let filtered = reports;

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter((r) => r.type === typeFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter((r) => r.status === statusFilter);
        }

        // Priority filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter((r) => r.priority === priorityFilter);
        }

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (r) =>
                    r.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.reportedContentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.reason.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredReports(filtered);
    }, [reports, typeFilter, statusFilter, priorityFilter, searchQuery]);

    const fetchReports = async () => {
        try {
            setLoading(true);

            const q = query(
                collection(db, 'reports'),
                orderBy('createdAt', 'desc'),
                limit(100)
            );

            const snapshot = await getDocs(q);
            const reportsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Report[];

            setReports(reportsData);
            setFilteredReports(reportsData);
        } catch (error) {
            console.error('Error fetching reports:', error);
            showToast('Failed to load reports', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: Toast['type']) => {
        setToast({ message, type, isVisible: true });
    };

    const handleResolve = async (id: string, resolution: string) => {
        if (!can(Permission.DELETE_COMMENTS)) {
            showToast('You do not have permission to resolve reports', 'error');
            return;
        }

        try {
            await updateDoc(doc(db, 'reports', id), {
                status: 'resolved',
                resolution,
                reviewedAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            setReports((prev) =>
                prev.map((r) =>
                    r.id === id ? { ...r, status: 'resolved', resolution } : r
                )
            );

            showToast('Report resolved successfully', 'success');
        } catch (error) {
            console.error('Error resolving report:', error);
            showToast('Failed to resolve report', 'error');
        }
    };

    const handleDismiss = async (id: string) => {
        if (!can(Permission.DELETE_COMMENTS)) {
            showToast('You do not have permission to dismiss reports', 'error');
            return;
        }

        try {
            await updateDoc(doc(db, 'reports', id), {
                status: 'dismissed',
                reviewedAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            setReports((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: 'dismissed' } : r))
            );

            showToast('Report dismissed successfully', 'success');
        } catch (error) {
            console.error('Error dismissing report:', error);
            showToast('Failed to dismiss report', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!can(Permission.DELETE_PERMANENTLY)) {
            showToast('You do not have permission to delete reports', 'error');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this report permanently?')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'reports', id));
            setReports((prev) => prev.filter((r) => r.id !== id));
            showToast('Report deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting report:', error);
            showToast('Failed to delete report', 'error');
        }
    };

    const openReportDetail = (report: Report) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    // Stats
    const stats = {
        total: reports.length,
        pending: reports.filter((r) => r.status === 'pending').length,
        resolved: reports.filter((r) => r.status === 'resolved').length,
        dismissed: reports.filter((r) => r.status === 'dismissed').length,
        critical: reports.filter((r) => r.priority === 'critical').length,
        high: reports.filter((r) => r.priority === 'high').length,
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'critical':
                return {
                    text: 'Critical',
                    class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                };
            case 'high':
                return {
                    text: 'High',
                    class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                };
            case 'medium':
                return {
                    text: 'Medium',
                    class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                };
            default:
                return {
                    text: 'Low',
                    class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                };
        }
    };

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            spam: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            inappropriate: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            copyright: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            comment: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            user: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            content: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        };

        return colors[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    };

    return (
        <div className="min-h-screen w-full">
            {/* Toast */}
            <Toast {...toast} onClose={() => setToast({ ...toast, isVisible: false })} />

            {/* Report Detail Modal */}
            <ReportDetailModal
                report={selectedReport}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onResolve={handleResolve}
                onDismiss={handleDismiss}
                onDelete={handleDelete}
            />

            <div className="space-y-6 w-full">
                {/* Header & Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-red-500 to-red-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden w-full"
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
                                    <AlertTriangle size={36} />
                                    Reports Management
                                </h1>
                                <p className="text-white/90 text-lg">Handle user reports and violations</p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Total Reports</p>
                                <p className="text-4xl font-black">{stats.total}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Pending</p>
                                <p className="text-4xl font-black text-orange-300">{stats.pending}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Resolved</p>
                                <p className="text-4xl font-black text-green-300">{stats.resolved}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Dismissed</p>
                                <p className="text-4xl font-black text-gray-300">{stats.dismissed}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">Critical</p>
                                <p className="text-4xl font-black text-red-300">{stats.critical}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                                <p className="text-white/80 text-sm mb-1">High Priority</p>
                                <p className="text-4xl font-black text-yellow-300">{stats.high}</p>
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
                                placeholder="Search reports by reporter, content, or reason..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white"
                            />
                        </div>

                        {/* Filter Row */}
                        <div className="flex flex-wrap gap-3">
                            {/* Type Filter */}
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white"
                            >
                                <option value="all">All Types</option>
                                <option value="spam">Spam</option>
                                <option value="inappropriate">Inappropriate</option>
                                <option value="copyright">Copyright</option>
                                <option value="comment">Comment</option>
                                <option value="user">User</option>
                                <option value="content">Content</option>
                                <option value="other">Other</option>
                            </select>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="reviewing">Reviewing</option>
                                <option value="resolved">Resolved</option>
                                <option value="dismissed">Dismissed</option>
                            </select>

                            {/* Priority Filter */}
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white"
                            >
                                <option value="all">All Priority</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>

                            {/* Refresh Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={fetchReports}
                                className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Refresh
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Reports Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full"
                            />
                            <p className="text-slate-600 dark:text-slate-400 font-semibold mt-4">
                                Loading reports...
                            </p>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <AlertTriangle className="text-slate-300 dark:text-slate-600" size={64} />
                            <p className="text-xl font-bold text-slate-400 dark:text-slate-500 mt-4">
                                No reports found
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Content
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Reporter
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Reason
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredReports.map((report) => {
                                        const priorityBadge = getPriorityBadge(report.priority);
                                        const typeClass = getTypeBadge(report.type);

                                        return (
                                            <motion.tr
                                                key={report.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                {/* Type */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${typeClass}`}
                                                    >
                                                        {report.type}
                                                    </span>
                                                </td>

                                                {/* Content */}
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-slate-800 dark:text-white max-w-xs truncate">
                                                        {report.reportedContentTitle}
                                                    </p>
                                                    {report.reportedContentType && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                                            {report.reportedContentType}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Reporter */}
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-slate-800 dark:text-white">
                                                        {report.reporterName}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        ID: {report.reporterId.slice(0, 8)}...
                                                    </p>
                                                </td>

                                                {/* Reason */}
                                                <td className="px-6 py-4">
                                                    <p className="text-slate-800 dark:text-white max-w-xs truncate">
                                                        {report.reason}
                                                    </p>
                                                </td>

                                                {/* Priority */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold ${priorityBadge.class}`}
                                                    >
                                                        {priorityBadge.text}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${report.status === 'pending'
                                                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                            : report.status === 'resolved'
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                : report.status === 'dismissed'
                                                                    ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                            }`}
                                                    >
                                                        {report.status}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {report.createdAt.toDate().toLocaleDateString()}
                                                    </p>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => openReportDetail(report)}
                                                            className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} />
                                                        </motion.button>

                                                        {report.status === 'pending' &&
                                                            can(Permission.DELETE_COMMENTS) && (
                                                                <>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => handleResolve(report.id, 'Resolved')}
                                                                        className="p-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all"
                                                                        title="Resolve"
                                                                    >
                                                                        <CheckCircle size={18} />
                                                                    </motion.button>

                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => handleDismiss(report.id)}
                                                                        className="p-2 bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900/50 transition-all"
                                                                        title="Dismiss"
                                                                    >
                                                                        <XCircle size={18} />
                                                                    </motion.button>
                                                                </>
                                                            )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsManagement;
