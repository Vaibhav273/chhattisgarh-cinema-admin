import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Plus,
  Edit2,
  Trash2,
  Users,
  DollarSign,
  Percent,
  Copy,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  Ticket,
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
} from "firebase/firestore";
import { db } from "../../config/firebase";

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 INTERFACES & TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Promotion {
  id: string;
  code: string;
  description: string;
  type: "percentage" | "fixed";
  discount: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  userLimit: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  totalRevenue: number;
  totalSavings: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PromotionStats {
  totalPromotions: number;
  activePromotions: number;
  expiredPromotions: number;
  totalUsage: number;
  totalRevenue: number;
  totalSavings: number;
  averageDiscount: number;
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

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const PromotionsManagement: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [stats, setStats] = useState<PromotionStats>({
    totalPromotions: 0,
    activePromotions: 0,
    expiredPromotions: 0,
    totalUsage: 0,
    totalRevenue: 0,
    totalSavings: 0,
    averageDiscount: 0,
  });

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null,
  );

  // Toast
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });

  // Fetch promotions
  useEffect(() => {
    fetchPromotions();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [promotions, statusFilter]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      console.log("Fetching promotions...");

      const promotionsQuery = query(
        collection(db, "promotions"),
        orderBy("createdAt", "desc"),
      );
      const promotionsSnapshot = await getDocs(promotionsQuery);

      const promotionsList: Promotion[] = [];
      let activeCount = 0;
      let expiredCount = 0;
      let totalUsage = 0;
      let totalRevenue = 0;
      let totalSavings = 0;
      let totalDiscount = 0;

      const now = new Date();

      promotionsSnapshot.forEach((doc) => {
        const data = doc.data();
        const validUntil = data.validUntil?.toDate() || new Date();
        const isExpired = validUntil < now;

        const promotion: Promotion = {
          id: doc.id,
          code: data.code || "",
          description: data.description || "",
          type: data.type || "percentage",
          discount: data.discount || 0,
          minPurchase: data.minPurchase || 0,
          maxDiscount: data.maxDiscount,
          usageLimit: data.usageLimit || 0,
          usedCount: data.usedCount || 0,
          userLimit: data.userLimit || 1,
          validFrom: data.validFrom?.toDate() || new Date(),
          validUntil: validUntil,
          isActive: data.isActive && !isExpired,
          totalRevenue: data.totalRevenue || 0,
          totalSavings: data.totalSavings || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };

        promotionsList.push(promotion);

        if (promotion.isActive && !isExpired) activeCount++;
        if (isExpired) expiredCount++;

        totalUsage += promotion.usedCount;
        totalRevenue += promotion.totalRevenue;
        totalSavings += promotion.totalSavings;
        totalDiscount += promotion.discount;
      });

      const averageDiscount =
        promotionsList.length > 0 ? totalDiscount / promotionsList.length : 0;

      setStats({
        totalPromotions: promotionsList.length,
        activePromotions: activeCount,
        expiredPromotions: expiredCount,
        totalUsage,
        totalRevenue,
        totalSavings,
        averageDiscount,
      });

      setPromotions(promotionsList);
      console.log("✅ Promotions fetched successfully");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      showToast("Failed to load promotions", "error");
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...promotions];
    const now = new Date();

    if (statusFilter === "active") {
      filtered = filtered.filter(
        (promo) => promo.isActive && promo.validUntil > now,
      );
    } else if (statusFilter === "expired") {
      filtered = filtered.filter((promo) => promo.validUntil < now);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((promo) => !promo.isActive);
    }

    setFilteredPromotions(filtered);
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

  const handleToggleActive = async (promotion: Promotion) => {
    try {
      await updateDoc(doc(db, "promotions", promotion.id), {
        isActive: !promotion.isActive,
        updatedAt: Timestamp.now(),
      });

      showToast(
        `Promotion ${!promotion.isActive ? "activated" : "deactivated"} successfully`,
        "success",
      );
      fetchPromotions();
    } catch (error) {
      console.error("Error toggling promotion status:", error);
      showToast("Failed to update promotion status", "error");
    }
  };

  const handleDelete = async (promotion: Promotion) => {
    if (
      !window.confirm(
        `Are you sure you want to delete promo code "${promotion.code}"?`,
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "promotions", promotion.id));
      showToast("Promotion deleted successfully", "success");
      fetchPromotions();
    } catch (error) {
      console.error("Error deleting promotion:", error);
      showToast("Failed to delete promotion", "error");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast("Promo code copied to clipboard", "success");
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getStatusColor = (promotion: Promotion) => {
    const now = new Date();
    if (promotion.validUntil < now) {
      return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
    }
    if (!promotion.isActive) {
      return "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400";
    }
    return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
  };

  const getStatusText = (promotion: Promotion) => {
    const now = new Date();
    if (promotion.validUntil < now) return "Expired";
    if (!promotion.isActive) return "Inactive";
    return "Active";
  };

  const getUsagePercentage = (usedCount: number, usageLimit: number) => {
    if (usageLimit === 0) return 0;
    return Math.min((usedCount / usageLimit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-600 dark:text-slate-400 font-semibold">
          Loading promotions...
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

      <div className="space-y-6 w-full">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
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
                  <Gift size={32} />
                </div>
                <div>
                  <h1 className="text-4xl font-black mb-2">
                    Promotions Management
                  </h1>
                  <p className="text-white/90 text-lg">
                    Manage promo codes, discounts, and special offers
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchPromotions}
                  className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                >
                  <RefreshCw size={20} />
                  Refresh
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/admin/marketing/promotions/new")}
                  className="px-8 py-3 bg-white text-purple-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create Promo Code
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
                <Gift
                  size={24}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Total Promotions
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {stats.totalPromotions}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Active: {stats.activePromotions} • Expired:{" "}
              {stats.expiredPromotions}
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
              Total Usage
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {formatNumber(stats.totalUsage)}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
              Times codes were used
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
                <DollarSign
                  size={24}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Total Revenue
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 font-bold">
              Generated from promos
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
                <Percent
                  size={24}
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Avg Discount
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {stats.averageDiscount.toFixed(1)}%
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400 font-bold">
              {formatCurrency(stats.totalSavings)} saved
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
          <div className="p-6">
            <div className="flex gap-3">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  statusFilter === "all"
                    ? "bg-purple-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                All ({promotions.length})
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  statusFilter === "active"
                    ? "bg-green-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Active ({stats.activePromotions})
              </button>
              <button
                onClick={() => setStatusFilter("expired")}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  statusFilter === "expired"
                    ? "bg-red-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Expired ({stats.expiredPromotions})
              </button>
              <button
                onClick={() => setStatusFilter("inactive")}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  statusFilter === "inactive"
                    ? "bg-gray-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </motion.div>

        {/* PROMOTIONS TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-800 dark:text-white">
              All Promo Codes ({filteredPromotions.length})
            </h3>
          </div>

          {filteredPromotions.length === 0 ? (
            <div className="text-center py-16">
              <Gift
                size={64}
                className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
              />
              <p className="text-xl font-bold text-slate-500 dark:text-slate-400 mb-2">
                No promotions found
              </p>
              <p className="text-slate-400 dark:text-slate-500 mb-4">
                Create your first promo code to boost sales
              </p>
              <button
                onClick={() => navigate("/admin/marketing/promotions/new")}
                className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all"
              >
                Create Promo Code
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Promo Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Discount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Usage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Revenue
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Validity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredPromotions.map((promotion, index) => {
                    const usagePercentage = getUsagePercentage(
                      promotion.usedCount,
                      promotion.usageLimit,
                    );

                    return (
                      <motion.tr
                        key={promotion.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.05 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <code className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg font-mono font-bold text-sm">
                                {promotion.code}
                              </code>
                              <button
                                onClick={() => handleCopyCode(promotion.code)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"
                                title="Copy code"
                              >
                                <Copy
                                  size={16}
                                  className="text-slate-600 dark:text-slate-400"
                                />
                              </button>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {promotion.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {promotion.type === "percentage" ? (
                              <>
                                <Percent
                                  size={16}
                                  className="text-green-600 dark:text-green-400"
                                />
                                <span className="font-bold text-green-600 dark:text-green-400">
                                  {promotion.discount}%
                                </span>
                              </>
                            ) : (
                              <>
                                <DollarSign
                                  size={16}
                                  className="text-green-600 dark:text-green-400"
                                />
                                <span className="font-bold text-green-600 dark:text-green-400">
                                  {formatCurrency(promotion.discount)}
                                </span>
                              </>
                            )}
                          </div>
                          {promotion.minPurchase > 0 && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Min: {formatCurrency(promotion.minPurchase)}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-slate-800 dark:text-white">
                                {promotion.usedCount}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400">
                                / {promotion.usageLimit}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${usagePercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(promotion.totalRevenue)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Saved: {formatCurrency(promotion.totalSavings)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {formatDate(promotion.validUntil)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              From {formatDate(promotion.validFrom)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getStatusColor(
                              promotion,
                            )}`}
                          >
                            {getStatusText(promotion)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedPromotion(promotion);
                                setIsPreviewOpen(true);
                              }}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                              title="Preview"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/marketing/promotions/edit/${promotion.id}`,
                                )
                              }
                              className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleToggleActive(promotion)}
                              className={`p-2 rounded-lg transition-all ${
                                promotion.isActive
                                  ? "text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                                  : "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                              }`}
                              title={
                                promotion.isActive ? "Deactivate" : "Activate"
                              }
                            >
                              <Ticket size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(promotion)}
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
        {isPreviewOpen && selectedPromotion && (
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
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Gift
                        size={24}
                        className="text-purple-600 dark:text-purple-400"
                      />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                      Promo Code Details
                    </h2>
                  </div>
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
                <div className="text-center p-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl">
                  <code className="text-4xl font-black text-white font-mono">
                    {selectedPromotion.code}
                  </code>
                  <p className="text-white/90 mt-2">
                    {selectedPromotion.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Discount
                    </p>
                    <p className="text-2xl font-black text-green-600 dark:text-green-400">
                      {selectedPromotion.type === "percentage"
                        ? `${selectedPromotion.discount}%`
                        : formatCurrency(selectedPromotion.discount)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Type
                    </p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white capitalize">
                      {selectedPromotion.type}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Used
                    </p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                      {selectedPromotion.usedCount}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Limit
                    </p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                      {selectedPromotion.usageLimit}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Per User
                    </p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                      {selectedPromotion.userLimit}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Revenue Generated
                    </p>
                    <p className="text-2xl font-black text-green-600 dark:text-green-400">
                      {formatCurrency(selectedPromotion.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Total Savings
                    </p>
                    <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                      {formatCurrency(selectedPromotion.totalSavings)}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Validity Period
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        From
                      </p>
                      <p className="font-bold text-slate-800 dark:text-white">
                        {formatDate(selectedPromotion.validFrom)}
                      </p>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Until
                      </p>
                      <p className="font-bold text-slate-800 dark:text-white">
                        {formatDate(selectedPromotion.validUntil)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Status
                  </span>
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${getStatusColor(
                      selectedPromotion,
                    )}`}
                  >
                    {getStatusText(selectedPromotion)}
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

export default PromotionsManagement;
