// ═══════════════════════════════════════════════════════════════
// 🔔 NOTIFICATION BELL - USER COMPONENT WITH ACTIVITY LOGGING
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
  doc,
  updateDoc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import NotificationPanel from "./NotificationPanel";
import type { UserNotification } from "../../types/notification";
import { logNotificationAction } from "../../utils/activityLogger";

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastOpenedAt, setLastOpenedAt] = useState<Date | null>(null);
  const previousUnreadCount = useRef(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Real-time listener for user notifications
    const notificationsRef = collection(
      db,
      "userNotifications",
      auth.currentUser.uid,
      "notifications",
    );
    const q = query(notificationsRef, orderBy("createdAt", "desc"), limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserNotification[];

      setNotifications(notifs);

      // Count unread
      const unread = notifs.filter((n) => !n.isRead).length;

      // ✅ Log when NEW notifications arrive (not on initial load)
      if (
        previousUnreadCount.current > 0 &&
        unread > previousUnreadCount.current
      ) {
        const newNotifCount = unread - previousUnreadCount.current;
        logNotificationAction(
          "notification_received",
          "success",
          `Received ${newNotifCount} new notification(s)`,
          auth.currentUser,
          {
            newNotifications: newNotifCount,
            totalUnread: unread,
            totalNotifications: notifs.length,
          },
        );
      }

      previousUnreadCount.current = unread;
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Handle opening/closing notification panel
  const handleTogglePanel = async () => {
    const wasOpen = isOpen;
    setIsOpen(!isOpen);

    if (!auth.currentUser) return;

    if (!wasOpen) {
      // ✅ Panel is being OPENED
      setLastOpenedAt(new Date());

      await logNotificationAction(
        "notification_panel_opened",
        "success",
        `Opened notification panel`,
        auth.currentUser,
        {
          unreadCount: unreadCount,
          totalNotifications: notifications.length,
          hasUnread: unreadCount > 0,
        },
      );
    } else {
      // ✅ Panel is being CLOSED
      if (lastOpenedAt) {
        const timeOpen = Math.round(
          (new Date().getTime() - lastOpenedAt.getTime()) / 1000,
        );

        await logNotificationAction(
          "notification_panel_closed",
          "success",
          `Closed notification panel after ${timeOpen}s`,
          auth.currentUser,
          {
            timeOpenSeconds: timeOpen,
            notificationsViewed: notifications.length,
            stillUnread: unreadCount,
          },
        );
      }
    }
  };

  // ✅ Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!auth.currentUser || unreadCount === 0) return;

    try {
      const batch = writeBatch(db);
      const unreadNotifs = notifications.filter((n) => !n.isRead);

      unreadNotifs.forEach((notif) => {
        const notifRef = doc(
          db,
          "userNotifications",
          auth.currentUser!.uid,
          "notifications",
          notif.id,
        );
        batch.update(notifRef, {
          isRead: true,
          readAt: Timestamp.now(),
        });
      });

      await batch.commit();

      // ✅ Log mark all as read
      await logNotificationAction(
        "notifications_marked_all_read",
        "success",
        `Marked ${unreadCount} notification(s) as read`,
        auth.currentUser,
        {
          markedCount: unreadCount,
          notificationIds: unreadNotifs.map((n) => n.id),
        },
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);

      // ✅ Log error
      await logNotificationAction(
        "notifications_mark_all_read_failed",
        "failed",
        `Failed to mark notifications as read`,
        auth.currentUser,
        {
          error: error instanceof Error ? error.message : "Unknown error",
          attemptedCount: unreadCount,
        },
      );
    }
  };

  // ✅ Mark single notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    if (!auth.currentUser) return;

    try {
      const notifRef = doc(
        db,
        "userNotifications",
        auth.currentUser.uid,
        "notifications",
        notificationId,
      );

      await updateDoc(notifRef, {
        isRead: true,
        readAt: Timestamp.now(),
      });

      const notification = notifications.find((n) => n.id === notificationId);

      // ✅ Log single mark as read
      await logNotificationAction(
        "notification_marked_read",
        "success",
        `Marked notification as read: ${notification?.title || "Unknown"}`,
        auth.currentUser,
        {
          notificationId: notificationId,
          notificationType: notification?.type,
          notificationTitle: notification?.title,
        },
      );
    } catch (error) {
      console.error("Error marking as read:", error);

      await logNotificationAction(
        "notification_mark_read_failed",
        "failed",
        `Failed to mark notification as read`,
        auth.currentUser,
        {
          notificationId: notificationId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      );
    }
  };

  // ✅ Handle notification click
  const handleNotificationClick = async (notification: UserNotification) => {
    if (!auth.currentUser) return;

    // Mark as read if unread
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    // ✅ Log notification interaction
    await logNotificationAction(
      "notification_clicked",
      "success",
      `Clicked on notification: ${notification.title}`,
      auth.currentUser,
      {
        notificationId: notification.id,
        notificationType: notification.type,
        notificationTitle: notification.title,
        wasUnread: !notification.isRead,
        actionUrl: notification.actionUrl,
      },
    );

    // Handle navigation if actionUrl exists
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  // ✅ Delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    if (!auth.currentUser) return;

    try {
      const notification = notifications.find((n) => n.id === notificationId);

      const notifRef = doc(
        db,
        "userNotifications",
        auth.currentUser.uid,
        "notifications",
        notificationId,
      );

      await updateDoc(notifRef, {
        deleted: true,
        deletedAt: Timestamp.now(),
      });

      // ✅ Log deletion
      await logNotificationAction(
        "notification_deleted",
        "success",
        `Deleted notification: ${notification?.title || "Unknown"}`,
        auth.currentUser,
        {
          notificationId: notificationId,
          notificationType: notification?.type,
          notificationTitle: notification?.title,
          wasUnread: !notification?.isRead,
        },
      );
    } catch (error) {
      console.error("Error deleting notification:", error);

      await logNotificationAction(
        "notification_delete_failed",
        "failed",
        `Failed to delete notification`,
        auth.currentUser,
        {
          notificationId: notificationId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      );
    }
  };

  return (
    <>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleTogglePanel}
        className="relative p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-slate-700"
      >
        <Bell size={24} className="text-gray-700 dark:text-gray-300" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
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
            onClose={handleTogglePanel}
            onMarkAllAsRead={handleMarkAllAsRead}
            onMarkAsRead={handleMarkAsRead}
            onNotificationClick={handleNotificationClick}
            onDeleteNotification={handleDeleteNotification}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationBell;
