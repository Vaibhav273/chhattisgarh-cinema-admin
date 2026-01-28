import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Plus,
  Send,
  Trash2,
  Users,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Mail,
  MessageSquare,
  Filter,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  orderBy,
  onSnapshot,
  where,
  writeBatch,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
interface Notification {
  id: string;
  title: string;
  message: string;
  type: "push" | "email" | "in-app";
  target: "all" | "premium" | "free" | "custom";
  status: "draft" | "scheduled" | "sent" | "failed";
  imageUrl?: string;
  scheduledFor?: Date;
  sentAt?: Date;
  totalRecipients: number;
  delivered: number;
  read: number;
  clicked: number;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationStats {
  totalNotifications: number;
  sentNotifications: number;
  draftNotifications: number;
  scheduledNotifications: number;
  totalRecipients: number;
  totalDelivered: number;
  totalRead: number;
  averageReadRate: number;
}

interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  isVisible: boolean;
  onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 TOAST NOTIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle,
    warning: AlertCircle,
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        exit={{ opacity: 0, y: -50, x: "-50%" }}
        className="fixed top-6 left-1/2 z-50"
      >
        <div
          className={`${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 min-w-[300px]`}
        >
          <Icon size={24} />
          <p className="font-bold text-lg">{message}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: 'danger' | 'warning' | 'success';
  loading?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  type = 'danger',
  loading = false,
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: {
      bg: 'from-red-500 to-pink-600',
      button: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      bg: 'from-orange-500 to-amber-600',
      button: 'bg-orange-500 hover:bg-orange-600',
    },
    success: {
      bg: 'from-green-500 to-emerald-600',
      button: 'bg-green-500 hover:bg-green-600',
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          {/* Header with Gradient */}
          <div className={`bg-gradient-to-r ${colors[type].bg} p-6 text-white relative overflow-hidden`}>
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute inset-0 bg-white/10 rounded-full blur-3xl"
            />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black">{title}</h3>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-6 py-3 ${colors[type].button} text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


// ═══════════════════════════════════════════════════════════════════════════════
// 📋 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const NotificationsManagement: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);

  const [stats, setStats] = useState<NotificationStats>({
    totalNotifications: 0,
    sentNotifications: 0,
    draftNotifications: 0,
    scheduledNotifications: 0,
    totalRecipients: 0,
    totalDelivered: 0,
    totalRead: 0,
    averageReadRate: 0,
  });

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modal states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  // Toast
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [notifications, statusFilter, typeFilter]);

  useEffect(() => {
    console.log("🔔 Setting up real-time notification listener...");

    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsList: Notification[] = [];
        let sentCount = 0;
        let draftCount = 0;
        let scheduledCount = 0;
        let totalRecipients = 0;
        let totalDelivered = 0;
        let totalRead = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          const notification: Notification = {
            id: doc.id,
            title: data.title || "",
            message: data.message || "",
            type: data.type || "push",
            target: data.target || "all",
            status: data.status || "draft",
            scheduledFor: data.scheduledFor?.toDate(),
            sentAt: data.sentAt?.toDate(),
            totalRecipients: data.totalRecipients || 0,
            delivered: data.delivered || 0,
            read: data.read || 0,
            clicked: data.clicked || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          };

          notificationsList.push(notification);

          if (notification.status === "sent") sentCount++;
          else if (notification.status === "draft") draftCount++;
          else if (notification.status === "scheduled") scheduledCount++;

          totalRecipients += notification.totalRecipients;
          totalDelivered += notification.delivered;
          totalRead += notification.read;
        });

        const averageReadRate =
          totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;

        setStats({
          totalNotifications: notificationsList.length,
          sentNotifications: sentCount,
          draftNotifications: draftCount,
          scheduledNotifications: scheduledCount,
          totalRecipients,
          totalDelivered,
          totalRead,
          averageReadRate,
        });

        setNotifications(notificationsList);
        console.log("✅ Notifications updated:", notificationsList.length);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Error listening to notifications:", error);
        showToast("Failed to load notifications", "error");
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      console.log("🔌 Cleaning up notification listener");
      unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log("Fetching notifications...");

      const notificationsQuery = query(
        collection(db, "notifications"),
        orderBy("createdAt", "desc"),
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);

      const notificationsList: Notification[] = [];
      let sentCount = 0;
      let draftCount = 0;
      let scheduledCount = 0;
      let totalRecipients = 0;
      let totalDelivered = 0;
      let totalRead = 0;

      notificationsSnapshot.forEach((doc) => {
        const data = doc.data();
        const notification: Notification = {
          id: doc.id,
          title: data.title || "",
          message: data.message || "",
          type: data.type || "push",
          target: data.target || "all",
          status: data.status || "draft",
          scheduledFor: data.scheduledFor?.toDate(),
          sentAt: data.sentAt?.toDate(),
          totalRecipients: data.totalRecipients || 0,
          delivered: data.delivered || 0,
          read: data.read || 0,
          clicked: data.clicked || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };

        notificationsList.push(notification);

        if (notification.status === "sent") sentCount++;
        else if (notification.status === "draft") draftCount++;
        else if (notification.status === "scheduled") scheduledCount++;

        totalRecipients += notification.totalRecipients;
        totalDelivered += notification.delivered;
        totalRead += notification.read;
      });

      const averageReadRate =
        totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;

      setStats({
        totalNotifications: notificationsList.length,
        sentNotifications: sentCount,
        draftNotifications: draftCount,
        scheduledNotifications: scheduledCount,
        totalRecipients,
        totalDelivered,
        totalRead,
        averageReadRate,
      });

      setNotifications(notificationsList);
      console.log("✅ Notifications fetched successfully");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showToast("Failed to load notifications", "error");
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    if (statusFilter !== "all") {
      filtered = filtered.filter((notif) => notif.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((notif) => notif.type === typeFilter);
    }

    setFilteredNotifications(filtered);
  };

  useEffect(() => {
    const checkScheduled = setInterval(() => {
      const now = new Date();
      console.log("⏰ Checking for scheduled notifications...");

      notifications.forEach(async (notification) => {
        if (
          notification.status === "scheduled" &&
          notification.scheduledFor &&
          notification.scheduledFor <= now
        ) {
          console.log(`📤 Auto-sending scheduled notification: ${notification.title}`);
          await handleSend(notification, true);
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(checkScheduled);
  }, [notifications]);

  // Alert Modal State
  const [deleteModal, setDeleteModal] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning",
  ) => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  const handleDeleteNotification = async () => {
    if (!deleteModal) return;

    try {
      setIsDeleting(true);
      console.log("🗑️ Starting delete process for:", deleteModal.id);

      await deleteDoc(doc(db, "notifications", deleteModal.id));
      console.log("✅ Notification deleted from database");

      // 🔥 CREATE SYSTEM LOG
      const currentUser = auth.currentUser;
      if (currentUser) {
        const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));

        if (adminDoc.exists()) {
          const adminData = adminDoc.data();

          await addDoc(collection(db, "systemLogs"), {
            action: "notification_deleted",
            module: "Marketing",
            subModule: "Notifications",
            performedBy: {
              uid: currentUser.uid,
              email: currentUser.email || "",
              name: adminData?.name || currentUser.displayName || "Admin",
              role: adminData?.role || "admin",
            },
            details: {
              notificationId: deleteModal.id,
              title: deleteModal.title,
              deletedAt: new Date().toISOString(),
            },
            timestamp: Timestamp.now(),
            userAgent: navigator.userAgent,
            status: "success",
          });

          console.log("✅✅ System log created!");
        }
      }

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== deleteModal.id)
      );

      showToast("Notification deleted successfully", "success");
      setDeleteModal(null);  // ✅ Close modal
      setIsDeleting(false);

    } catch (error: any) {
      console.error("❌ Error deleting notification:", error);
      showToast(error.message || "Failed to delete notification", "error");
      setIsDeleting(false);
    }
  };


  const handleSend = async (notification: Notification, auto: boolean = false) => {
    if (
      !auto &&
      !window.confirm(
        `Send notification "${notification.title}" to ${notification.target} users?`
      )
    ) {
      return;
    }

    try {
      console.log(`📤 Sending notification: ${notification.title}`);

      // Send to actual users
      const userCount = await sendNotificationToUsers(notification);

      // Update status to sent
      await updateDoc(doc(db, "notifications", notification.id), {
        status: "sent",
        sentAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        delivered: userCount,
      });

      showToast(
        auto
          ? `Scheduled notification sent to ${userCount} users`
          : "Notification sent successfully",
        "success"
      );
    } catch (error) {
      console.error("❌ Error sending notification:", error);

      // Mark as failed
      await updateDoc(doc(db, "notifications", notification.id), {
        status: "failed",
        updatedAt: Timestamp.now(),
      });

      showToast("Failed to send notification", "error");
    }
  };

  const sendNotificationToUsers = async (notification: Notification): Promise<number> => {
    try {
      // Get target users based on notification target
      const usersQuery = getUsersQuery(notification.target);
      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        console.log("⚠️ No users found for target:", notification.target);
        return 0;
      }

      const batch = writeBatch(db);
      let count = 0;

      // Create individual user notifications
      usersSnapshot.forEach((userDoc) => {
        const userNotifRef = doc(collection(db, "userNotifications"));
        batch.set(userNotifRef, {
          userId: userDoc.id,
          notificationId: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: false,
          clicked: false,
          createdAt: Timestamp.now(),
        });
        count++;
      });

      await batch.commit();
      console.log(`✅ Sent to ${count} users`);
      return count;
    } catch (error) {
      console.error("❌ Error sending to users:", error);
      throw error;
    }
  };

  // 🔥 ADD: Get users query based on target
  const getUsersQuery = (target: string) => {
    let q;
    switch (target) {
      case "premium":
        q = query(collection(db, "users"), where("isPremium", "==", true));
        break;
      case "free":
        q = query(collection(db, "users"), where("isPremium", "==", false));
        break;
      case "all":
      default:
        q = query(collection(db, "users"));
        break;
    }
    return q;
  };

  // 🔥 ADD: Mark all as read
  const handleMarkAsRead = async (notification: Notification) => {
    try {
      console.log("📖 Marking notification as read:", notification.id);

      // Update all user notifications for this notification to read
      const q = query(
        collection(db, "userNotifications"),
        where("notificationId", "==", notification.id),
        where("read", "==", false)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        showToast("All notifications already marked as read", "info");
        console.log("ℹ️ No unread notifications found");
        return;
      }

      console.log(`📖 Marking ${snapshot.size} user notifications as read...`);

      const batch = writeBatch(db);

      snapshot.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
          readAt: Timestamp.now()
        });
      });

      await batch.commit();

      // Update main notification stats
      await updateDoc(doc(db, "notifications", notification.id), {
        read: notification.delivered, // Assume all delivered were read
        updatedAt: Timestamp.now(),
      });

      showToast(`✅ Marked ${snapshot.size} notifications as read`, "success");
      console.log(`✅ Successfully marked ${snapshot.size} as read`);
    } catch (error: any) {
      console.error("❌ Error marking as read:", error);
      showToast(error.message || "Failed to mark as read", "error");
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (date?: Date): string => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400",
      scheduled:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      sent: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      failed: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      push: Bell,
      email: Mail,
      "in-app": MessageSquare,
    };
    return icons[type as keyof typeof icons] || Bell;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-600 dark:text-slate-400 font-semibold">
          Loading notifications...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pb-8">
      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={deleteModal !== null}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDeleteNotification}
        title="Delete Notification"
        message={`Are you sure you want to delete "${deleteModal?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={isDeleting}
      />

      <div className="space-y-6 w-full">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                  <Bell size={32} />
                </div>
                <div>
                  <h1 className="text-4xl font-black mb-2">
                    Notifications Management
                  </h1>
                  <p className="text-white/90 text-lg flex items-center gap-2">
                    Send and manage notifications • Real-time updates
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-green-400 rounded-full"
                    />
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchNotifications}
                  className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                >
                  <RefreshCw size={20} />
                  Refresh
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/admin/marketing/notifications/new")}
                  className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create Notification
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Bell
                  size={24}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Total Notifications
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {stats.totalNotifications}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sent: {stats.sentNotifications} • Draft:{" "}
              {stats.draftNotifications}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Total Recipients
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {formatNumber(stats.totalRecipients)}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
              Across all notifications
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle
                  size={24}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Total Delivered
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {formatNumber(stats.totalDelivered)}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 font-bold">
              Successfully delivered
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Eye
                  size={24}
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Average Read Rate
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {stats.averageReadRate.toFixed(1)}%
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400 font-bold">
              {formatNumber(stats.totalRead)} total reads
            </p>
          </motion.div>
        </div>

        {/* FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter
                  size={20}
                  className="text-slate-600 dark:text-slate-400"
                />
                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                  Filters
                </h3>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="push">Push Notification</option>
                  <option value="email">Email</option>
                  <option value="in-app">In-App</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* NOTIFICATIONS TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-800 dark:text-white">
              All Notifications ({filteredNotifications.length})
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-sm text-green-600 dark:text-green-400 font-bold">
                Live Updates
              </p>
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell
                size={64}
                className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
              />
              <p className="text-xl font-bold text-slate-500 dark:text-slate-400 mb-2">
                No notifications found
              </p>
              <p className="text-slate-400 dark:text-slate-500 mb-4">
                Create your first notification to engage users
              </p>
              <button
                onClick={() => navigate("/admin/marketing/notifications/new")}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all"
              >
                Create Notification
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Notification
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Target
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Recipients
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Read Rate
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredNotifications.map((notification, index) => {
                    const TypeIcon = getTypeIcon(notification.type);
                    const readRate =
                      notification.delivered > 0
                        ? (notification.read / notification.delivered) * 100
                        : 0;

                    return (
                      <motion.tr
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.05 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {notification.imageUrl && (
                              <motion.img
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={notification.imageUrl}
                                alt={notification.title}
                                className="w-16 h-16 object-cover rounded-xl shadow-lg"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-bold text-slate-800 dark:text-white">
                                {notification.title}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md truncate">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <TypeIcon
                              size={16}
                              className="text-slate-600 dark:text-slate-400"
                            />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">
                              {notification.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold capitalize">
                            {notification.target}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getStatusColor(
                              notification.status,
                            )}`}
                          >
                            {notification.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 dark:text-white">
                            {formatNumber(notification.totalRecipients)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              {readRate.toFixed(1)}%
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {formatNumber(notification.read)} /{" "}
                              {formatNumber(notification.delivered)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(
                              notification.sentAt || notification.createdAt,
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedNotification(notification);
                                setIsPreviewOpen(true);
                              }}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                              title="Preview"
                            >
                              <Eye size={18} />
                            </button>
                            {notification.status === "draft" && (
                              <button
                                onClick={() => handleSend(notification)}
                                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all"
                                title="Send Now"
                              >
                                <Send size={18} />
                              </button>
                            )}
                            {notification.status === "sent" && (
                              <button
                                onClick={() => handleMarkAsRead(notification)}
                                className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-all"
                                title="Mark All Read"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteModal({ id: notification.id, title: notification.title })}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {isPreviewOpen && selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                    Notification Preview
                  </h2>
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <AlertCircle
                      size={24}
                      className="text-slate-600 dark:text-slate-400"
                    />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {selectedNotification.imageUrl && (
                  <div>
                    <img
                      src={selectedNotification.imageUrl}
                      alt={selectedNotification.title}
                      className="w-full h-64 object-cover rounded-2xl"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                    {selectedNotification.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedNotification.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Type
                    </p>
                    <p className="text-lg font-black text-slate-800 dark:text-white capitalize">
                      {selectedNotification.type}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Target
                    </p>
                    <p className="text-lg font-black text-slate-800 dark:text-white capitalize">
                      {selectedNotification.target}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Recipients
                    </p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                      {formatNumber(selectedNotification.totalRecipients)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Delivered
                    </p>
                    <p className="text-2xl font-black text-green-600 dark:text-green-400">
                      {formatNumber(selectedNotification.delivered)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Read
                    </p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {formatNumber(selectedNotification.read)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Status
                  </span>
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${getStatusColor(
                      selectedNotification.status,
                    )}`}
                  >
                    {selectedNotification.status}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsManagement;
