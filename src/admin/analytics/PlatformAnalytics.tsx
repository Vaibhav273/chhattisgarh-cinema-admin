import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart3,
    Users,
    Eye,
    Play,
    TrendingUp,
    Download,
    RefreshCw,
    Monitor,
    Smartphone,
    Tv,
    Film,
    Heart,
    ArrowUp,
    ArrowDown,
    AlertCircle,
    Target,
} from "lucide-react";
import {
    collection,
    query,
    getDocs,
    orderBy,
    limit,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type { AnalyticsStats, ContentStats, DeviceStats, TopContent } from "../../types";

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

const PlatformAnalytics: React.FC = () => {
    // States
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AnalyticsStats>({
        totalUsers: 0,
        totalViews: 0,
        watchHours: 0,
        engagementRate: 0,
        dailyActiveUsers: 0,
        weeklyActiveUsers: 0,
        monthlyActiveUsers: 0,
        premiumUsers: 0,
        freeUsers: 0,
        newUsersThisMonth: 0,
        userGrowth: 0,
        viewsGrowth: 0,
        watchTimeGrowth: 0,
    });
    const [contentStats, setContentStats] = useState<ContentStats>({
        moviesCount: 0,
        seriesCount: 0,
        shortFilmsCount: 0,
        totalContent: 0,
    });
    const [topContent, setTopContent] = useState<TopContent[]>([]);
    const [deviceStats, setDeviceStats] = useState<DeviceStats>({
        mobile: 0,
        web: 0,
        tv: 0,
    });

    // Toast
    const [toast, setToast] = useState({
        isVisible: false,
        message: "",
        type: "success" as "success" | "error" | "info" | "warning",
    });

    // Fetch analytics data
    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            console.log("Fetching platform analytics...");

            // Fetch users
            const usersSnapshot = await getDocs(collection(db, "users"));
            const totalUsers = usersSnapshot.size;

            // Calculate active users (example: users who logged in last 30 days)
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            let premiumUsers = 0;
            let freeUsers = 0;
            let monthlyActiveUsers = 0;
            let weeklyActiveUsers = 0;
            let dailyActiveUsers = 0;
            let newUsersThisMonth = 0;
            const deviceCount = { mobile: 0, web: 0, tv: 0 };

            usersSnapshot.forEach((doc) => {
                const userData = doc.data();

                // Premium vs Free
                if (userData.subscription?.status === "active") {
                    premiumUsers++;
                } else {
                    freeUsers++;
                }

                // Active users (based on lastActive)
                const lastActive = userData.lastActive?.toDate?.() || new Date(0);
                if (lastActive >= oneDayAgo) dailyActiveUsers++;
                if (lastActive >= sevenDaysAgo) weeklyActiveUsers++;
                if (lastActive >= thirtyDaysAgo) monthlyActiveUsers++;

                // New users this month
                const createdAt = userData.createdAt?.toDate?.() || new Date(0);
                if (createdAt >= thirtyDaysAgo) newUsersThisMonth++;

                // Device stats (example from user metadata)
                const deviceType = userData.deviceType || "web";
                if (deviceType === "mobile") deviceCount.mobile++;
                else if (deviceType === "tv") deviceCount.tv++;
                else deviceCount.web++;
            });

            // Fetch content stats
            const moviesSnapshot = await getDocs(collection(db, "movies"));
            const seriesSnapshot = await getDocs(collection(db, "webseries"));
            const shortFilmsSnapshot = await getDocs(collection(db, "shortfilms"));

            const contentStats: ContentStats = {
                moviesCount: moviesSnapshot.size,
                seriesCount: seriesSnapshot.size,
                shortFilmsCount: shortFilmsSnapshot.size,
                totalContent:
                    moviesSnapshot.size + seriesSnapshot.size + shortFilmsSnapshot.size,
            };

            // Calculate total views and watch time from watch history
            const watchHistorySnapshot = await getDocs(collection(db, "watchHistory"));
            let totalViews = watchHistorySnapshot.size;
            let totalWatchMinutes = 0;
            let totalEngagements = 0;

            watchHistorySnapshot.forEach((doc) => {
                const data = doc.data();
                const watchTime = data.watchTime || 0;
                totalWatchMinutes += watchTime;

                // Count engagements (likes, comments, etc.)
                if (data.liked) totalEngagements++;
                if (data.commented) totalEngagements++;
                if (data.shared) totalEngagements++;
            });

            const watchHours = Math.floor(totalWatchMinutes / 60);
            const engagementRate =
                totalViews > 0 ? (totalEngagements / totalViews) * 100 : 0;

            // Example growth calculations (you can implement proper historical comparison)
            const userGrowth = totalUsers > 0 ? (newUsersThisMonth / totalUsers) * 100 : 0;
            const viewsGrowth = 15.3; // Example
            const watchTimeGrowth = 12.1; // Example

            // Fetch top content (most viewed)
            const topMoviesQuery = query(
                collection(db, "movies"),
                orderBy("views", "desc"),
                limit(5)
            );
            const topMoviesSnapshot = await getDocs(topMoviesQuery);

            const topContentList: TopContent[] = [];
            topMoviesSnapshot.forEach((doc) => {
                const data = doc.data();
                topContentList.push({
                    id: doc.id,
                    title: data.title || "Unknown",
                    type: "Movie",
                    views: data.views || 0,
                    likes: data.likes || 0,
                    watchTime: data.totalWatchTime || 0,
                });
            });

            setStats({
                totalUsers,
                totalViews,
                watchHours,
                engagementRate,
                dailyActiveUsers,
                weeklyActiveUsers,
                monthlyActiveUsers,
                premiumUsers,
                freeUsers,
                newUsersThisMonth,
                userGrowth,
                viewsGrowth,
                watchTimeGrowth,
            });

            setContentStats(contentStats);
            setTopContent(topContentList);
            setDeviceStats(deviceCount);

            console.log("✅ Analytics data fetched successfully");
            setLoading(false);
        } catch (error) {
            console.error("Error fetching analytics:", error);
            showToast("Failed to load analytics data", "error");
            setLoading(false);
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

    const handleExportReport = () => {
        showToast("Exporting analytics report...", "info");
        // Export logic here
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"
                />
                <p className="text-slate-600 dark:text-slate-400 font-semibold">
                    Loading analytics...
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
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
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
                                    <BarChart3 size={32} />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black mb-2">Platform Analytics</h1>
                                    <p className="text-white/90 text-lg">
                                        Overall platform performance metrics
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={fetchAnalyticsData}
                                    className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                                >
                                    <RefreshCw size={20} />
                                    Refresh
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleExportReport}
                                    className="px-8 py-3 bg-white text-cyan-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                    <Download size={20} />
                                    Export Report
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* KEY METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                <Users size={24} className="text-green-600 dark:text-green-400" />
                            </div>
                            {stats.userGrowth > 0 ? (
                                <ArrowUp className="text-green-600 dark:text-green-400" size={24} />
                            ) : (
                                <ArrowDown className="text-red-600 dark:text-red-400" size={24} />
                            )}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                            Total Users
                        </p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                            {formatNumber(stats.totalUsers)}
                        </p>
                        <div
                            className={`text-sm font-bold ${stats.userGrowth > 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                        >
                            {stats.userGrowth > 0 ? "+" : ""}
                            {stats.userGrowth.toFixed(1)}% from last month
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
                                <Eye size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <ArrowUp className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                            Total Views
                        </p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                            {formatNumber(stats.totalViews)}
                        </p>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            +{stats.viewsGrowth.toFixed(1)}% from last month
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <Play size={24} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <ArrowUp className="text-green-600 dark:text-green-400" size={24} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                            Watch Hours
                        </p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                            {formatNumber(stats.watchHours)}
                        </p>
                        <div className="text-sm font-bold text-green-600 dark:text-green-400">
                            +{stats.watchTimeGrowth.toFixed(1)}% from last month
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
                                <TrendingUp size={24} className="text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                            Engagement Rate
                        </p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                            {stats.engagementRate.toFixed(1)}%
                        </p>
                        <div className="text-sm font-bold text-slate-600 dark:text-slate-400">
                            Based on interactions
                        </div>
                    </motion.div>
                </div>

                {/* ACTIVE USERS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                                <Target size={20} className="text-teal-600 dark:text-teal-400" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                Active Users Overview
                            </h3>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-semibold">
                                Daily Active Users
                            </p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">
                                {formatNumber(stats.dailyActiveUsers)}
                            </p>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-semibold">
                                Weekly Active Users
                            </p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">
                                {formatNumber(stats.weeklyActiveUsers)}
                            </p>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-semibold">
                                Monthly Active Users
                            </p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">
                                {formatNumber(stats.monthlyActiveUsers)}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* CONTENT & DEMOGRAPHICS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Content Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
                                    <Film size={20} className="text-pink-600 dark:text-pink-400" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                    Content Distribution
                                </h3>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Movies */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-slate-800 dark:text-white">Movies</span>
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                        {contentStats.moviesCount} (
                                        {((contentStats.moviesCount! / contentStats.totalContent!) * 100).toFixed(0)}
                                        %)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${(contentStats.moviesCount! / contentStats.totalContent!) * 100}%`,
                                        }}
                                        transition={{ duration: 1, delay: 0.7 }}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                                    />
                                </div>
                            </div>

                            {/* Series */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-slate-800 dark:text-white">Series</span>
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                        {contentStats.seriesCount} (
                                        {((contentStats.seriesCount! / contentStats.totalContent!) * 100).toFixed(0)}
                                        %)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${(contentStats.seriesCount! / contentStats.totalContent!) * 100}%`,
                                        }}
                                        transition={{ duration: 1, delay: 0.8 }}
                                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
                                    />
                                </div>
                            </div>

                            {/* Short Films */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-slate-800 dark:text-white">
                                        Short Films
                                    </span>
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                        {contentStats.shortFilmsCount} (
                                        {((contentStats.shortFilmsCount! / contentStats.totalContent!) * 100).toFixed(
                                            0
                                        )}
                                        %)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${(contentStats.shortFilmsCount! / contentStats.totalContent!) * 100
                                                }%`,
                                        }}
                                        transition={{ duration: 1, delay: 0.9 }}
                                        className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* User Demographics */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                    <Users size={20} className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                    User Demographics
                                </h3>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Premium vs Free */}
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4">
                                    Subscription Type
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                        <span className="font-bold text-amber-700 dark:text-amber-400">
                                            Premium Users
                                        </span>
                                        <span className="text-xl font-black text-amber-700 dark:text-amber-400">
                                            {formatNumber(stats.premiumUsers)} (
                                            {((stats.premiumUsers / stats.totalUsers) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">
                                            Free Users
                                        </span>
                                        <span className="text-xl font-black text-slate-700 dark:text-slate-300">
                                            {formatNumber(stats.freeUsers)} (
                                            {((stats.freeUsers / stats.totalUsers) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Device Stats */}
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4">
                                    Device Distribution
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Smartphone size={18} className="text-green-600" />
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                Mobile
                                            </span>
                                        </div>
                                        <span className="font-bold text-slate-800 dark:text-white">
                                            {formatNumber(deviceStats.mobile)} (
                                            {(
                                                (deviceStats.mobile /
                                                    (deviceStats.mobile + deviceStats.web + deviceStats.tv)) *
                                                100
                                            ).toFixed(0)}
                                            %)
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Monitor size={18} className="text-blue-600" />
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                Web
                                            </span>
                                        </div>
                                        <span className="font-bold text-slate-800 dark:text-white">
                                            {formatNumber(deviceStats.web)} (
                                            {(
                                                (deviceStats.web /
                                                    (deviceStats.mobile + deviceStats.web + deviceStats.tv)) *
                                                100
                                            ).toFixed(0)}
                                            %)
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Tv size={18} className="text-purple-600" />
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                TV
                                            </span>
                                        </div>
                                        <span className="font-bold text-slate-800 dark:text-white">
                                            {formatNumber(deviceStats.tv)} (
                                            {(
                                                (deviceStats.tv /
                                                    (deviceStats.mobile + deviceStats.web + deviceStats.tv)) *
                                                100
                                            ).toFixed(0)}
                                            %)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* TOP CONTENT */}
                {topContent.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                                    <TrendingUp size={20} className="text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                    Top Performing Content
                                </h3>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {topContent.map((content, index) => (
                                    <motion.div
                                        key={content.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.9 + index * 0.1 }}
                                        className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black">
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 dark:text-white">
                                                        {content.title}
                                                    </h4>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {content.type}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                                        <Eye size={16} />
                                                        <span className="text-sm font-bold">
                                                            {formatNumber(content.views)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">views</p>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                                        <Heart size={16} />
                                                        <span className="text-sm font-bold">
                                                            {formatNumber(content.likes)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">likes</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default PlatformAnalytics;