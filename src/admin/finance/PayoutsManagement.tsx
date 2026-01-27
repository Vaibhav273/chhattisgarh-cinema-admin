import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet,
    Eye,
    Download,
    RefreshCw,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    TrendingUp,
    AlertCircle,
    User,
    Mail,
    Calendar,
    FileText,
    CreditCard,
    ChevronDown,
    X,
    Check,
    Send,
} from "lucide-react";
import {
    collection,
    query,
    getDocs,
    orderBy,
    doc,
    updateDoc,
    Timestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type { Payout } from "../../types";

interface Stats {
    totalPayouts: number;
    pendingPayouts: number;
    approvedPayouts: number;
    paidPayouts: number;
    rejectedPayouts: number;
    totalAmount: number;
    pendingAmount: number;
}

interface ToastProps {
    message: string;
    type: "success" | "error" | "info" | "warning";
    isVisible: boolean;
    onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 TOAST NOTIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const colors = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500",
        warning: "bg-yellow-500",
    };

    const icons = {
        success: CheckCircle,
        error: XCircle,
        info: AlertCircle,
        warning: AlertCircle,
    };

    const Icon = icons[type];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: -50, x: "-50%" }}
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
// 👁️ VIEW PAYOUT MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface ViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    payout: Payout | null;
}

const ViewModal: React.FC<ViewModalProps> = ({ isOpen, onClose, payout }) => {
    if (!isOpen || !payout) return null;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
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
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white sticky top-0 z-10 rounded-t-3xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                                    <Wallet size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black">Payout Details</h3>
                                    <p className="text-white/80 text-sm">#{payout.payoutId}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-xl transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Status Banner */}
                        <div
                            className={`p-6 rounded-2xl flex items-center justify-between ${payout.status === "paid"
                                ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800"
                                : payout.status === "approved"
                                    ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800"
                                    : payout.status === "pending"
                                        ? "bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800"
                                        : payout.status === "rejected"
                                            ? "bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800"
                                            : "bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800"
                                }`}
                        >
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                    Payout Status
                                </p>
                                <div className="flex items-center gap-3">
                                    {payout.status === "paid" && (
                                        <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
                                    )}
                                    {payout.status === "approved" && (
                                        <Check className="text-blue-600 dark:text-blue-400" size={32} />
                                    )}
                                    {payout.status === "pending" && (
                                        <Clock className="text-yellow-600 dark:text-yellow-400" size={32} />
                                    )}
                                    {payout.status === "rejected" && (
                                        <XCircle className="text-red-600 dark:text-red-400" size={32} />
                                    )}
                                    {payout.status === "processing" && (
                                        <Send className="text-orange-600 dark:text-orange-400" size={32} />
                                    )}
                                    <span
                                        className={`text-2xl font-black ${payout.status === "paid"
                                            ? "text-green-600 dark:text-green-400"
                                            : payout.status === "approved"
                                                ? "text-blue-600 dark:text-blue-400"
                                                : payout.status === "pending"
                                                    ? "text-yellow-600 dark:text-yellow-400"
                                                    : payout.status === "rejected"
                                                        ? "text-red-600 dark:text-red-400"
                                                        : "text-orange-600 dark:text-orange-400"
                                            }`}
                                    >
                                        {payout.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Net Payout</p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white">
                                    {payout.currency === "INR" ? "₹" : "$"}
                                    {payout.earnings.netPayout.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Creator Info */}
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <User size={20} className="text-purple-500" />
                                Creator Information
                            </h4>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                        <User size={18} className="text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
                                        <p className="font-bold text-slate-800 dark:text-white">
                                            {payout.creatorName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                        <Mail size={18} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                                            {payout.creatorEmail}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <FileText size={18} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Creator ID</p>
                                        <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                            {payout.creatorId}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Period Info */}
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Calendar size={20} className="text-orange-500" />
                                Payout Period
                            </h4>
                            <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl border-2 border-orange-200 dark:border-orange-800">
                                <div className="text-center mb-4">
                                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                                        {payout.period}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                            Start Date
                                        </p>
                                        <p className="font-bold text-slate-800 dark:text-white">
                                            {new Date(payout.periodStartDate).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                            End Date
                                        </p>
                                        <p className="font-bold text-slate-800 dark:text-white">
                                            {new Date(payout.periodEndDate).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Earnings Breakdown */}
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <DollarSign size={20} className="text-green-500" />
                                Earnings Breakdown
                            </h4>
                            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl space-y-3 border-2 border-green-200 dark:border-green-800">
                                <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-xl">
                                    <span className="text-slate-600 dark:text-slate-400 font-semibold">
                                        Subscription Revenue
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-white text-lg">
                                        ₹{payout.earnings.subscriptionRevenue.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-xl">
                                    <span className="text-slate-600 dark:text-slate-400 font-semibold">
                                        Event Revenue
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-white text-lg">
                                        ₹{payout.earnings.eventRevenue.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-xl">
                                    <span className="text-slate-600 dark:text-slate-400 font-semibold">
                                        Total Earnings
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-white text-lg">
                                        ₹{payout.earnings.totalEarnings.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                    <span className="text-red-600 dark:text-red-400 font-semibold">
                                        Platform Fee (
                                        {((payout.earnings.platformFee / payout.earnings.totalEarnings) * 100).toFixed(
                                            0
                                        )}
                                        %)
                                    </span>
                                    <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                                        -₹{payout.earnings.platformFee.toLocaleString()}
                                    </span>
                                </div>
                                <div className="pt-3 border-t-2 border-green-300 dark:border-green-700 flex justify-between items-center">
                                    <span className="text-xl font-black text-slate-800 dark:text-white">
                                        Net Payout
                                    </span>
                                    <span className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                        ₹{payout.earnings.netPayout.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        {payout.paymentMethod && (
                            <div>
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <CreditCard size={20} className="text-blue-500" />
                                    Payment Method
                                </h4>
                                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400 font-semibold">
                                            Method Type
                                        </span>
                                        <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-black uppercase">
                                            {payout.paymentMethod.type.replace("_", " ")}
                                        </span>
                                    </div>
                                    {payout.paymentMethod.accountNumber && (
                                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                Account Number
                                            </p>
                                            <code className="text-sm font-mono font-bold text-slate-800 dark:text-white">
                                                •••• •••• {payout.paymentMethod.accountNumber.slice(-4)}
                                            </code>
                                        </div>
                                    )}
                                    {payout.paymentMethod.ifscCode && (
                                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                IFSC Code
                                            </p>
                                            <code className="text-sm font-mono font-bold text-slate-800 dark:text-white">
                                                {payout.paymentMethod.ifscCode}
                                            </code>
                                        </div>
                                    )}
                                    {payout.paymentMethod.upiId && (
                                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">UPI ID</p>
                                            <code className="text-sm font-mono font-bold text-slate-800 dark:text-white">
                                                {payout.paymentMethod.upiId}
                                            </code>
                                        </div>
                                    )}
                                    {payout.paymentMethod.paypalEmail && (
                                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                PayPal Email
                                            </p>
                                            <code className="text-sm font-mono font-bold text-slate-800 dark:text-white">
                                                {payout.paymentMethod.paypalEmail}
                                            </code>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Additional Info */}
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-slate-500" />
                                Additional Information
                            </h4>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-4">
                                {payout.transactionId && (
                                    <div className="p-3 bg-white dark:bg-slate-700 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                            Transaction ID
                                        </p>
                                        <code className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 px-3 py-2 rounded-lg block">
                                            {payout.transactionId}
                                        </code>
                                    </div>
                                )}
                                {payout.processedBy && (
                                    <div className="p-3 bg-white dark:bg-slate-700 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                            Processed By
                                        </p>
                                        <p className="font-bold text-slate-800 dark:text-white">
                                            {payout.processedBy}
                                        </p>
                                    </div>
                                )}
                                {payout.processedAt && (
                                    <div className="p-3 bg-white dark:bg-slate-700 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                            Processed At
                                        </p>
                                        <p className="font-bold text-slate-800 dark:text-white">
                                            {formatDate(payout.processedAt)}
                                        </p>
                                    </div>
                                )}
                                {payout.rejectionReason && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                        <p className="text-sm text-red-600 dark:text-red-400 mb-2 font-bold">
                                            Rejection Reason
                                        </p>
                                        <p className="text-red-700 dark:text-red-300">{payout.rejectionReason}</p>
                                    </div>
                                )}
                                {payout.notes && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-semibold">
                                            Notes
                                        </p>
                                        <p className="text-slate-700 dark:text-slate-300">{payout.notes}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white dark:bg-slate-700 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Created At</p>
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">
                                            {formatDate(payout.createdAt)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-700 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                            Last Updated
                                        </p>
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">
                                            {formatDate(payout.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between sticky bottom-0 border-t border-slate-200 dark:border-slate-700 rounded-b-3xl">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2"
                        >
                            <Download size={20} />
                            Download Report
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
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
// ✅ APPROVE/REJECT MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    payout: Payout | null;
    action: "approve" | "reject";
    onConfirm: (payoutId: string, notes?: string) => Promise<void>;
}

const ActionModal: React.FC<ActionModalProps> = ({
    isOpen,
    onClose,
    payout,
    action,
    onConfirm,
}) => {
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen || !payout) return null;

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm(payout.id, notes);
        setLoading(false);
        setNotes("");
        onClose();
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
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full"
                >
                    <div
                        className={`p-6 text-white rounded-t-3xl ${action === "approve"
                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                            : "bg-gradient-to-r from-red-500 to-rose-600"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                                {action === "approve" ? <CheckCircle size={24} /> : <XCircle size={24} />}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black">
                                    {action === "approve" ? "Approve Payout" : "Reject Payout"}
                                </h3>
                                <p className="text-white/80 text-sm">#{payout.payoutId}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Creator</p>
                            <p className="font-bold text-slate-800 dark:text-white">{payout.creatorName}</p>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Amount</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">
                                ₹{payout.earnings.netPayout.toLocaleString()}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {action === "approve" ? "Notes (Optional)" : "Rejection Reason (Required)"}
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={
                                    action === "approve"
                                        ? "Add any notes about this approval..."
                                        : "Please provide a reason for rejection..."
                                }
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white resize-none"
                                rows={4}
                                required={action === "reject"}
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700 rounded-b-3xl">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                            disabled={loading}
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleConfirm}
                            disabled={loading || (action === "reject" && !notes.trim())}
                            className={`px-6 py-3 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${action === "approve"
                                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                : "bg-gradient-to-r from-red-500 to-rose-600"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {action === "approve" ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                    {action === "approve" ? "Approve Payout" : "Reject Payout"}
                                </>
                            )}
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

const PayoutsManagement: React.FC = () => {
    // States
    const [loading, setLoading] = useState(true);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [filteredPayouts, setFilteredPayouts] = useState<Payout[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalPayouts: 0,
        pendingPayouts: 0,
        approvedPayouts: 0,
        paidPayouts: 0,
        rejectedPayouts: 0,
        totalAmount: 0,
        pendingAmount: 0,
    });

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // Modals
    const [viewModal, setViewModal] = useState({
        isOpen: false,
        payout: null as Payout | null,
    });

    const [actionModal, setActionModal] = useState({
        isOpen: false,
        payout: null as Payout | null,
        action: "approve" as "approve" | "reject",
    });

    // Toast
    const [toast, setToast] = useState({
        isVisible: false,
        message: "",
        type: "success" as "success" | "error" | "info" | "warning",
    });

    // Fetch payouts
    useEffect(() => {
        fetchPayouts();
    }, []);

    // Apply filters
    useEffect(() => {
        applyFilters();
    }, [searchQuery, filterStatus, payouts]);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            console.log("Fetching payouts...");

            const payoutsQuery = query(
                collection(db, "payouts"),
                orderBy("createdAt", "desc")
            );
            const payoutsSnapshot = await getDocs(payoutsQuery);

            const fetchedPayouts: Payout[] = [];
            let totalAmount = 0;
            let pendingAmount = 0;
            let pendingCount = 0;
            let approvedCount = 0;
            let paidCount = 0;
            let rejectedCount = 0;

            payoutsSnapshot.forEach((doc) => {
                const data = doc.data();
                const payout: Payout = {
                    id: doc.id,
                    payoutId: data.payoutId || doc.id,
                    creatorId: data.creatorId || "",
                    creatorName: data.creatorName || "Unknown Creator",
                    creatorEmail: data.creatorEmail || "",
                    amount: data.amount || 0,
                    currency: data.currency || "INR",
                    period: data.period || "",
                    periodStartDate: data.periodStartDate || "",
                    periodEndDate: data.periodEndDate || "",
                    status: data.status || "pending",
                    paymentMethod: data.paymentMethod,
                    earnings: data.earnings || {
                        subscriptionRevenue: 0,
                        eventRevenue: 0,
                        totalEarnings: 0,
                        platformFee: 0,
                        netPayout: 0,
                    },
                    transactionId: data.transactionId,
                    processedBy: data.processedBy,
                    processedAt: data.processedAt?.toDate?.()?.toISOString(),
                    rejectionReason: data.rejectionReason,
                    notes: data.notes,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                };

                fetchedPayouts.push(payout);

                // Calculate stats
                totalAmount += payout.earnings.netPayout;

                if (payout.status === "pending") {
                    pendingCount++;
                    pendingAmount += payout.earnings.netPayout;
                } else if (payout.status === "approved") {
                    approvedCount++;
                } else if (payout.status === "paid") {
                    paidCount++;
                } else if (payout.status === "rejected") {
                    rejectedCount++;
                }
            });

            const stats: Stats = {
                totalPayouts: fetchedPayouts.length,
                pendingPayouts: pendingCount,
                approvedPayouts: approvedCount,
                paidPayouts: paidCount,
                rejectedPayouts: rejectedCount,
                totalAmount,
                pendingAmount,
            };

            console.log(`✅ Fetched ${fetchedPayouts.length} payouts`);
            setPayouts(fetchedPayouts);
            setStats(stats);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching payouts:", error);
            showToast("Failed to load payouts", "error");
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...payouts];

        // Filter by status
        if (filterStatus !== "all") {
            filtered = filtered.filter((payout) => payout.status === filterStatus);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (payout) =>
                    payout.payoutId.toLowerCase().includes(query) ||
                    payout.creatorName.toLowerCase().includes(query) ||
                    payout.creatorEmail.toLowerCase().includes(query) ||
                    payout.period.toLowerCase().includes(query)
            );
        }

        setFilteredPayouts(filtered);
    };

    const handleApproveReject = async (payoutId: string, notes?: string) => {
        try {
            const payoutRef = doc(db, "payouts", payoutId);
            const updateData: any = {
                status: actionModal.action === "approve" ? "approved" : "rejected",
                processedAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            if (notes) {
                if (actionModal.action === "approve") {
                    updateData.notes = notes;
                } else {
                    updateData.rejectionReason = notes;
                }
            }

            await updateDoc(payoutRef, updateData);

            showToast(
                `Payout ${actionModal.action === "approve" ? "approved" : "rejected"} successfully`,
                "success"
            );
            fetchPayouts();
        } catch (error) {
            console.error(`Error ${actionModal.action}ing payout:`, error);
            showToast(`Failed to ${actionModal.action} payout`, "error");
        }
    };

    const showToast = (
        message: string,
        type: "success" | "error" | "info" | "warning"
    ) => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid":
                return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
            case "approved":
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
            case "pending":
                return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
            case "rejected":
                return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
            case "processing":
                return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
            default:
                return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const handleExportReport = () => {
        showToast("Exporting payouts report...", "info");
        // Export logic here
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mb-4"
                />
                <p className="text-slate-600 dark:text-slate-400 font-semibold">
                    Loading payouts...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full pb-8">
            {/* Toast */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            {/* View Modal */}
            <ViewModal
                isOpen={viewModal.isOpen}
                onClose={() => setViewModal({ isOpen: false, payout: null })}
                payout={viewModal.payout}
            />

            {/* Action Modal */}
            <ActionModal
                isOpen={actionModal.isOpen}
                onClose={() =>
                    setActionModal({ isOpen: false, payout: null, action: "approve" })
                }
                payout={actionModal.payout}
                action={actionModal.action}
                onConfirm={handleApproveReject}
            />

            <div className="space-y-6 w-full">
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                    />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                                    <Wallet size={32} />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black mb-2">Payouts Management</h1>
                                    <p className="text-white/90 text-lg">
                                        Manage creator payouts and earnings
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={fetchPayouts}
                                    className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                                >
                                    <RefreshCw size={20} />
                                    Refresh
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleExportReport}
                                    className="px-8 py-3 bg-white text-purple-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                    <Download size={20} />
                                    Export Report
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    Total Payouts
                                </p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                                    {stats.totalPayouts}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <Wallet size={24} className="text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    Pending
                                </p>
                                <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400 mt-2">
                                    {stats.pendingPayouts}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                                <Clock size={24} className="text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    Paid Out
                                </p>
                                <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-2">
                                    {stats.paidPayouts}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    Total Amount
                                </p>
                                <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
                                    ₹{(stats.totalAmount / 1000).toFixed(1)}K
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <DollarSign size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    Pending Amount
                                </p>
                                <p className="text-3xl font-black text-orange-600 dark:text-orange-400 mt-2">
                                    ₹{(stats.pendingAmount / 1000).toFixed(1)}K
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                <TrendingUp size={24} className="text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    Approved
                                </p>
                                <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
                                    {stats.approvedPayouts}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <Check size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    Rejected
                                </p>
                                <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-2">
                                    {stats.rejectedPayouts}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                                <XCircle size={24} className="text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* FILTERS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by payout ID, creator, email, period..."
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="appearance-none px-6 py-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white font-semibold cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="processing">Processing</option>
                                <option value="paid">Paid</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                size={20}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* PAYOUTS TABLE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    {filteredPayouts.length === 0 ? (
                        <div className="text-center py-16">
                            <AlertCircle
                                size={64}
                                className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
                            />
                            <p className="text-xl font-bold text-slate-500 dark:text-slate-400">
                                No payouts found
                            </p>
                            <p className="text-slate-400 dark:text-slate-500 mt-2">
                                Try adjusting your filters
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Payout ID
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Creator
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Period
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Created Date
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {filteredPayouts.map((payout, index) => (
                                        <motion.tr
                                            key={payout.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg font-mono text-slate-700 dark:text-slate-300">
                                                    {payout.payoutId}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white">
                                                        {payout.creatorName}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {payout.creatorEmail}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-800 dark:text-white">
                                                    {payout.period}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-800 dark:text-white">
                                                    ₹{payout.earnings.netPayout.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getStatusColor(
                                                        payout.status
                                                    )}`}
                                                >
                                                    {payout.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {formatDate(payout.createdAt)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() =>
                                                            setViewModal({ isOpen: true, payout: payout })
                                                        }
                                                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </motion.button>
                                                    {payout.status === "pending" && (
                                                        <>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() =>
                                                                    setActionModal({
                                                                        isOpen: true,
                                                                        payout: payout,
                                                                        action: "approve",
                                                                    })
                                                                }
                                                                className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-all"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() =>
                                                                    setActionModal({
                                                                        isOpen: true,
                                                                        payout: payout,
                                                                        action: "reject",
                                                                    })
                                                                }
                                                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                                                title="Reject"
                                                            >
                                                                <XCircle size={18} />
                                                            </motion.button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default PayoutsManagement;