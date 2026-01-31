import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp,
    DollarSign,
    Download,
    RefreshCw,
    Calendar,
    Users,
    CreditCard,
    Ticket,
    ArrowUp,
    ArrowDown,
    TrendingDown,
    AlertCircle,
    FileText,
    PieChart,
    BarChart3
} from "lucide-react";
import {
    collection,
    query,
    getDocs,
    where
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type { MonthlyRevenue, RevenueStats, TaxInfo } from "../../types";

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
        success: ArrowUp,
        error: AlertCircle,
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
// 📋 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const RevenueReports: React.FC = () => {
    // States
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<RevenueStats>({
        totalRevenue: 0,
        subscriptionRevenue: 0,
        eventRevenue: 0,
        thisMonth: 0,
        lastMonth: 0,
        growth: 0,
        activeSubscribers: 0,
        totalBookings: 0,
        averageOrderValue: 0,
    });
    const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
    const [taxInfo, setTaxInfo] = useState<TaxInfo>({
        gstCollected: 0,
        tdsDeducted: 0,
        platformFee: 0,
        netPayable: 0,
    });

    // Filters
    const [timeRange, _setTimeRange] = useState<string>("6months");

    // Toast
    const [toast, setToast] = useState({
        isVisible: false,
        message: "",
        type: "success" as "success" | "error" | "info" | "warning",
    });

    // Fetch revenue data
    useEffect(() => {
        fetchRevenueData();
    }, [timeRange]);

    const fetchRevenueData = async () => {
        try {
            setLoading(true);
            console.log("Fetching revenue data...");

            // Get current month and last month
            const now = new Date();
            const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

            // Fetch all successful transactions
            const transactionsQuery = query(
                collection(db, "transactions"),
                where("status", "==", "success")
            );
            const transactionsSnapshot = await getDocs(transactionsQuery);

            let totalRevenue = 0;
            let subscriptionRevenue = 0;
            let eventRevenue = 0;
            let thisMonthRevenue = 0;
            let lastMonthRevenue = 0;

            const monthlyDataMap: { [key: string]: MonthlyRevenue } = {};

            transactionsSnapshot.forEach((doc) => {
                const data = doc.data();
                const amount = data.amount || 0;
                const type = data.type || "subscription";
                const createdAt = data.createdAt?.toDate() || new Date();

                totalRevenue += amount;

                // Calculate by type
                if (type === "subscription") {
                    subscriptionRevenue += amount;
                } else if (type === "event_booking") {
                    eventRevenue += amount;
                }

                // This month revenue
                if (createdAt >= currentMonthStart) {
                    thisMonthRevenue += amount;
                }

                // Last month revenue
                if (createdAt >= lastMonthStart && createdAt <= lastMonthEnd) {
                    lastMonthRevenue += amount;
                }

                // Monthly breakdown
                const monthKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
                if (!monthlyDataMap[monthKey]) {
                    monthlyDataMap[monthKey] = {
                        month: createdAt.toLocaleString("en-US", { month: "short" }),
                        year: createdAt.getFullYear(),
                        subscriptions: 0,
                        events: 0,
                        total: 0,
                        growth: 0,
                    };
                }

                if (type === "subscription") {
                    monthlyDataMap[monthKey].subscriptions += amount;
                } else if (type === "event_booking") {
                    monthlyDataMap[monthKey].events += amount;
                }
                monthlyDataMap[monthKey].total += amount;
            });

            // Calculate growth
            const growth =
                lastMonthRevenue > 0
                    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
                    : 0;

            // Get active subscribers count
            const subscribersQuery = query(
                collection(db, "users"),
                where("subscription.status", "==", "active")
            );
            const subscribersSnapshot = await getDocs(subscribersQuery);
            const activeSubscribers = subscribersSnapshot.size;

            // Get total bookings count
            const bookingsQuery = query(
                collection(db, "bookings"),
                where("bookingStatus", "==", "confirmed")
            );
            const bookingsSnapshot = await getDocs(bookingsQuery);
            const totalBookings = bookingsSnapshot.size;

            // Calculate average order value
            const totalTransactions = transactionsSnapshot.size;
            const averageOrderValue =
                totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

            // Sort monthly data
            const sortedMonthlyData = Object.values(monthlyDataMap)
                .sort((a, b) => {
                    const dateA = new Date(a.year, getMonthNumber(a.month));
                    const dateB = new Date(b.year, getMonthNumber(b.month));
                    return dateB.getTime() - dateA.getTime();
                })
                .slice(0, 12); // Last 12 months

            // Calculate monthly growth
            for (let i = 0; i < sortedMonthlyData.length; i++) {
                if (i < sortedMonthlyData.length - 1) {
                    const current = sortedMonthlyData[i].total;
                    const previous = sortedMonthlyData[i + 1].total;
                    sortedMonthlyData[i].growth =
                        previous > 0 ? ((current - previous) / previous) * 100 : 0;
                }
            }

            // Calculate tax info (example calculations)
            const gstRate = 0.18; // 18% GST
            const tdsRate = 0.01; // 1% TDS
            const platformFeeRate = 0.05; // 5% platform fee

            const gstCollected = totalRevenue * gstRate;
            const tdsDeducted = totalRevenue * tdsRate;
            const platformFee = totalRevenue * platformFeeRate;
            const netPayable = totalRevenue - gstCollected - tdsDeducted - platformFee;

            setStats({
                totalRevenue,
                subscriptionRevenue,
                eventRevenue,
                thisMonth: thisMonthRevenue,
                lastMonth: lastMonthRevenue,
                growth,
                activeSubscribers,
                totalBookings,
                averageOrderValue,
            });

            setMonthlyData(sortedMonthlyData);

            setTaxInfo({
                gstCollected,
                tdsDeducted,
                platformFee,
                netPayable,
            });

            console.log("✅ Revenue data fetched successfully");
            setLoading(false);
        } catch (error) {
            console.error("Error fetching revenue data:", error);
            showToast("Failed to load revenue data", "error");
            setLoading(false);
        }
    };

    const getMonthNumber = (monthName: string): number => {
        const months = {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11,
        };
        return months[monthName as keyof typeof months] || 0;
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

    const handleExportReport = () => {
        showToast("Exporting revenue report...", "info");
        // Export logic here
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)}Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)}L`;
        } else if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)}K`;
        }
        return `₹${amount.toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
                />
                <p className="text-slate-600 dark:text-slate-400 font-semibold">
                    Loading revenue data...
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

            <div className="space-y-6 w-full">
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
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
                                    <TrendingUp size={32} />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black mb-2">Revenue Reports</h1>
                                    <p className="text-white/90 text-lg">
                                        Financial analytics and insights
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={fetchRevenueData}
                                    className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                                >
                                    <RefreshCw size={20} />
                                    Refresh
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleExportReport}
                                    className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                    <Download size={20} />
                                    Export Report
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* MAIN STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                        />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                                    <DollarSign size={24} />
                                </div>
                                {stats.growth > 0 ? (
                                    <ArrowUp size={24} className="text-white/80" />
                                ) : (
                                    <ArrowDown size={24} className="text-white/80" />
                                )}
                            </div>
                            <p className="text-white/80 text-sm font-semibold mb-2">
                                Total Revenue
                            </p>
                            <p className="text-4xl font-black mb-2">
                                {formatCurrency(stats.totalRevenue)}
                            </p>
                            <div
                                className={`flex items-center gap-2 text-sm font-bold ${stats.growth > 0 ? "text-white/90" : "text-red-200"
                                    }`}
                            >
                                {stats.growth > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                                {Math.abs(stats.growth).toFixed(1)}% from last month
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <Calendar size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                            This Month
                        </p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white mb-2">
                            {formatCurrency(stats.thisMonth)}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
                            {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <CreditCard size={24} className="text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                            Subscriptions
                        </p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white mb-2">
                            {formatCurrency(stats.subscriptionRevenue)}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Users size={16} />
                            {stats.activeSubscribers.toLocaleString()} active users
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                <Ticket size={24} className="text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                            Events
                        </p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white mb-2">
                            {formatCurrency(stats.eventRevenue)}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Ticket size={16} />
                            {stats.totalBookings.toLocaleString()} bookings
                        </div>
                    </motion.div>
                </div>

                {/* ADDITIONAL STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    Average Order Value
                                </p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                                    {formatCurrency(stats.averageOrderValue)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                                <BarChart3 size={24} className="text-teal-600 dark:text-teal-400" />
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
                                    Last Month
                                </p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                                    {formatCurrency(stats.lastMonth)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                <TrendingDown size={24} className="text-indigo-600 dark:text-indigo-400" />
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
                                    Revenue Growth
                                </p>
                                <p
                                    className={`text-3xl font-black mt-2 ${stats.growth > 0
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-red-600 dark:text-red-400"
                                        }`}
                                >
                                    {stats.growth > 0 ? "+" : ""}
                                    {stats.growth.toFixed(1)}%
                                </p>
                            </div>
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.growth > 0
                                        ? "bg-green-100 dark:bg-green-900/30"
                                        : "bg-red-100 dark:bg-red-900/30"
                                    }`}
                            >
                                {stats.growth > 0 ? (
                                    <TrendingUp
                                        size={24}
                                        className="text-green-600 dark:text-green-400"
                                    />
                                ) : (
                                    <TrendingDown size={24} className="text-red-600 dark:text-red-400" />
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* MONTHLY BREAKDOWN */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                    <PieChart size={20} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                    Monthly Revenue Breakdown
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        {monthlyData.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertCircle
                                    size={48}
                                    className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
                                />
                                <p className="text-slate-500 dark:text-slate-400">No data available</p>
                            </div>
                        ) : (
                            monthlyData.map((month, index) => (
                                <motion.div
                                    key={`${month.month}-${month.year}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                                                {month.month} {month.year}
                                            </h4>
                                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                                    <span>Subscriptions: {formatCurrency(month.subscriptions)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                                    <span>Events: {formatCurrency(month.events)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-slate-800 dark:text-white mb-2">
                                                {formatCurrency(month.total)}
                                            </div>
                                            <div
                                                className={`flex items-center gap-2 justify-end text-sm font-bold ${month.growth > 0
                                                        ? "text-green-600 dark:text-green-400"
                                                        : month.growth < 0
                                                            ? "text-red-600 dark:text-red-400"
                                                            : "text-slate-500"
                                                    }`}
                                            >
                                                {month.growth > 0 ? (
                                                    <ArrowUp size={16} />
                                                ) : month.growth < 0 ? (
                                                    <ArrowDown size={16} />
                                                ) : null}
                                                {month.growth !== 0 && (
                                                    <>
                                                        {month.growth > 0 ? "+" : ""}
                                                        {month.growth.toFixed(1)}%
                                                    </>
                                                )}
                                                {month.growth === 0 && "No change"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4">
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                            <div className="h-full flex">
                                                <div
                                                    className="bg-purple-500 transition-all"
                                                    style={{
                                                        width: `${(month.subscriptions / month.total) * 100}%`,
                                                    }}
                                                />
                                                <div
                                                    className="bg-orange-500 transition-all"
                                                    style={{
                                                        width: `${(month.events / month.total) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* TAX INFORMATION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                                <FileText size={20} className="text-white" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                Tax Information
                            </h3>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-semibold">
                                    Total GST Collected (18%)
                                </p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white">
                                    {formatCurrency(taxInfo.gstCollected)}
                                </p>
                            </div>

                            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-semibold">
                                    TDS Deducted (1%)
                                </p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white">
                                    {formatCurrency(taxInfo.tdsDeducted)}
                                </p>
                            </div>

                            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-semibold">
                                    Platform Fee (5%)
                                </p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white">
                                    {formatCurrency(taxInfo.platformFee)}
                                </p>
                            </div>

                            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800">
                                <p className="text-sm text-green-600 dark:text-green-400 mb-2 font-bold">
                                    Net Payable
                                </p>
                                <p className="text-3xl font-black text-green-600 dark:text-green-400">
                                    {formatCurrency(taxInfo.netPayable)}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RevenueReports;