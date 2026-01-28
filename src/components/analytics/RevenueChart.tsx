import React from 'react';
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Line,
    ComposedChart,
} from 'recharts';
import { DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import type { AnalyticsDataPoint } from '../../types';

interface Props {
    data: AnalyticsDataPoint[];
    loading?: boolean;
}

const RevenueChart: React.FC<Props> = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const avgDailyRevenue = totalRevenue / data.length;
    const trend = data.length > 1
        ? ((data[data.length - 1].revenue - data[0].revenue) / data[0].revenue) * 100
        : 0;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const date = new Date(label);
            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-white mb-2">
                        {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-slate-600 dark:text-slate-400">Revenue:</span>
                            <span className="font-bold text-slate-800 dark:text-white">
                                ₹{payload[0]?.value.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-slate-600 dark:text-slate-400">Users:</span>
                            <span className="font-bold text-slate-800 dark:text-white">
                                {payload[1]?.value.toLocaleString()}
                            </span>
                        </div>
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
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <DollarSign size={20} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Revenue Analytics</h3>
                    </div>
                    <p className="text-sm text-slate-500">Daily revenue trends and payment analytics</p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                        <DollarSign size={16} />
                        <span className="text-xs font-semibold">Total Revenue</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                        ₹{(totalRevenue / 1000).toFixed(1)}K
                    </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                        <CreditCard size={16} />
                        <span className="text-xs font-semibold">Avg Daily</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                        ₹{avgDailyRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                        <TrendingUp size={16} />
                        <span className="text-xs font-semibold">Growth Trend</span>
                    </div>
                    <p className={`text-2xl font-black ${trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                    </p>
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={350}>
                <ComposedChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
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
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#64748b"
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    <Bar
                        yAxisId="left"
                        dataKey="revenue"
                        fill="url(#colorRevenue)"
                        radius={[8, 8, 0, 0]}
                        name="Revenue (₹)"
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="users"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        name="Paying Users"
                    />
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
                        </linearGradient>
                    </defs>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;
