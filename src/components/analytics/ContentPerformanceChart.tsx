import React, { useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { type ContentPerformance } from '../../types/analytics';
import { Film, Tv, Video, Calendar, TrendingUp, Eye, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    data: ContentPerformance[];
    loading?: boolean;
}

const ContentPerformanceChart: React.FC<Props> = ({ data, loading }) => {
    const [viewMode, setViewMode] = useState<'pie' | 'bar'>('bar');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Calculate totals
    const totalViews = data.reduce((sum, item) => sum + item.views, 0);
    const totalWatchTime = data.reduce((sum, item) => sum + item.watchTime, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

    // Get icon for content type
    const getContentIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'movie':
                return Film;
            case 'webseries':
            case 'series':
                return Tv;
            case 'shortfilm':
                return Video;
            case 'event':
                return Calendar;
            default:
                return Film;
        }
    };

    // Custom Pie Chart Tooltip
    const CustomPieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-white mb-2">
                        {data.label}
                    </p>
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-600 dark:text-slate-400">Views:</span>
                            <span className="font-bold text-slate-800 dark:text-white">
                                {data.views.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-600 dark:text-slate-400">Percentage:</span>
                            <span className="font-bold text-slate-800 dark:text-white">
                                {((data.views / totalViews) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-600 dark:text-slate-400">Watch Time:</span>
                            <span className="font-bold text-slate-800 dark:text-white">
                                {(data.watchTime / 60).toFixed(0)}h
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-600 dark:text-slate-400">Revenue:</span>
                            <span className="font-bold text-slate-800 dark:text-white">
                                ₹{(data.revenue / 1000).toFixed(0)}K
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Custom Bar Chart Tooltip
    const CustomBarTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-white mb-2">{label}</p>
                    <div className="space-y-2">
                        {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
                                <span className="font-bold text-slate-800 dark:text-white">
                                    {entry.value.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Custom Pie Label
    const renderCustomLabel = (entry: any) => {
        const percentage = ((entry.views / totalViews) * 100).toFixed(0);
        return `${percentage}%`;
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <TrendingUp size={20} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                            Content Performance
                        </h3>
                    </div>
                    <p className="text-sm text-slate-500">
                        Views, watch time, and revenue by content type
                    </p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    <button
                        onClick={() => setViewMode('bar')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'bar'
                            ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        Bar Chart
                    </button>
                    <button
                        onClick={() => setViewMode('pie')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'pie'
                            ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        Pie Chart
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl"
                >
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                        <Eye size={16} />
                        <span className="text-xs font-semibold">Total Views</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                        {totalViews > 999999
                            ? (totalViews / 1000000).toFixed(1) + 'M'
                            : (totalViews / 1000).toFixed(0) + 'K'}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl"
                >
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                        <Clock size={16} />
                        <span className="text-xs font-semibold">Watch Time</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                        {(totalWatchTime / 60).toFixed(0)}h
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl"
                >
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                        <TrendingUp size={16} />
                        <span className="text-xs font-semibold">Revenue</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                        ₹{(totalRevenue / 1000).toFixed(0)}K
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
                {viewMode === 'pie' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="views"
                                    nameKey="label"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    label={renderCustomLabel}
                                    labelLine={false}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Legend with detailed stats */}
                        <div className="flex flex-col justify-center space-y-3">
                            {data.map((item, index) => {
                                const Icon = getContentIcon(item.contentType);
                                const percentage = ((item.views / totalViews) * 100).toFixed(1);

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: item.color + '20' }}
                                            >
                                                <Icon size={20} style={{ color: item.color }} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">
                                                    {item.label}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {item.totalContent} items • ⭐ {item.avgRating.toFixed(1)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-800 dark:text-white">
                                                {percentage}%
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {item.views.toLocaleString()} views
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                            <XAxis
                                dataKey="label"
                                stroke="#64748b"
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomBarTooltip />} />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                            />
                            <Bar
                                dataKey="views"
                                name="Views"
                                radius={[8, 8, 0, 0]}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </motion.div>

            {/* Content Type Breakdown Table */}
            <div className="mt-6 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                Content Type
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                Views
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                Watch Time
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                Revenue
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                Avg Rating
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => {
                            const Icon = getContentIcon(item.contentType);
                            return (
                                <tr
                                    key={index}
                                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: item.color + '20' }}
                                            >
                                                <Icon size={16} style={{ color: item.color }} />
                                            </div>
                                            <span className="font-semibold text-slate-800 dark:text-white">
                                                {item.label}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-white">
                                        {item.views.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-white">
                                        {(item.watchTime / 60).toFixed(0)}h
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-white">
                                        ₹{(item.revenue / 1000).toFixed(1)}K
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <span className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-white">
                                            {item.avgRating.toFixed(1)}
                                            <span className="text-yellow-500">⭐</span>
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContentPerformanceChart;
