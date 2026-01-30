// ═══════════════════════════════════════════════════════════════
// 📊 PLATFORM ANALYTICS - ENHANCED WITH ADVANCED VISUALIZATIONS
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Eye,
    Play,
    TrendingUp,
    TrendingDown,
    Download,
    RefreshCw,
    Monitor,
    Smartphone,
    Tv,
    Film,
    Heart,
    Clock,
    Target,
    Zap,
    Loader,
} from 'lucide-react';
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { Movie, WebSeries, ShortFilm } from '../../types/content';

// ═══════════════════════════════════════════════════════════════
// 📊 INTERFACES
// ═══════════════════════════════════════════════════════════════
interface PlatformStats {
    totalUsers: number;
    totalViews: number;
    watchHours: number;
    engagementRate: number;
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    premiumUsers: number;
    freeUsers: number;
    newUsersThisMonth: number;
    userGrowth: number;
    viewsGrowth: number;
    watchTimeGrowth: number;
}

interface ContentStats {
    moviesCount: number;
    seriesCount: number;
    shortFilmsCount: number;
    totalContent: number;
}

interface DeviceStats {
    mobile: number;
    web: number;
    tv: number;
}

interface TopContent {
    id: string;
    title: string;
    type: string;
    views: number;
    likes: number;
    watchTime: number;
    thumbnail?: string;
}

interface ActivityData {
    hour: string;
    users: number;
}

interface SessionData {
    date: string;
    sessions: number;
    avgDuration: number;
}

interface RegionData {
    region: string;
    users: number;
    percentage: number;
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
const PlatformAnalytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<PlatformStats>({
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

    const [activityData, setActivityData] = useState<ActivityData[]>([]);
    const [sessionData, setSessionData] = useState<SessionData[]>([]);
    const [regionData, setRegionData] = useState<RegionData[]>([]);

    useEffect(() => {
        fetchPlatformAnalytics();
    }, []);

    // ═══════════════════════════════════════════════════════════════
    // 🛠️ TYPE SAFE DATE CONVERTER
    // ═══════════════════════════════════════════════════════════════
    const toDate = (timestamp: any): Date => {
        if (!timestamp) return new Date(0);
        if (timestamp instanceof Date) return timestamp;
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
            return timestamp.toDate();
        }
        if (timestamp.seconds) {
            return new Date(timestamp.seconds * 1000);
        }
        return new Date(0);
    };


    // ═══════════════════════════════════════════════════════════════
    // 📥 FETCH PLATFORM ANALYTICS - 100% DYNAMIC
    // ═══════════════════════════════════════════════════════════════
    const fetchPlatformAnalytics = async () => {
        try {
            setLoading(true);

            // Date calculations
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

            // Fetch all collections in parallel
            const [usersSnapshot, moviesSnapshot, seriesSnapshot, shortFilmsSnapshot, devicesSnapshot] = await Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'movies')),
                getDocs(collection(db, 'webseries')),
                getDocs(collection(db, 'shortfilms')),
                getDocs(collection(db, 'userDevices')),
            ]);

            // ✅ PROCESS USERS DATA
            let premiumUsers = 0;
            let freeUsers = 0;
            let monthlyActiveUsers = 0;
            let weeklyActiveUsers = 0;
            let dailyActiveUsers = 0;
            let newUsersThisMonth = 0;
            let previousMonthUsers = 0;
            const regionMap: Record<string, number> = {};
            const deviceCount = { mobile: 0, web: 0, tv: 0 };

            usersSnapshot.forEach((doc) => {
                const userData = doc.data();

                // Premium vs Free
                if (userData.isPremium || userData.subscription?.status === 'active') {
                    premiumUsers++;
                } else {
                    freeUsers++;
                }

                // Active users - using type-safe converter
                const lastActive = toDate(userData.lastActive || userData.lastLoginAt);
                if (lastActive >= oneDayAgo) dailyActiveUsers++;
                if (lastActive >= sevenDaysAgo) weeklyActiveUsers++;
                if (lastActive >= thirtyDaysAgo) monthlyActiveUsers++;

                // New users - using type-safe converter
                const createdAt = toDate(userData.createdAt);
                if (createdAt >= thirtyDaysAgo) newUsersThisMonth++;
                if (createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo) previousMonthUsers++;

                // Region data
                const region = userData.location || userData.city || userData.state || 'Unknown';
                regionMap[region] = (regionMap[region] || 0) + 1;

                // Device type from user metadata
                const deviceType = userData.deviceType || userData.lastDeviceType || 'web';
                if (deviceType.toLowerCase().includes('mobile') || deviceType.toLowerCase().includes('android') || deviceType.toLowerCase().includes('ios')) {
                    deviceCount.mobile++;
                } else if (deviceType.toLowerCase().includes('tv')) {
                    deviceCount.tv++;
                } else {
                    deviceCount.web++;
                }
            });

            // Process device data from userDevices collection
            devicesSnapshot.forEach(doc => {
                const data = doc.data();
                const devices = data.devices || [];

                devices.forEach((device: any) => {
                    const deviceType = device.deviceType?.toLowerCase() || device.type?.toLowerCase() || '';
                    if (deviceType.includes('mobile') || deviceType.includes('android') || deviceType.includes('ios') || deviceType.includes('phone')) {
                        deviceCount.mobile++;
                    } else if (deviceType.includes('tv') || deviceType.includes('television')) {
                        deviceCount.tv++;
                    } else {
                        deviceCount.web++;
                    }
                });
            });

            // Calculate user growth
            const userGrowth = previousMonthUsers > 0 ? ((newUsersThisMonth - previousMonthUsers) / previousMonthUsers) * 100 : 0;

            // ✅ PROCESS CONTENT DATA
            let totalViews = 0;
            let totalWatchTime = 0;
            let totalLikes = 0;
            let totalComments = 0;
            let previousViews = 0;
            let previousWatchTime = 0;
            const allContent: TopContent[] = [];

            // Process Movies
            moviesSnapshot.forEach(doc => {
                const movie = doc.data() as Movie;
                const views = movie.views || 0;
                const duration = parseDuration(movie.duration) || 0;
                const watchTime = (duration * views) / 60;
                const likes = movie.likes || 0;

                totalViews += views;
                totalWatchTime += watchTime;
                totalLikes += likes;
                totalComments += movie.commentsCount || 0;

                // Check if created in previous period - using type-safe converter
                const createdAt = toDate(movie.createdAt);
                if (createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo) {
                    previousViews += views;
                    previousWatchTime += watchTime;
                }

                allContent.push({
                    id: doc.id,
                    title: movie.title,
                    type: 'Movie',
                    views,
                    likes,
                    watchTime,
                    thumbnail: movie.thumbnail || movie.posterUrl,
                });
            });

            // Process Series
            seriesSnapshot.forEach(doc => {
                const series = doc.data() as WebSeries;
                const views = series.views || 0;
                const likes = series.likes || 0;

                // Calculate watch time for series
                let seriesWatchTime = 0;
                if (series.seasons && series.seasons.length > 0) {
                    series.seasons.forEach((season: any) => {
                        if (season.episodes && season.episodes.length > 0) {
                            season.episodes.forEach((episode: any) => {
                                const epDuration = parseDuration(episode.duration) || 0;
                                const epViews = episode.views || views / (series.totalEpisodes || 1);
                                seriesWatchTime += (epDuration * epViews) / 60;
                            });
                        }
                    });
                }

                totalViews += views;
                totalWatchTime += seriesWatchTime;
                totalLikes += likes;
                totalComments += series.commentsCount || 0;

                // Using type-safe converter
                const createdAt = toDate(series.createdAt);
                if (createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo) {
                    previousViews += views;
                    previousWatchTime += seriesWatchTime;
                }

                allContent.push({
                    id: doc.id,
                    title: series.title,
                    type: 'Series',
                    views,
                    likes,
                    watchTime: seriesWatchTime,
                    thumbnail: series.thumbnail || series.posterUrl,
                });
            });

            // Process Short Films
            shortFilmsSnapshot.forEach(doc => {
                const shortFilm = doc.data() as ShortFilm;
                const views = shortFilm.views || 0;
                const duration = parseDuration(shortFilm.duration) || 0;
                const watchTime = (duration * views) / 60;
                const likes = shortFilm.likes || 0;

                totalViews += views;
                totalWatchTime += watchTime;
                totalLikes += likes;
                totalComments += shortFilm.commentsCount || 0;

                // Using type-safe converter
                const createdAt = toDate(shortFilm.createdAt);
                if (createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo) {
                    previousViews += views;
                    previousWatchTime += watchTime;
                }

                allContent.push({
                    id: doc.id,
                    title: shortFilm.title,
                    type: 'Short Film',
                    views,
                    likes,
                    watchTime,
                    thumbnail: shortFilm.thumbnail || shortFilm.posterUrl,
                });
            });

            // Calculate growth
            const viewsGrowth = previousViews > 0 ? ((totalViews - previousViews) / previousViews) * 100 : 0;
            const watchTimeGrowth = previousWatchTime > 0 ? ((totalWatchTime - previousWatchTime) / previousWatchTime) * 100 : 0;

            // Calculate engagement rate
            const totalEngagement = totalLikes + totalComments;
            const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;

            // Sort and get top content
            allContent.sort((a, b) => b.views - a.views);
            setTopContent(allContent.slice(0, 5));

            // Set stats
            setStats({
                totalUsers: usersSnapshot.size,
                totalViews,
                watchHours: Math.floor(totalWatchTime),
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

            setContentStats({
                moviesCount: moviesSnapshot.size,
                seriesCount: seriesSnapshot.size,
                shortFilmsCount: shortFilmsSnapshot.size,
                totalContent: moviesSnapshot.size + seriesSnapshot.size + shortFilmsSnapshot.size,
            });

            setDeviceStats(deviceCount);

            // Generate activity data (24-hour breakdown)
            const activityDataArray = generateActivityData(usersSnapshot.docs);
            setActivityData(activityDataArray);

            // Generate session data (last 7 days)
            const sessionDataArray = generateSessionData(usersSnapshot.docs);
            setSessionData(sessionDataArray);

            // Convert region data
            const regionDataArray: RegionData[] = Object.entries(regionMap)
                .map(([region, users]) => ({
                    region,
                    users,
                    percentage: usersSnapshot.size > 0 ? (users / usersSnapshot.size) * 100 : 0,
                }))
                .sort((a, b) => b.users - a.users)
                .slice(0, 5);
            setRegionData(regionDataArray);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching platform analytics:', error);
            setLoading(false);
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // 🛠️ HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    const parseDuration = (duration: any): number => {
        if (!duration) return 0;
        if (typeof duration === 'number') return duration;

        const str = duration.toString();
        const hours = str.match(/(\d+)h/);
        const minutes = str.match(/(\d+)m/);

        let total = 0;
        if (hours) total += parseInt(hours[1]) * 60;
        if (minutes) total += parseInt(minutes[1]);

        return total;
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    };

    const generateActivityData = (userDocs: any[]): ActivityData[] => {
        const hourCounts: Record<number, number> = {};

        // Initialize all hours
        for (let i = 0; i < 24; i++) {
            hourCounts[i] = 0;
        }

        // Count users per hour based on lastActive
        userDocs.forEach(doc => {
            const userData = doc.data();
            const lastActive = toDate(userData.lastActive || userData.lastLoginAt);

            if (lastActive.getTime() > 0) {
                const hour = lastActive.getHours();
                hourCounts[hour]++;
            }
        });

        // Convert to array
        return Object.entries(hourCounts).map(([hour, users]) => ({
            hour: `${hour.padStart(2, '0')}:00`,
            users,
        }));
    };

    const generateSessionData = (userDocs: any[]): SessionData[] => {
        const data: SessionData[] = [];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            // Count sessions for this day
            let sessions = 0;
            let totalDuration = 0;

            userDocs.forEach(doc => {
                const userData = doc.data();
                const lastActive = toDate(userData.lastActive || userData.lastLoginAt);

                if (lastActive.getTime() > 0 && lastActive.toDateString() === date.toDateString()) {
                    sessions++;
                    totalDuration += userData.sessionDuration || 30; // Default 30 minutes
                }
            });

            data.push({
                date: dateStr,
                sessions,
                avgDuration: sessions > 0 ? totalDuration / sessions : 0,
            });
        }

        return data;
    };

    // ═══════════════════════════════════════════════════════════════
    // 📤 EXPORT FUNCTIONALITY
    // ═══════════════════════════════════════════════════════════════
    const handleExport = () => {
        const data = {
            generatedAt: new Date().toISOString(),
            stats,
            contentStats,
            deviceStats,
            topContent,
            regionData,
            activityData,
            sessionData,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `platform-analytics-${new Date().toISOString().split('T')[0]}.json`;
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
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Platform Analytics</h2>
                    <p className="text-slate-600 dark:text-slate-400">Overall platform performance and health metrics</p>
                </div>

                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchPlatformAnalytics}
                        className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold flex items-center gap-2 shadow-lg"
                    >
                        <RefreshCw size={20} />
                        Refresh
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExport}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
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
                    change={stats.userGrowth}
                    icon={<Users size={24} />}
                    gradient="from-green-500 to-emerald-600"
                    loading={loading}
                />
                <StatsCard
                    title="Total Views"
                    value={formatNumber(stats.totalViews)}
                    change={stats.viewsGrowth}
                    icon={<Eye size={24} />}
                    gradient="from-blue-500 to-cyan-600"
                    loading={loading}
                />
                <StatsCard
                    title="Watch Hours"
                    value={formatNumber(stats.watchHours)}
                    change={stats.watchTimeGrowth}
                    icon={<Play size={24} />}
                    gradient="from-purple-500 to-pink-600"
                    loading={loading}
                />
                <StatsCard
                    title="Engagement Rate"
                    value={`${stats.engagementRate.toFixed(1)}%`}
                    icon={<Target size={24} />}
                    gradient="from-orange-500 to-red-600"
                    loading={loading}
                />
            </div>

            {/* Active Users Panel */}
            {!loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Zap size={20} className="text-cyan-500" />
                        Active Users Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-semibold">Daily Active Users</p>
                            <p className="text-3xl font-black text-green-600 dark:text-green-400">{formatNumber(stats.dailyActiveUsers)}</p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-semibold">Weekly Active Users</p>
                            <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{formatNumber(stats.weeklyActiveUsers)}</p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-semibold">Monthly Active Users</p>
                            <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{formatNumber(stats.monthlyActiveUsers)}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Activity Heatmap & Session Trends */}
            {!loading && activityData.length > 0 && sessionData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 24-Hour Activity Pattern */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Clock size={20} className="text-blue-500" />
                            24-Hour Activity Pattern
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="hour" stroke="#64748B" />
                                <YAxis stroke="#64748B" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="users" stroke="#06B6D4" fillOpacity={1} fill="url(#colorActivity)" name="Active Users" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Session Trends */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-purple-500" />
                            Session Trends (Last 7 Days)
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={sessionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="date" stroke="#64748B" />
                                <YAxis stroke="#64748B" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="sessions" stroke="#8B5CF6" strokeWidth={2} name="Sessions" dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="avgDuration" stroke="#10B981" strokeWidth={2} name="Avg Duration (min)" dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>
            )}

            {/* Content Distribution & User Demographics */}
            {!loading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Content Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Film size={20} className="text-pink-500" />
                            Content Distribution
                        </h3>
                        <div className="space-y-6">
                            {/* Movies */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-slate-800 dark:text-white">Movies</span>
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                        {contentStats.moviesCount} ({((contentStats.moviesCount / contentStats.totalContent) * 100).toFixed(0)}%)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(contentStats.moviesCount / contentStats.totalContent) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                                    />
                                </div>
                            </div>

                            {/* Series */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-slate-800 dark:text-white">Series</span>
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                        {contentStats.seriesCount} ({((contentStats.seriesCount / contentStats.totalContent) * 100).toFixed(0)}%)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(contentStats.seriesCount / contentStats.totalContent) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.3 }}
                                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
                                    />
                                </div>
                            </div>

                            {/* Short Films */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-slate-800 dark:text-white">Short Films</span>
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                        {contentStats.shortFilmsCount} ({((contentStats.shortFilmsCount / contentStats.totalContent) * 100).toFixed(0)}%)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(contentStats.shortFilmsCount / contentStats.totalContent) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.4 }}
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
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Users size={20} className="text-indigo-500" />
                            User Demographics
                        </h3>
                        <div className="space-y-6">
                            {/* Subscription Type */}
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4">Subscription Type</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                        <span className="font-bold text-amber-700 dark:text-amber-400">Premium Users</span>
                                        <span className="text-xl font-black text-amber-700 dark:text-amber-400">
                                            {formatNumber(stats.premiumUsers)} ({((stats.premiumUsers / stats.totalUsers) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">Free Users</span>
                                        <span className="text-xl font-black text-slate-700 dark:text-slate-300">
                                            {formatNumber(stats.freeUsers)} ({((stats.freeUsers / stats.totalUsers) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Device Distribution */}
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4">Device Distribution</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Smartphone size={18} className="text-green-600" />
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">Mobile</span>
                                        </div>
                                        <span className="font-bold text-slate-800 dark:text-white">
                                            {formatNumber(deviceStats.mobile)} ({((deviceStats.mobile / (deviceStats.mobile + deviceStats.web + deviceStats.tv)) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Monitor size={18} className="text-blue-600" />
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">Web</span>
                                        </div>
                                        <span className="font-bold text-slate-800 dark:text-white">
                                            {formatNumber(deviceStats.web)} ({((deviceStats.web / (deviceStats.mobile + deviceStats.web + deviceStats.tv)) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Tv size={18} className="text-purple-600" />
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">TV</span>
                                        </div>
                                        <span className="font-bold text-slate-800 dark:text-white">
                                            {formatNumber(deviceStats.tv)} ({((deviceStats.tv / (deviceStats.mobile + deviceStats.web + deviceStats.tv)) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Device Stats Chart & Top Regions */}
            {!loading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Device Stats Pie Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Monitor size={20} className="text-cyan-500" />
                            Device Usage Distribution
                        </h3>
                        {(deviceStats.mobile + deviceStats.web + deviceStats.tv) > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Mobile', value: deviceStats.mobile, color: '#10B981' },
                                            { name: 'Web', value: deviceStats.web, color: '#3B82F6' },
                                            { name: 'TV', value: deviceStats.tv, color: '#8B5CF6' },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent! * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {[
                                            { name: 'Mobile', value: deviceStats.mobile, color: '#10B981' },
                                            { name: 'Web', value: deviceStats.web, color: '#3B82F6' },
                                            { name: 'TV', value: deviceStats.tv, color: '#8B5CF6' },
                                        ].map((entry, index) => (
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
                            <Target size={20} className="text-green-500" />
                            Top Regions
                        </h3>
                        {regionData.length > 0 ? (
                            <div className="space-y-4">
                                {regionData.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-black">
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">{item.region}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{formatNumber(item.users)} users</p>
                                            </div>
                                        </div>
                                        <span className="text-lg font-bold text-green-600 dark:text-green-400">{item.percentage.toFixed(1)}%</span>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 dark:text-slate-400 py-20">No region data available</p>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Top Performing Content */}
            {!loading && topContent.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-red-500" />
                        Top Performing Content
                    </h3>
                    <div className="space-y-4">
                        {topContent.map((content, index) => (
                            <motion.div
                                key={content.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:shadow-lg transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black">
                                            #{index + 1}
                                        </div>
                                        {content.thumbnail && (
                                            <img
                                                src={content.thumbnail}
                                                alt={content.title}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                        )}
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white">{content.title}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{content.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                                <Eye size={16} />
                                                <span className="text-sm font-bold">{formatNumber(content.views)}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">views</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
                                                <Heart size={16} />
                                                <span className="text-sm font-bold">{formatNumber(content.likes)}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">likes</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                                <Clock size={16} />
                                                <span className="text-sm font-bold">{formatNumber(content.watchTime)}h</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">watch time</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default PlatformAnalytics;

