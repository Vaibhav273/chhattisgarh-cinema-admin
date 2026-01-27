import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    UserPlus,
    UserMinus,
    Activity,
    Download,
    RefreshCw,
    Clock,
    Smartphone,
    Monitor,
    Tv,
    AlertCircle,
    Target,
    BarChart3,
    CheckCircle,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import {
    collection,
    getDocs,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type { ActivityTime, DeviceUsage, RetentionData, UserStatsAnalytics } from "../../types";

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

const UserAnalytics: React.FC = () => {
    // States
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<UserStatsAnalytics>({
        totalUsers: 0,
        newUsersThisMonth: 0,
        churnedUsers: 0,
        activeSessions: 0,
        averageSessionTime: 0,
        premiumUsers: 0,
        freeUsers: 0,
        monthlyActiveUsers: 0,
        weeklyActiveUsers: 0,
        dailyActiveUsers: 0,
        newUserGrowth: 0,
        churnRate: 0,
        sessionTimeGrowth: 0,
    });
    const [deviceUsage, setDeviceUsage] = useState<DeviceUsage>({
        mobile: 0,
        desktop: 0,
        tv: 0,
        mobilePercentage: 0,
        desktopPercentage: 0,
        tvPercentage: 0,
    });
    const [activityTimes, setActivityTimes] = useState<ActivityTime[]>([]);
    const [retentionData, setRetentionData] = useState<RetentionData[]>([]);

    // Toast
    const [toast, setToast] = useState({
        isVisible: false,
        message: "",
        type: "success" as "success" | "error" | "info" | "warning",
    });

    // Fetch user analytics
    useEffect(() => {
        fetchUserAnalytics();
    }, []);

    const fetchUserAnalytics = async () => {
        try {
            setLoading(true);
            console.log("Fetching user analytics...");

            // Fetch all users
            const usersSnapshot = await getDocs(collection(db, "users"));
            const totalUsers = usersSnapshot.size;

            // Date calculations
            const now = new Date();
            const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            let newUsersThisMonth = 0;
            let newUsersLastMonth = 0;
            let churnedUsers = 0;
            let activeSessions = 0;
            let totalSessionTime = 0;
            let sessionCount = 0;
            let premiumUsers = 0;
            let freeUsers = 0;
            let monthlyActiveUsers = 0;
            let weeklyActiveUsers = 0;
            let dailyActiveUsers = 0;

            const deviceCount = { mobile: 0, desktop: 0, tv: 0 };
            const activityHours: { [key: string]: number } = {};

            usersSnapshot.forEach((doc) => {
                const userData = doc.data();
                const createdAt = userData.createdAt?.toDate?.() || new Date(0);
                const lastActive = userData.lastActive?.toDate?.() || new Date(0);

                // New users
                if (createdAt >= currentMonthStart) {
                    newUsersThisMonth++;
                }
                if (createdAt >= lastMonthStart && createdAt <= lastMonthEnd) {
                    newUsersLastMonth++;
                }

                // Premium vs Free
                if (userData.subscription?.status === "active") {
                    premiumUsers++;
                } else {
                    freeUsers++;
                }

                // Active users
                if (lastActive >= oneDayAgo) {
                    dailyActiveUsers++;
                    activeSessions++;
                }
                if (lastActive >= sevenDaysAgo) weeklyActiveUsers++;
                if (lastActive >= thirtyDaysAgo) monthlyActiveUsers++;

                // Churned users (not active in last 60 days)
                const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
                if (lastActive < sixtyDaysAgo && lastActive > new Date(0)) {
                    churnedUsers++;
                }

                // Session time
                const sessionTime = userData.averageSessionTime || 0;
                if (sessionTime > 0) {
                    totalSessionTime += sessionTime;
                    sessionCount++;
                }

                // Device usage
                const deviceType = userData.deviceType || "desktop";
                if (deviceType === "mobile") deviceCount.mobile++;
                else if (deviceType === "tv") deviceCount.tv++;
                else deviceCount.desktop++;

                // Activity time
                const activeHour = lastActive.getHours();
                const timeSlot = `${activeHour}:00`;
                activityHours[timeSlot] = (activityHours[timeSlot] || 0) + 1;
            });

            // Calculate averages
            const averageSessionTime = sessionCount > 0 ? totalSessionTime / sessionCount : 0;
            const newUserGrowth =
                newUsersLastMonth > 0
                    ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
                    : 0;
            const churnRate = totalUsers > 0 ? (churnedUsers / totalUsers) * 100 : 0;
            const sessionTimeGrowth = 5;

            // Device usage percentages
            const totalDevices = deviceCount.mobile + deviceCount.desktop + deviceCount.tv;
            const deviceUsageData: DeviceUsage = {
                mobile: deviceCount.mobile,
                desktop: deviceCount.desktop,
                tv: deviceCount.tv,
                mobilePercentage: totalDevices > 0 ? (deviceCount.mobile / totalDevices) * 100 : 0,
                desktopPercentage: totalDevices > 0 ? (deviceCount.desktop / totalDevices) * 100 : 0,
                tvPercentage: totalDevices > 0 ? (deviceCount.tv / totalDevices) * 100 : 0,
            };

            // Activity times (top 5)
            const activityTimesArray: ActivityTime[] = Object.entries(activityHours)
                .map(([timeSlot, userCount]) => ({
                    timeSlot,
                    userCount,
                    percentage: (userCount / totalUsers) * 100,
                }))
                .sort((a, b) => b.userCount - a.userCount)
                .slice(0, 5);

            // ═══════════════════════════════════════════════════════════════════
            // 🔥 DYNAMIC RETENTION CALCULATION
            // ═══════════════════════════════════════════════════════════════════
            const calculateRetention = () => {
                const retentionPeriods = [
                    { day: "Day 1", days: 1 },
                    { day: "Day 7", days: 7 },
                    { day: "Day 14", days: 14 },
                    { day: "Day 30", days: 30 },
                    { day: "Day 60", days: 60 },
                    { day: "Day 90", days: 90 },
                    { day: "Day 180", days: 180 },
                ];

                const retentionDataArray: RetentionData[] = [];

                retentionPeriods.forEach((period) => {
                    const periodDate = new Date(now.getTime() - period.days * 24 * 60 * 60 * 1000);
                    let usersCreatedInPeriod = 0;
                    let usersStillActive = 0;

                    usersSnapshot.forEach((doc) => {
                        const userData = doc.data();
                        const createdAt = userData.createdAt?.toDate?.() || new Date(0);
                        const lastActive = userData.lastActive?.toDate?.() || new Date(0);

                        // Check if user was created around this period (±2 days window)
                        const periodStart = new Date(periodDate.getTime() - 2 * 24 * 60 * 60 * 1000);
                        const periodEnd = new Date(periodDate.getTime() + 2 * 24 * 60 * 60 * 1000);

                        if (createdAt >= periodStart && createdAt <= periodEnd) {
                            usersCreatedInPeriod++;

                            // Check if they're still active (active in last 7 days)
                            const sevenDaysAgoCheck = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            if (lastActive >= sevenDaysAgoCheck) {
                                usersStillActive++;
                            }
                        }
                    });

                    const percentage =
                        usersCreatedInPeriod > 0
                            ? (usersStillActive / usersCreatedInPeriod) * 100
                            : 0;

                    retentionDataArray.push({
                        day: period.day,
                        percentage: Math.round(percentage),
                        userCount: usersStillActive,
                    });
                });

                return retentionDataArray;
            };

            const retentionDataArray = calculateRetention();

            // Set all states
            setStats({
                totalUsers,
                newUsersThisMonth,
                churnedUsers,
                activeSessions,
                averageSessionTime,
                premiumUsers,
                freeUsers,
                monthlyActiveUsers,
                weeklyActiveUsers,
                dailyActiveUsers,
                newUserGrowth,
                churnRate,
                sessionTimeGrowth,
            });

            setDeviceUsage(deviceUsageData);
            setActivityTimes(activityTimesArray);
            setRetentionData(retentionDataArray);

            console.log("✅ User analytics fetched successfully");
            console.log("📊 Retention Data:", retentionDataArray);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching user analytics:", error);
            showToast("Failed to load user analytics", "error");
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
        showToast("Exporting user analytics report...", "info");
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
                    className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mb-4"
                />
                <p className="text-slate-600 dark:text-slate-400 font-semibold">
                    Loading user analytics...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full pb-8">
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
                    className="bg-gradient-to-r from-green-500 to-teal-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
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
                                    <Users size={32} />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black mb-2">User Analytics</h1>
                                    <p className="text-white/90 text-lg">
                                        User behavior and engagement metrics
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={fetchUserAnalytics}
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

                {/* USER STATS - Same as before */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                <UserPlus size={24} className="text-green-600 dark:text-green-400" />
                            </div>
                            {stats.newUserGrowth > 0 ? (
                                <ArrowUp className="text-green-600 dark:text-green-400" size={24} />
                            ) : (
                                <ArrowDown className="text-red-600 dark:text-red-400" size={24} />
                            )}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                            New Users (This Month)
                        </p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                            {formatNumber(stats.newUsersThisMonth)}
                        </p>
                        <div
                            className={`text-sm font-bold ${stats.newUserGrowth > 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                        >
                            {stats.newUserGrowth > 0 ? "+" : ""}
                            {stats.newUserGrowth.toFixed(1)}% from last month
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                                <UserMinus size={24} className="text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                            Churned Users
                        </p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                            {formatNumber(stats.churnedUsers)}
                        </p>
                        <div className="text-sm font-bold text-red-600 dark:text-red-400">
                            {stats.churnRate.toFixed(1)}% churn rate
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <Activity size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                            Active Sessions
                        </p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                            {formatNumber(stats.activeSessions)}
                        </p>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            Current online users
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <Clock size={24} className="text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                            Avg. Session Time
                        </p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                            {Math.floor(stats.averageSessionTime)} min
                        </p>
                        <div className="text-sm font-bold text-green-600 dark:text-green-400">
                            +{stats.sessionTimeGrowth} min from last month
                        </div>
                    </motion.div>
                </div>

                {/* USER BEHAVIOR - Same as before */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                <BarChart3 size={20} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                User Behavior
                            </h3>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-4">
                                    Most Active Time
                                </h4>
                                {activityTimes.map((time, index) => (
                                    <motion.div
                                        key={time.timeSlot}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + index * 0.1 }}
                                        className="space-y-2"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                {time.timeSlot} - {parseInt(time.timeSlot) + 1}:00
                                            </span>
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                                {time.percentage.toFixed(1)}% of users
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${time.percentage}%` }}
                                                transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-4">
                                    Device Usage
                                </h4>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Smartphone size={18} className="text-green-600" />
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                Mobile
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                            {deviceUsage.mobilePercentage.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${deviceUsage.mobilePercentage}%` }}
                                            transition={{ duration: 1, delay: 0.8 }}
                                            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Monitor size={18} className="text-orange-600" />
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                Desktop
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                            {deviceUsage.desktopPercentage.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${deviceUsage.desktopPercentage}%` }}
                                            transition={{ duration: 1, delay: 0.9 }}
                                            className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.9 }}
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Tv size={18} className="text-pink-600" />
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                TV/Other
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                            {deviceUsage.tvPercentage.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${deviceUsage.tvPercentage}%` }}
                                            transition={{ duration: 1, delay: 1 }}
                                            className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full"
                                        />
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 🔥 DYNAMIC USER RETENTION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                    <Target size={20} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                    User Retention (Dynamic)
                                </h3>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                                Based on real user data
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {retentionData.length === 0 ? (
                            <div className="text-center py-16">
                                <AlertCircle
                                    size={64}
                                    className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
                                />
                                <p className="text-xl font-bold text-slate-500 dark:text-slate-400">
                                    No retention data available
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-end justify-around gap-2 h-64">
                                {retentionData.map((data, index) => (
                                    <motion.div
                                        key={data.day}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: `${data.percentage}%`, opacity: 1 }}
                                        transition={{ duration: 0.8, delay: 1.1 + index * 0.1 }}
                                        className="flex-1 flex flex-col items-center justify-end"
                                    >
                                        <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                            {data.percentage}%
                                        </div>
                                        <div
                                            className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-xl relative group cursor-pointer hover:from-blue-600 hover:to-blue-500 transition-all"
                                            style={{ height: "100%" }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white px-3 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {formatNumber(data.userCount)} users
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-semibold">
                                            {data.day}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ACTIVE USERS BREAKDOWN - Same as before */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                                <Users size={20} className="text-teal-600 dark:text-teal-400" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                Active Users Breakdown
                            </h3>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-700 dark:text-green-400 mb-2 font-bold">
                                Daily Active Users
                            </p>
                            <p className="text-4xl font-black text-green-700 dark:text-green-400">
                                {formatNumber(stats.dailyActiveUsers)}
                            </p>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-700 dark:text-blue-400 mb-2 font-bold">
                                Weekly Active Users
                            </p>
                            <p className="text-4xl font-black text-blue-700 dark:text-blue-400">
                                {formatNumber(stats.weeklyActiveUsers)}
                            </p>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                            <p className="text-sm text-purple-700 dark:text-purple-400 mb-2 font-bold">
                                Monthly Active Users
                            </p>
                            <p className="text-4xl font-black text-purple-700 dark:text-purple-400">
                                {formatNumber(stats.monthlyActiveUsers)}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserAnalytics;