import React, { useState } from 'react';
import {
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    Line,
} from 'recharts';
import type { WatchTimeByPeriod, AnalyticsDataPoint } from '../../types/analytics';
import { Clock, TrendingUp, Users, Play, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    dailyData: AnalyticsDataPoint[]; // Daily watch time trends
    hourlyData?: WatchTimeByPeriod[]; // Peak hours data (optional)
    loading?: boolean;
}

const WatchTimeChart: React.FC<Props> = ({ dailyData, hourlyData, loading }) => {
    const [viewMode, setViewMode] = useState<'daily' | 'hourly'>('daily');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Calculate metrics from daily data
    const totalWatchTime = dailyData.reduce((sum, d) => sum + d.watchTime, 0);
    const avgDailyWatchTime = totalWatchTime / dailyData.length;
    const totalActiveUsers = dailyData.reduce((sum, d) => sum + d.activeUsers, 0);
    const avgWatchTimePerUser = totalWatchTime / totalActiveUsers;

    // Peak day
    const peakDay = dailyData.reduce((max, d) =>
        d.watchTime > max.watchTime ? d : max
        , dailyData[0]);

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-white mb-2">
                        {viewMode === 'daily'
                            ? new Date(label).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                            : label
                        }
                    </p>
                    <div className="space-y-1">
                        {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
                                <span className="font-bold text-slate-800 dark:text-white">
                                    {entry.name.includes('Time') || entry.name.includes('Avg')
                                        ? `${entry.value.toLocaleString()} min`
                                        : entry.value.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                            <Clock size={20} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                            Watch Time Analytics
                        </h3>
                    </div>
                    <p className="text-sm text-slate-500">
                        {viewMode === 'daily'
                            ? 'Daily watch time trends and user engagement'
                            : 'Peak viewing hours and user activity patterns'}
                    </p>
                </div>

                {/* View Mode Toggle (only show if hourly data available) */}
                {hourlyData && hourlyData.length > 0 && (
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'daily'
                                    ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setViewMode('hourly')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'hourly'
                                    ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            Hourly
                        </button>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl"
                >
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
                        <Clock size={16} />
                        <span className="text-xs font-semibold">Total Watch Time</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                        {(totalWatchTime / 60).toFixed(0)}h
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        {totalWatchTime.toLocaleString()} mins
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl"
                >
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                        <Activity size={16} />
                        <span className="text-xs font-semibold">Avg Daily</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                        {(avgDailyWatchTime / 60).toFixed(1)}h
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        {avgDailyWatchTime.toFixed(0)} mins/day
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl"
                >
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                        <Users size={16} />
                        <span className="text-xs font-semibold">Avg per User</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                        {avgWatchTimePerUser.toFixed(0)}m
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        per active user
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl"
                >
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                        <TrendingUp size={16} />
                        <span className="text-xs font-semibold">Peak Day</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                        {(peakDay.watchTime / 60).toFixed(0)}h
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        {new Date(peakDay.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                </motion.div>
            </div>

            {/* Chart Display */}
            <motion.div
                key={viewMode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                {viewMode === 'daily' ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart
                            data={dailyData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        >
                            <defs>
                                <linearGradient id="colorWatchTime" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                stroke="#64748b"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                                }}
                            />
                            <YAxis
                                yAxisId="left"
                                stroke="#64748b"
                                tick={{ fontSize: 12 }}
                                label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#64748b"
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="watchTime"
                                stroke="#f97316"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorWatchTime)"
                                name="Watch Time"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="activeUsers"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', r: 3 }}
                                name="Active Users"
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="avgWatchTime"
                                stroke="#10b981"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                name="Avg Session Time"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    hourlyData && (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={hourlyData}
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                                <XAxis
                                    dataKey="period"
                                    stroke="#64748b"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                <Bar
                                    dataKey="watchTime"
                                    fill="#f97316"
                                    radius={[8, 8, 0, 0]}
                                    name="Watch Time (mins)"
                                />
                                <Bar
                                    dataKey="users"
                                    fill="#3b82f6"
                                    radius={[8, 8, 0, 0]}
                                    name="Active Users"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )
                )}
            </motion.div>

            {/* Engagement Insights */}
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Play size={20} className="text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-white mb-1">
                            Engagement Insights
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Users are watching an average of <span className="font-bold text-orange-600 dark:text-orange-400">
                                {avgWatchTimePerUser.toFixed(0)} minutes
                            </span> per session. Peak engagement was on{' '}
                            <span className="font-bold text-orange-600 dark:text-orange-400">
                                {new Date(peakDay.date).toLocaleDateString('en-IN', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                })}
                            </span> with {(peakDay.watchTime / 60).toFixed(0)} hours of total watch time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchTimeChart;
