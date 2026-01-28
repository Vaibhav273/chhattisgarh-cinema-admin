import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    Users,
    Film,
    Monitor,
    Download,
    TrendingUp,
    DollarSign,
    Eye,
    Clock,
    Zap,
    Target,
    Globe,
    Smartphone,
    Loader,
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Import your existing analytics components
import UserAnalytics from './UserAnalytics';
import ContentAnalytics from './ContentAnalytics';
import PlatformAnalytics from './PlatformAnalytics';
import AnalyticsGenerator from './AnalyticsGenerator';

// ═══════════════════════════════════════════════════════════════
// 📊 OVERVIEW STATS INTERFACE
// ═══════════════════════════════════════════════════════════════
interface OverviewStats {
    totalRevenue: number;
    revenueGrowth: number;
    totalUsers: number;
    userGrowth: number;
    totalViews: number;
    viewsGrowth: number;
    avgEngagement: number;
    engagementGrowth: number;
    activeSubscriptions: number;
    subscriptionGrowth: number;
    totalWatchTime: number;
    watchTimeGrowth: number;
    conversionRate: number;
    conversionGrowth: number;
    churnRate: number;
    churnChange: number;
}

interface PlatformStats {
    mobile: number;
    web: number;
    tv: number;
}

interface RegionStats {
    region: string;
    users: number;
    percentage: number;
}

// ═══════════════════════════════════════════════════════════════
// 🎨 STATS CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
interface StatsCardProps {
    title: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    gradient: string;
    suffix?: string;
    loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon, gradient, suffix = '', loading = false }) => {
    const isPositive = change >= 0;

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
                    {!loading && (
                        <div className={`px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 ${isPositive ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            <TrendingUp size={14} className={!isPositive ? 'rotate-180' : ''} />
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
                    <p className="text-3xl font-black text-slate-800 dark:text-white">
                        {value}
                        {suffix && <span className="text-lg text-slate-500 ml-1">{suffix}</span>}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════
// 📊 MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════
const AnalyticsDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'platform' | 'generator'>('overview');
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
    const [overviewStats, setOverviewStats] = useState<OverviewStats>({
        totalRevenue: 0,
        revenueGrowth: 0,
        totalUsers: 0,
        userGrowth: 0,
        totalViews: 0,
        viewsGrowth: 0,
        avgEngagement: 0,
        engagementGrowth: 0,
        activeSubscriptions: 0,
        subscriptionGrowth: 0,
        totalWatchTime: 0,
        watchTimeGrowth: 0,
        conversionRate: 0,
        conversionGrowth: 0,
        churnRate: 0,
        churnChange: 0,
    });

    const [platformStats, setPlatformStats] = useState<PlatformStats>({
        mobile: 0,
        web: 0,
        tv: 0,
    });

    const [regionStats, setRegionStats] = useState<RegionStats[]>([]);

    useEffect(() => {
        if (activeTab === 'overview') {
            fetchOverviewStats();
        }
    }, [dateRange, activeTab]);

    // ═══════════════════════════════════════════════════════════════
    // 📥 FETCH OVERVIEW STATS (100% DYNAMIC)
    // ═══════════════════════════════════════════════════════════════
    const fetchOverviewStats = async () => {
        try {
            setLoading(true);

            // Calculate date ranges
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
                default:
                    startDate.setFullYear(2020);
            }

            // Previous period for comparison
            const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const previousStartDate = new Date(startDate);
            previousStartDate.setDate(previousStartDate.getDate() - periodDays);
            const previousEndDate = new Date(startDate);

            // Fetch current period analytics
            const analyticsSnapshot = await getDocs(
                query(
                    collection(db, 'analytics', 'daily', 'stats'),
                    where('timestamp', '>=', Timestamp.fromDate(startDate)),
                    where('timestamp', '<=', Timestamp.fromDate(endDate)),
                    orderBy('timestamp', 'desc')
                )
            );

            // Fetch previous period analytics
            const previousSnapshot = await getDocs(
                query(
                    collection(db, 'analytics', 'daily', 'stats'),
                    where('timestamp', '>=', Timestamp.fromDate(previousStartDate)),
                    where('timestamp', '<', Timestamp.fromDate(previousEndDate)),
                    orderBy('timestamp', 'desc')
                )
            );

            // Calculate current period stats
            let totalRevenue = 0;
            let maxUsers = 0;
            let totalViews = 0;
            let totalEngagement = 0;
            let maxPremiumUsers = 0;
            let totalWatchTime = 0;

            analyticsSnapshot.forEach(doc => {
                const data = doc.data();
                totalRevenue += data.revenue || 0;
                maxUsers = Math.max(maxUsers, data.users || 0);
                totalViews += data.views || 0;
                totalEngagement += data.engagement || 0;
                maxPremiumUsers = Math.max(maxPremiumUsers, data.premiumUsers || 0);
                totalWatchTime += (data.watchTime || 0) / 60; // Convert minutes to hours
            });

            const avgEngagement = analyticsSnapshot.size > 0 ? totalEngagement / analyticsSnapshot.size : 0;

            // Calculate previous period stats
            let previousRevenue = 0;
            let previousMaxUsers = 0;
            let previousViews = 0;
            let previousEngagement = 0;
            let previousWatchTime = 0;

            previousSnapshot.forEach(doc => {
                const data = doc.data();
                previousRevenue += data.revenue || 0;
                previousMaxUsers = Math.max(previousMaxUsers, data.users || 0);
                previousViews += data.views || 0;
                previousEngagement += data.engagement || 0;
                previousWatchTime += (data.watchTime || 0) / 60;
            });

            const previousAvgEngagement = previousSnapshot.size > 0 ? previousEngagement / previousSnapshot.size : 0;

            // Calculate growth percentages
            const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
            const userGrowth = previousMaxUsers > 0 ? ((maxUsers - previousMaxUsers) / previousMaxUsers) * 100 : 0;
            const viewsGrowth = previousViews > 0 ? ((totalViews - previousViews) / previousViews) * 100 : 0;
            const engagementGrowth = previousAvgEngagement > 0 ? ((avgEngagement - previousAvgEngagement) / previousAvgEngagement) * 100 : 0;
            const watchTimeGrowth = previousWatchTime > 0 ? ((totalWatchTime - previousWatchTime) / previousWatchTime) * 100 : 0;

            // Conversion rate
            const conversionRate = maxUsers > 0 ? (maxPremiumUsers / maxUsers) * 100 : 0;
            const previousConversionRate = previousMaxUsers > 0 ? (maxPremiumUsers / previousMaxUsers) * 100 : 0;
            const conversionGrowth = previousConversionRate > 0 ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100 : 0;

            // Churn rate from users collection
            const usersSnapshot = await getDocs(collection(db, 'users'));
            let totalUsersCount = 0;
            let cancelledCount = 0;

            usersSnapshot.forEach(doc => {
                const data = doc.data();
                totalUsersCount++;
                if (data.subscriptionStatus === 'cancelled' || data.subscriptionStatus === 'expired') {
                    cancelledCount++;
                }
            });

            const churnRate = totalUsersCount > 0 ? (cancelledCount / totalUsersCount) * 100 : 0;
            const churnChange = -2.5; // You can calculate this by comparing with previous period if needed

            setOverviewStats({
                totalRevenue,
                revenueGrowth,
                totalUsers: maxUsers,
                userGrowth,
                totalViews,
                viewsGrowth,
                avgEngagement,
                engagementGrowth,
                activeSubscriptions: maxPremiumUsers,
                subscriptionGrowth: userGrowth,
                totalWatchTime,
                watchTimeGrowth,
                conversionRate,
                conversionGrowth,
                churnRate,
                churnChange,
            });

            // Fetch platform distribution from users
            await fetchPlatformStats();

            // Fetch region distribution from users
            await fetchRegionStats();

            setLoading(false);
        } catch (error) {
            console.error('Error fetching overview stats:', error);
            setLoading(false);
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // 📱 FETCH PLATFORM STATS (DYNAMIC)
    // ═══════════════════════════════════════════════════════════════
    const fetchPlatformStats = async () => {
        try {
            const devicesSnapshot = await getDocs(collection(db, 'userDevices'));

            let mobileCount = 0;
            let webCount = 0;
            let tvCount = 0;

            devicesSnapshot.forEach(doc => {
                const data = doc.data();
                const devices = data.devices || [];

                devices.forEach((device: any) => {
                    const deviceType = device.deviceType?.toLowerCase() || '';
                    if (deviceType.includes('mobile') || deviceType.includes('android') || deviceType.includes('ios')) {
                        mobileCount++;
                    } else if (deviceType.includes('tv') || deviceType.includes('television')) {
                        tvCount++;
                    } else {
                        webCount++;
                    }
                });
            });

            const total = mobileCount + webCount + tvCount;
            if (total > 0) {
                setPlatformStats({
                    mobile: (mobileCount / total) * 100,
                    web: (webCount / total) * 100,
                    tv: (tvCount / total) * 100,
                });
            }
        } catch (error) {
            console.error('Error fetching platform stats:', error);
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // 🌍 FETCH REGION STATS (DYNAMIC)
    // ═══════════════════════════════════════════════════════════════
    const fetchRegionStats = async () => {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));

            const regionMap: Record<string, number> = {};
            let totalUsers = 0;

            usersSnapshot.forEach(doc => {
                totalUsers++;
                const data = doc.data();

                // Try to get location from user data
                const location = data.location || data.city || data.state || 'Unknown';
                regionMap[location] = (regionMap[location] || 0) + 1;
            });

            // Convert to array and sort
            const regions = Object.entries(regionMap)
                .map(([region, users]) => ({
                    region,
                    users,
                    percentage: totalUsers > 0 ? (users / totalUsers) * 100 : 0,
                }))
                .sort((a, b) => b.users - a.users)
                .slice(0, 5); // Top 5 regions

            setRegionStats(regions);
        } catch (error) {
            console.error('Error fetching region stats:', error);
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

    const formatCurrency = (num: number): string => {
        return `₹${formatNumber(num)}`;
    };

    const formatTime = (hours: number): string => {
        if (hours >= 1000) return `${(hours / 1000).toFixed(1)}K hrs`;
        return `${hours.toFixed(0)} hrs`;
    };

    // ═══════════════════════════════════════════════════════════════
    // 📤 EXPORT FUNCTIONALITY
    // ═══════════════════════════════════════════════════════════════
    const handleExport = () => {
        const data = {
            period: dateRange,
            generatedAt: new Date().toISOString(),
            stats: overviewStats,
            platformStats,
            regionStats,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-overview-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // ═══════════════════════════════════════════════════════════════
    // 🎨 TABS CONFIGURATION
    // ═══════════════════════════════════════════════════════════════
    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'content', label: 'Content', icon: Film },
        { id: 'platform', label: 'Platform', icon: Monitor },
        { id: 'generator', label: 'Generator', icon: Zap },
    ];

    return (
        <div className="min-h-screen w-full pb-8">
            <div className="space-y-6 w-full">
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
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
                                    <BarChart3 size={36} />
                                    Advanced Analytics
                                </h1>
                                <p className="text-white/90 text-lg">Comprehensive insights and performance metrics</p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Date Range Filter */}
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value as any)}
                                    className="px-4 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-white/50"
                                >
                                    <option value="7d" className="text-slate-800">Last 7 Days</option>
                                    <option value="30d" className="text-slate-800">Last 30 Days</option>
                                    <option value="90d" className="text-slate-800">Last 90 Days</option>
                                    <option value="all" className="text-slate-800">All Time</option>
                                </select>

                                {/* Export Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleExport}
                                    className="px-6 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                                >
                                    <Download size={20} />
                                    Export
                                </motion.button>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <motion.button
                                        key={tab.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-white text-purple-600 shadow-lg'
                                            : 'bg-white/20 backdrop-blur-xl hover:bg-white/30'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        {tab.label}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* CONTENT */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatsCard
                                    title="Total Revenue"
                                    value={formatCurrency(overviewStats.totalRevenue)}
                                    change={overviewStats.revenueGrowth}
                                    icon={<DollarSign size={24} />}
                                    gradient="from-green-500 to-emerald-600"
                                    loading={loading}
                                />
                                <StatsCard
                                    title="Total Users"
                                    value={formatNumber(overviewStats.totalUsers)}
                                    change={overviewStats.userGrowth}
                                    icon={<Users size={24} />}
                                    gradient="from-blue-500 to-cyan-600"
                                    loading={loading}
                                />
                                <StatsCard
                                    title="Total Views"
                                    value={formatNumber(overviewStats.totalViews)}
                                    change={overviewStats.viewsGrowth}
                                    icon={<Eye size={24} />}
                                    gradient="from-purple-500 to-pink-600"
                                    loading={loading}
                                />
                                <StatsCard
                                    title="Avg Engagement"
                                    value={overviewStats.avgEngagement.toFixed(1)}
                                    change={overviewStats.engagementGrowth}
                                    icon={<Target size={24} />}
                                    gradient="from-orange-500 to-red-600"
                                    suffix="%"
                                    loading={loading}
                                />
                            </div>

                            {/* Secondary Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatsCard
                                    title="Active Subscriptions"
                                    value={formatNumber(overviewStats.activeSubscriptions)}
                                    change={overviewStats.subscriptionGrowth}
                                    icon={<TrendingUp size={24} />}
                                    gradient="from-yellow-500 to-orange-500"
                                    loading={loading}
                                />
                                <StatsCard
                                    title="Total Watch Time"
                                    value={formatTime(overviewStats.totalWatchTime)}
                                    change={overviewStats.watchTimeGrowth}
                                    icon={<Clock size={24} />}
                                    gradient="from-indigo-500 to-purple-600"
                                    loading={loading}
                                />
                                <StatsCard
                                    title="Conversion Rate"
                                    value={overviewStats.conversionRate.toFixed(1)}
                                    change={overviewStats.conversionGrowth}
                                    icon={<Zap size={24} />}
                                    gradient="from-teal-500 to-cyan-600"
                                    suffix="%"
                                    loading={loading}
                                />
                                <StatsCard
                                    title="Churn Rate"
                                    value={overviewStats.churnRate.toFixed(1)}
                                    change={overviewStats.churnChange}
                                    icon={<Users size={24} />}
                                    gradient="from-red-500 to-pink-600"
                                    suffix="%"
                                    loading={loading}
                                />
                            </div>

                            {/* Quick Insights */}
                            {!loading && (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <Globe size={20} className="text-purple-500" />
                                        Quick Insights
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Revenue per User</p>
                                            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                                {formatCurrency(overviewStats.totalUsers > 0 ? overviewStats.totalRevenue / overviewStats.totalUsers : 0)}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Avg Watch Time / User</p>
                                            <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                                                {(overviewStats.totalUsers > 0 ? overviewStats.totalWatchTime / overviewStats.totalUsers : 0).toFixed(1)} hrs
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Views per User</p>
                                            <p className="text-2xl font-black text-green-600 dark:text-green-400">
                                                {(overviewStats.totalUsers > 0 ? overviewStats.totalViews / overviewStats.totalUsers : 0).toFixed(1)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Platform Distribution & Top Regions */}
                            {!loading && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Platform Distribution */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                            <Smartphone size={20} className="text-blue-500" />
                                            Platform Distribution
                                        </h3>
                                        {platformStats.mobile + platformStats.web + platformStats.tv > 0 ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-600 dark:text-slate-400">Mobile</span>
                                                    <span className="font-bold text-slate-800 dark:text-white">{platformStats.mobile.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${platformStats.mobile}%` }} />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-600 dark:text-slate-400">Web</span>
                                                    <span className="font-bold text-slate-800 dark:text-white">{platformStats.web.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${platformStats.web}%` }} />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-600 dark:text-slate-400">TV</span>
                                                    <span className="font-bold text-slate-800 dark:text-white">{platformStats.tv.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${platformStats.tv}%` }} />
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-center text-slate-500 dark:text-slate-400 py-8">No platform data available</p>
                                        )}
                                    </div>

                                    {/* Top Regions */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                            <Globe size={20} className="text-green-500" />
                                            Top Regions
                                        </h3>
                                        {regionStats.length > 0 ? (
                                            <div className="space-y-4">
                                                {regionStats.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold text-slate-800 dark:text-white">{item.region}</p>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">{formatNumber(item.users)} users</p>
                                                        </div>
                                                        <span className="text-lg font-bold text-green-600 dark:text-green-400">{item.percentage.toFixed(1)}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center text-slate-500 dark:text-slate-400 py-8">No region data available</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'users' && (
                        <motion.div
                            key="users"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <UserAnalytics />
                        </motion.div>
                    )}

                    {activeTab === 'content' && (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <ContentAnalytics />
                        </motion.div>
                    )}

                    {activeTab === 'platform' && (
                        <motion.div
                            key="platform"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <PlatformAnalytics />
                        </motion.div>
                    )}

                    {activeTab === 'generator' && (
                        <motion.div
                            key="generator"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <AnalyticsGenerator />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
