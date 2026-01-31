import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Crown,
  Shield,
  TrendingUp,
  Eye,
  Heart,
  Star,
  CreditCard,
  Smartphone,
  CheckCircle,
  XCircle,
  MapPin,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import type { User as UserType } from "../../types/user";
import { logUserManagementAction } from "../../utils/activityLogger";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
}

interface WatchHistoryItem {
  contentId: string;
  contentTitle: string;
  contentType: string;
  watchedAt: any;
  progress: number;
  duration: number;
}

interface Transaction {
  id: string;
  amount: number;
  status: string;
  type: string;
  createdAt: any;
  planName?: string;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "activity" | "transactions" | "devices"
  >("overview");
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserData();
    }
  }, [isOpen, user]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Existing fetch code...
      const watchHistoryQuery = query(
        collection(db, "users", user.uid, "watchHistory"),
        orderBy("watchedAt", "desc"),
        limit(10),
      );
      const watchHistorySnapshot = await getDocs(watchHistoryQuery);
      const watchHistoryData = watchHistorySnapshot.docs.map((doc) => ({
        contentId: doc.id,
        ...doc.data(),
      })) as WatchHistoryItem[];
      setWatchHistory(watchHistoryData);

      // Fetch transactions...
      const transactionsQuery = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(10),
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactionsData = transactionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
      setTransactions(transactionsData);

      // ✅ OPTIONAL: Log that admin viewed user details
      await logUserManagementAction(
        "user_details_viewed",
        "success",
        `Viewed detailed information for user: ${user.email}`,
        auth.currentUser,
        {
          viewedUserId: user.uid,
          viewedUserEmail: user.email,
          viewedUserName: user.displayName,
          watchHistoryCount: watchHistoryData.length,
          transactionsCount: transactionsData.length,
        },
      );
    } catch (error) {
      console.error("Error fetching user data:", error);

      // ✅ OPTIONAL: Log error
      await logUserManagementAction(
        "user_details_view_failed",
        "failed",
        `Failed to view user details for: ${user.email}`,
        auth.currentUser,
        {
          error: error instanceof Error ? error.message : "Unknown error",
          userId: user.uid,
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!isOpen) return null;

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
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white relative overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute inset-0 bg-white/10 rounded-full blur-3xl"
            />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-black">{user.displayName}</h2>
                  <p className="text-white/90">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {user.emailVerified && (
                      <span className="px-2 py-1 bg-green-500/30 backdrop-blur-xl rounded-lg text-xs font-bold flex items-center gap-1">
                        <CheckCircle size={12} /> Verified
                      </span>
                    )}
                    {user.isPremium && (
                      <span className="px-2 py-1 bg-yellow-500/30 backdrop-blur-xl rounded-lg text-xs font-bold flex items-center gap-1">
                        <Crown size={12} /> Premium
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <X size={24} />
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex gap-2 px-6">
              {[
                { id: "overview", label: "Overview", icon: User },
                { id: "activity", label: "Activity", icon: TrendingUp },
                { id: "transactions", label: "Transactions", icon: CreditCard },
                { id: "devices", label: "Devices", icon: Smartphone },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-4 font-bold transition-all flex items-center gap-2 border-b-2 ${
                      activeTab === tab.id
                        ? "border-purple-500 text-purple-600 dark:text-purple-400"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 text-white">
                    <Eye size={24} className="mb-2 opacity-80" />
                    <p className="text-3xl font-black">
                      {user.stats?.totalViews || 0}
                    </p>
                    <p className="text-sm opacity-90">Total Views</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-4 text-white">
                    <Clock size={24} className="mb-2 opacity-80" />
                    <p className="text-3xl font-black">
                      {formatDuration(user.stats?.totalWatchTime || 0)}
                    </p>
                    <p className="text-sm opacity-90">Watch Time</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-4 text-white">
                    <Heart size={24} className="mb-2 opacity-80" />
                    <p className="text-3xl font-black">
                      {user.stats?.totalLikes || 0}
                    </p>
                    <p className="text-sm opacity-90">Likes</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 text-white">
                    <Star size={24} className="mb-2 opacity-80" />
                    <p className="text-3xl font-black">
                      {user.rewardPoints || 0}
                    </p>
                    <p className="text-sm opacity-90">Rewards</p>
                  </div>
                </div>

                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <User size={20} className="text-purple-500" />
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <Mail size={18} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Email
                          </p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      {user.phoneNumber && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <Phone size={18} className="text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Phone
                            </p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">
                              {user.phoneNumber}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <Calendar size={18} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Joined
                          </p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <Clock size={18} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Last Login
                          </p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {formatDate(user.lastLogin)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <Shield size={20} className="text-purple-500" />
                      Account Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <Crown size={18} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Current Plan
                          </p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white capitalize">
                            {user.currentPlanId || "Free"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <Smartphone
                          size={18}
                          className="text-slate-400 mt-0.5"
                        />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Devices
                          </p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {user.currentDeviceCount || 0} /{" "}
                            {user.maxDevices || 3}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <User size={18} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Profiles
                          </p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {user.profiles?.length || 0} /{" "}
                            {user.maxProfiles || 5}
                          </p>
                        </div>
                      </div>
                      {user.subscriptionEndDate && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <Calendar
                            size={18}
                            className="text-slate-400 mt-0.5"
                          />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Subscription Ends
                            </p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">
                              {formatDate(user.subscriptionEndDate)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    Verification Status
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div
                      className={`p-4 rounded-xl border-2 ${user.emailVerified ? "bg-green-50 dark:bg-green-900/20 border-green-500" : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"}`}
                    >
                      {user.emailVerified ? (
                        <CheckCircle
                          className="text-green-500 mb-2"
                          size={20}
                        />
                      ) : (
                        <XCircle className="text-slate-400 mb-2" size={20} />
                      )}
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        Email
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-xl border-2 ${user.phoneVerified ? "bg-green-50 dark:bg-green-900/20 border-green-500" : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"}`}
                    >
                      {user.phoneVerified ? (
                        <CheckCircle
                          className="text-green-500 mb-2"
                          size={20}
                        />
                      ) : (
                        <XCircle className="text-slate-400 mb-2" size={20} />
                      )}
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        Phone
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-xl border-2 ${user.kycVerified ? "bg-green-50 dark:bg-green-900/20 border-green-500" : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"}`}
                    >
                      {user.kycVerified ? (
                        <CheckCircle
                          className="text-green-500 mb-2"
                          size={20}
                        />
                      ) : (
                        <XCircle className="text-slate-400 mb-2" size={20} />
                      )}
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        KYC
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-xl border-2 ${user.twoFactorEnabled ? "bg-green-50 dark:bg-green-900/20 border-green-500" : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"}`}
                    >
                      {user.twoFactorEnabled ? (
                        <CheckCircle
                          className="text-green-500 mb-2"
                          size={20}
                        />
                      ) : (
                        <XCircle className="text-slate-400 mb-2" size={20} />
                      )}
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        2FA
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Recent Watch History
                </h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : watchHistory.length > 0 ? (
                  <div className="space-y-3">
                    {watchHistory.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 dark:text-white">
                            {item.contentTitle || "Unknown Content"}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                            {item.contentType}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            {formatDate(item.watchedAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{
                                width: `${(item.progress / item.duration) * 100}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {Math.round((item.progress / item.duration) * 100)}%
                            watched
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No watch history found
                  </div>
                )}
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Transaction History
                </h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((txn, index) => (
                      <motion.div
                        key={txn.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">
                            ₹{txn.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                            {txn.type} - {txn.planName || "N/A"}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            {formatDate(txn.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            txn.status === "completed"
                              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                              : txn.status === "pending"
                                ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {txn.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No transactions found
                  </div>
                )}
              </div>
            )}

            {activeTab === "devices" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Connected Devices
                </h3>
                {user.devices && user.devices.length > 0 ? (
                  <div className="space-y-3">
                    {user.devices.map((device: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white">
                            <Smartphone size={24} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">
                              {device.deviceName || "Unknown Device"}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {device.deviceType || "N/A"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {device.location && (
                                <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                  <MapPin size={12} />
                                  {device.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            Last Active
                          </p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {formatDate(device.lastActive)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No devices connected
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserDetailModal;
