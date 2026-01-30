// ═══════════════════════════════════════════════════════════════
// 🔔 NOTIFICATION BELL - USER COMPONENT
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import NotificationPanel from './NotificationPanel';
import type { UserNotification } from '../../types/notification';

const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!auth.currentUser) return;

        // Real-time listener for user notifications
        const notificationsRef = collection(db, 'userNotifications', auth.currentUser.uid, 'notifications');
        const q = query(
            notificationsRef,
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as UserNotification[];

            setNotifications(notifs);

            // Count unread
            const unread = notifs.filter((n) => !n.isRead).length;
            setUnreadCount(unread);
        });

        return () => unsubscribe();
    }, []);

    return (
        <>
            {/* Bell Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200"
            >
                <Bell size={24} className="text-gray-700" />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.div>
                )}

                {/* Pulse animation for new notifications */}
                {unreadCount > 0 && (
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full"
                    />
                )}
            </motion.button>

            {/* Notification Panel */}
            <AnimatePresence>
                {isOpen && (
                    <NotificationPanel
                        notifications={notifications}
                        onClose={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default NotificationBell;
