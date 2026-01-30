// ═══════════════════════════════════════════════════════════════
// 🔔 NOTIFICATION TOAST - FIXED (No Router Required)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import type { UserNotification } from '../../types/notification';

interface ToastNotification extends UserNotification {
    showTime: number;
    isSilent?: boolean;
}

const NotificationToast: React.FC = () => {
    // ✅ FIXED: Removed useNavigate
    const [toasts, setToasts] = useState<ToastNotification[]>([]);

    useEffect(() => {
        if (!auth.currentUser) return;

        const notificationsRef = collection(db, 'userNotifications', auth.currentUser.uid, 'notifications');
        const q = query(
            notificationsRef,
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        let isFirstLoad = true;

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (isFirstLoad) {
                isFirstLoad = false;
                return;
            }

            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const notification = {
                        id: change.doc.id,
                        ...change.doc.data(),
                        showTime: Date.now(),
                    } as ToastNotification;

                    if (!notification.isSilent && !notification.isRead) {
                        setToasts((prev) => {
                            if (prev.some(t => t.id === notification.id)) {
                                return prev;
                            }
                            return [...prev, notification];
                        });

                        playNotificationSound();

                        setTimeout(() => {
                            removeToast(notification.id);
                        }, 5000);
                    }
                }
            });
        });

        return () => unsubscribe();
    }, []);

    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notification-sound.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => { });
        } catch (error) { }
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    // ✅ FIXED: Use window.location instead of navigate
    const handleToastClick = (notification: ToastNotification) => {
        if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        }
        removeToast(notification.id);
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

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            urgent: 'from-red-500 to-pink-600',
            high: 'from-orange-500 to-amber-600',
            medium: 'from-blue-500 to-cyan-600',
            low: 'from-gray-500 to-slate-600',
        };
        return colors[priority] || 'from-blue-500 to-cyan-600';
    };

    return (
        <div className="fixed top-4 right-4 z-50 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast, index) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: -50, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: index * 110, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="pointer-events-auto mb-4"
                    >
                        <div
                            onClick={() => handleToastClick(toast)}
                            className={`w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden cursor-pointer hover:shadow-3xl transition-all ${toast.actionUrl ? 'hover:scale-[1.02]' : ''
                                }`}
                        >
                            {/* Header with gradient */}
                            <div className={`bg-gradient-to-r ${getPriorityColor(toast.priority)} p-4 text-white relative overflow-hidden`}>
                                {/* Animated background */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 90, 0],
                                    }}
                                    transition={{
                                        duration: 10,
                                        repeat: Infinity,
                                    }}
                                    className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                                />

                                <div className="relative z-10 flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                                            {getTypeIcon(toast.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-sm mb-1 line-clamp-1">
                                                {toast.title}
                                            </h4>
                                            <p className="text-white/90 text-xs line-clamp-2">
                                                {toast.message}
                                            </p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeToast(toast.id);
                                        }}
                                        className="w-7 h-7 bg-white/20 backdrop-blur-xl rounded-lg hover:bg-white/30 transition-all flex items-center justify-center flex-shrink-0 ml-2"
                                    >
                                        <X size={14} />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Image (if exists) */}
                            {toast.imageUrl && (
                                <div className="relative">
                                    <img
                                        src={toast.imageUrl}
                                        alt=""
                                        className="w-full h-32 object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Action Button */}
                            {toast.actionUrl && toast.actionLabel && (
                                <div className="p-3 bg-gray-50 border-t border-gray-100">
                                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-blue-600">
                                        <span>{toast.actionLabel}</span>
                                        <ExternalLink size={14} />
                                    </div>
                                </div>
                            )}

                            {/* Progress Bar */}
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: 5, ease: 'linear' }}
                                className={`h-1 bg-gradient-to-r ${getPriorityColor(toast.priority)}`}
                            />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default NotificationToast;
