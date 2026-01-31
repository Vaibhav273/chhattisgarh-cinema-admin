// ═══════════════════════════════════════════════════════════════
// 👁️ VIEW USER DETAILS - ADMIN PANEL - PRODUCTION READY
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  Crown,
  CheckCircle,
  XCircle,
  Ban,
  Smartphone,
  Monitor,
  Tv,
  CreditCard,
  Eye,
  Heart,
  Edit,
  Activity,
  Lock,
  PlayCircle,
  DollarSign,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  doc,
  getDoc,
  collection,
  query,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import type { User as UserType } from "../../types/user";
import { usePermissions } from "../../hooks/usePermissions";
import { Permission, ROLE_CONFIGS } from "../../types/roles";
import { logUserManagementAction } from "../../utils/activityLogger";

// ═══════════════════════════════════════════════════════════════
// 🎉 TOAST NOTIFICATION
// ═══════════════════════════════════════════════════════════════
interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Eye,
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
          className={`${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3`}
        >
          <Icon size={24} />
          <p className="font-bold text-lg">{message}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════
// 📊 STATS CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  gradient: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  gradient,
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -5 }}
    className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 text-white relative overflow-hidden`}
  >
    <motion.div
      animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
      transition={{ duration: 20, repeat: Infinity }}
      className="absolute inset-0 bg-white/10 rounded-full blur-3xl"
    />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
          <Icon size={24} />
        </div>
      </div>
      <p className="text-white/80 text-sm mb-1">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════
// 🎯 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const ViewUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { can } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "activity" | "devices" | "subscription" | "payments"
  >("overview");

  // Toast State
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  // ✅ Data states
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [userDevices, setUserDevices] = useState<any[]>([]);
  const [userStreams, setUserStreams] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [cancellations, setCancellations] = useState<any[]>([]);

  // Permission warnings tracking
  const [permissionWarnings, setPermissionWarnings] = useState<string[]>([]);

  useEffect(() => {
    console.log("ViewUser mounted with userId:", userId);
    if (userId) {
      fetchAllUserData();
    }
  }, [userId]);

  // ═══════════════════════════════════════════════════════════════
  // 🔄 FETCH ALL USER DATA
  // ═══════════════════════════════════════════════════════════════
  const fetchAllUserData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setPermissionWarnings([]);

      // First fetch basic user data
      await fetchUserBasicData();

      // Then fetch all other data in parallel (with error handling)
      await Promise.allSettled([
        fetchWatchHistory(),
        fetchContinueWatching(),
        fetchUserDevices(),
        fetchUserStreams(),
        fetchProfiles(),
        fetchLikes(),
        fetchPayments(),
        fetchInvoices(),
        fetchCancellations(),
      ]);

      console.log("✅ All user data loaded successfully!");

      if (permissionWarnings.length > 0) {
        showToast(
          `Loaded with ${permissionWarnings.length} permission warnings`,
          "info",
        );
      }

      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      showToast("Failed to load user details", "error");
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 👤 FETCH BASIC USER DATA
  // ═══════════════════════════════════════════════════════════════
  const fetchUserBasicData = async () => {
    try {
      console.log("📥 Fetching basic user data for:", userId);
      const userDoc = await getDoc(doc(db, "users", userId!));

      if (!userDoc.exists()) {
        showToast("User not found", "error");
        navigate("/admin/users/all");
        return;
      }

      const rawData = userDoc.data();
      console.log("✅ Raw user data:", rawData);

      const userData: UserType = {
        uid: userDoc.id,
        email: rawData.email || "",
        phoneNumber: rawData.phoneNumber || null,
        displayName: rawData.displayName || "Unnamed User",
        photoURL: rawData.photoURL || null,
        role: rawData.role || "viewer",
        currentPlanId: rawData.currentPlanId || "free",
        isPremium: rawData.isPremium || false,
        subscriptionPlanId: rawData.subscriptionPlanId || null,
        subscriptionStatus: rawData.subscriptionStatus || "inactive",
        subscriptionStartDate: rawData.subscriptionStartDate || null,
        subscriptionEndDate: rawData.subscriptionEndDate || null,
        subscription: rawData.subscription || null,
        preferences: rawData.preferences || {
          language: "en",
          contentTypes: [],
          autoPlay: true,
          notificationsEnabled: true,
        },
        devices: rawData.devices || [],
        maxDevices: rawData.maxDevices || 3,
        currentDeviceCount: rawData.currentDeviceCount || 0,
        profiles: rawData.profiles || [],
        maxProfiles: rawData.maxProfiles || 5,
        currentProfileId: rawData.currentProfileId || null,
        creatorProfile: rawData.creatorProfile || null,
        stats: rawData.stats || {
          totalWatchTime: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalViews: 0,
          favoritesCount: 0,
          watchlistCount: 0,
        },
        status: rawData.status || "active",
        emailVerified: rawData.emailVerified || false,
        phoneVerified: rawData.phoneVerified || false,
        kycVerified: rawData.kycVerified || false,
        twoFactorEnabled: rawData.twoFactorEnabled || false,
        createdAt: rawData.createdAt || null,
        updatedAt: rawData.updatedAt || null,
        lastLogin: rawData.lastLogin || null,
        lastActive: rawData.lastActive || null,
        referralCode: rawData.referralCode || null,
        referredBy: rawData.referredBy || null,
        rewardPoints: rawData.rewardPoints || 0,
        moderation: rawData.moderation || null,
      };

      console.log("✅ Basic user data loaded");
      setUser(userData);
      await logUserManagementAction(
        "user_details_page_viewed",
        "success",
        `Viewed detailed page for user: ${userData.email}`,
        auth.currentUser,
        {
          viewedUserId: userData.uid,
          viewedUserEmail: userData.email,
          viewedUserName: userData.displayName,
          viewedUserRole: userData.role,
          hasPermissionWarnings: permissionWarnings.length > 0,
          permissionWarnings: permissionWarnings,
        },
      );
    } catch (error) {
      console.error("❌ Error fetching basic user data:", error);
      await logUserManagementAction(
        "user_details_page_view_failed",
        "failed",
        `Failed to view user details page: ${error instanceof Error ? error.message : "Unknown error"}`,
        auth.currentUser,
        {
          error: error instanceof Error ? error.message : "Unknown error",
          userId: userId,
        },
      );
      throw error;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 📺 FETCH WATCH HISTORY
  // ═══════════════════════════════════════════════════════════════
  const fetchWatchHistory = async () => {
    try {
      const historyQuery = query(
        collection(db, "users", userId!, "watchHistory"),
        orderBy("watchedAt", "desc"),
        limit(20),
      );

      const historySnapshot = await getDocs(historyQuery);
      const history = historySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          contentTitle: data.contentTitle || data.title || "Unknown Content",
          watchedAt: data.watchedAt || null,
          duration: data.duration || 0,
          progress: data.progress || 0,
          contentId: data.contentId || "",
          contentType: data.contentType || "",
        };
      });

      console.log("✅ Watch history:", history.length, "items");
      setWatchHistory(history);
    } catch (error: any) {
      if (error.code === "permission-denied") {
        console.log("⚠️ No permission: watchHistory");
        setPermissionWarnings((prev) => [...prev, "watchHistory"]);
      } else {
        console.error("❌ Error fetching watch history:", error);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ▶️ FETCH CONTINUE WATCHING
  // ═══════════════════════════════════════════════════════════════
  const fetchContinueWatching = async () => {
    try {
      const continueQuery = query(
        collection(db, "users", userId!, "continueWatching"),
        orderBy("lastWatched", "desc"),
        limit(10),
      );

      const continueSnapshot = await getDocs(continueQuery);
      const continueData = continueSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || data.contentTitle || "Unknown",
          progress: data.progress || 0,
          duration: data.duration || 0,
          lastWatched: data.lastWatched || null,
        };
      });

      console.log("✅ Continue watching:", continueData.length, "items");
      setContinueWatching(continueData);
    } catch (error: any) {
      if (error.code === "permission-denied") {
        console.log("⚠️ No permission: continueWatching");
        setPermissionWarnings((prev) => [...prev, "continueWatching"]);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 📱 FETCH USER DEVICES
  // ═══════════════════════════════════════════════════════════════
  const fetchUserDevices = async () => {
    try {
      // Method 1: userDevices/{userId} document
      const devicesRef = doc(db, "userDevices", userId!);
      const devicesDoc = await getDoc(devicesRef);

      if (devicesDoc.exists()) {
        const devicesData = devicesDoc.data();
        const devices = (devicesData.devices || []).map((device: any) => ({
          id: device.id || "",
          deviceName: device.deviceName || device.name || "Unknown Device",
          deviceType: device.deviceType || device.type || "unknown",
          os: device.os || device.platform || "Unknown OS",
          lastUsed: device.lastUsed || device.lastActive || null,
          ipAddress: device.ipAddress || "",
        }));

        console.log("✅ User devices:", devices.length, "devices");
        setUserDevices(devices);
        return;
      }

      // Method 2: Try subcollection
      const devicesQuery = query(collection(db, "users", userId!, "devices"));
      const devicesSnapshot = await getDocs(devicesQuery);

      if (!devicesSnapshot.empty) {
        const devices = devicesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            deviceName: data.deviceName || data.name || "Unknown Device",
            deviceType: data.deviceType || data.type || "unknown",
            os: data.os || data.platform || "Unknown OS",
            lastUsed: data.lastUsed || data.lastActive || null,
          };
        });

        console.log("✅ User devices (subcollection):", devices.length);
        setUserDevices(devices);
      } else {
        console.log("ℹ️ No devices found");
      }
    } catch (error: any) {
      if (error.code === "permission-denied") {
        console.log("⚠️ No permission: userDevices");
        setPermissionWarnings((prev) => [...prev, "userDevices"]);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🎬 FETCH USER STREAMS
  // ═══════════════════════════════════════════════════════════════
  const fetchUserStreams = async () => {
    try {
      const streamRef = doc(db, "userStream", userId!);
      const streamDoc = await getDoc(streamRef);

      if (streamDoc.exists()) {
        const streamData = streamDoc.data();
        const streams = (streamData.streams || []).map((stream: any) => ({
          id: stream.id || "",
          contentTitle: stream.contentTitle || stream.title || "Unknown",
          startedAt: stream.startedAt || null,
        }));

        console.log("✅ User streams:", streams.length);
        setUserStreams(streams);
      }
    } catch (error: any) {
      if (error.code === "permission-denied") {
        console.log("⚠️ No permission: userStream");
        setPermissionWarnings((prev) => [...prev, "userStream"]);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 👥 FETCH PROFILES
  // ═══════════════════════════════════════════════════════════════
  const fetchProfiles = async () => {
    try {
      const profilesQuery = query(collection(db, "users", userId!, "profiles"));
      const profilesSnapshot = await getDocs(profilesQuery);

      const profilesData = profilesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Unnamed",
          type: data.type || "Standard",
        };
      });

      console.log("✅ Profiles:", profilesData.length);
      setProfiles(profilesData);
    } catch (error: any) {
      if (error.code === "permission-denied") {
        console.log("⚠️ No permission: profiles");
        setPermissionWarnings((prev) => [...prev, "profiles"]);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ❤️ FETCH LIKES
  // ═══════════════════════════════════════════════════════════════
  const fetchLikes = async () => {
    try {
      const likesQuery = query(collection(db, "users", userId!, "likes"));
      const likesSnapshot = await getDocs(likesQuery);

      const likesData = likesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          contentTitle: data.contentTitle || data.title || "Unknown",
        };
      });

      console.log("✅ Likes:", likesData.length);
      setLikes(likesData);
    } catch (error: any) {
      if (error.code === "permission-denied") {
        console.log("⚠️ No permission: likes");
        setPermissionWarnings((prev) => [...prev, "likes"]);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 💳 FETCH PAYMENTS
  // ═══════════════════════════════════════════════════════════════
  const fetchPayments = async () => {
    try {
      const paymentsQuery = query(
        collection(db, "users", userId!, "payments"),
        orderBy("createdAt", "desc"),
        limit(20),
      );

      const paymentsSnapshot = await getDocs(paymentsQuery);
      const paymentsData = paymentsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          amount: data.amount || 0,
          status: data.status || "pending",
          description: data.description || "Payment",
          createdAt: data.createdAt || null,
        };
      });

      console.log("✅ Payments:", paymentsData.length);
      setPayments(paymentsData);
    } catch (error: any) {
      if (error.code === "permission-denied") {
        console.log("⚠️ No permission: payments");
        setPermissionWarnings((prev) => [...prev, "payments"]);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🧾 FETCH INVOICES
  // ═══════════════════════════════════════════════════════════════
  const fetchInvoices = async () => {
    try {
      const invoicesQuery = query(
        collection(db, "users", userId!, "invoices"),
        orderBy("createdAt", "desc"),
        limit(20),
      );

      const invoicesSnapshot = await getDocs(invoicesQuery);
      const invoicesData = invoicesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          invoiceNumber: data.invoiceNumber || `INV-${doc.id.slice(0, 8)}`,
          amount: data.amount || 0,
          createdAt: data.createdAt || null,
        };
      });

      console.log("✅ Invoices:", invoicesData.length);
      setInvoices(invoicesData);
    } catch (error: any) {
      if (error.code === "permission-denied") {
        console.log("⚠️ No permission: invoices");
        setPermissionWarnings((prev) => [...prev, "invoices"]);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ❌ FETCH CANCELLATIONS
  // ═══════════════════════════════════════════════════════════════
  const fetchCancellations = async () => {
    try {
      const cancellationsQuery = query(
        collection(db, "users", userId!, "cancellations"),
        orderBy("cancelledAt", "desc"),
      );

      const cancellationsSnapshot = await getDocs(cancellationsQuery);
      const cancellationsData = cancellationsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          planName: data.planName || "Subscription",
          cancelledAt: data.cancelledAt || null,
          reason: data.reason || "",
        };
      });

      console.log("✅ Cancellations:", cancellationsData.length);
      setCancellations(cancellationsData);
    } catch (error: any) {
      if (error.code === "permission-denied") {
        console.log("⚠️ No permission: cancellations");
        setPermissionWarnings((prev) => [...prev, "cancellations"]);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🛠️ HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getTimeAgo = (timestamp: any): string => {
    if (!timestamp) return "Never";

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (seconds < 60) return "Just now";
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
      return formatDate(timestamp);
    } catch {
      return "Invalid";
    }
  };

  const getRoleBadge = () => {
    if (!user) return null;
    const roleConfig = ROLE_CONFIGS[user.role];
    if (!roleConfig) return null;

    return (
      <span
        className={`px-4 py-2 bg-gradient-to-r ${roleConfig.gradient} text-white rounded-full text-sm font-bold flex items-center gap-2 w-fit`}
      >
        <Shield size={16} />
        {roleConfig.name}
      </span>
    );
  };

  const getStatusBadge = () => {
    if (!user) return null;

    const statusConfig = {
      active: {
        icon: CheckCircle,
        class:
          "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
        text: "Active",
      },
      banned: {
        icon: Ban,
        class: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        text: "Banned",
      },
      suspended: {
        icon: Lock,
        class:
          "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
        text: "Suspended",
      },
    };

    const status = user.status || "active";
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const StatusIcon = config.icon;

    return (
      <span
        className={`px-4 py-2 ${config.class} rounded-full text-sm font-bold flex items-center gap-2 w-fit`}
      >
        <StatusIcon size={16} />
        {config.text}
      </span>
    );
  };

  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType?.toLowerCase() || "";
    if (type.includes("mobile") || type.includes("phone")) return Smartphone;
    if (type.includes("tv")) return Tv;
    return Monitor;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // ═══════════════════════════════════════════════════════════════
  // 🎨 LOADING STATE
  // ═══════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-600 dark:text-slate-400 font-semibold">
          Loading user data...
        </p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // ❌ USER NOT FOUND
  // ═══════════════════════════════════════════════════════════════
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            User Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The user you're looking for doesn't exist.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/admin/users/all")}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold"
          >
            Back to Users
          </motion.button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "devices", label: "Devices", icon: Smartphone },
    { id: "subscription", label: "Subscription", icon: Crown },
    { id: "payments", label: "Payments", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen w-full pb-8">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className="space-y-6 w-full">
        {/* Permission Warnings Banner */}
        {permissionWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-yellow-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  Limited Data Access
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Some data couldn't be loaded due to permissions:{" "}
                  {permissionWarnings.join(", ")}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Check Firestore security rules to enable full data access.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate("/admin/users/all")}
                  className="p-3 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-white/30 transition-all"
                >
                  <ArrowLeft size={24} />
                </motion.button>
                <div>
                  <h1 className="text-4xl font-black mb-2">User Details</h1>
                  <p className="text-white/90">
                    Complete user profile and activity
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {can(Permission.BAN_USERS) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      // ✅ OPTIONAL: Log navigation to edit page
                      await logUserManagementAction(
                        "user_edit_opened_from_details",
                        "success",
                        `Opened edit page for user: ${user.displayName}`,
                        auth.currentUser,
                        {
                          targetUserId: userId,
                          targetUserEmail: user.email,
                          targetUserName: user.displayName,
                          source: "details_page",
                        },
                      );

                      navigate(`/admin/users/edit/${userId}`);
                    }}
                    className="px-6 py-3 bg-white/20 backdrop-blur-xl text-white rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                  >
                    <Edit size={20} />
                    Edit User
                  </motion.button>
                )}
              </div>
            </div>

            {/* User Header Info */}
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 rounded-3xl overflow-hidden bg-white/20 backdrop-blur-xl flex items-center justify-center text-white text-5xl font-black border-4 border-white/30">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.displayName.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <h2 className="text-3xl font-black">{user.displayName}</h2>
                  {user.emailVerified && (
                    <CheckCircle size={24} className="text-green-300" />
                  )}
                  {user.isPremium && (
                    <Crown size={24} className="text-yellow-300" />
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  {getRoleBadge()}
                  {getStatusBadge()}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-white/60" />
                    <span className="text-white/90 truncate">{user.email}</span>
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-white/60" />
                      <span className="text-white/90">{user.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-white/60" />
                    <span className="text-white/90">
                      Joined {formatDate(user.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-white/60" />
                    <span className="text-white/90">
                      Active {getTimeAgo(user.lastActive)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={Eye}
            label="Watch Time (min)"
            value={user.stats?.totalWatchTime || 0}
            gradient="from-purple-500 to-indigo-600"
          />
          <StatsCard
            icon={Heart}
            label="Total Likes"
            value={likes.length}
            gradient="from-pink-500 to-rose-600"
          />
          <StatsCard
            icon={DollarSign}
            label="Payments"
            value={payments.length}
            gradient="from-blue-500 to-cyan-600"
          />
          <StatsCard
            icon={Smartphone}
            label="Devices"
            value={`${userDevices.length}/${user.maxDevices || 3}`}
            gradient="from-green-500 to-emerald-600"
          />
        </div>

        {/* TABS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-6 py-4 font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-500 text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <TabIcon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                      <User size={24} className="text-blue-500" />
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Full Name
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-white">
                          {user.displayName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Email
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-white break-all">
                          {user.email}
                        </p>
                      </div>
                      {user.phoneNumber && (
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Phone
                          </p>
                          <p className="font-semibold text-slate-800 dark:text-white">
                            {user.phoneNumber}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          User ID
                        </p>
                        <p className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
                          {user.uid}
                        </p>
                      </div>
                      {user.referralCode && (
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Referral Code
                          </p>
                          <p className="font-mono text-sm text-slate-800 dark:text-white">
                            {user.referralCode}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                      <Shield size={24} className="text-green-500" />
                      Account Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Email Verified
                        </p>
                        {user.emailVerified ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <XCircle size={20} className="text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Phone Verified
                        </p>
                        {user.phoneVerified ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <XCircle size={20} className="text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Premium Member
                        </p>
                        {user.isPremium ? (
                          <Crown size={20} className="text-yellow-500" />
                        ) : (
                          <XCircle size={20} className="text-slate-400" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Reward Points
                        </p>
                        <span className="font-bold text-slate-800 dark:text-white">
                          {user.rewardPoints || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profiles Section */}
                {profiles.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                      User Profiles ({profiles.length}/{user.maxProfiles})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {profiles.map((profile, index) => (
                        <div
                          key={index}
                          className="bg-white dark:bg-slate-700 rounded-xl p-4 text-center"
                        >
                          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black">
                            {profile.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <p className="font-semibold text-slate-800 dark:text-white truncate">
                            {profile.name || "Unnamed"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {profile.type || "Standard"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subscription Info */}
                {user.isPremium && user.subscription && (
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Crown size={24} />
                      Active Subscription
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-white/80 text-sm mb-1">Plan</p>
                        <p className="text-lg font-bold">
                          {user.subscription.planName || user.currentPlanId}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/80 text-sm mb-1">Status</p>
                        <p className="text-lg font-bold capitalize">
                          {user.subscription.status || user.subscriptionStatus}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/80 text-sm mb-1">Started</p>
                        <p className="text-lg font-bold">
                          {formatDate(
                            user.subscription.startDate ||
                              user.subscriptionStartDate,
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/80 text-sm mb-1">Expires</p>
                        <p className="text-lg font-bold">
                          {formatDate(
                            user.subscription.endDate ||
                              user.subscriptionEndDate,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ACTIVITY TAB */}
            {activeTab === "activity" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    Watch History ({watchHistory.length} items)
                  </h3>
                  {watchHistory.length > 0 ? (
                    <div className="space-y-3">
                      {watchHistory.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                        >
                          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                            <Eye size={24} className="text-slate-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800 dark:text-white">
                              {item.contentTitle}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Watched {getTimeAgo(item.watchedAt)}
                            </p>
                            {item.progress > 0 && item.duration > 0 && (
                              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(100, (item.progress / item.duration) * 100)}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                              {Math.floor((item.duration || 0) / 60)} min
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <Eye
                        size={48}
                        className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
                      />
                      <p className="text-slate-500 dark:text-slate-400">
                        No watch history available
                      </p>
                    </div>
                  )}
                </div>

                {/* Continue Watching */}
                {continueWatching.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                      Continue Watching ({continueWatching.length} items)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {continueWatching.map((item, index) => (
                        <div
                          key={index}
                          className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4"
                        >
                          <div className="w-full h-24 bg-slate-200 dark:bg-slate-700 rounded-lg mb-3 flex items-center justify-center">
                            <PlayCircle size={32} className="text-slate-400" />
                          </div>
                          <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                            {item.title}
                          </p>
                          {item.progress > 0 && (
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-2">
                              <div
                                className="bg-blue-500 h-1 rounded-full"
                                style={{
                                  width: `${Math.min(100, item.progress)}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Likes */}
                {likes.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                      Liked Content ({likes.length} items)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {likes.slice(0, 8).map((like, index) => (
                        <div
                          key={index}
                          className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex items-center gap-3"
                        >
                          <Heart
                            size={20}
                            className="text-red-500 flex-shrink-0"
                          />
                          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                            {like.contentTitle}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DEVICES TAB */}
            {activeTab === "devices" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    Active Devices
                  </h3>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {userDevices.length} of {user.maxDevices || 3} devices
                  </span>
                </div>

                {userDevices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userDevices.map((device, index) => {
                      const DeviceIcon = getDeviceIcon(device.deviceType);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                        >
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                            <DeviceIcon size={24} className="text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-white truncate">
                              {device.deviceName}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {device.os}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              Last active: {getTimeAgo(device.lastUsed)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Smartphone
                      size={48}
                      className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
                    />
                    <p className="text-slate-500 dark:text-slate-400">
                      No devices registered
                    </p>
                  </div>
                )}

                {/* Active Streams */}
                {userStreams.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                      Active Streams ({userStreams.length})
                    </h3>
                    <div className="space-y-3">
                      {userStreams.map((stream, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                        >
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                            <Activity size={24} className="text-green-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800 dark:text-white">
                              {stream.contentTitle}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Started {getTimeAgo(stream.startedAt)}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold">
                            LIVE
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUBSCRIPTION TAB */}
            {activeTab === "subscription" && (
              <div className="space-y-6">
                {user.isPremium && user.subscription ? (
                  <>
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white">
                      <div className="flex items-center gap-3 mb-6">
                        <Crown size={32} />
                        <h3 className="text-2xl font-black">
                          Premium Subscription
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-white/80 mb-2">Plan Name</p>
                          <p className="text-xl font-bold">
                            {user.subscription.planName || user.currentPlanId}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/80 mb-2">Status</p>
                          <p className="text-xl font-bold capitalize">
                            {user.subscription.status ||
                              user.subscriptionStatus}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/80 mb-2">Start Date</p>
                          <p className="text-xl font-bold">
                            {formatDate(
                              user.subscription.startDate ||
                                user.subscriptionStartDate,
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/80 mb-2">End Date</p>
                          <p className="text-xl font-bold">
                            {formatDate(
                              user.subscription.endDate ||
                                user.subscriptionEndDate,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cancellations */}
                    {cancellations.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                          <AlertCircle size={24} className="text-orange-500" />
                          Cancellation History ({cancellations.length})
                        </h3>
                        <div className="space-y-3">
                          {cancellations.map((cancellation, index) => (
                            <div
                              key={index}
                              className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800"
                            >
                              <p className="font-semibold text-slate-800 dark:text-white">
                                {cancellation.planName}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Cancelled on{" "}
                                {formatDate(cancellation.cancelledAt)}
                              </p>
                              {cancellation.reason && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  Reason: {cancellation.reason}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Crown
                      size={64}
                      className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
                    />
                    <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">
                      Free Plan
                    </h3>
                    <p className="text-slate-500 dark:text-slate-500">
                      User is on the free plan
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    Payment History ({payments.length})
                  </h3>
                  {payments.length > 0 ? (
                    <div className="space-y-3">
                      {payments.map((payment, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                        >
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                            <DollarSign size={24} className="text-green-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800 dark:text-white">
                              {payment.description}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {formatDate(payment.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-800 dark:text-white">
                              {formatCurrency(payment.amount)}
                            </p>
                            <span
                              className={`text-xs font-semibold ${
                                payment.status === "success" ||
                                payment.status === "paid"
                                  ? "text-green-600 dark:text-green-400"
                                  : payment.status === "pending"
                                    ? "text-yellow-600 dark:text-yellow-400"
                                    : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {payment.status?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <CreditCard
                        size={48}
                        className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
                      />
                      <p className="text-slate-500 dark:text-slate-400">
                        No payment history
                      </p>
                    </div>
                  )}
                </div>

                {/* Invoices */}
                {invoices.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                      Invoices ({invoices.length})
                    </h3>
                    <div className="space-y-3">
                      {invoices.map((invoice, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                        >
                          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <FileText size={24} className="text-purple-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800 dark:text-white">
                              Invoice #{invoice.invoiceNumber}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {formatDate(invoice.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-800 dark:text-white">
                              {formatCurrency(invoice.amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUser;
