// ═══════════════════════════════════════════════════════════════
// 📊 ANALYTICS TAB - FIXED WITH REAL DATA
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, MousePointerClick, RefreshCw, Send, CheckCircle, Eye, Lightbulb } from 'lucide-react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import type { Notification } from '../../../types/notification';

interface Stats {
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalClicked: number;
    deliveryRate: number;
    readRate: number;
    clickRate: number;
}

const AnalyticsTab: React.FC = () => {
    const [stats, setStats] = useState<Stats>({
        totalSent: 0,
        totalDelivered: 0,
        totalRead: 0,
        totalClicked: 0,
        deliveryRate: 0,
        readRate: 0,
        clickRate: 0,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    // ✅ FIXED: Calculate stats from actual Firestore data
    const fetchStats = async () => {
        try {
            setLoading(true);

            // Fetch all notifications
            const notificationsRef = collection(db, 'notifications');
            const q = query(notificationsRef);
            const snapshot = await getDocs(q);

            let totalSent = 0;
            let totalDelivered = 0;
            let totalRead = 0;
            let totalClicked = 0;

            snapshot.forEach((doc) => {
                const notification = doc.data() as Notification;

                // Count sent notifications
                if (notification.status === 'sent') {
                    totalSent++;
                }

                // Sum up delivered count
                totalDelivered += notification.deliveredCount || 0;

                // Sum up read count
                totalRead += notification.readCount || 0;

                // Sum up click count
                totalClicked += notification.clickCount || 0;
            });

            // Calculate rates
            const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
            const readRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;
            const clickRate = totalRead > 0 ? (totalClicked / totalRead) * 100 : 0;

            setStats({
                totalSent,
                totalDelivered,
                totalRead,
                totalClicked,
                deliveryRate,
                readRate,
                clickRate,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <div className="py-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-black text-gray-900">
                        📊 Notification Analytics
                    </h3>
                    <p className="text-gray-500 mt-1">
                        Track performance and engagement metrics
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchStats}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </motion.button>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Sent */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Send size={24} className="text-blue-600" />
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm font-semibold mb-2">
                        Total Sent
                    </p>
                    <p className="text-4xl font-black text-gray-900">
                        {formatNumber(stats.totalSent)}
                    </p>
                </motion.div>

                {/* Delivered */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm font-semibold mb-2">
                        Delivered
                    </p>
                    <p className="text-4xl font-black text-gray-900">
                        {formatNumber(stats.totalDelivered)}
                    </p>
                </motion.div>

                {/* Read */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Eye size={24} className="text-purple-600" />
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm font-semibold mb-2">
                        Read
                    </p>
                    <p className="text-4xl font-black text-gray-900">
                        {formatNumber(stats.totalRead)}
                    </p>
                </motion.div>

                {/* Clicked */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <MousePointerClick size={24} className="text-orange-600" />
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm font-semibold mb-2">
                        Clicked
                    </p>
                    <p className="text-4xl font-black text-gray-900">
                        {formatNumber(stats.totalClicked)}
                    </p>
                </motion.div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Delivery Rate */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle size={20} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">
                                Delivery Rate
                            </h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="text-center">
                            <div className="text-5xl font-black text-green-600 mb-2">
                                {stats.deliveryRate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-500">
                                {stats.totalDelivered} of {stats.totalSent} delivered
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.deliveryRate}%` }}
                                transition={{ duration: 1, delay: 0.6 }}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                            />
                        </div>
                        {/* Status */}
                        <div className="flex items-center justify-center gap-2 text-sm">
                            {stats.deliveryRate >= 90 ? (
                                <>
                                    <TrendingUp size={16} className="text-green-500" />
                                    <span className="text-green-600 font-bold">
                                        Excellent
                                    </span>
                                </>
                            ) : stats.deliveryRate >= 70 ? (
                                <>
                                    <TrendingUp size={16} className="text-blue-500" />
                                    <span className="text-blue-600 font-bold">
                                        Good
                                    </span>
                                </>
                            ) : (
                                <>
                                    <TrendingDown size={16} className="text-orange-500" />
                                    <span className="text-orange-600 font-bold">
                                        Needs Improvement
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Read Rate */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Eye size={20} className="text-purple-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">
                                Read Rate
                            </h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="text-center">
                            <div className="text-5xl font-black text-purple-600 mb-2">
                                {stats.readRate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-500">
                                {stats.totalRead} of {stats.totalDelivered} read
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.readRate}%` }}
                                transition={{ duration: 1, delay: 0.7 }}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                            />
                        </div>
                        {/* Status */}
                        <div className="flex items-center justify-center gap-2 text-sm">
                            {stats.readRate >= 60 ? (
                                <>
                                    <TrendingUp size={16} className="text-purple-500" />
                                    <span className="text-purple-600 font-bold">
                                        Excellent
                                    </span>
                                </>
                            ) : stats.readRate >= 40 ? (
                                <>
                                    <TrendingUp size={16} className="text-blue-500" />
                                    <span className="text-blue-600 font-bold">
                                        Good
                                    </span>
                                </>
                            ) : (
                                <>
                                    <TrendingDown size={16} className="text-orange-500" />
                                    <span className="text-orange-600 font-bold">
                                        Needs Improvement
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Click Rate */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                <MousePointerClick size={20} className="text-orange-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">
                                Click Rate
                            </h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="text-center">
                            <div className="text-5xl font-black text-orange-600 mb-2">
                                {stats.clickRate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-500">
                                {stats.totalClicked} of {stats.totalRead} clicked
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.clickRate}%` }}
                                transition={{ duration: 1, delay: 0.8 }}
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
                            />
                        </div>
                        {/* Status */}
                        <div className="flex items-center justify-center gap-2 text-sm">
                            {stats.clickRate >= 30 ? (
                                <>
                                    <TrendingUp size={16} className="text-orange-500" />
                                    <span className="text-orange-600 font-bold">
                                        Excellent
                                    </span>
                                </>
                            ) : stats.clickRate >= 15 ? (
                                <>
                                    <TrendingUp size={16} className="text-blue-500" />
                                    <span className="text-blue-600 font-bold">
                                        Good
                                    </span>
                                </>
                            ) : (
                                <>
                                    <TrendingDown size={16} className="text-red-500" />
                                    <span className="text-red-600 font-bold">
                                        Needs Improvement
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tips */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            >
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <Lightbulb size={20} className="text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">
                            Performance Tips
                        </h3>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={20} className="text-green-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">
                                High Delivery Rate ({stats.deliveryRate.toFixed(0)}%)
                            </h4>
                            <p className="text-sm text-gray-600">
                                Your notifications are reaching users successfully!
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Eye size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">
                                Improve Read Rate
                            </h4>
                            <p className="text-sm text-gray-600">
                                Try using more engaging titles and send at optimal times (evenings work best).
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <MousePointerClick size={20} className="text-orange-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">
                                Boost Click Rate
                            </h4>
                            <p className="text-sm text-gray-600">
                                Add clear call-to-action buttons and use compelling images.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Empty State */}
            {stats.totalSent === 0 && !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-50 rounded-2xl p-12 text-center"
                >
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No Data Yet
                    </h3>
                    <p className="text-gray-600">
                        Send your first notification to see analytics
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default AnalyticsTab;
