// ═══════════════════════════════════════════════════════════════
// 📋 NOTIFICATION PANEL - USER COMPONENT
// ═══════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Trash2, Eye, Bell } from 'lucide-react';
import { doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import type { UserNotification } from '../../types/notification';

interface NotificationPanelProps {
    notifications: UserNotification[];
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose }) => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filteredNotifications = filter === 'unread'
        ? notifications.filter((n) => !n.isRead)
        : notifications;

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // Mark as read
    const handleMarkAsRead = async (notificationId: string) => {
        if (!auth.currentUser) return;

        try {
            const notifRef = doc(db, 'userNotifications', auth.currentUser.uid, 'notifications', notificationId);
            await updateDoc(notifRef, {
                isRead: true,
                readAt: new Date(),
            });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // Mark all as read
    const handleMarkAllAsRead = async () => {
        if (!auth.currentUser) return;

        try {
            const batch = writeBatch(db);

            notifications
                .filter((n) => !n.isRead)
                .forEach((notification) => {
                    const notifRef = doc(db, 'userNotifications', auth.currentUser!.uid, 'notifications', notification.id);
                    batch.update(notifRef, {
                        isRead: true,
                        readAt: new Date(),
                    });
                });

            await batch.commit();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Delete notification
    const handleDelete = async (notificationId: string) => {
        if (!auth.currentUser) return;

        try {
            const notifRef = doc(db, 'userNotifications', auth.currentUser.uid, 'notifications', notificationId);
            await deleteDoc(notifRef);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // Handle notification click
    const handleNotificationClick = async (notification: UserNotification) => {
        // Mark as read
        if (!notification.isRead) {
            await handleMarkAsRead(notification.id);
        }

        // Navigate if action URL exists
        if (notification.actionUrl) {
            onClose();
            navigate(notification.actionUrl);
        }
    };

    const getTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            new_content: '🎬',
            subscription: '💳',
            payment: '💰',
            promotion: '🎁',
            system: '⚙️',
            content_update: '🔄',
            event: '🎪',
            reminder: '⏰',
            announcement: '📢',
        };
        return icons[type] || '🔔';
    };

    const formatDate = (date: any) => {
        if (!date) return '';
        const d = date.toDate ? date.toDate() : new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString();
    };

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                                🔔
                            </div>
                            <div>
                                <h2 className="text-2xl font-black">Notifications</h2>
                                <p className="text-white/80 text-sm">
                                    {unreadCount} unread
                                </p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-white/30 transition-all flex items-center justify-center"
                        >
                            <X size={20} />
                        </motion.button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${filter === 'all'
                                ? 'bg-white text-blue-600'
                                : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${filter === 'unread'
                                ? 'bg-white text-blue-600'
                                : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            Unread ({unreadCount})
                        </button>
                        {unreadCount > 0 && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleMarkAllAsRead}
                                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
                            >
                                <Check size={20} />
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Bell size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                            </h3>
                            <p className="text-gray-500 text-center">
                                {filter === 'unread'
                                    ? "You've read all your notifications"
                                    : "You'll see notifications here when they arrive"}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredNotifications.map((notification, index) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-4 hover:bg-gray-50 transition-all cursor-pointer ${!notification.isRead ? 'bg-blue-50/50' : ''
                                        }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl">
                                            {getTypeIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                                                    {notification.title}
                                                </h4>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                {notification.message}
                                            </p>

                                            {/* Image */}
                                            {notification.imageUrl && (
                                                <img
                                                    src={notification.imageUrl}
                                                    alt=""
                                                    className="w-full h-32 object-cover rounded-lg mb-2"
                                                />
                                            )}

                                            {/* Meta */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">
                                                    {formatDate(notification.createdAt)}
                                                </span>

                                                {/* Actions */}
                                                <div className="flex gap-1">
                                                    {!notification.isRead && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkAsRead(notification.id);
                                                            }}
                                                            className="p-1.5 hover:bg-white rounded-lg transition-all"
                                                            title="Mark as read"
                                                        >
                                                            <Eye size={14} className="text-gray-500" />
                                                        </motion.button>
                                                    )}
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(notification.id);
                                                        }}
                                                        className="p-1.5 hover:bg-white rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} className="text-red-500" />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default NotificationPanel;
