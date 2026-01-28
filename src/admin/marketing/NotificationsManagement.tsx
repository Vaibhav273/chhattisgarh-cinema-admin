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
  BarChart3,
  Activity,
  TrendingUp,
  Clock,
  Calendar,
  Award,
  EditIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
  orderBy,
  onSnapshot,
  where,
  writeBatch,
  limit,
  getDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";

// ═══════════════════════════════════════════════════════════════
// 📊 INTERFACES
// ═══════════════════════════════════════════════════════════════

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

interface SystemLog {
  id: string;
  action: string;
  module: string;
  subModule?: string;
  performedBy: {
    uid: string;
    email: string;
    name: string;
    role: string;
  };
  details: any;
  timestamp: Timestamp;
  userAgent?: string;
  status: string;
}

// ═══════════════════════════════════════════════════════════════
// 🎨 TOAST NOTIFICATION
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// 🚨 ALERT MODAL
// ═══════════════════════════════════════════════════════════════

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: "danger" | "warning" | "success";
  loading?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  type = "danger",
  loading = false,
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: {
      bg: "from-red-500 to-pink-600",
      button: "bg-red-500 hover:bg-red-600",
    },
    warning: {
      bg: "from-orange-500 to-amber-600",
      button: "bg-orange-500 hover:bg-orange-600",
    },
    success: {
      bg: "from-green-500 to-emerald-600",
      button: "bg-green-500 hover:bg-green-600",
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
          <div
            className={`bg-gradient-to-r ${colors[type].bg} p-6 text-white relative overflow-hidden`}
          >
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

          <div className="p-6">
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              {message}
            </p>
          </div>

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
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
// ═══════════════════════════════════════════════════════════════
// 📋 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const NotificationsManagement: React.FC = () => {
  const navigate = useNavigate();

  // ═══════════════════════════════════════════════════════════════
  // 📊 STATES
  // ═══════════════════════════════════════════════════════════════

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);

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

  // Tab state
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "logs">("overview");

  // System logs state
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Modal states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [sendModal, setSendModal] = useState<Notification | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Toast
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });

  // ═══════════════════════════════════════════════════════════════
  // 🔄 EFFECTS
  // ═══════════════════════════════════════════════════════════════

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [notifications, statusFilter, typeFilter]);

  // Real-time listener
  useEffect(() => {
    console.log("🔔 Setting up real-time notification listener...");

    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));

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
            imageUrl: data.imageUrl,
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

        const averageReadRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;

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

    return () => {
      console.log("🔌 Cleaning up notification listener");
      unsubscribe();
    };
  }, []);

  // Auto-send scheduled notifications
  useEffect(() => {
    const checkScheduled = setInterval(() => {
      const now = new Date();
      notifications.forEach(async (notification) => {
        if (
          notification.status === "scheduled" &&
          notification.scheduledFor &&
          notification.scheduledFor <= now
        ) {
          console.log(`⏰ Auto-sending scheduled notification: ${notification.title}`);
          // For auto-send, directly call without modal
          setSendModal(notification);
          await handleSend(true); // auto = true
        }
      });
    }, 60000);

    return () => clearInterval(checkScheduled);
  }, [notifications]);

  // ═══════════════════════════════════════════════════════════════
  // 🔧 HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════

  const showToast = (message: string, type: "success" | "error" | "info" | "warning") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
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
      scheduled: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
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

  // Log helper functions
  const formatLogTime = (timestamp: any) => {
    if (!timestamp) return "Just now";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getLogIcon = (action: string) => {
    if (action.includes("created") || action.includes("sent")) return "✨";
    if (action.includes("updated")) return "📝";
    if (action.includes("deleted")) return "🗑️";
    return "📋";
  };

  const getLogColor = (action: string) => {
    if (action.includes("created") || action.includes("sent"))
      return "text-green-500 bg-green-100 dark:bg-green-900/30";
    if (action.includes("updated")) return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
    if (action.includes("deleted")) return "text-red-500 bg-red-100 dark:bg-red-900/30";
    return "text-slate-500 bg-slate-100 dark:bg-slate-800/50";
  };

  // ═══════════════════════════════════════════════════════════════
  // 📋 FETCH SYSTEM LOGS
  // ═══════════════════════════════════════════════════════════════

  const fetchSystemLogs = async () => {
    try {
      setLoadingLogs(true);
      console.log("📋 Fetching notification logs...");

      const logsQuery = query(
        collection(db, "systemLogs"),
        where("module", "==", "Marketing"),
        orderBy("timestamp", "desc"),
        limit(20)
      );

      const logsSnapshot = await getDocs(logsQuery);

      const logs: SystemLog[] = logsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SystemLog[];

      console.log("✅ Notification logs fetched:", logs.length);
      setSystemLogs(logs);
      setLoadingLogs(false);
    } catch (error) {
      console.error("❌ Error fetching logs:", error);
      setLoadingLogs(false);
      setSystemLogs([]);
    }
  };

  useEffect(() => {
    if (activeTab !== "logs") return; // Only listen when on logs tab

    console.log("📋 Setting up real-time logs listener...");
    setLoadingLogs(true);

    const logsQuery = query(
      collection(db, "systemLogs"),
      where("module", "==", "Marketing"),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      logsQuery,
      (snapshot) => {
        const logs: SystemLog[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SystemLog[];

        console.log("✅ Logs updated in real-time:", logs.length);
        setSystemLogs(logs);
        setLoadingLogs(false);
      },
      (error) => {
        console.error("❌ Error listening to logs:", error);
        setLoadingLogs(false);
        setSystemLogs([]);
      }
    );

    return () => {
      console.log("🔌 Cleaning up logs listener");
      unsubscribe();
    };
  }, [activeTab]);

  // ═══════════════════════════════════════════════════════════════
  // 🗑️ DELETE NOTIFICATION
  // ═══════════════════════════════════════════════════════════════

  const handleDeleteNotification = async () => {
    if (!deleteModal) return;

    try {
      setIsDeleting(true);
      console.log("🗑️ Starting delete process for:", deleteModal.id);

      // Delete from Firestore
      await deleteDoc(doc(db, "notifications", deleteModal.id));
      console.log("✅ Notification deleted from database");

      // Create system log
      try {
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

            console.log("✅ System log created!");
          }
        }
      } catch (logError) {
        console.error("⚠️ Error creating log (non-critical):", logError);
        // Continue even if log fails
      }

      // Update UI - remove from local state
      setNotifications((prev) => prev.filter((n) => n.id !== deleteModal.id));
      setFilteredNotifications((prev) => prev.filter((n) => n.id !== deleteModal.id));

      // Refresh logs if on logs tab
      if (activeTab === "logs") {
        setTimeout(() => fetchSystemLogs(), 500);
      }

      showToast("Notification deleted successfully", "success");
      setDeleteModal(null);
      setIsDeleting(false);
    } catch (error: any) {
      console.error("❌ Error deleting notification:", error);
      showToast(error.message || "Failed to delete notification", "error");
      setIsDeleting(false);
    }
  };


  // ═══════════════════════════════════════════════════════════════
  // 📤 SEND NOTIFICATION
  // ═══════════════════════════════════════════════════════════════

  const handleSend = async (auto: boolean = false) => {
    if (!sendModal && !auto) return;

    const notification = sendModal!;

    try {
      setIsSending(true);
      console.log(`📤 Sending notification: ${notification.title}`);

      const userCount = await sendNotificationToUsers(notification);

      await updateDoc(doc(db, "notifications", notification.id), {
        status: "sent",
        sentAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        delivered: userCount,
      });

      // Create system log
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));

          if (adminDoc.exists()) {
            const adminData = adminDoc.data();

            await addDoc(collection(db, "systemLogs"), {
              action: "notification_sent",
              module: "Marketing",
              subModule: "Notifications",
              performedBy: {
                uid: currentUser.uid,
                email: currentUser.email || "",
                name: adminData?.name || currentUser.displayName || "Admin",
                role: adminData?.role || "admin",
              },
              details: {
                notificationId: notification.id,
                title: notification.title,
                recipients: userCount,
                target: notification.target,
                sentAt: new Date().toISOString(),
              },
              timestamp: Timestamp.now(),
              userAgent: navigator.userAgent,
              status: "success",
            });

            console.log("✅ System log created for send!");
          }
        }
      } catch (logError) {
        console.error("⚠️ Error creating log:", logError);
      }

      showToast(
        auto ? `Scheduled notification sent to ${userCount} users` : `Notification sent to ${userCount} users successfully`,
        "success"
      );

      setSendModal(null);
      setIsSending(false);

      // Refresh logs if on logs tab
      if (activeTab === "logs") {
        setTimeout(() => fetchSystemLogs(), 500);
      }
    } catch (error) {
      console.error("❌ Error sending notification:", error);

      await updateDoc(doc(db, "notifications", notification.id), {
        status: "failed",
        updatedAt: Timestamp.now(),
      });

      showToast("Failed to send notification", "error");
      setSendModal(null);
      setIsSending(false);
    }
  };

  const sendNotificationToUsers = async (notification: Notification): Promise<number> => {
    try {
      const usersQuery = getUsersQuery(notification.target);
      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        console.log("⚠️ No users found for target:", notification.target);
        return 0;
      }

      const batch = writeBatch(db);
      let count = 0;

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

  // ═══════════════════════════════════════════════════════════════
  // 📖 MARK AS READ
  // ═══════════════════════════════════════════════════════════════

  const handleMarkAsRead = async (notification: Notification) => {
    try {
      console.log("📖 Marking notification as read:", notification.id);

      const q = query(
        collection(db, "userNotifications"),
        where("notificationId", "==", notification.id),
        where("read", "==", false)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        showToast("All notifications already marked as read", "info");
        return;
      }

      const batch = writeBatch(db);

      snapshot.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
          readAt: Timestamp.now(),
        });
      });

      await batch.commit();

      await updateDoc(doc(db, "notifications", notification.id), {
        read: notification.delivered,
        updatedAt: Timestamp.now(),
      });

      showToast(`✅ Marked ${snapshot.size} notifications as read`, "success");
    } catch (error: any) {
      console.error("❌ Error marking as read:", error);
      showToast(error.message || "Failed to mark as read", "error");
    }
  };

  const fetchNotifications = async () => {
    // This is handled by real-time listener
    showToast("Refreshed successfully", "success");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-600 dark:text-slate-400 font-semibold">Loading notifications...</p>
      </div>
    );
  }
  // ═══════════════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen w-full pb-8">
      {/* Toast */}
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />

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
      {/* 🔥 ADD SEND CONFIRMATION MODAL */}

      <AlertModal
        isOpen={sendModal !== null}
        onClose={() => setSendModal(null)}
        onConfirm={handleSend}
        title="Send Notification"
        message={`Are you sure you want to send "${sendModal?.title}" to ${sendModal?.target} users? This notification will be delivered immediately.`}
        confirmText="Send Now"
        type="success"
        loading={isSending}
      />
      {isPreviewOpen && selectedNotification && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white relative overflow-hidden">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                  transition={{ duration: 20, repeat: Infinity }}
                  className="absolute inset-0 bg-white/10 rounded-full blur-3xl"
                />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                    <Eye size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Notification Preview</h3>
                    <p className="text-white/80 text-sm">How users will see it</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Image */}
                {selectedNotification.imageUrl && (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={selectedNotification.imageUrl}
                    alt={selectedNotification.title}
                    className="w-full h-48 object-cover rounded-xl mb-4 shadow-lg"
                  />
                )}

                {/* Notification Card Preview */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bell size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                        {selectedNotification.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {selectedNotification.message}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Just now</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Type</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                      {selectedNotification.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Target</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                      {selectedNotification.target}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Status</span>
                    <span
                      className={`text-xs font-bold uppercase px-3 py-1 rounded-lg ${getStatusColor(
                        selectedNotification.status
                      )}`}
                    >
                      {selectedNotification.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsPreviewOpen(false)}
                  className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                >
                  Close
                </motion.button>
                {selectedNotification.status === "draft" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsPreviewOpen(false);
                      navigate(`/admin/marketing/notifications/edit/${selectedNotification.id}`);
                    }}
                    className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg"
                  >
                    Edit
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}


      <div className="space-y-6 w-full">
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* HEADER */}
        {/* ═══════════════════════════════════════════════════════════ */}
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
                  <h1 className="text-4xl font-black mb-2">Notifications Management</h1>
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
                  onClick={() => {
                    fetchNotifications();
                    if (activeTab === "logs") fetchSystemLogs();
                  }}
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

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* TABS NAVIGATION */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 px-6 py-4 font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "overview"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
            >
              <Bell size={20} />
              Overview
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 px-6 py-4 font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "analytics"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
            >
              <BarChart3 size={20} />
              Analytics
            </button>

            <button
              onClick={() => setActiveTab("logs")} // Just set tab, listener will handle rest
              className={`flex-1 px-6 py-4 font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "logs"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
            >
              <Activity size={20} />
              Activity Logs
            </button>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* TAB CONTENT */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {/* ───────────────────────────────────────────────────────── */}
          {/* OVERVIEW TAB */}
          {/* ───────────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
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
                      <Bell size={24} className="text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                    Total Notifications
                  </p>
                  <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                    {stats.totalNotifications}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Sent: {stats.sentNotifications} • Draft: {stats.draftNotifications}
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
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">Across all notifications</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">Total Delivered</p>
                  <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                    {formatNumber(stats.totalDelivered)}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 font-bold">Successfully delivered</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                      <Eye size={24} className="text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">Average Read Rate</p>
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
                  <div className="flex items-center gap-3">
                    <Filter size={20} className="text-slate-600 dark:text-slate-400" />
                    <h3 className="text-lg font-black text-slate-800 dark:text-white">Filters</h3>
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
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Type</label>
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
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-sm text-green-600 dark:text-green-400 font-bold">Live Updates</p>
                  </div>
                </div>

                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-16">
                    <Bell size={64} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
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
                            notification.delivered > 0 ? (notification.read / notification.delivered) * 100 : 0;

                          return (
                            <motion.tr
                              key={notification.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {notification.imageUrl && (
                                    <img
                                      src={notification.imageUrl}
                                      alt={notification.title}
                                      className="w-16 h-16 object-cover rounded-xl shadow-lg"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 dark:text-white truncate">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-md">
                                      {notification.message}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <TypeIcon size={16} className="text-slate-600 dark:text-slate-400" />
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
                                    notification.status
                                  )}`}
                                >
                                  {notification.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm">
                                  <p className="font-bold text-slate-800 dark:text-white">
                                    {formatNumber(notification.delivered)} / {formatNumber(notification.totalRecipients)}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">delivered</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden min-w-[60px]">
                                    <div
                                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-full transition-all"
                                      style={{ width: `${readRate}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 min-w-[45px]">
                                    {readRate.toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {formatDate(notification.status === "sent" ? notification.sentAt : notification.createdAt)}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                      setSelectedNotification(notification);
                                      setIsPreviewOpen(true);
                                    }}
                                    className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all"
                                    title="Preview"
                                  >
                                    <Eye size={18} />
                                  </motion.button>

                                  {/* Edit Button - For Draft & Scheduled */}
                                  {(notification.status === "draft" || notification.status === "scheduled") && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() =>
                                        navigate(`/admin/marketing/notifications/edit/${notification.id}`)
                                      }
                                      className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                                      title="Edit"
                                    >
                                      <EditIcon size={18} />
                                    </motion.button>
                                  )}

                                  {/* Send Now Button - For Draft Only */}
                                  {notification.status === "draft" && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => {
                                        console.log("📤 Send clicked for:", notification.title);
                                        setSendModal(notification);
                                      }}
                                      className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all"
                                      title="Send Now"
                                    >
                                      <Send size={18} className="rotate-45" />
                                    </motion.button>
                                  )}

                                  {/* Mark as Read - For Sent Only */}
                                  {notification.status === "sent" && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleMarkAsRead(notification)}
                                      className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all"
                                      title="Mark as Read"
                                    >
                                      <CheckCircle size={18} />
                                    </motion.button>
                                  )}

                                  {/* Delete Button - For All */}
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      setDeleteModal({
                                        id: notification.id,
                                        title: notification.title,
                                      })
                                    }
                                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 size={18} />
                                  </motion.button>
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
            </motion.div>
          )}

          {/* ───────────────────────────────────────────────────────── */}
          {/* ANALYTICS TAB */}
          {/* ───────────────────────────────────────────────────────── */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Detailed Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Sent */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle size={32} />
                    <TrendingUp size={24} className="opacity-50" />
                  </div>
                  <p className="text-white/80 font-semibold mb-2">Total Sent</p>
                  <p className="text-5xl font-black mb-2">{stats.sentNotifications}</p>
                  <p className="text-white/80 text-sm">
                    {stats.totalNotifications > 0
                      ? ((stats.sentNotifications / stats.totalNotifications) * 100).toFixed(1)
                      : 0}
                    % of total
                  </p>
                </motion.div>

                {/* Scheduled */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Clock size={32} />
                    <Calendar size={24} className="opacity-50" />
                  </div>
                  <p className="text-white/80 font-semibold mb-2">Scheduled</p>
                  <p className="text-5xl font-black mb-2">{stats.scheduledNotifications}</p>
                  <p className="text-white/80 text-sm">Pending to be sent</p>
                </motion.div>

                {/* Draft */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-gray-500 to-slate-600 rounded-2xl p-6 text-white shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Bell size={32} />
                    <AlertCircle size={24} className="opacity-50" />
                  </div>
                  <p className="text-white/80 font-semibold mb-2">Drafts</p>
                  <p className="text-5xl font-black mb-2">{stats.draftNotifications}</p>
                  <p className="text-white/80 text-sm">Not yet sent</p>
                </motion.div>
              </div>

              {/* Engagement Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
              >
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp size={24} className="text-blue-500" />
                  Engagement Metrics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Delivery Rate */}
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-slate-200 dark:text-slate-700"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - (stats.totalDelivered / stats.totalRecipients || 0))
                            }`}
                          className="text-green-500 transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-black text-slate-800 dark:text-white">
                          {stats.totalRecipients > 0
                            ? ((stats.totalDelivered / stats.totalRecipients) * 100).toFixed(0)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                    <p className="font-bold text-slate-800 dark:text-white mb-1">Delivery Rate</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatNumber(stats.totalDelivered)} / {formatNumber(stats.totalRecipients)}
                    </p>
                  </div>

                  {/* Read Rate */}
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-slate-200 dark:text-slate-700"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - stats.averageReadRate / 100)}`}
                          className="text-orange-500 transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-black text-slate-800 dark:text-white">
                          {stats.averageReadRate.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <p className="font-bold text-slate-800 dark:text-white mb-1">Read Rate</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatNumber(stats.totalRead)} total reads
                    </p>
                  </div>

                  {/* Success Rate */}
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-slate-200 dark:text-slate-700"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - stats.sentNotifications / (stats.totalNotifications || 1))
                            }`}
                          className="text-blue-500 transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-black text-slate-800 dark:text-white">
                          {stats.totalNotifications > 0
                            ? ((stats.sentNotifications / stats.totalNotifications) * 100).toFixed(0)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                    <p className="font-bold text-slate-800 dark:text-white mb-1">Success Rate</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {stats.sentNotifications} successfully sent
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Top Performing Notifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
              >
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <Award size={24} className="text-yellow-500" />
                  Top Performing Notifications
                </h3>

                {filteredNotifications.filter((n) => n.status === "sent").length === 0 ? (
                  <div className="text-center py-12">
                    <Award size={48} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">No sent notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications
                      .filter((n) => n.status === "sent")
                      .sort((a, b) => {
                        const aRate = a.delivered > 0 ? (a.read / a.delivered) * 100 : 0;
                        const bRate = b.delivered > 0 ? (b.read / b.delivered) * 100 : 0;
                        return bRate - aRate;
                      })
                      .slice(0, 5)
                      .map((notification, index) => {
                        const readRate =
                          notification.delivered > 0 ? (notification.read / notification.delivered) * 100 : 0;

                        return (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-black text-lg">
                              #{index + 1}
                            </div>
                            {notification.imageUrl && (
                              <img
                                src={notification.imageUrl}
                                alt={notification.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-800 dark:text-white truncate">
                                {notification.title}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {formatNumber(notification.read)} reads • {formatNumber(notification.delivered)}{" "}
                                delivered
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-green-600 dark:text-green-400">
                                {readRate.toFixed(1)}%
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">read rate</p>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ───────────────────────────────────────────────────────── */}
          {/* ACTIVITY LOGS TAB */}
          {/* ───────────────────────────────────────────────────────── */}
          {activeTab === "logs" && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <Activity size={24} className="text-indigo-500" />
                    Notification Activity Logs
                  </h3>
                  <button
                    onClick={fetchSystemLogs}
                    className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>

                {loadingLogs ? (
                  <div className="flex items-center justify-center py-20">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : systemLogs.length > 0 ? (
                  <div className="space-y-3">
                    {systemLogs.map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl ${getLogColor(
                            log.action
                          )}`}
                        >
                          {getLogIcon(log.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-slate-800 dark:text-white">
                              {log.performedBy?.name || "Unknown"}
                            </span>
                            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                              {log.performedBy?.role || "admin"}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                            {log.action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </p>
                          {log.details?.title && (
                            <p className="text-slate-800 dark:text-white font-semibold text-sm mb-2">
                              📧 {log.details.title}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatLogTime(log.timestamp)}
                            </div>
                            {log.details?.recipients && (
                              <div className="flex items-center gap-1">
                                <Users size={12} />
                                {formatNumber(log.details.recipients)} users
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${log.status === "success"
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                        >
                          {log.status}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Activity className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={64} />
                    <p className="text-xl font-bold text-slate-500 dark:text-slate-400">No activity logs found</p>
                    <p className="text-slate-400 dark:text-slate-500 mt-2">
                      Activity logs will appear here when you create, update, or delete notifications
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsManagement;
