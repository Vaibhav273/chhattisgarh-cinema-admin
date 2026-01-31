// ═══════════════════════════════════════════════════════════════
// 📜 NOTIFICATION HISTORY TAB - MODERN THEME (FIXED)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Bell,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
// ✅ FIXED: Import from firestore directly
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import type { Notification } from "../../../types/notification";
import { logNotificationAction, logError } from "../../../utils/activityLogger";

const NotificationHistoryTab: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotificationsList();
  }, [notifications, searchTerm, filterType, filterStatus]);

  // ✅ FIXED: Fetch notifications directly from Firestore
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notificationsRef = collection(db, "notifications");
      const q = query(notificationsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];

      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showToast("Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  const filterNotificationsList = () => {
    let filtered = [...notifications];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.message.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((n) => n.type === filterType);
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((n) => n.status === filterStatus);
    }

    setFilteredNotifications(filtered);
  };

  // ✅ FIXED: Delete with doc reference
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    // Find notification details before deleting
    const notification = notifications.find((n) => n.id === id);

    try {
      await deleteDoc(doc(db, "notifications", id));
      showToast("Notification deleted successfully", "success");
      fetchNotifications();

      // ✅ ADD LOGGING
      await logNotificationAction("delete", id, title, {
        type: notification?.type,
        target: notification?.target,
        status: notification?.status,
        message: notification?.message?.substring(0, 100),
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      showToast("Failed to delete notification", "error");

      // ✅ ADD ERROR LOGGING
      await logError("Notification History", "Failed to delete notification", {
        error,
        notificationId: id,
        title,
      });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      new_content:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      subscription:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      payment:
        "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      promotion:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
      system: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      content_update:
        "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
      event: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
      reminder:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
      announcement:
        "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
    };
    return (
      colors[type] ||
      "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
    );
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      sent: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      pending:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
      failed: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      scheduled:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    };
    return (
      colors[status] ||
      "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
    );
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ FIXED: Check for correct target types
  const getTargetLabel = (notification: Notification) => {
    if (notification.target === "free") return "Free Users";
    if (notification.target === "custom") return "Custom Users";
    if (notification.target === "individual") {
      const count = notification.targetUsers?.length || 0;
      return `${count} User${count !== 1 ? "s" : ""}`;
    }
    return "All Users";
  };

  return (
    <div className="py-6 space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-6 left-1/2 z-50"
          >
            <div
              className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 min-w-[300px] ${
                toast.type === "success" ? "bg-green-500" : "bg-red-500"
              } text-white`}
            >
              {toast.type === "success" ? (
                <CheckCircle size={24} />
              ) : (
                <XCircle size={24} />
              )}
              <p className="font-bold text-lg">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-slate-800">
            📜 Notification History
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View and manage all sent notifications
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchNotifications}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          Refresh
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white appearance-none"
            >
              <option value="all">All Types</option>
              <option value="new_content">New Content</option>
              <option value="subscription">Subscription</option>
              <option value="payment">Payment</option>
              <option value="promotion">Promotion</option>
              <option value="system">System</option>
              <option value="content_update">Content Update</option>
              <option value="event">Event</option>
              <option value="reminder">Reminder</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white appearance-none"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Showing{" "}
          <span className="font-bold text-slate-800 dark:text-white">
            {filteredNotifications.length}
          </span>{" "}
          of{" "}
          <span className="font-bold text-slate-800 dark:text-white">
            {notifications.length}
          </span>{" "}
          notifications
        </div>
      </div>

      {/* Notifications List */}
      {loading && notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          />
          <p className="text-slate-600 dark:text-slate-400 font-semibold mt-4">
            Loading notifications...
          </p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-12 text-center"
        >
          <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            No Notifications Found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {notifications.length === 0
              ? "Send your first notification to see it here"
              : "Try adjusting your filters"}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-slate-800 dark:text-white text-lg">
                        {notification.title}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${getTypeColor(notification.type)}`}
                      >
                        {notification.type.replace("_", " ").toUpperCase()}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(notification.status)}`}
                      >
                        {notification.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {notification.message}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Sent At
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {formatDate(
                          notification.sentAt || notification.createdAt,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Target
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {getTargetLabel(notification)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Read Count
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {notification.readCount || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Delivered
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {notification.deliveredCount || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleExpand(notification.id)}
                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all flex items-center gap-2"
                  >
                    {expandedId === notification.id ? (
                      <>
                        <ChevronUp size={16} />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        View Details
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      handleDelete(notification.id, notification.title)
                    }
                    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </motion.button>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedId === notification.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="p-6 space-y-4">
                      {notification.imageUrl && (
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Image
                          </p>
                          <img
                            src={notification.imageUrl}
                            alt="Notification"
                            className="w-full max-w-md h-48 object-cover rounded-xl"
                          />
                        </div>
                      )}

                      {notification.actionUrl && (
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Action URL
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-mono">
                            {notification.actionUrl}
                          </p>
                        </div>
                      )}

                      {notification.actionLabel && (
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Action Label
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {notification.actionLabel}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Priority
                        </p>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            notification.priority === "urgent"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                              : notification.priority === "high"
                                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                                : notification.priority === "medium"
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {/* ✅ FIXED: Safe access with fallback */}
                          {notification.priority?.toUpperCase() || "MEDIUM"}
                        </span>
                      </div>

                      {notification.createdByName && (
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Created By
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {notification.createdByName}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationHistoryTab;
