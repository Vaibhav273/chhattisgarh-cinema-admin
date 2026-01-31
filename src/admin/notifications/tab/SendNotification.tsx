// ═══════════════════════════════════════════════════════════════
// 📤 SEND NOTIFICATION TAB - MODERN THEME (TYPE SAFE)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Image as ImageIcon,
  Users,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  Lightbulb,
  Upload,
  X,
} from "lucide-react";
import {
  sendNotification,
  getTemplates,
} from "../../../services/notificationService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type {
  NotificationTemplate,
  NotificationType,
  NotificationPriority,
  NotificationTarget,
} from "../../../types/notification";
import { auth, storage } from "../../../config/firebase";
import { logError, logNotificationAction } from "../../../utils/activityLogger";

const SendNotificationTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const [imageUploadMode, setImageUploadMode] = useState<"url" | "upload">(
    "url",
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  // ✅ FIXED: Form state with proper types
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "announcement" as NotificationType,
    priority: "medium" as NotificationPriority,
    target: "free" as NotificationTarget,
    targetUsers: [] as string[],
    imageUrl: "",
    actionUrl: "",
    actionLabel: "",
    contentId: "",
    contentType: "" as "movie" | "series" | "short-film" | "event" | "", // ✅ FIXED
    scheduledFor: "",
    isSilent: false,
  });

  // Preview state
  const [previewData, setPreviewData] = useState({
    title: "",
    message: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Update preview when form changes
  useEffect(() => {
    setPreviewData({
      title: formData.title,
      message: formData.message,
      imageUrl: formData.imageUrl,
    });
  }, [formData.title, formData.message, formData.imageUrl]);

  const fetchTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data.filter((t) => t.isActive));
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        title: template.title,
        message: template.message,
        type: template.type,
        priority: template.priority,
        imageUrl: template.imageUrl || "",
        actionUrl: template.actionUrl || "",
        actionLabel: template.actionLabel || "",
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB", "error");
      return;
    }

    try {
      setUploadingImage(true);

      // Create unique filename
      const timestamp = Date.now();
      const filename = `notifications/${timestamp}_${file.name}`;
      const storageRef = ref(storage, filename);

      // Upload file
      await uploadBytes(storageRef, file);

      // Get download URL
      const url = await getDownloadURL(storageRef);

      setFormData({ ...formData, imageUrl: url });
      showToast("Image uploaded successfully!", "success");
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast("Failed to upload image", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // ✅ FIXED: Handle submit with proper type conversion
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.message) {
      showToast("Please fill all required fields", "error");
      return;
    }

    try {
      setLoading(true);

      const notificationData: any = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
        target: formData.target,
        targetUsers: formData.targetUsers,
        imageUrl: formData.imageUrl || undefined,
        actionUrl: formData.actionUrl || undefined,
        actionLabel: formData.actionLabel || undefined,
        contentId: formData.contentId || undefined,
        contentType: formData.contentType || undefined,
        scheduledFor:
          scheduleEnabled && formData.scheduledFor
            ? new Date(formData.scheduledFor)
            : undefined,
        isSilent: formData.isSilent,
        createdBy: auth.currentUser?.uid || "admin",
        createdByName: auth.currentUser?.displayName || "Admin",
        status: "sent" as const,
        createdAt: new Date(),
      };

      await sendNotification(notificationData);

      showToast("Notification sent successfully! 🎉", "success");

      // ✅ UPDATED LOGGING
      await logNotificationAction("send", "notification-sent", formData.title, {
        type: formData.type,
        priority: formData.priority,
        target: formData.target,
        targetUsersCount: formData.targetUsers.length,
        hasImage: !!formData.imageUrl,
        hasAction: !!formData.actionUrl,
        contentType: formData.contentType,
        contentId: formData.contentId,
        isScheduled: scheduleEnabled,
        scheduledFor: formData.scheduledFor,
        isSilent: formData.isSilent,
      });

      // Reset form
      setFormData({
        title: "",
        message: "",
        type: "announcement",
        priority: "medium",
        target: "free",
        targetUsers: [],
        imageUrl: "",
        actionUrl: "",
        actionLabel: "",
        contentId: "",
        contentType: "",
        scheduledFor: "",
        isSilent: false,
      });
      setSelectedTemplate("");
    } catch (error) {
      console.error("Error sending notification:", error);
      showToast("Failed to send notification", "error");

      // ✅ ADDED ERROR LOGGING
      await logError("Send Notification", "Failed to send notification", {
        error,
        title: formData.title,
        type: formData.type,
        target: formData.target,
      });
    } finally {
      setLoading(false);
    }
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
      <div>
        <h3 className="text-2xl font-black text-slate-800">
          📤 Send Notification
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Create and send notifications to your users
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section (2 columns) */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template Selection */}
            {templates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6"
              >
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  📋 Use Template (Optional)
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                >
                  <option value="">Select a template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            >
              <h4 className="text-lg font-black text-slate-800 dark:text-white mb-4">
                📝 Basic Information
              </h4>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Title *{" "}
                  <span className="text-xs text-slate-500">
                    (Max 50 characters)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter notification title"
                  maxLength={50}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  required
                />
                <div className="text-xs text-slate-500 mt-1 text-right">
                  {formData.title.length}/50
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Message *{" "}
                  <span className="text-xs text-slate-500">
                    (Max 200 characters)
                  </span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Enter notification message"
                  rows={4}
                  maxLength={200}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white resize-none"
                  required
                />
                <div className="text-xs text-slate-500 mt-1 text-right">
                  {formData.message.length}/200
                </div>
              </div>

              {/* Type & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as NotificationType,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  >
                    <option value="new_content">🎬 New Content</option>
                    <option value="subscription">💳 Subscription</option>
                    <option value="payment">💰 Payment</option>
                    <option value="promotion">🎁 Promotion</option>
                    <option value="system">⚙️ System</option>
                    <option value="content_update">🔄 Content Update</option>
                    <option value="event">🎪 Event</option>
                    <option value="reminder">⏰ Reminder</option>
                    <option value="announcement">📢 Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as NotificationPriority,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Target Audience */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            >
              <h4 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Users size={20} />
                Target Audience
              </h4>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Send To *
                </label>
                <select
                  value={formData.target}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target: e.target.value as NotificationTarget,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                >
                  <option value="free">🆓 Free Users</option>
                  <option value="custom">👥 Custom Users</option>
                  <option value="individual">👤 Individual Users</option>
                </select>
              </div>

              {formData.target === "individual" && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    User IDs (comma-separated)
                  </label>
                  <textarea
                    value={formData.targetUsers.join(", ")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetUsers: e.target.value
                          .split(",")
                          .map((id) => id.trim())
                          .filter((id) => id),
                      })
                    }
                    placeholder="user1, user2, user3..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white resize-none"
                  />
                </div>
              )}
            </motion.div>

            {/* Additional Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            >
              <h4 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <ImageIcon size={20} />
                Additional Options
              </h4>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Notification Image (Optional)
                </label>

                {/* Toggle between URL and Upload */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setImageUploadMode("url")}
                    className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all ${
                      imageUploadMode === "url"
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    🔗 URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadMode("upload")}
                    className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all ${
                      imageUploadMode === "upload"
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    📤 Upload
                  </button>
                </div>

                {imageUploadMode === "url" ? (
                  // URL Input
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                ) : (
                  // File Upload
                  <div>
                    <label className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-blue-500 transition-all cursor-pointer flex items-center justify-center gap-3">
                      <Upload size={20} className="text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400 font-semibold">
                        {uploadingImage ? "Uploading..." : "Choose Image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-slate-500 mt-2">
                      Max size: 5MB • Formats: JPG, PNG, GIF, WebP
                    </p>
                  </div>
                )}

                {/* Image Preview */}
                {formData.imageUrl && (
                  <div className="mt-3 relative">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-xl"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/400x200?text=Invalid+Image";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Action URL & Label */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Action URL
                  </label>
                  <input
                    type="text"
                    value={formData.actionUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, actionUrl: e.target.value })
                    }
                    placeholder="/movies/movie-id"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Action Label
                  </label>
                  <input
                    type="text"
                    value={formData.actionLabel}
                    onChange={(e) =>
                      setFormData({ ...formData, actionLabel: e.target.value })
                    }
                    placeholder="Watch Now"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* ✅ ADDED: Content Type Selector */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Content Type (Optional)
                  </label>
                  <select
                    value={formData.contentType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contentType: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  >
                    <option value="">None</option>
                    <option value="movie">🎬 Movie</option>
                    <option value="series">📺 Series</option>
                    <option value="short-film">🎞️ Short Film</option>
                    <option value="event">🎪 Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Content ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.contentId}
                    onChange={(e) =>
                      setFormData({ ...formData, contentId: e.target.value })
                    }
                    placeholder="content-id-123"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Schedule */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setScheduleEnabled(!scheduleEnabled)}
                    className={`w-12 h-6 rounded-full transition-all ${
                      scheduleEnabled
                        ? "bg-blue-500"
                        : "bg-slate-300 dark:bg-slate-700"
                    } relative`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                        scheduleEnabled ? "left-6" : "left-0.5"
                      }`}
                    />
                  </button>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock size={16} />
                    Schedule for later
                  </label>
                </div>

                {scheduleEnabled && (
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledFor: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                )}
              </div>

              {/* Silent Notification */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isSilent: !formData.isSilent })
                  }
                  className={`w-12 h-6 rounded-full transition-all ${
                    formData.isSilent
                      ? "bg-purple-500"
                      : "bg-slate-300 dark:bg-slate-700"
                  } relative`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                      formData.isSilent ? "left-6" : "left-0.5"
                    }`}
                  />
                </button>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Silent notification (no sound)
                </label>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={24} />
                  Send Notification
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Preview Section - Keep same as before */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky top-6"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
              <h4 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Zap size={20} />
                Live Preview
              </h4>

              {/* Phone Mockup */}
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-4 space-y-3">
                  {previewData.imageUrl && (
                    <img
                      src={previewData.imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white text-sm">
                      {previewData.title || "Notification Title"}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {previewData.message ||
                        "Notification message will appear here..."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Clock size={12} />
                    <span>Just now</span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb
                    size={20}
                    className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">
                      💡 Best Practices
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• Keep titles under 40 characters</li>
                      <li>• Write clear, action-oriented messages</li>
                      <li>• Use relevant images (16:9 ratio)</li>
                      <li>• Test before sending to all users</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SendNotificationTab;
