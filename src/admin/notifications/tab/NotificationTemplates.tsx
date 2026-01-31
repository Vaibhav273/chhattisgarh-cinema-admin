// ═══════════════════════════════════════════════════════════════
// 📝 TEMPLATES TAB - WITH IMAGE UPLOAD
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Lightbulb,
  Save,
  X,
  Upload, // ✅ ADDED
} from "lucide-react";
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../../../services/notificationService";
import type {
  NotificationPriority,
  NotificationTemplate,
  NotificationType,
} from "../../../types/notification";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // ✅ ADDED
import { storage } from "../../../config/firebase";
import {
  logNotificationTemplateAction,
  logError,
} from "../../../utils/activityLogger";

const TemplatesTab: React.FC = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<NotificationTemplate | null>(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  // ✅ ADDED: Image upload states
  const [imageUploadMode, setImageUploadMode] = useState<"url" | "upload">(
    "url",
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    imageUrl: string;
    actionUrl: string;
    actionLabel: string;
    isActive: boolean;
  }>({
    name: "",
    title: "",
    message: "",
    type: "announcement",
    priority: "medium",
    imageUrl: "",
    actionUrl: "",
    actionLabel: "",
    isActive: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
      showToast("Failed to load templates", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  // ✅ ADDED: Handle image upload
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
      const filename = `templates/${timestamp}_${file.name}`;
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

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      title: "",
      message: "",
      type: "announcement",
      priority: "medium",
      imageUrl: "",
      actionUrl: "",
      actionLabel: "",
      isActive: true,
    });
    setImageUploadMode("url"); // ✅ RESET to URL mode
    setModalVisible(true);
  };

  const handleEdit = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      title: template.title,
      message: template.message,
      type: template.type,
      priority: template.priority,
      imageUrl: template.imageUrl || "",
      actionUrl: template.actionUrl || "",
      actionLabel: template.actionLabel || "",
      isActive: template.isActive,
    });
    setImageUploadMode("url"); // ✅ RESET to URL mode
    setModalVisible(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    // Find template details before deleting
    const template = templates.find((t) => t.id === id);

    try {
      await deleteTemplate(id);
      showToast("Template deleted successfully", "success");
      fetchTemplates();

      // ✅ ADD LOGGING
      await logNotificationTemplateAction("delete", id, name, {
        type: template?.type,
        priority: template?.priority,
        usageCount: template?.usageCount,
        isActive: template?.isActive,
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      showToast("Failed to delete template", "error");

      // ✅ ADD ERROR LOGGING
      await logError("Notification Templates", "Failed to delete template", {
        error,
        templateId: id,
        templateName: name,
      });
    }
  };

  const handleDuplicate = (template: NotificationTemplate) => {
    setEditingTemplate(null);
    setFormData({
      name: `${template.name} (Copy)`,
      title: template.title,
      message: template.message,
      type: template.type,
      priority: template.priority,
      imageUrl: template.imageUrl || "",
      actionUrl: template.actionUrl || "",
      actionLabel: template.actionLabel || "",
      isActive: false,
    });
    setImageUploadMode("url"); // ✅ RESET to URL mode
    setModalVisible(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.title || !formData.message) {
      showToast("Please fill all required fields", "error");
      return;
    }

    try {
      setLoading(true);

      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData);
        showToast("Template updated successfully! ✅", "success");

        // ✅ LOGGING FOR UPDATE
        await logNotificationTemplateAction(
          "update",
          editingTemplate.id,
          formData.name,
          {
            type: formData.type,
            priority: formData.priority,
            isActive: formData.isActive,
            hasImage: !!formData.imageUrl,
            hasAction: !!formData.actionUrl,
          },
        );
      } else {
        await createTemplate({
          ...formData,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        showToast("Template created successfully! 🎉", "success");

        // ✅ FIXED: Use 'new-template' as ID since we don't get it back
        await logNotificationTemplateAction(
          "create",
          "new-template",
          formData.name,
          {
            type: formData.type,
            priority: formData.priority,
            isActive: formData.isActive,
            hasImage: !!formData.imageUrl,
            hasAction: !!formData.actionUrl,
          },
        );
      }

      setModalVisible(false);
      fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      showToast("Failed to save template", "error");

      // ✅ ERROR LOGGING
      await logError(
        "Notification Templates",
        `Failed to ${editingTemplate ? "update" : "create"} template`,
        {
          error,
          templateName: formData.name,
          action: editingTemplate ? "update" : "create",
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (template: NotificationTemplate) => {
    const newStatus = !template.isActive;

    try {
      await updateTemplate(template.id, { isActive: newStatus });
      showToast(
        template.isActive ? "Template deactivated" : "Template activated",
        "success",
      );
      fetchTemplates();

      // ✅ ADD LOGGING
      await logNotificationTemplateAction(
        newStatus ? "activate" : "deactivate",
        template.id,
        template.name,
        {
          type: template.type,
          priority: template.priority,
          usageCount: template.usageCount,
        },
      );
    } catch (error) {
      console.error("Error toggling template:", error);
      showToast("Failed to update template", "error");

      // ✅ ADD ERROR LOGGING
      await logError(
        "Notification Templates",
        "Failed to toggle template status",
        {
          error,
          templateId: template.id,
          templateName: template.name,
          action: newStatus ? "activate" : "deactivate",
        },
      );
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      new_content: "bg-blue-100 text-blue-600",
      subscription: "bg-purple-100 text-purple-600",
      payment: "bg-green-100 text-green-600",
      promotion: "bg-orange-100 text-orange-600",
      system: "bg-red-100 text-red-600",
      content_update: "bg-teal-100 text-teal-600",
      event: "bg-pink-100 text-pink-600",
      reminder: "bg-yellow-100 text-yellow-600",
      announcement: "bg-cyan-100 text-cyan-600",
    };
    return colors[type] || "bg-gray-100 text-gray-600";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-600",
      medium: "bg-blue-100 text-blue-600",
      high: "bg-orange-100 text-orange-600",
      urgent: "bg-red-100 text-red-600",
    };
    return colors[priority] || "bg-gray-100 text-gray-600";
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
              className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 min-w-[300px] ${toast.type === "success" ? "bg-green-500" : "bg-red-500"} text-white`}
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-gray-900">
            📝 Notification Templates
          </h3>
          <p className="text-gray-500 mt-1">
            Create and manage reusable notification templates
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreate}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Create Template
        </motion.button>
      </div>

      {/* Templates Grid */}
      {loading && templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          />
          <p className="text-gray-600 font-semibold mt-4">
            Loading templates...
          </p>
        </div>
      ) : templates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50 rounded-2xl p-12 text-center"
        >
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Templates Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first template to get started
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Create Your First Template
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">
                      {template.name}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${getTypeColor(template.type)}`}
                      >
                        {template.type.replace("_", " ").toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${getPriorityColor(template.priority)}`}
                      >
                        {template.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleActive(template)}
                    className={`w-12 h-6 rounded-full transition-all ${template.isActive ? "bg-green-500" : "bg-gray-300"} relative`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${template.isActive ? "left-6" : "left-0.5"}`}
                    />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {template.title}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {template.message}
                  </p>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Used {template.usageCount || 0} times
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(template)}
                    className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-xl font-semibold hover:bg-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDuplicate(template)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    <Copy size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(template.id, template.name)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-all"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModalVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black">
                    {editingTemplate ? "Edit Template" : "Create Template"}
                  </h3>
                  <button
                    onClick={() => setModalVisible(false)}
                    className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-white/30 transition-all flex items-center justify-center"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Template Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., New Movie Release"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Title *{" "}
                    <span className="text-xs text-gray-500">
                      (Max 50 characters)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., New Movie Released!"
                    maxLength={50}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {formData.title.length}/50
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Message *{" "}
                    <span className="text-xs text-gray-500">
                      (Max 200 characters)
                    </span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="e.g., Check out {{movieTitle}} now available!"
                    rows={4}
                    maxLength={200}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {formData.message.length}/200
                  </div>
                </div>

                {/* Type & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🟠 High</option>
                      <option value="urgent">🔴 Urgent</option>
                    </select>
                  </div>
                </div>

                {/* ✅ ADDED: Image Upload/URL Section */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Template Image (Optional)
                  </label>

                  {/* Toggle between URL and Upload */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode("url")}
                      className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all ${
                        imageUploadMode === "url"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600"
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
                          : "bg-gray-100 text-gray-600"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  ) : (
                    // File Upload
                    <div>
                      <label className="w-full px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-all cursor-pointer flex items-center justify-center gap-3">
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-gray-600 font-semibold">
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
                      <p className="text-xs text-gray-500 mt-2">
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
                        onClick={() =>
                          setFormData({ ...formData, imageUrl: "" })
                        }
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Action URL
                    </label>
                    <input
                      type="text"
                      value={formData.actionUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, actionUrl: e.target.value })
                      }
                      placeholder="/movies/movie-id"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Action Label
                    </label>
                    <input
                      type="text"
                      value={formData.actionLabel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          actionLabel: e.target.value,
                        })
                      }
                      placeholder="Watch Now"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isActive: !formData.isActive })
                    }
                    className={`w-12 h-6 rounded-full transition-all ${formData.isActive ? "bg-green-500" : "bg-gray-300"} relative`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${formData.isActive ? "left-6" : "left-0.5"}`}
                    />
                  </button>
                  <span className="text-sm font-semibold text-gray-700">
                    Active template
                  </span>
                </div>

                {/* Pro Tip */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb
                      size={20}
                      className="text-blue-600 flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-bold text-blue-800 mb-1">
                        💡 Pro Tip: Use Variables
                      </p>
                      <p className="text-xs text-blue-600">
                        You can use placeholders like{" "}
                        <code className="bg-blue-100 px-1 rounded">
                          {"{{userName}}"}
                        </code>
                        ,{" "}
                        <code className="bg-blue-100 px-1 rounded">
                          {"{{contentTitle}}"}
                        </code>{" "}
                        in your message.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalVisible(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        {editingTemplate ? "Update" : "Create"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplatesTab;
