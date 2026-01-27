import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Gift,
  Save,
  AlertCircle,
  CheckCircle,
  Percent,
  DollarSign,
  Users,
  Calendar,
  Eye,
  Sparkles,
  TrendingUp,
  Hash,
  Ticket,
  Target,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 INTERFACES & TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  isVisible: boolean;
  onClose: () => void;
}

interface FormErrors {
  code?: string;
  description?: string;
  discount?: string;
  minPurchase?: string;
  usageLimit?: string;
  userLimit?: string;
  validFrom?: string;
  validUntil?: string;
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
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const AddNewEditPromotion: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  // Loading state
  const [loading, setLoading] = useState(isEditMode);
  const [promotionNotFound, setPromotionNotFound] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "percentage" as "percentage" | "fixed",
    discount: "",
    minPurchase: "",
    maxDiscount: "",
    usageLimit: "",
    userLimit: "1",
    validFrom: "",
    validUntil: "",
    isActive: true,
  });

  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Toast
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });

  // Fetch promotion data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchPromotionData();
    }
  }, [isEditMode, id]);

  const fetchPromotionData = async () => {
    try {
      setLoading(true);
      const promotionDoc = await getDoc(doc(db, "promotions", id!));

      if (!promotionDoc.exists()) {
        setPromotionNotFound(true);
        showToast("Promotion not found", "error");
        setLoading(false);
        return;
      }

      const data = promotionDoc.data();

      // Parse dates
      let validFrom = "";
      let validUntil = "";
      if (data.validFrom) {
        validFrom = data.validFrom.toDate().toISOString().split("T")[0];
      }
      if (data.validUntil) {
        validUntil = data.validUntil.toDate().toISOString().split("T")[0];
      }

      setFormData({
        code: data.code || "",
        description: data.description || "",
        type: data.type || "percentage",
        discount: data.discount?.toString() || "",
        minPurchase: data.minPurchase?.toString() || "",
        maxDiscount: data.maxDiscount?.toString() || "",
        usageLimit: data.usageLimit?.toString() || "",
        userLimit: data.userLimit?.toString() || "1",
        validFrom,
        validUntil,
        isActive: data.isActive ?? true,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching promotion:", error);
      showToast("Failed to load promotion data", "error");
      setPromotionNotFound(true);
      setLoading(false);
    }
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

  // Generate random promo code
  const generatePromoCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Promo code is required";
    } else if (formData.code.length < 4) {
      newErrors.code = "Code must be at least 4 characters";
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      newErrors.code = "Code must contain only uppercase letters and numbers";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    const discount = parseFloat(formData.discount);
    if (!formData.discount || isNaN(discount) || discount <= 0) {
      newErrors.discount = "Valid discount amount is required";
    } else if (formData.type === "percentage" && discount > 100) {
      newErrors.discount = "Percentage cannot exceed 100%";
    }

    const minPurchase = parseFloat(formData.minPurchase);
    if (formData.minPurchase && (isNaN(minPurchase) || minPurchase < 0)) {
      newErrors.minPurchase = "Invalid minimum purchase amount";
    }

    const usageLimit = parseInt(formData.usageLimit);
    if (!formData.usageLimit || isNaN(usageLimit) || usageLimit <= 0) {
      newErrors.usageLimit = "Valid usage limit is required";
    }

    const userLimit = parseInt(formData.userLimit);
    if (!formData.userLimit || isNaN(userLimit) || userLimit <= 0) {
      newErrors.userLimit = "Valid user limit is required";
    }

    if (!formData.validFrom) {
      newErrors.validFrom = "Start date is required";
    }

    if (!formData.validUntil) {
      newErrors.validUntil = "End date is required";
    }

    if (formData.validFrom && formData.validUntil) {
      const startDate = new Date(formData.validFrom);
      const endDate = new Date(formData.validUntil);
      if (endDate <= startDate) {
        newErrors.validUntil = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix the errors in the form", "warning");
      return;
    }

    try {
      setUploading(true);

      // Create promotion data
      const promotionData = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        type: formData.type,
        discount: parseFloat(formData.discount),
        minPurchase: formData.minPurchase
          ? parseFloat(formData.minPurchase)
          : 0,
        maxDiscount: formData.maxDiscount
          ? parseFloat(formData.maxDiscount)
          : null,
        usageLimit: parseInt(formData.usageLimit),
        userLimit: parseInt(formData.userLimit),
        validFrom: Timestamp.fromDate(new Date(formData.validFrom)),
        validUntil: Timestamp.fromDate(new Date(formData.validUntil)),
        isActive: formData.isActive,
        updatedAt: Timestamp.now(),
      };

      if (isEditMode) {
        // Update existing promotion
        await updateDoc(doc(db, "promotions", id!), promotionData);
        showToast("Promotion updated successfully!", "success");
      } else {
        // Create new promotion
        await addDoc(collection(db, "promotions"), {
          ...promotionData,
          usedCount: 0,
          totalRevenue: 0,
          totalSavings: 0,
          createdAt: Timestamp.now(),
        });
        showToast("Promotion created successfully!", "success");
      }

      // Navigate back after 1.5 seconds
      setTimeout(() => {
        navigate("/admin/marketing/promotions");
      }, 1500);

      setUploading(false);
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} promotion:`,
        error,
      );
      showToast(
        `Failed to ${isEditMode ? "update" : "create"} promotion. Please try again.`,
        "error",
      );
      setUploading(false);
    }
  };

  const formatCurrency = (amount: string): string => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const calculateSampleDiscount = () => {
    const discount = parseFloat(formData.discount) || 0;
    const samplePrice = 500;

    if (formData.type === "percentage") {
      const discountAmount = (samplePrice * discount) / 100;
      const maxDiscount = formData.maxDiscount
        ? parseFloat(formData.maxDiscount)
        : Infinity;
      const finalDiscount = Math.min(discountAmount, maxDiscount);
      return {
        original: samplePrice,
        discount: finalDiscount,
        final: samplePrice - finalDiscount,
      };
    } else {
      return {
        original: samplePrice,
        discount: Math.min(discount, samplePrice),
        final: Math.max(samplePrice - discount, 0),
      };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-600 dark:text-slate-400 font-semibold">
          Loading promotion data...
        </p>
      </div>
    );
  }

  // Not found state
  if (promotionNotFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
          Promotion Not Found
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The promotion you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate("/admin/marketing/promotions")}
          className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all"
        >
          Back to Promotions
        </button>
      </div>
    );
  }

  const sampleDiscount = calculateSampleDiscount();

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
            <button
              onClick={() => navigate("/admin/marketing/promotions")}
              className="mb-4 px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back to Promotions
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <Gift size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-black mb-2">
                  {isEditMode ? "Edit Promotion" : "Create New Promotion"}
                </h1>
                <p className="text-white/90 text-lg">
                  {isEditMode
                    ? "Update promo code details and settings"
                    : "Create promotional offers to boost subscriptions"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN - Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Promo Code Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">
                    Promo Code Details
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  {/* Promo Code */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Promo Code *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            code: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="e.g., NEWUSER50"
                        maxLength={20}
                        className={`flex-1 px-4 py-3 border ${
                          errors.code
                            ? "border-red-500"
                            : "border-slate-300 dark:border-slate-700"
                        } rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      <button
                        type="button"
                        onClick={generatePromoCode}
                        className="px-4 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl font-bold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all flex items-center gap-2"
                      >
                        <Sparkles size={20} />
                        Generate
                      </button>
                    </div>
                    {errors.code ? (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle size={16} />
                        {errors.code}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Uppercase letters and numbers only (4-20 characters)
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description of this offer..."
                      rows={3}
                      maxLength={200}
                      className={`w-full px-4 py-3 border ${
                        errors.description
                          ? "border-red-500"
                          : "border-slate-300 dark:border-slate-700"
                      } rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.description ? (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertCircle size={16} />
                          {errors.description}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Explain what this promo offers
                        </p>
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formData.description.length}/200
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Discount Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <TrendingUp
                        size={20}
                        className="text-green-600 dark:text-green-400"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white">
                        Discount Settings
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Configure discount type and amount
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                      Discount Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, type: "percentage" })
                        }
                        className={`p-4 border-2 rounded-xl transition-all ${
                          formData.type === "percentage"
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                            : "border-slate-300 dark:border-slate-700 hover:border-purple-300"
                        }`}
                      >
                        <Percent
                          size={32}
                          className={`mx-auto mb-2 ${
                            formData.type === "percentage"
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        />
                        <p
                          className={`text-sm font-bold ${
                            formData.type === "percentage"
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          Percentage
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          % off total
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, type: "fixed" })
                        }
                        className={`p-4 border-2 rounded-xl transition-all ${
                          formData.type === "fixed"
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                            : "border-slate-300 dark:border-slate-700 hover:border-purple-300"
                        }`}
                      >
                        <DollarSign
                          size={32}
                          className={`mx-auto mb-2 ${
                            formData.type === "fixed"
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        />
                        <p
                          className={`text-sm font-bold ${
                            formData.type === "fixed"
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          Fixed Amount
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          ₹ off total
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Discount Amount */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Discount{" "}
                      {formData.type === "percentage" ? "Percentage" : "Amount"}{" "}
                      *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) =>
                          setFormData({ ...formData, discount: e.target.value })
                        }
                        placeholder={
                          formData.type === "percentage" ? "50" : "100"
                        }
                        min="0"
                        max={formData.type === "percentage" ? "100" : undefined}
                        step={formData.type === "percentage" ? "1" : "10"}
                        className={`w-full px-4 py-3 pr-12 border ${
                          errors.discount
                            ? "border-red-500"
                            : "border-slate-300 dark:border-slate-700"
                        } rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold">
                        {formData.type === "percentage" ? "%" : "₹"}
                      </div>
                    </div>
                    {errors.discount && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle size={16} />
                        {errors.discount}
                      </p>
                    )}
                  </div>

                  {/* Min Purchase & Max Discount */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Min Purchase (Optional)
                      </label>
                      <input
                        type="number"
                        value={formData.minPurchase}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minPurchase: e.target.value,
                          })
                        }
                        placeholder="0"
                        min="0"
                        step="10"
                        className={`w-full px-4 py-3 border ${
                          errors.minPurchase
                            ? "border-red-500"
                            : "border-slate-300 dark:border-slate-700"
                        } rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Minimum purchase amount
                      </p>
                    </div>

                    {formData.type === "percentage" && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Max Discount (Optional)
                        </label>
                        <input
                          type="number"
                          value={formData.maxDiscount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxDiscount: e.target.value,
                            })
                          }
                          placeholder="No limit"
                          min="0"
                          step="10"
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Cap discount amount
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Usage Limits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Target
                        size={20}
                        className="text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white">
                        Usage Limits
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Control how many times this code can be used
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        <div className="flex items-center gap-2">
                          <Hash size={16} />
                          Total Usage Limit *
                        </div>
                      </label>
                      <input
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            usageLimit: e.target.value,
                          })
                        }
                        placeholder="500"
                        min="1"
                        className={`w-full px-4 py-3 border ${
                          errors.usageLimit
                            ? "border-red-500"
                            : "border-slate-300 dark:border-slate-700"
                        } rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      {errors.usageLimit ? (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertCircle size={16} />
                          {errors.usageLimit}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Total times code can be used
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          Uses Per User *
                        </div>
                      </label>
                      <input
                        type="number"
                        value={formData.userLimit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            userLimit: e.target.value,
                          })
                        }
                        placeholder="1"
                        min="1"
                        className={`w-full px-4 py-3 border ${
                          errors.userLimit
                            ? "border-red-500"
                            : "border-slate-300 dark:border-slate-700"
                        } rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      {errors.userLimit ? (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertCircle size={16} />
                          {errors.userLimit}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Max uses per single user
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Validity Period */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                      <Calendar
                        size={20}
                        className="text-orange-600 dark:text-orange-400"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white">
                        Validity Period
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Set when this promotion is valid
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.validFrom}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            validFrom: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 border ${
                          errors.validFrom
                            ? "border-red-500"
                            : "border-slate-300 dark:border-slate-700"
                        } rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      {errors.validFrom && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertCircle size={16} />
                          {errors.validFrom}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            validUntil: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 border ${
                          errors.validUntil
                            ? "border-red-500"
                            : "border-slate-300 dark:border-slate-700"
                        } rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      {errors.validUntil && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertCircle size={16} />
                          {errors.validUntil}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN - Preview & Actions */}
            <div className="space-y-6">
              {/* Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-6"
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">
                    Status
                  </h3>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        Active Status
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Enable this promotion
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          isActive: !formData.isActive,
                        })
                      }
                      className={`relative w-14 h-8 rounded-full transition-all ${
                        formData.isActive
                          ? "bg-green-500"
                          : "bg-slate-300 dark:bg-slate-600"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                          formData.isActive ? "right-1" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Eye
                        size={20}
                        className="text-purple-600 dark:text-purple-400"
                      />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">
                      Preview
                    </h3>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Promo Card */}
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl text-white">
                    <div className="flex items-center justify-between mb-3">
                      <Ticket size={24} />
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-xl rounded-lg text-xs font-bold">
                        PROMO
                      </span>
                    </div>
                    <code className="text-2xl font-black font-mono block mb-2">
                      {formData.code || "PROMOCODE"}
                    </code>
                    <p className="text-sm text-white/90">
                      {formData.description ||
                        "Promo description will appear here"}
                    </p>
                  </div>

                  {/* Sample Calculation */}
                  {formData.discount && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-3">
                        Sample Calculation
                      </p>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          Original Price:
                        </span>
                        <span className="font-bold text-slate-800 dark:text-white">
                          {formatCurrency(sampleDiscount.original.toString())}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          Discount:
                        </span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          -{formatCurrency(sampleDiscount.discount.toString())}
                        </span>
                      </div>
                      <div className="border-t border-slate-300 dark:border-slate-600 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            Final Price:
                          </span>
                          <span className="font-black text-xl text-purple-600 dark:text-purple-400">
                            {formatCurrency(sampleDiscount.final.toString())}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Type:
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                        {formData.type}
                      </span>
                    </div>
                    {formData.usageLimit && (
                      <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Limit:
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                          {formData.usageLimit} uses
                        </span>
                      </div>
                    )}
                    {formData.userLimit && (
                      <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Per User:
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                          {formData.userLimit}{" "}
                          {formData.userLimit === "1" ? "time" : "times"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-3"
              >
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {isEditMode ? "Update Promotion" : "Create Promotion"}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/admin/marketing/promotions")}
                  disabled={uploading}
                  className="w-full px-6 py-4 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewEditPromotion;
