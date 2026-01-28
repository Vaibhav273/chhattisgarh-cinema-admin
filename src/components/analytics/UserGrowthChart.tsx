import React from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';
import { Users, UserPlus, TrendingUp } from 'lucide-react';
import type { AnalyticsDataPoint } from '../../types';

interface Props {
    data: AnalyticsDataPoint[];
    loading?: boolean;
}

const UserGrowthChart: React.FC<Props> = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const date = new Date(label);
            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-white mb-2">
                        {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
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
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <TrendingUp size={20} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">User Growth Analytics</h3>
                    </div>
                    <p className="text-sm text-slate-500">Total users, new signups, and active users over time</p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                        <Users size={16} />
                        <span className="text-xs font-semibold">Total Users</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                        {data[data.length - 1]?.users.toLocaleString() || 0}
                    </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                        <UserPlus size={16} />
                        <span className="text-xs font-semibold">New Users</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                        {data.reduce((sum, d) => sum + d.newUsers, 0).toLocaleString()}
                    </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                        <TrendingUp size={16} />
                        <span className="text-xs font-semibold">Active Users</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                        {data[data.length - 1]?.activeUsers.toLocaleString() || 0}
                    </p>
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
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
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                    />
                    <Area
                        type="monotone"
                        dataKey="users"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                        name="Total Users"
                    />
                    <Area
                        type="monotone"
                        dataKey="newUsers"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorNewUsers)"
                        name="New Users"
                    />
                    <Area
                        type="monotone"
                        dataKey="activeUsers"
                        stroke="#a855f7"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorActiveUsers)"
                        name="Active Users"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default UserGrowthChart;
