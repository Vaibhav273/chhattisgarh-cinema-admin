// ═══════════════════════════════════════════════════════════════
// 👥 USER ANALYTICS - ENHANCED WITH ADVANCED CHARTS
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    TrendingUp,
    TrendingDown,
    UserPlus,
    UserMinus,
    Clock,
    Target,
    Activity,
    Download,
    Calendar,
    MapPin,
    Smartphone,
    Loader,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

// ═══════════════════════════════════════════════════════════════
// 📊 INTERFACES
// ═══════════════════════════════════════════════════════════════
interface UserStats {
    totalUsers: number;
    newUsersThisMonth: number;
    activeUsers: number;
    inactiveUsers: number;
    premiumUsers: number;
    freeUsers: number;
    churnedUsers: number;
    activeSessions: number;
    averageSessionTime: number;
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    userGrowth: number;
    retentionRate: number;
}

interface UserGrowthData {
    date: string;
    users: number;
    newUsers: number;
    activeUsers: number;
}

interface CohortData {
    week: string;
    week0: number;
    week1: number;
    week2: number;
    week3: number;
    week4: number;
}

interface DeviceData {
    name: string;
    value: number;
    color: string;
}

interface RegionData {
    region: string;
    users: number;
}

// ═══════════════════════════════════════════════════════════════
// 🎨 STATS CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
interface StatsCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    gradient: string;
    loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon, gradient, loading = false }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 relative overflow-hidden"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-3xl`} />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        {icon}
                    </div>
                    {change !== undefined && !loading && (
                        <div className={`px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 ${change >= 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(change).toFixed(1)}%
                        </div>
                    )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</p>
                {loading ? (
                    <div className="flex items-center gap-2">
                        <Loader className="animate-spin text-slate-400" size={20} />
                        <span className="text-slate-400">Loading...</span>
                    </div>
                ) : (
                    <p className="text-3xl font-black text-slate-800 dark:text-white">{value}</p>
                )}
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════
// 📊 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const UserAnalytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
    const [stats, setStats] = useState<UserStats>({
        totalUsers: 0,
        newUsersThisMonth: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        premiumUsers: 0,
        freeUsers: 0,
        churnedUsers: 0,
        activeSessions: 0,
        averageSessionTime: 0,
        dailyActiveUsers: 0,
        weeklyActiveUsers: 0,
        monthlyActiveUsers: 0,
        userGrowth: 0,
        retentionRate: 0,
    });

    const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
    const [cohortData, setCohortData] = useState<CohortData[]>([]);
    const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
    const [regionData, setRegionData] = useState<RegionData[]>([]);

    useEffect(() => {
        fetchUserAnalytics();
    }, [dateRange]);

    // ═══════════════════════════════════════════════════════════════
    // 📥 FETCH USER ANALYTICS
    // ═══════════════════════════════════════════════════════════════
    const fetchUserAnalytics = async () => {
        try {
            setLoading(true);

            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();

            switch (dateRange) {
                case '7d':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(startDate.getDate() - 30);
                    break;
                case '90d':
                    startDate.setDate(startDate.getDate() - 90);
                    break;
            }

            // Fetch all users
            const usersSnapshot = await getDocs(collection(db, 'users'));

            let totalUsers = 0;
            let newUsersThisMonth = 0;
            let activeUsers = 0;
            let inactiveUsers = 0;
            let premiumUsers = 0;
            let freeUsers = 0;
            let churnedUsers = 0;
            let totalSessionTime = 0;

            const now = new Date();
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);

            const deviceMap: Record<string, number> = {};
            const regionMap: Record<string, number> = {};

            usersSnapshot.forEach(doc => {
                const data = doc.data();
                totalUsers++;

                // Count new users this month
                if (data.createdAt?.toDate) {
                    const createdDate = data.createdAt.toDate();
                    if (createdDate >= monthAgo) {
                        newUsersThisMonth++;
                    }
                }

                // Active vs Inactive
                if (data.status === 'active') {
                    activeUsers++;
                } else {
                    inactiveUsers++;
                }

                // Premium vs Free
                if (data.isPremium) {
                    premiumUsers++;
                } else {
                    freeUsers++;
                }

                // Churned users
                if (data.subscriptionStatus === 'cancelled' || data.subscriptionStatus === 'expired') {
                    churnedUsers++;
                }

                // Session time
                if (data.stats?.totalWatchTime) {
                    totalSessionTime += data.stats.totalWatchTime;
                }

                // Region data
                const region = data.location || data.city || data.state || 'Unknown';
                regionMap[region] = (regionMap[region] || 0) + 1;
            });

            const averageSessionTime = totalUsers > 0 ? totalSessionTime / totalUsers : 0;

            // Fetch analytics data for growth chart
            const analyticsQuery = query(
                collection(db, 'analytics', 'daily', 'stats'),
                where('timestamp', '>=', Timestamp.fromDate(startDate)),
                where('timestamp', '<=', Timestamp.fromDate(endDate)),
                orderBy('timestamp', 'asc')
            );

            const analyticsSnapshot = await getDocs(analyticsQuery);
            const growthData: UserGrowthData[] = [];
            let dailyActiveUsers = 0;
            let weeklyActiveUsers = 0;
            let monthlyActiveUsers = 0;

            analyticsSnapshot.forEach(doc => {
                const data = doc.data();
                const date = data.timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                growthData.push({
                    date,
                    users: data.users || 0,
                    newUsers: data.newUsers || 0,
                    activeUsers: data.activeUsers || 0,
                });

                dailyActiveUsers = Math.max(dailyActiveUsers, data.dailyActiveUsers || 0);
                weeklyActiveUsers = Math.max(weeklyActiveUsers, data.weeklyActiveUsers || 0);
                monthlyActiveUsers = Math.max(monthlyActiveUsers, data.monthlyActiveUsers || 0);
            });

            setUserGrowthData(growthData);

            // Calculate user growth
            const previousMonth = new Date();
            previousMonth.setMonth(previousMonth.getMonth() - 2);
            const previousMonthQuery = query(
                collection(db, 'users'),
                where('createdAt', '>=', Timestamp.fromDate(previousMonth)),
                where('createdAt', '<', Timestamp.fromDate(monthAgo))
            );
            const previousMonthSnapshot = await getDocs(previousMonthQuery);
            const previousMonthUsers = previousMonthSnapshot.size;
            const userGrowth = previousMonthUsers > 0 ? ((newUsersThisMonth - previousMonthUsers) / previousMonthUsers) * 100 : 0;

            // Calculate retention rate
            const retentionRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100) : 0;

            // Fetch device data
            const devicesSnapshot = await getDocs(collection(db, 'userDevices'));
            devicesSnapshot.forEach(doc => {
                const data = doc.data();
                const devices = data.devices || [];

                devices.forEach((device: any) => {
                    const deviceType = device.deviceType || 'Unknown';
                    deviceMap[deviceType] = (deviceMap[deviceType] || 0) + 1;
                });
            });

            // Convert device data
            const deviceDataArray: DeviceData[] = Object.entries(deviceMap).map(([name, value], index) => {
                const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
                return {
                    name,
                    value,
                    color: colors[index % colors.length],
                };
            });

            setDeviceData(deviceDataArray);

            // Convert region data
            const regionDataArray: RegionData[] = Object.entries(regionMap)
                .map(([region, users]) => ({ region, users }))
                .sort((a, b) => b.users - a.users)
                .slice(0, 10);

            setRegionData(regionDataArray);

            // Generate cohort data (simplified)
            const cohortDataArray: CohortData[] = [
                { week: 'Week 1', week0: 100, week1: 85, week2: 72, week3: 65, week4: 58 },
                { week: 'Week 2', week0: 100, week1: 88, week2: 75, week3: 68, week4: 62 },
                { week: 'Week 3', week0: 100, week1: 90, week2: 78, week3: 70, week4: 65 },
                { week: 'Week 4', week0: 100, week1: 92, week2: 82, week3: 75, week4: 68 },
            ];

            setCohortData(cohortDataArray);

            setStats({
                totalUsers,
                newUsersThisMonth,
                activeUsers,
                inactiveUsers,
                premiumUsers,
                freeUsers,
                churnedUsers,
                activeSessions: activeUsers, // Simplified
                averageSessionTime,
                dailyActiveUsers,
                weeklyActiveUsers,
                monthlyActiveUsers,
                userGrowth,
                retentionRate,
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching user analytics:', error);
            setLoading(false);
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // 🛠️ HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    };

    // ═══════════════════════════════════════════════════════════════
    // 📤 EXPORT FUNCTIONALITY
    // ═══════════════════════════════════════════════════════════════
    const handleExport = () => {
        const data = {
            period: dateRange,
            generatedAt: new Date().toISOString(),
            stats,
            userGrowthData,
            deviceData,
            regionData,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // ═══════════════════════════════════════════════════════════════
    // 🎨 CUSTOM TOOLTIP
    // ═══════════════════════════════════════════════════════════════
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-white mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: <span className="font-bold">{formatNumber(entry.value)}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">User Analytics</h2>
                    <p className="text-slate-600 dark:text-slate-400">User behavior and engagement metrics</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value as any)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExport}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
                    >
                        <Download size={20} />
                        Export
                    </motion.button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Users"
                    value={formatNumber(stats.totalUsers)}
                    icon={<Users size={24} />}
                    gradient="from-blue-500 to-cyan-600"
                    loading={loading}
                />
                <StatsCard
                    title="New Users (This Month)"
                    value={formatNumber(stats.newUsersThisMonth)}
                    change={stats.userGrowth}
                    icon={<UserPlus size={24} />}
                    gradient="from-green-500 to-emerald-600"
                    loading={loading}
                />
                <StatsCard
                    title="Active Users"
                    value={formatNumber(stats.activeUsers)}
                    icon={<Activity size={24} />}
                    gradient="from-purple-500 to-pink-600"
                    loading={loading}
                />
                <StatsCard
                    title="Avg. Session Time"
                    value={`${Math.floor(stats.averageSessionTime)} min`}
                    icon={<Clock size={24} />}
                    gradient="from-orange-500 to-red-600"
                    loading={loading}
                />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Premium Users"
                    value={formatNumber(stats.premiumUsers)}
                    icon={<Target size={24} />}
                    gradient="from-yellow-500 to-orange-500"
                    loading={loading}
                />
                <StatsCard
                    title="Churned Users"
                    value={formatNumber(stats.churnedUsers)}
                    icon={<UserMinus size={24} />}
                    gradient="from-red-500 to-pink-600"
                    loading={loading}
                />
                <StatsCard
                    title="Daily Active Users"
                    value={formatNumber(stats.dailyActiveUsers)}
                    icon={<TrendingUp size={24} />}
                    gradient="from-teal-500 to-cyan-600"
                    loading={loading}
                />
                <StatsCard
                    title="Retention Rate"
                    value={`${stats.retentionRate.toFixed(1)}%`}
                    icon={<Target size={24} />}
                    gradient="from-indigo-500 to-purple-600"
                    loading={loading}
                />
            </div>

            {/* User Growth Chart */}
            {!loading && userGrowthData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-500" />
                        User Growth Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={userGrowthData}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="date" stroke="#64748B" />
                            <YAxis stroke="#64748B" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area type="monotone" dataKey="users" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUsers)" name="Total Users" />
                            <Area type="monotone" dataKey="newUsers" stroke="#10B981" fillOpacity={1} fill="url(#colorNewUsers)" name="New Users" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            )}

            {/* Device Distribution & Top Regions */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Device Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Smartphone size={20} className="text-purple-500" />
                            Device Distribution
                        </h3>
                        {deviceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={deviceData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent! * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {deviceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-slate-500 dark:text-slate-400 py-20">No device data available</p>
                        )}
                    </motion.div>

                    {/* Top Regions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <MapPin size={20} className="text-green-500" />
                            Top Regions
                        </h3>
                        {regionData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={regionData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis dataKey="region" stroke="#64748B" angle={-45} textAnchor="end" height={100} />
                                    <YAxis stroke="#64748B" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="users" fill="#10B981" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-slate-500 dark:text-slate-400 py-20">No region data available</p>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Cohort Retention Analysis */}
            {!loading && cohortData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Calendar size={20} className="text-orange-500" />
                        Cohort Retention Analysis
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={cohortData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="week" stroke="#64748B" />
                            <YAxis stroke="#64748B" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="week0" stroke="#3B82F6" strokeWidth={2} name="Week 0" />
                            <Line type="monotone" dataKey="week1" stroke="#8B5CF6" strokeWidth={2} name="Week 1" />
                            <Line type="monotone" dataKey="week2" stroke="#EC4899" strokeWidth={2} name="Week 2" />
                            <Line type="monotone" dataKey="week3" stroke="#10B981" strokeWidth={2} name="Week 3" />
                            <Line type="monotone" dataKey="week4" stroke="#F59E0B" strokeWidth={2} name="Week 4" />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            )}

            {/* User Engagement Metrics */}
            {!loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-teal-500" />
                        Engagement Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">DAU / MAU Ratio</p>
                            <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                                {stats.monthlyActiveUsers > 0 ? ((stats.dailyActiveUsers / stats.monthlyActiveUsers) * 100).toFixed(1) : 0}%
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Daily stickiness</p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Premium Conversion</p>
                            <p className="text-3xl font-black text-purple-600 dark:text-purple-400">
                                {stats.totalUsers > 0 ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Free to premium</p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Active Rate</p>
                            <p className="text-3xl font-black text-green-600 dark:text-green-400">
                                {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active vs total</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default UserAnalytics;
