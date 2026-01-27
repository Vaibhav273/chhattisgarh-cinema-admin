import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Receipt,
    Eye,
    Download,
    RefreshCw,
    Search,
    User,
    CreditCard,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    AlertCircle,
    FileText,
    Smartphone,
    Laptop,
    ChevronDown,
    X,
} from "lucide-react";
import {
    collection,
    query,
    getDocs,
    orderBy,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type { Transaction } from "../../types";

interface Stats {
    totalTransactions: number;
    successfulTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    totalRevenue: number;
    todayRevenue: number;
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
// 👁️ VIEW TRANSACTION MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface ViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

const ViewModal: React.FC<ViewModalProps> = ({ isOpen, onClose, transaction }) => {
    if (!isOpen || !transaction) return null;

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

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case "card":
                return <CreditCard size={20} />;
            case "upi":
                return <Smartphone size={20} />;
            case "netbanking":
                return <Laptop size={20} />;
            case "wallet":
                return <DollarSign size={20} />;
            default:
                return <CreditCard size={20} />;
        }
    };

    const getPaymentMethodDisplay = () => {
        const { type, last4, upiId, bank } = transaction.paymentMethod;
        if (type === "card" && last4) return `Card •••• ${last4}`;
        if (type === "upi" && upiId) return upiId;
        if (type === "netbanking" && bank) return bank;
        return type.toUpperCase();
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
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white sticky top-0 z-10 rounded-t-3xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                                    <Receipt size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black">Transaction Details</h3>
                                    <p className="text-white/80 text-sm">#{transaction.transactionId}</p>
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
                            className={`p-6 rounded-2xl flex items-center justify-between ${transaction.status === "success"
                                    ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800"
                                    : transaction.status === "pending"
                                        ? "bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800"
                                        : transaction.status === "failed"
                                            ? "bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800"
                                            : "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800"
                                }`}
                        >
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                    Transaction Status
                                </p>
                                <div className="flex items-center gap-3">
                                    {transaction.status === "success" && (
                                        <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
                                    )}
                                    {transaction.status === "pending" && (
                                        <Clock className="text-yellow-600 dark:text-yellow-400" size={32} />
                                    )}
                                    {transaction.status === "failed" && (
                                        <XCircle className="text-red-600 dark:text-red-400" size={32} />
                                    )}
                                    {transaction.status === "refunded" && (
                                        <AlertCircle className="text-blue-600 dark:text-blue-400" size={32} />
                                    )}
                                    <span
                                        className={`text-2xl font-black ${transaction.status === "success"
                                                ? "text-green-600 dark:text-green-400"
                                                : transaction.status === "pending"
                                                    ? "text-yellow-600 dark:text-yellow-400"
                                                    : transaction.status === "failed"
                                                        ? "text-red-600 dark:text-red-400"
                                                        : "text-blue-600 dark:text-blue-400"
                                            }`}
                                    >
                                        {transaction.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Amount</p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white">
                                    {transaction.currency === "INR" ? "₹" : "$"}
                                    {transaction.amount.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <User size={20} className="text-green-500" />
                                Customer Information
                            </h4>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <User size={18} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
                                        <p className="font-bold text-slate-800 dark:text-white">
                                            {transaction.userName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                        <FileText size={18} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                                            {transaction.userEmail}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                        <User size={18} className="text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">User ID</p>
                                        <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                            {transaction.userId}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <CreditCard size={20} className="text-blue-500" />
                                Payment Details
                            </h4>
                            <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl space-y-4 border-2 border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                                            {getPaymentMethodIcon(transaction.paymentMethod.type)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Payment Method
                                            </p>
                                            <p className="font-bold text-slate-800 dark:text-white text-lg">
                                                {getPaymentMethodDisplay()}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-4 py-2 rounded-xl text-sm font-black ${transaction.paymentMethod.type === "card"
                                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                                : transaction.paymentMethod.type === "upi"
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                                    : transaction.paymentMethod.type === "netbanking"
                                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                        : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                                            }`}
                                    >
                                        {transaction.paymentMethod.type.toUpperCase()}
                                    </span>
                                </div>

                                {transaction.gatewayTransactionId && (
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                            Gateway Transaction ID
                                        </p>
                                        <code className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg block">
                                            {transaction.gatewayTransactionId}
                                        </code>
                                    </div>
                                )}

                                {transaction.gatewayName && (
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                            Payment Gateway
                                        </p>
                                        <p className="font-bold text-slate-800 dark:text-white">
                                            {transaction.gatewayName}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Transaction Info */}
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-purple-500" />
                                Transaction Information
                            </h4>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-4">
                                <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-700 rounded-xl">
                                    <span className="text-slate-600 dark:text-slate-400 font-semibold">
                                        Transaction Type
                                    </span>
                                    <span
                                        className={`px-4 py-2 rounded-xl text-sm font-black ${transaction.type === "subscription"
                                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                                : transaction.type === "event_booking"
                                                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                                                    : transaction.type === "refund"
                                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                        : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                            }`}
                                    >
                                        {transaction.type.replace("_", " ").toUpperCase()}
                                    </span>
                                </div>

                                <div className="p-3 bg-white dark:bg-slate-700 rounded-xl">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                        Description
                                    </p>
                                    <p className="font-semibold text-slate-800 dark:text-white">
                                        {transaction.description}
                                    </p>
                                </div>

                                {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                                    <div className="p-4 bg-white dark:bg-slate-700 rounded-xl">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 font-bold">
                                            Additional Details
                                        </p>
                                        <div className="space-y-2">
                                            {transaction.metadata.subscriptionPlan && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600 dark:text-slate-400">
                                                        Subscription Plan
                                                    </span>
                                                    <span className="font-bold text-slate-800 dark:text-white">
                                                        {transaction.metadata.subscriptionPlan}
                                                    </span>
                                                </div>
                                            )}
                                            {transaction.metadata.eventName && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600 dark:text-slate-400">
                                                        Event Name
                                                    </span>
                                                    <span className="font-bold text-slate-800 dark:text-white">
                                                        {transaction.metadata.eventName}
                                                    </span>
                                                </div>
                                            )}
                                            {transaction.metadata.deviceType && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600 dark:text-slate-400">
                                                        Device Type
                                                    </span>
                                                    <span className="font-bold text-slate-800 dark:text-white capitalize">
                                                        {transaction.metadata.deviceType}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white dark:bg-slate-700 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                            Created At
                                        </p>
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">
                                            {formatDate(transaction.createdAt)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-700 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                            Last Updated
                                        </p>
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">
                                            {formatDate(transaction.updatedAt)}
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
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2"
                        >
                            <Download size={20} />
                            Download Receipt
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
// 📋 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const TransactionsManagement: React.FC = () => {
    // States
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalTransactions: 0,
        successfulTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
        totalRevenue: 0,
        todayRevenue: 0,
    });

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");

    // View Modal
    const [viewModal, setViewModal] = useState({
        isOpen: false,
        transaction: null as Transaction | null,
    });

    // Toast
    const [toast, setToast] = useState({
        isVisible: false,
        message: "",
        type: "success" as "success" | "error" | "info" | "warning",
    });

    // Fetch transactions
    useEffect(() => {
        fetchTransactions();
    }, []);

    // Apply filters
    useEffect(() => {
        applyFilters();
    }, [searchQuery, filterStatus, filterType, filterPaymentMethod, transactions]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            console.log("Fetching transactions...");

            const transactionsQuery = query(
                collection(db, "transactions"),
                orderBy("createdAt", "desc")
            );
            const transactionsSnapshot = await getDocs(transactionsQuery);

            const fetchedTransactions: Transaction[] = [];
            let totalRevenue = 0;
            let todayRevenue = 0;
            let successCount = 0;
            let pendingCount = 0;
            let failedCount = 0;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            transactionsSnapshot.forEach((doc) => {
                const data = doc.data();
                const transaction: Transaction = {
                    id: doc.id,
                    transactionId: data.transactionId || doc.id,
                    userId: data.userId || "",
                    userName: data.userName || "Unknown User",
                    userEmail: data.userEmail || "",
                    type: data.type || "subscription",
                    amount: data.amount || 0,
                    currency: data.currency || "INR",
                    status: data.status || "pending",
                    paymentMethod: data.paymentMethod || { type: "card" },
                    gatewayTransactionId: data.gatewayTransactionId,
                    gatewayName: data.gatewayName,
                    description: data.description || "",
                    metadata: data.metadata,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                };

                fetchedTransactions.push(transaction);

                // Calculate stats
                if (transaction.status === "success") {
                    successCount++;
                    totalRevenue += transaction.amount;

                    const txDate = new Date(transaction.createdAt);
                    txDate.setHours(0, 0, 0, 0);
                    if (txDate.getTime() === today.getTime()) {
                        todayRevenue += transaction.amount;
                    }
                } else if (transaction.status === "pending") {
                    pendingCount++;
                } else if (transaction.status === "failed") {
                    failedCount++;
                }
            });

            const stats: Stats = {
                totalTransactions: fetchedTransactions.length,
                successfulTransactions: successCount,
                pendingTransactions: pendingCount,
                failedTransactions: failedCount,
                totalRevenue,
                todayRevenue,
            };

            console.log(`✅ Fetched ${fetchedTransactions.length} transactions`);
            setTransactions(fetchedTransactions);
            setStats(stats);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            showToast("Failed to load transactions", "error");
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...transactions];

        // Filter by status
        if (filterStatus !== "all") {
            filtered = filtered.filter((tx) => tx.status === filterStatus);
        }

        // Filter by type
        if (filterType !== "all") {
            filtered = filtered.filter((tx) => tx.type === filterType);
        }

        // Filter by payment method
        if (filterPaymentMethod !== "all") {
            filtered = filtered.filter((tx) => tx.paymentMethod.type === filterPaymentMethod);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (tx) =>
                    tx.transactionId.toLowerCase().includes(query) ||
                    tx.userName.toLowerCase().includes(query) ||
                    tx.userEmail.toLowerCase().includes(query) ||
                    tx.description.toLowerCase().includes(query)
            );
        }

        setFilteredTransactions(filtered);
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
            case "success":
                return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
            case "pending":
                return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
            case "failed":
                return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
            case "refunded":
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
            default:
                return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "subscription":
                return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
            case "event_booking":
                return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
            case "refund":
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
            case "payout":
                return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
            default:
                return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleExportReport = () => {
        showToast("Exporting transactions report...", "info");
        // Export logic here
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mb-4"
                />
                <p className="text-slate-600 dark:text-slate-400 font-semibold">
                    Loading transactions...
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
                onClose={() => setViewModal({ isOpen: false, transaction: null })}
                transaction={viewModal.transaction}
            />

            <div className="space-y-6 w-full">
                {/* HEADER */}
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
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                                    <Receipt size={32} />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black mb-2">Transactions Management</h1>
                                    <p className="text-white/90 text-lg">
                                        View and manage all payment transactions
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={fetchTransactions}
                                    className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                                >
                                    <RefreshCw size={20} />
                                    Refresh
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleExportReport}
                                    className="px-8 py-3 bg-white text-green-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                    <Download size={20} />
                                    Export Report
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    Total Transactions
                                </p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                                    {stats.totalTransactions}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                <Receipt size={24} className="text-green-600 dark:text-green-400" />
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
                                    Successful
                                </p>
                                <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-2">
                                    {stats.successfulTransactions}
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
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    Total Revenue
                                </p>
                                <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
                                    ₹{(stats.totalRevenue / 1000).toFixed(1)}K
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
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    Today's Revenue
                                </p>
                                <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">
                                    ₹{stats.todayRevenue.toLocaleString()}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <TrendingUp size={24} className="text-purple-600 dark:text-purple-400" />
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
                                    Pending
                                </p>
                                <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400 mt-2">
                                    {stats.pendingTransactions}
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
                        transition={{ delay: 0.6 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    Failed
                                </p>
                                <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-2">
                                    {stats.failedTransactions}
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
                    transition={{ delay: 0.7 }}
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
                                    placeholder="Search by transaction ID, user, email..."
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="appearance-none px-6 py-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white font-semibold cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="success">Success</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                size={20}
                            />
                        </div>

                        {/* Type Filter */}
                        <div className="relative">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="appearance-none px-6 py-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white font-semibold cursor-pointer"
                            >
                                <option value="all">All Types</option>
                                <option value="subscription">Subscription</option>
                                <option value="event_booking">Event Booking</option>
                                <option value="refund">Refund</option>
                                <option value="payout">Payout</option>
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                size={20}
                            />
                        </div>

                        {/* Payment Method Filter */}
                        <div className="relative">
                            <select
                                value={filterPaymentMethod}
                                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                                className="appearance-none px-6 py-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white font-semibold cursor-pointer"
                            >
                                <option value="all">All Methods</option>
                                <option value="card">Card</option>
                                <option value="upi">UPI</option>
                                <option value="netbanking">Net Banking</option>
                                <option value="wallet">Wallet</option>
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                size={20}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* TRANSACTIONS TABLE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-16">
                            <AlertCircle
                                size={64}
                                className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
                            />
                            <p className="text-xl font-bold text-slate-500 dark:text-slate-400">
                                No transactions found
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
                                            Transaction ID
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Payment Method
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {filteredTransactions.map((transaction, index) => (
                                        <motion.tr
                                            key={transaction.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg font-mono text-slate-700 dark:text-slate-300">
                                                    {transaction.transactionId}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white">
                                                        {transaction.userName}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {transaction.userEmail}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getTypeColor(
                                                        transaction.type
                                                    )}`}
                                                >
                                                    {transaction.type.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-800 dark:text-white">
                                                    ₹{transaction.amount.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                                                    {transaction.paymentMethod.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getStatusColor(
                                                        transaction.status
                                                    )}`}
                                                >
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {formatDate(transaction.createdAt)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() =>
                                                            setViewModal({ isOpen: true, transaction: transaction })
                                                        }
                                                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => showToast("Downloading receipt...", "info")}
                                                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-all"
                                                        title="Download Receipt"
                                                    >
                                                        <Download size={18} />
                                                    </motion.button>
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

export default TransactionsManagement;