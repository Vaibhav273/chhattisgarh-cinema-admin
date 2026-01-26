// ═══════════════════════════════════════════════════════════════════════════════
// 💳 SUBSCRIPTIONS MANAGEMENT - PRODUCTION READY (FINAL)
// Path: src/pages/admin/SubscriptionsManagement.tsx
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Users,
  TrendingUp,
  DollarSign,
  Search,
  Eye,
  RefreshCw,
  Calendar,
  Crown,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  X,
  Mail,
  Phone,
  Clock,
  Activity,
  Award,
} from "lucide-react";
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type { User, SubscriptionPlan } from "../../types";

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 INTERFACES & TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  isVisible: boolean;
  onClose: () => void;
}

interface Stats {
  totalSubscribers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  growth: number;
  basicUsers: number;
  standardUsers: number;
  premiumUsers: number;
  professionalUsers: number;
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
    error: XCircle,
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

// ═══════════════════════════════════════════════════════════════════════════════
// 👁️ VIEW SUBSCRIPTION MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  plan: SubscriptionPlan | null;
}

const ViewModal: React.FC<ViewModalProps> = ({
  isOpen,
  onClose,
  user,
  plan,
}) => {
  if (!isOpen || !user) return null;

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPlanColor = (planName: string) => {
    const name = planName?.toLowerCase() || "";
    if (name.includes("basic")) return "from-blue-500 to-blue-600";
    if (name.includes("standard")) return "from-green-500 to-green-600";
    if (name.includes("premium")) return "from-purple-500 to-purple-600";
    if (name.includes("professional")) return "from-yellow-500 to-orange-600";
    return "from-slate-500 to-slate-600";
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
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div
            className={`bg-gradient-to-r ${getPlanColor(
              user.subscription?.planName || "",
            )} p-6 text-white`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <Crown size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black">Subscription Details</h3>
                  <p className="text-white/80 text-sm">
                    User ID: {user.uid.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* User Info */}
            <div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Users size={20} />
                User Information
              </h4>
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || user.email}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Users size={28} className="text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-slate-800 dark:text-white text-lg">
                    {user.displayName || "N/A"}
                  </p>
                  <div className="space-y-1 mt-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Mail size={14} />
                      {user.email}
                    </p>
                    {user.phoneNumber && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Phone size={14} />
                        {user.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  {user.subscription?.status === "active" ? (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-bold">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold uppercase">
                      {user.subscription?.status || "INACTIVE"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Subscription Info */}
            {user.subscription && (
              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Crown size={20} />
                  Subscription Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Plan Name
                    </p>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {user.subscription.planName}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Billing Cycle
                    </p>
                    <p className="font-bold text-slate-800 dark:text-white capitalize">
                      {user.subscription.billingCycle || "N/A"}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Start Date
                    </p>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {formatDate(user.subscription.startDate)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      End Date
                    </p>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {formatDate(user.subscription.endDate)}
                    </p>
                  </div>
                  {user.subscription.nextBillingDate && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Next Billing
                      </p>
                      <p className="font-bold text-slate-800 dark:text-white">
                        {formatDate(user.subscription.nextBillingDate)}
                      </p>
                    </div>
                  )}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Auto Renew
                    </p>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {user.subscription.autoRenew ? (
                        <span className="text-green-600 dark:text-green-400">
                          Enabled
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">
                          Disabled
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Plan Features */}
            {plan && (
              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Activity size={20} />
                  Plan Features & Limits
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {plan.maxProfiles}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Max Profiles
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                    <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                      {plan.maxDevices}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Max Devices
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                    <p className="text-2xl font-black text-green-600 dark:text-green-400">
                      {plan.maxScreens}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Max Screens
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                    <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                      {plan.maxDownloadDevices}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Download Devices
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                    <p className="text-2xl font-black text-pink-600 dark:text-pink-400">
                      {plan.maxDownloadsPerDevice}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Downloads/Device
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                    <p className="text-sm font-black text-teal-600 dark:text-teal-400">
                      {plan.videoQuality.join(", ")}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Video Quality
                    </p>
                  </div>
                </div>

                {/* Plan Price */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Monthly Price
                    </p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      ₹{plan.priceMonthly}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Yearly Price
                    </p>
                    <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                      ₹{plan.priceYearly}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Devices */}
            {user.devices && user.devices.length > 0 && (
              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Activity size={20} />
                  Active Devices ({user.devices.length})
                </h4>
                <div className="space-y-3">
                  {user.devices.map((device, index) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">
                          {device.deviceName || "Unknown Device"}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {device.deviceType} • ID:{" "}
                          {device.deviceId.slice(0, 12)}...
                        </p>
                        {device.lastUsed && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Last login: {formatDate(device.lastUsed)}
                          </p>
                        )}
                      </div>
                      {device.isActive && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Account Info */}
            <div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Clock size={20} />
                Account Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Created At
                  </p>
                  <p className="font-bold text-slate-800 dark:text-white">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Last Login
                  </p>
                  <p className="font-bold text-slate-800 dark:text-white">
                    {formatDate(user.lastLogin)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Email Verified
                  </p>
                  <p className="font-bold text-slate-800 dark:text-white">
                    {user.emailVerified ? (
                      <span className="text-green-600 dark:text-green-400">
                        Yes
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">No</span>
                    )}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Total Profiles
                  </p>
                  <p className="font-bold text-slate-800 dark:text-white">
                    {user.profiles?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3 sticky bottom-0 border-t border-slate-200 dark:border-slate-700">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
            >
              Close
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

const SubscriptionsManagement: React.FC = () => {
  // States
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSubscribers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    growth: 0,
    basicUsers: 0,
    standardUsers: 0,
    premiumUsers: 0,
    professionalUsers: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    user: null as User | null,
    plan: null as SubscriptionPlan | null,
  });

  // Toast
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterPlan, filterStatus, users]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Fetching subscriptions data...");

      // Fetch plans
      const plansQuery = query(
        collection(db, "subscriptionPlans"),
        where("isActive", "==", true),
        orderBy("order", "asc"),
      );
      const plansSnapshot = await getDocs(plansQuery);
      const fetchedPlans: SubscriptionPlan[] = [];
      plansSnapshot.forEach((doc) => {
        fetchedPlans.push({ ...doc.data(), id: doc.id } as SubscriptionPlan);
      });
      setPlans(fetchedPlans);

      // Fetch users with subscriptions
      const usersQuery = query(collection(db, "users"));
      const usersSnapshot = await getDocs(usersQuery);

      const fetchedUsers: User[] = [];
      let monthlyRev = 0;
      let yearlyRev = 0;
      let activeCount = 0;
      let basicCount = 0;
      let standardCount = 0;
      let premiumCount = 0;
      let professionalCount = 0;

      usersSnapshot.forEach((doc) => {
        const userData = doc.data() as User;
        if (userData.subscription) {
          fetchedUsers.push({ ...userData, uid: doc.id });

          // Calculate stats
          if (userData.subscription.status === "active") {
            activeCount++;

            // Find plan to get price
            const userPlan = fetchedPlans.find(
              (p) => p.id === userData.subscription?.planId,
            );
            if (userPlan) {
              if (userData.subscription.billingCycle === "monthly") {
                monthlyRev += userPlan.priceMonthly;
              } else if (userData.subscription.billingCycle === "annual") {
                yearlyRev += userPlan.priceYearly;
              }
            }

            // Count by plan
            const planName =
              userData.subscription.planName?.toLowerCase() || "";
            if (planName.includes("basic")) basicCount++;
            else if (planName.includes("standard")) standardCount++;
            else if (planName.includes("premium")) premiumCount++;
            else if (planName.includes("professional")) professionalCount++;
          }
        }
      });

      setUsers(fetchedUsers);
      setStats({
        totalSubscribers: fetchedUsers.length,
        activeSubscriptions: activeCount,
        monthlyRevenue: monthlyRev,
        yearlyRevenue: yearlyRev,
        growth: 12.5,
        basicUsers: basicCount,
        standardUsers: standardCount,
        premiumUsers: premiumCount,
        professionalUsers: professionalCount,
      });

      console.log(`Fetched ${fetchedUsers.length} subscriptions`);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      showToast("Failed to load subscriptions", "error");
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Filter by plan
    if (filterPlan !== "all") {
      filtered = filtered.filter((user) => {
        const planName = user.subscription?.planName?.toLowerCase() || "";
        return planName.includes(filterPlan);
      });
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (user) => user.subscription?.status === filterStatus,
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.subscription?.planName?.toLowerCase().includes(query),
      );
    }

    setFilteredUsers(filtered);
  };

  const handleViewDetails = (user: User) => {
    const userPlan = plans.find((p) => p.id === user.subscription?.planId);
    setViewModal({ isOpen: true, user, plan: userPlan || null });
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning",
  ) => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      case "expired":
        return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
      case "cancelled":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
      case "trial":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      case "paused":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
    }
  };

  const getPlanBadge = (planName?: string) => {
    const name = planName?.toLowerCase() || "";
    if (name.includes("basic"))
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    if (name.includes("standard"))
      return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
    if (name.includes("premium"))
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
    if (name.includes("professional"))
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
    return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
          Loading subscriptions...
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

      {/* View Modal */}
      <ViewModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, user: null, plan: null })}
        user={viewModal.user}
        plan={viewModal.plan}
      />

      <div className="space-y-6 w-full">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                  <CreditCard size={32} />
                </div>
                <div>
                  <h1 className="text-4xl font-black mb-2">
                    Subscriptions Management
                  </h1>
                  <p className="text-white/90 text-lg">
                    Manage user subscriptions and plans
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <RefreshCw size={20} />
                Refresh
              </motion.button>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                  Total Subscribers
                </p>
                <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                  {stats.totalSubscribers.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Users
                  size={24}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                  Active Subscriptions
                </p>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
                  {stats.activeSubscriptions.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle
                  size={24}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                  Monthly Revenue
                </p>
                <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400 mt-2">
                  ₹{(stats.monthlyRevenue / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <DollarSign
                  size={24}
                  className="text-yellow-600 dark:text-yellow-400"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                  Growth Rate
                </p>
                <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-2">
                  +{stats.growth}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp
                  size={24}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* PLAN DISTRIBUTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Basic Plan</h3>
              <Award size={24} />
            </div>
            <p className="text-4xl font-black">{stats.basicUsers}</p>
            <p className="text-white/80 text-sm mt-2">Active Users</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Standard Plan</h3>
              <Crown size={24} />
            </div>
            <p className="text-4xl font-black">{stats.standardUsers}</p>
            <p className="text-white/80 text-sm mt-2">Active Users</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Premium Plan</h3>
              <Crown size={24} />
            </div>
            <p className="text-4xl font-black">{stats.premiumUsers}</p>
            <p className="text-white/80 text-sm mt-2">Active Users</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Professional Plan</h3>
              <Crown size={24} />
            </div>
            <p className="text-4xl font-black">{stats.professionalUsers}</p>
            <p className="text-white/80 text-sm mt-2">Active Users</p>
          </div>
        </motion.div>

        {/* FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, plan..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Plan Filter */}
            <div className="relative">
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="appearance-none px-6 py-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white font-semibold cursor-pointer"
              >
                <option value="all">All Plans</option>
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="professional">Professional</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={20}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none px-6 py-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white font-semibold cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="trial">Trial</option>
                <option value="paused">Paused</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={20}
              />
            </div>
          </div>
        </motion.div>

        {/* SUBSCRIPTIONS TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle
                size={64}
                className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
              />
              <p className="text-xl font-bold text-slate-500 dark:text-slate-400">
                No subscriptions found
              </p>
              <p className="text-slate-400 dark:text-slate-500 mt-2">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Billing
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.uid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName || user.email}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <Users size={20} className="text-white" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">
                              {user.displayName || "N/A"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-bold ${getPlanBadge(
                            user.subscription?.planName,
                          )}`}
                        >
                          {user.subscription?.planName || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-700 dark:text-slate-300 font-semibold capitalize">
                          {user.subscription?.billingCycle || "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-bold uppercase ${getStatusColor(
                            user.subscription?.status,
                          )}`}
                        >
                          {user.subscription?.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300">
                            {formatDate(user.subscription?.endDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewDetails(user)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionsManagement;
