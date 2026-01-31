// ═══════════════════════════════════════════════════════════════
// 🔔 NOTIFICATION TOAST - REAL-TIME POPUP NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import { logNotificationAction } from "../../utils/activityLogger";
import type { UserNotification } from "../../types/notification";

interface ToastNotification extends UserNotification {
  showTime: number;
  isSilent?: boolean;
}

const getTimestamp = (date: Date | Timestamp | undefined | null): number => {
  if (!date) return Date.now();
  if (date instanceof Date) return date.getTime();
  if (date instanceof Timestamp) return date.toDate().getTime();
  // Fallback for edge cases
  return Date.now();
};

const NotificationToast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const notificationsRef = collection(
      db,
      "userNotifications",
      auth.currentUser.uid,
      "notifications",
    );
    const q = query(
      notificationsRef,
      orderBy("createdAt", "desc"),
      limit(5), // Listen to last 5 for better detection
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Skip initial load
        if (isFirstLoad.current) {
          isFirstLoad.current = false;
          return;
        }

        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const notification = {
              id: change.doc.id,
              ...change.doc.data(),
              showTime: Date.now(),
            } as ToastNotification;

            // Only show if not silent, not read, and created recently (within 10 seconds)
            const now = Date.now();
            const createdAt = getTimestamp(notification.createdAt);
            const isRecent = now - createdAt < 10000; // 10 seconds

            if (!notification.isSilent && !notification.isRead && isRecent) {
              setToasts((prev) => {
                // Prevent duplicates
                if (prev.some((t) => t.id === notification.id)) {
                  return prev;
                }
                return [...prev, notification];
              });

              // Play sound
              playNotificationSound();

              // ✅ Log toast displayed
              logNotificationAction(
                "notification_toast_displayed",
                "success",
                `Toast notification displayed: ${notification.title}`,
                auth.currentUser,
                {
                  notificationId: notification.id,
                  notificationType: notification.type,
                  notificationTitle: notification.title,
                  priority: notification.priority || "medium",
                },
              );

              // Auto-remove after 5 seconds
              setTimeout(() => {
                removeToast(notification.id);
              }, 5000);
            }
          }
        });
      },
      (error) => {
        console.error("❌ Toast listener error:", error);
      },
    );

    return () => unsubscribe();
  }, []);

  const playNotificationSound = () => {
    try {
      const audio = new Audio("/notification-sound.mp3");
      audio.volume = 0.3;
      audio.play().catch((error) => {
        console.log("Sound play failed (user interaction required):", error);
      });
    } catch (error) {
      console.log("Sound initialization failed:", error);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));

    // ✅ Log toast dismissed (auto or manual)
    logNotificationAction(
      "notification_toast_dismissed",
      "success",
      `Toast notification dismissed`,
      auth.currentUser,
      {
        notificationId: id,
      },
    );
  };

  // ✅ Handle toast click
  const handleToastClick = async (notification: ToastNotification) => {
    if (!auth.currentUser) return;

    // Mark as read
    try {
      const notifRef = doc(
        db,
        "userNotifications",
        auth.currentUser.uid,
        "notifications",
        notification.id,
      );
      await updateDoc(notifRef, {
        isRead: true,
        readAt: Timestamp.now(),
      });

      // ✅ Log toast clicked
      await logNotificationAction(
        "notification_toast_clicked",
        "success",
        `Clicked toast notification: ${notification.title}`,
        auth.currentUser,
        {
          notificationId: notification.id,
          notificationType: notification.type,
          notificationTitle: notification.title,
          actionUrl: notification.actionUrl,
          hasAction: !!notification.actionUrl,
        },
      );

      // Navigate if action URL exists
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
    } catch (error) {
      console.error("Error marking toast as read:", error);

      await logNotificationAction(
        "notification_toast_click_failed",
        "failed",
        `Failed to process toast click`,
        auth.currentUser,
        {
          notificationId: notification.id,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      );
    }

    removeToast(notification.id);
  };

  // ✅ Handle manual dismiss
  const handleDismiss = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    // ✅ Log manual dismissal
    await logNotificationAction(
      "notification_toast_manually_dismissed",
      "success",
      `Manually dismissed toast notification`,
      auth.currentUser,
      {
        notificationId: id,
      },
    );

    removeToast(id);
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      new_content: "🎬",
      subscription: "💳",
      payment: "💰",
      promotion: "🎁",
      system: "⚙️",
      content_update: "🔄",
      event: "🎪",
      reminder: "⏰",
      announcement: "📢",
    };
    return icons[type] || "🔔";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: "from-red-500 to-pink-600",
      high: "from-orange-500 to-amber-600",
      medium: "from-blue-500 to-cyan-600",
      low: "from-gray-500 to-slate-600",
    };
    return colors[priority] || "from-blue-500 to-cyan-600";
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -50, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: index * 110, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="pointer-events-auto mb-4"
          >
            <div
              onClick={() => handleToastClick(toast)}
              className={`w-[380px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden cursor-pointer hover:shadow-3xl transition-all ${
                toast.actionUrl ? "hover:scale-[1.02]" : ""
              }`}
            >
              {/* Header with gradient */}
              <div
                className={`bg-gradient-to-r ${getPriorityColor(toast.priority)} p-4 text-white relative overflow-hidden`}
              >
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
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-lg">
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
                    onClick={(e) => handleDismiss(e, toast.id)}
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
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Action Button */}
              {toast.actionUrl && toast.actionLabel && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex items-center justify-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                    <span>{toast.actionLabel}</span>
                    <ExternalLink size={14} />
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
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
