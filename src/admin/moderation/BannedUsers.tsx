import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserX,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Shield,
  Calendar,
  Clock,
  AlertTriangle,
  RefreshCw,
  Ban,
  User,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { usePermissions } from "../../hooks/usePermissions";
import { Permission } from "../../types/roles";
import { type User as UserType } from "../../types/user";
import { logUserModerationAction, logError } from "../../utils/activityLogger";

interface BannedUser extends UserType {
  banReason?: string;
  bannedBy?: string;
  bannedAt?: string;
  banDuration?: string;
  banExpiresAt?: string;
}

interface Toast {
  message: string;
  type: "success" | "error" | "info" | "warning";
  isVisible: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 TOAST COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const Toast: React.FC<Toast & { onClose: () => void }> = ({
  message,
  type,
  isVisible,
  onClose,
}) => {
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
    info: AlertTriangle,
    warning: AlertTriangle,
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
// 👤 USER DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface UserDetailModalProps {
  user: BannedUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUnban: (userId: string) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onUnban,
}) => {
  if (!isOpen || !user) return null;

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
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 text-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <UserX size={24} />
                </div>
                <h3 className="text-2xl font-black">Banned User Details</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <XCircle size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user.displayName?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                  {user.displayName || "Unnamed User"}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
                {user.phoneNumber && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {user.phoneNumber}
                  </p>
                )}
              </div>
              <span className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-xl text-sm font-bold">
                BANNED
              </span>
            </div>

            {/* Ban Details */}
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-3">
                <Ban size={20} className="text-red-600" />
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                  Ban Information
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Reason
                  </p>
                  <p className="text-slate-800 dark:text-white font-bold">
                    {user.moderation?.banReason ||
                      user.banReason ||
                      "No reason provided"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Banned By
                    </p>
                    <p className="text-slate-800 dark:text-white font-semibold">
                      {user.moderation?.bannedBy || user.bannedBy || "System"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Ban Duration
                    </p>
                    <p className="text-slate-800 dark:text-white font-semibold">
                      {user.banDuration || "Permanent"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Banned At
                  </p>
                  <p className="text-slate-800 dark:text-white font-semibold">
                    {user.moderation?.bannedAt || user.bannedAt || "Unknown"}
                  </p>
                </div>

                {user.banExpiresAt && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Expires At
                    </p>
                    <p className="text-slate-800 dark:text-white font-semibold">
                      {user.banExpiresAt}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={20} className="text-slate-500" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Role
                  </span>
                </div>
                <p className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                  {user.role || "Viewer"}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={20} className="text-slate-500" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Joined
                  </span>
                </div>
                <p className="text-lg font-bold text-slate-800 dark:text-white">
                  {formatDate(user.createdAt)}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={20} className="text-slate-500" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Last Login
                  </span>
                </div>
                <p className="text-lg font-bold text-slate-800 dark:text-white">
                  {formatDate(user.lastLogin)}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <User size={20} className="text-slate-500" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Subscription
                  </span>
                </div>
                <p className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                  {user.isPremium ? "Premium" : "Free"}
                </p>
              </div>
            </div>

            {/* Warning Count */}
            {user.moderation?.warnings && user.moderation.warnings > 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={20} className="text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                    Previous Warnings: {user.moderation.warnings}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
            >
              Close
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onUnban(user.uid);
                onClose();
              }}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <CheckCircle size={20} />
              Unban User
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🚫 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const BannedUsers: React.FC = () => {
  const { can } = usePermissions();

  // State
  const [users, setUsers] = useState<BannedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<BannedUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<Toast>({
    message: "",
    type: "info",
    isVisible: false,
  });

  // Fetch Banned Users
  useEffect(() => {
    fetchBannedUsers();
  }, []);

  // Filter Users
  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phoneNumber?.includes(searchQuery),
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [users, searchQuery]);

  const fetchBannedUsers = async () => {
    try {
      setLoading(true);

      const q = query(
        collection(db, "users"),
        where("status", "==", "banned"),
        orderBy("createdAt", "desc"),
        limit(100),
      );

      const snapshot = await getDocs(q);
      const usersData: BannedUser[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          uid: docSnap.id,
          email: data.email || "",
          phoneNumber: data.phoneNumber,
          displayName: data.displayName || "Unnamed User",
          photoURL: data.photoURL,
          role: data.role || "viewer",
          currentPlanId: data.currentPlanId || "free",
          isPremium: data.isPremium || false,
          status: data.status || "banned",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          lastLogin: data.lastLogin,
          moderation: data.moderation,
          banReason: data.moderation?.banReason,
          bannedBy: data.moderation?.bannedBy,
          bannedAt: data.moderation?.bannedAt,
          banDuration: data.moderation?.banDuration || "Permanent",
          banExpiresAt: data.moderation?.banExpiresAt,
        } as BannedUser;
      });

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Error fetching banned users:", error);
      showToast("Failed to load banned users", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: Toast["type"]) => {
    setToast({ message, type, isVisible: true });
  };

  const handleUnban = async (userId: string) => {
    if (!can(Permission.BAN_USERS)) {
      showToast("You do not have permission to unban users", "error");
      return;
    }

    if (!window.confirm("Are you sure you want to unban this user?")) {
      return;
    }

    // Find user details before unbanning
    const user = users.find((u) => u.uid === userId);

    try {
      await updateDoc(doc(db, "users", userId), {
        status: "active",
        "moderation.bannedAt": null,
        "moderation.bannedBy": null,
        "moderation.banReason": null,
        "moderation.banDuration": null,
        "moderation.banExpiresAt": null,
        updatedAt: Timestamp.now(),
      });

      setUsers((prev) => prev.filter((u) => u.uid !== userId));
      showToast("User unbanned successfully", "success");

      // ✅ ADD LOGGING
      await logUserModerationAction(
        "unban",
        userId,
        user?.displayName || user?.email || "Unknown User",
        {
          email: user?.email,
          previousBanReason: user?.banReason || user?.moderation?.banReason,
          previousBanDuration: user?.banDuration,
          bannedBy: user?.bannedBy || user?.moderation?.bannedBy,
        },
      );
    } catch (error) {
      console.error("Error unbanning user:", error);
      showToast("Failed to unban user", "error");

      // ✅ ADD ERROR LOGGING
      await logError("User Management", "Failed to unban user", {
        error,
        userId,
        userName: user?.displayName || user?.email,
      });
    }
  };

  const handleViewDetails = (user: BannedUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // const formatDate = (timestamp: any): string => {
  //     if (!timestamp) return 'N/A';
  //     const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  //     return date.toLocaleDateString('en-US', {
  //         year: 'numeric',
  //         month: 'short',
  //         day: 'numeric',
  //     });
  // };

  return (
    <div className="min-h-screen w-full">
      {/* Toast */}
      <Toast
        {...toast}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUnban={handleUnban}
      />

      <div className="space-y-6 w-full">
        {/* Header & Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden w-full"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                  <UserX size={36} />
                  Banned Users
                </h1>
                <p className="text-white/90 text-lg">
                  Manage banned and suspended users
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                <p className="text-white/80 text-sm mb-1">Total Banned</p>
                <p className="text-4xl font-black">{users.length}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                <p className="text-white/80 text-sm mb-1">Permanent Bans</p>
                <p className="text-4xl font-black text-red-300">
                  {users.filter((u) => u.banDuration === "Permanent").length}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                <p className="text-white/80 text-sm mb-1">Temporary Bans</p>
                <p className="text-4xl font-black text-yellow-300">
                  {users.filter((u) => u.banDuration !== "Permanent").length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 w-full"
        >
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchBannedUsers}
              className="px-6 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-gray-700 border-t-transparent rounded-full"
              />
              <p className="text-slate-600 dark:text-slate-400 font-semibold mt-4">
                Loading banned users...
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <UserX className="text-slate-300 dark:text-slate-600" size={64} />
              <p className="text-xl font-bold text-slate-400 dark:text-slate-500 mt-4">
                No banned users found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Banned By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Ban Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.uid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-white font-bold">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              user.displayName?.charAt(0).toUpperCase() || "U"
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">
                              {user.displayName || "Unnamed User"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="px-6 py-4">
                        <p className="text-slate-800 dark:text-white max-w-xs truncate">
                          {user.moderation?.banReason ||
                            user.banReason ||
                            "No reason"}
                        </p>
                      </td>

                      {/* Banned By */}
                      <td className="px-6 py-4">
                        <p className="text-slate-800 dark:text-white">
                          {user.moderation?.bannedBy ||
                            user.bannedBy ||
                            "System"}
                        </p>
                      </td>

                      {/* Ban Date */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {user.moderation?.bannedAt ||
                            user.bannedAt ||
                            "Unknown"}
                        </p>
                      </td>

                      {/* Duration */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            user.banDuration === "Permanent"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {user.banDuration || "Permanent"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewDetails(user)}
                            className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </motion.button>

                          {can(Permission.BAN_USERS) && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleUnban(user.uid)}
                              className="p-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all"
                              title="Unban"
                            >
                              <CheckCircle size={18} />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannedUsers;
