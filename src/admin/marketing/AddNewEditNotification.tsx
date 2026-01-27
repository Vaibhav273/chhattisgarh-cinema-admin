import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Send,
  Save,
  AlertCircle,
  CheckCircle,
  Users,
  Target,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Eye,
  Zap,
  Crown,
  UserX,
  Filter,
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
  title?: string;
  message?: string;
  scheduledDate?: string;
  scheduledTime?: string;
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

const AddNewEditNotification: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  // Loading state
  const [loading, setLoading] = useState(isEditMode);
  const [notificationNotFound, setNotificationNotFound] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "push" as "push" | "email" | "in-app",
    target: "all" as "all" | "premium" | "free" | "custom",
    sendType: "immediate" as "immediate" | "scheduled",
    scheduledDate: "",
    scheduledTime: "",
    customSegments: [] as string[],
  });

  const [estimatedRecipients, setEstimatedRecipients] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Toast
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });

  // Fetch notification data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchNotificationData();
    }
  }, [isEditMode, id]);

  // Calculate estimated recipients
  useEffect(() => {
    calculateEstimatedRecipients();
  }, [formData.target, formData.customSegments]);

  const fetchNotificationData = async () => {
    try {
      setLoading(true);
      const notificationDoc = await getDoc(doc(db, "notifications", id!));

      if (!notificationDoc.exists()) {
        setNotificationNotFound(true);
        showToast("Notification not found", "error");
        setLoading(false);
        return;
      }

      const data = notificationDoc.data();

      // Parse scheduled date/time if exists
      let scheduledDate = "";
      let scheduledTime = "";
      if (data.scheduledFor) {
        const date = data.scheduledFor.toDate();
        scheduledDate = date.toISOString().split("T")[0];
        scheduledTime = date.toTimeString().slice(0, 5);
      }

      setFormData({
        title: data.title || "",
        message: data.message || "",
        type: data.type || "push",
        target: data.target || "all",
        sendType: data.scheduledFor ? "scheduled" : "immediate",
        scheduledDate,
        scheduledTime,
        customSegments: data.customSegments || [],
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching notification:", error);
      showToast("Failed to load notification data", "error");
      setNotificationNotFound(true);
      setLoading(false);
    }
  };

  const calculateEstimatedRecipients = async () => {
    // Simulate recipient calculation
    // In production, query actual user counts from Firestore
    let count = 0;
    switch (formData.target) {
      case "all":
        count = 25000; // Example: all users
        break;
      case "premium":
        count = 5000; // Example: premium users
        break;
      case "free":
        count = 20000; // Example: free users
        break;
      case "custom":
        count = formData.customSegments.length * 1000; // Example
        break;
    }
    setEstimatedRecipients(count);
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Notification title is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Notification message is required";
    }

    if (formData.sendType === "scheduled") {
      if (!formData.scheduledDate) {
        newErrors.scheduledDate = "Please select a date";
      }
      if (!formData.scheduledTime) {
        newErrors.scheduledTime = "Please select a time";
      }

      if (formData.scheduledDate && formData.scheduledTime) {
        const scheduledDateTime = new Date(
          `${formData.scheduledDate}T${formData.scheduledTime}`
        );
        if (scheduledDateTime <= new Date()) {
          newErrors.scheduledDate = "Scheduled time must be in the future";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent, sendNow: boolean = false) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix the errors in the form", "warning");
      return;
    }

    try {
      setUploading(true);

      let scheduledFor = null;
      let status = "draft";

      if (sendNow) {
        status = "sent";
      } else if (formData.sendType === "scheduled") {
        scheduledFor = Timestamp.fromDate(
          new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
        );
        status = "scheduled";
      }

      // Create notification data
      const notificationData = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        target: formData.target,
        status,
        scheduledFor,
        totalRecipients: estimatedRecipients,
        delivered: sendNow ? estimatedRecipients : 0,
        read: 0,
        clicked: 0,
        customSegments: formData.customSegments,
        updatedAt: Timestamp.now(),
      };

      if (isEditMode) {
        // Update existing notification
        await updateDoc(doc(db, "notifications", id!), notificationData);
        showToast(
          sendNow
            ? "Notification sent successfully!"
            : "Notification updated successfully!",
          "success"
        );
      } else {
        // Create new notification
        if (sendNow) {
          notificationData.delivered = estimatedRecipients;
        }
        await addDoc(collection(db, "notifications"), {
          ...notificationData,
          sentAt: sendNow ? Timestamp.now() : null,
          createdAt: Timestamp.now(),
        });
        showToast(
          sendNow
            ? "Notification sent successfully!"
            : "Notification saved as draft!",
          "success"
        );
      }

      // Navigate back after 1.5 seconds
      setTimeout(() => {
        navigate("/admin/marketing/notifications");
      }, 1500);

      setUploading(false);
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} notification:`, error);
      showToast(
        `Failed to ${isEditMode ? "update" : "create"} notification. Please try again.`,
        "error"
      );
      setUploading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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
        <p className="text-slate-600 dark:text-slate-400 font-semibold">
          Loading notification data...
        </p>
      </div>
    );
  }

  // Not found state
  if (notificationNotFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
          Notification Not Found
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The notification you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate("/admin/marketing/notifications")}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all"
        >
          Back to Notifications
        </button>
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
          className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <div className="relative z-10">
            <button
              onClick={() => navigate("/admin/marketing/notifications")}
              className="mb-4 px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back to Notifications
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <Bell size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-black mb-2">
                  {isEditMode ? "Edit Notification" : "Create New Notification"}
                </h1>
                <p className="text-white/90 text-lg">
                  {isEditMode
                    ? "Update notification details and resend"
                    : "Send push notifications, emails, or in-app messages to users"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FORM */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN - Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">
                    Notification Content
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., New Content Alert"
                      maxLength={50}
                      className={`w-full px-4 py-3 border ${
                        errors.title
                          ? "border-red-500"
                          : "border-slate-300 dark:border-slate-700"
                      } rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.title ? (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertCircle size={16} />
                          {errors.title}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Keep it short and attention-grabbing
                        </p>
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formData.title.length}/50
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Write your notification message here..."
                      rows={5}
                      maxLength={200}
                      className={`w-full px-4 py-3 border ${
                        errors.message
                          ? "border-red-500"
                          : "border-slate-300 dark:border-slate-700"
                      } rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.message ? (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertCircle size={16} />
                          {errors.message}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Clear, concise message that drives action
                        </p>
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formData.message.length}/200
                      </span>
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                      Notification Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: "push" })}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          formData.type === "push"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                            : "border-slate-300 dark:border-slate-700 hover:border-blue-300"
                        }`}
                      >
                        <Bell
                          size={24}
                          className={`mx-auto mb-2 ${
                            formData.type === "push"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        />
                        <p
                          className={`text-sm font-bold ${
                            formData.type === "push"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          Push
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: "email" })}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          formData.type === "email"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                            : "border-slate-300 dark:border-slate-700 hover:border-blue-300"
                        }`}
                      >
                        <Mail
                          size={24}
                          className={`mx-auto mb-2 ${
                            formData.type === "email"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        />
                        <p
                          className={`text-sm font-bold ${
                            formData.type === "email"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          Email
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: "in-app" })}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          formData.type === "in-app"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                            : "border-slate-300 dark:border-slate-700 hover:border-blue-300"
                        }`}
                      >
                        <MessageSquare
                          size={24}
                          className={`mx-auto mb-2 ${
                            formData.type === "in-app"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        />
                        <p
                          className={`text-sm font-bold ${
                            formData.type === "in-app"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          In-App
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Target Audience */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Target size={20} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white">
                        Target Audience
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Choose who should receive this notification
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, target: "all" })}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        formData.target === "all"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                          : "border-slate-300 dark:border-slate-700 hover:border-purple-300"
                      }`}
                    >
                      <Users
                        size={24}
                        className={`mx-auto mb-2 ${
                          formData.target === "all"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      />
                      <p
                        className={`text-sm font-bold ${
                          formData.target === "all"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        All Users
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, target: "premium" })}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        formData.target === "premium"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                          : "border-slate-300 dark:border-slate-700 hover:border-purple-300"
                      }`}
                    >
                      <Crown
                        size={24}
                        className={`mx-auto mb-2 ${
                          formData.target === "premium"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      />
                      <p
                        className={`text-sm font-bold ${
                          formData.target === "premium"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        Premium
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, target: "free" })}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        formData.target === "free"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                          : "border-slate-300 dark:border-slate-700 hover:border-purple-300"
                      }`}
                    >
                      <UserX
                        size={24}
                        className={`mx-auto mb-2 ${
                          formData.target === "free"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      />
                      <p
                        className={`text-sm font-bold ${
                          formData.target === "free"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        Free Users
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, target: "custom" })}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        formData.target === "custom"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                          : "border-slate-300 dark:border-slate-700 hover:border-purple-300"
                      }`}
                    >
                      <Filter
                        size={24}
                        className={`mx-auto mb-2 ${
                          formData.target === "custom"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      />
                      <p
                        className={`text-sm font-bold ${
                          formData.target === "custom"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        Custom
                      </p>
                    </button>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Users size={16} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        Estimated Recipients
                      </span>
                    </div>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {formatNumber(estimatedRecipients)}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Schedule */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                      <Clock size={20} className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white">
                        Send Schedule
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        When should this notification be sent?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, sendType: "immediate" })
                      }
                      className={`p-4 border-2 rounded-xl transition-all ${
                        formData.sendType === "immediate"
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/30"
                          : "border-slate-300 dark:border-slate-700 hover:border-orange-300"
                      }`}
                    >
                      <Zap
                        size={24}
                        className={`mx-auto mb-2 ${
                          formData.sendType === "immediate"
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      />
                      <p
                        className={`text-sm font-bold ${
                          formData.sendType === "immediate"
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        Send Now
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, sendType: "scheduled" })
                      }
                      className={`p-4 border-2 rounded-xl transition-all ${
                        formData.sendType === "scheduled"
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/30"
                          : "border-slate-300 dark:border-slate-700 hover:border-orange-300"
                      }`}
                    >
                      <Calendar
                        size={24}
                        className={`mx-auto mb-2 ${
                          formData.sendType === "scheduled"
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      />
                      <p
                        className={`text-sm font-bold ${
                          formData.sendType === "scheduled"
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        Schedule
                      </p>
                    </button>
                  </div>

                  {formData.sendType === "scheduled" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Date
                          </label>
                          <input
                            type="date"
                            value={formData.scheduledDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                scheduledDate: e.target.value,
                              })
                            }
                            className={`w-full px-4 py-3 border ${
                              errors.scheduledDate
                                ? "border-red-500"
                                : "border-slate-300 dark:border-slate-700"
                            } rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
                          />
                          {errors.scheduledDate && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                              <AlertCircle size={16} />
                              {errors.scheduledDate}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Time
                          </label>
                          <input
                            type="time"
                            value={formData.scheduledTime}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                scheduledTime: e.target.value,
                              })
                            }
                            className={`w-full px-4 py-3 border ${
                              errors.scheduledTime
                                ? "border-red-500"
                                : "border-slate-300 dark:border-slate-700"
                            } rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
                          />
                          {errors.scheduledTime && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                              <AlertCircle size={16} />
                              {errors.scheduledTime}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN - Preview & Actions */}
            <div className="space-y-6">
              {/* Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-6"
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <Eye size={20} className="text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">
                      Preview
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  {/* Phone mockup */}
                  <div className="mx-auto max-w-[280px]">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl p-4 shadow-xl">
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Bell
                              size={20}
                              className="text-blue-600 dark:text-blue-400"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white text-sm mb-1 line-clamp-2">
                              {formData.title || "Notification Title"}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                              {formData.message || "Your notification message will appear here"}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Just now
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          Type
                        </span>
                        <span className="text-xs font-black text-slate-800 dark:text-white capitalize">
                          {formData.type}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          Target
                        </span>
                        <span className="text-xs font-black text-slate-800 dark:text-white capitalize">
                          {formData.target}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          Recipients
                        </span>
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                          {formatNumber(estimatedRecipients)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                {formData.sendType === "immediate" && !isEditMode && (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={uploading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send Now
                      </>
                    )}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isEditMode ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {isEditMode
                        ? "Update Notification"
                        : formData.sendType === "scheduled"
                        ? "Schedule Notification"
                        : "Save as Draft"}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/admin/marketing/notifications")}
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

export default AddNewEditNotification;