// ═══════════════════════════════════════════════════════════════════════════════
// ✅ CONTENT APPROVAL - PRODUCTION READY
// Path: src/pages/admin/ContentApproval.tsx
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Calendar,
  User,
  Film,
  Tv,
  Video,
  Clock,
  AlertCircle,
  Loader,
  ChevronDown,
  X,
  RefreshCw,
} from "lucide-react";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type { Movie, WebSeries, ShortFilm } from "../../types";
import {
  logContentApproval,
  logContentRejection,
  logError,
} from "../../utils/activityLogger";

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 INTERFACES & TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ContentItem {
  id: string;
  title: string;
  titleHindi?: string;
  type: "movie" | "webseries" | "short-film";
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  submittedDate: Date | Timestamp;
  thumbnail?: string;
  description?: string;
  genre?: string[];
  duration?: string;
  language?: string;
  isPremium?: boolean;
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
// 🎬 REVIEW MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItem | null;
  onApprove: (id: string, notes: string) => void;
  onReject: (id: string, reason: string) => void;
  loading: boolean;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  content,
  onApprove,
  onReject,
  loading,
}) => {
  const [notes, setNotes] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const handleSubmit = () => {
    if (!content) return;

    if (action === "approve") {
      onApprove(content.id, notes);
    } else if (action === "reject") {
      if (!notes.trim()) {
        alert("Please provide a reason for rejection");
        return;
      }
      onReject(content.id, notes);
    }
  };

  if (!isOpen || !content) return null;

  const typeIcons = {
    movie: Film,
    webseries: Tv,
    "short-film": Video,
  };

  const TypeIcon = typeIcons[content.type];

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
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <CheckSquare size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black">Review Content</h3>
                  <p className="text-white/80 text-sm">
                    Review and approve or reject
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

          {/* Content Details */}
          <div className="p-6 space-y-6">
            {/* Thumbnail & Basic Info */}
            <div className="flex gap-4">
              {content.thumbnail ? (
                <img
                  src={content.thumbnail}
                  alt={content.title}
                  className="w-32 h-48 object-cover rounded-xl"
                />
              ) : (
                <div className="w-32 h-48 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center">
                  <TypeIcon size={48} className="text-slate-400" />
                </div>
              )}

              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {content.title}
                  </h4>
                  {content.titleHindi && (
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                      {content.titleHindi}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold flex items-center gap-1">
                    <TypeIcon size={14} />
                    {content.type === "webseries"
                      ? "Web Series"
                      : content.type === "short-film"
                        ? "Short Film"
                        : "Movie"}
                  </span>

                  {content.isPremium && (
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg text-sm font-bold">
                      Premium
                    </span>
                  )}

                  {content.language && (
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-bold">
                      {content.language}
                    </span>
                  )}

                  {content.duration && (
                    <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg text-sm font-bold flex items-center gap-1">
                      <Clock size={14} />
                      {content.duration}
                    </span>
                  )}
                </div>

                {content.genre && content.genre.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {content.genre.map((g) => (
                      <span
                        key={g}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {content.description && (
              <div>
                <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </h5>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {content.description}
                </p>
              </div>
            )}

            {/* Submission Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Submitted By
                </p>
                <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <User size={16} />
                  {content.submittedBy}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Submitted Date
                </p>
                <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Calendar size={16} />
                  {content.submittedDate instanceof Timestamp
                    ? content.submittedDate.toDate().toLocaleDateString()
                    : new Date(content.submittedDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Notes/Reason */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {action === "reject" ? "Rejection Reason" : "Notes (Optional)"}
                {action === "reject" && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  action === "reject"
                    ? "Please provide a detailed reason for rejection..."
                    : "Add any notes or comments..."
                }
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between sticky bottom-0 border-t border-slate-200 dark:border-slate-700">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
            >
              Cancel
            </motion.button>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setAction("reject");
                  handleSubmit();
                }}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading && action === "reject" ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle size={20} />
                    Reject
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setAction("approve");
                  handleSubmit();
                }}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading && action === "approve" ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Approve
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const ContentApproval: React.FC = () => {
  // States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "movie" | "webseries" | "short-film"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");

  // Modal
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    content: null as ContentItem | null,
  });

  // Toast
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });

  // Fetch content
  useEffect(() => {
    fetchContent();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterType, filterStatus, contentItems]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      console.log("Fetching content for approval...");

      const allContent: ContentItem[] = [];

      // Fetch Movies
      const moviesQuery = query(
        collection(db, "movies"),
        orderBy("createdAt", "desc"),
        limit(100),
      );
      const moviesSnapshot = await getDocs(moviesQuery);
      moviesSnapshot.forEach((doc) => {
        const data = doc.data() as Movie;
        allContent.push({
          id: doc.id,
          title: data.title,
          titleHindi: data.titleHindi,
          type: "movie",
          status: data.isPublished ? "approved" : "pending",
          submittedBy: "Admin", // You can add createdBy field in your schema
          submittedDate: data.createdAt || new Date(),
          thumbnail: data.thumbnailCdnUrl || data.thumbnail,
          description: data.description,
          genre: data.genre,
          duration: data.duration,
          language: data.language,
          isPremium: data.isPremium,
        });
      });

      // Fetch Web Series
      const seriesQuery = query(
        collection(db, "webseries"),
        orderBy("createdAt", "desc"),
        limit(100),
      );
      const seriesSnapshot = await getDocs(seriesQuery);
      seriesSnapshot.forEach((doc) => {
        const data = doc.data() as WebSeries;
        allContent.push({
          id: doc.id,
          title: data.title,
          titleHindi: data.titleHindi,
          type: "webseries",
          status: data.isPublished ? "approved" : "pending",
          submittedBy: "Admin",
          submittedDate: data.createdAt || new Date(),
          thumbnail: data.thumbnailCdnUrl || data.thumbnail,
          description: data.description,
          genre: data.genre,
          duration: data.episodeDuration,
          language: data.language,
          isPremium: data.isPremium,
        });
      });

      // Fetch Short Films
      const shortFilmsQuery = query(
        collection(db, "shortfilms"),
        orderBy("createdAt", "desc"),
        limit(100),
      );
      const shortFilmsSnapshot = await getDocs(shortFilmsQuery);
      shortFilmsSnapshot.forEach((doc) => {
        const data = doc.data() as ShortFilm;
        allContent.push({
          id: doc.id,
          title: data.title,
          titleHindi: data.titleHindi,
          type: "short-film",
          status: data.isPublished ? "approved" : "pending",
          submittedBy: "Admin",
          submittedDate: data.createdAt || new Date(),
          thumbnail: data.thumbnailCdnUrl || data.thumbnail,
          description: data.description,
          genre: data.genre,
          duration: data.duration,
          language: data.language,
          isPremium: data.isPremium,
        });
      });

      console.log(`Fetched ${allContent.length} content items`);
      setContentItems(allContent);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching content:", error);
      await logError(
        "Content Approval",
        `Failed to fetch approval queue: ${error.message}`,
        {
          error: error.stack || error.message,
        },
      );
      showToast("Failed to load content", "error");
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...contentItems];

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((item) => item.type === filterType);
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.titleHindi?.toLowerCase().includes(query) ||
          item.submittedBy.toLowerCase().includes(query),
      );
    }

    setFilteredItems(filtered);
  };

  const handleApprove = async (id: string, notes: string) => {
    try {
      setActionLoading(true);
      console.log("Approving content:", id);

      const item = contentItems.find((c) => c.id === id);
      if (!item) return;

      const collectionName =
        item.type === "movie"
          ? "movies"
          : item.type === "webseries"
            ? "webseries"
            : "shortfilms";

      await updateDoc(doc(db, collectionName, id), {
        isPublished: true,
        isActive: true,
        approvalStatus: "approved",
        approvalDate: serverTimestamp(),
        approvalNotes: notes,
        updatedAt: serverTimestamp(),
      });

      // ✅ LOG APPROVAL
      await logContentApproval(
        item.type,
        id,
        item.title,
        collectionName === "movies"
          ? "Movies"
          : collectionName === "webseries"
            ? "Web Series"
            : "Short Films",
        {
          approvedBy: "Admin",
          notes: notes,
          contentType: item.type,
          genre: item.genre,
          language: item.language,
          isPremium: item.isPremium,
        },
      );

      showToast("Content approved successfully!", "success");
      setReviewModal({ isOpen: false, content: null });
      fetchContent();
      setActionLoading(false);
    } catch (error: any) {
      console.error("Error approving content:", error);

      // ✅ LOG ERROR
      const item = contentItems.find((c) => c.id === id);
      await logError(
        "Content Approval",
        `Failed to approve content: ${error.message}`,
        {
          contentId: id,
          contentTitle: item?.title,
          contentType: item?.type,
          error: error.stack || error.message,
        },
      );

      showToast("Failed to approve content", "error");
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      setActionLoading(true);
      console.log("Rejecting content:", id);

      const item = contentItems.find((c) => c.id === id);
      if (!item) return;

      const collectionName =
        item.type === "movie"
          ? "movies"
          : item.type === "webseries"
            ? "webseries"
            : "shortfilms";

      await updateDoc(doc(db, collectionName, id), {
        isPublished: false,
        isActive: false,
        approvalStatus: "rejected",
        rejectionDate: serverTimestamp(),
        rejectionReason: reason,
        updatedAt: serverTimestamp(),
      });

      // ✅ LOG REJECTION
      await logContentRejection(
        item.type,
        id,
        item.title,
        collectionName === "movies"
          ? "Movies"
          : collectionName === "webseries"
            ? "Web Series"
            : "Short Films",
        reason,
        {
          rejectedBy: "Admin",
          contentType: item.type,
          genre: item.genre,
          language: item.language,
          isPremium: item.isPremium,
        },
      );

      showToast("Content rejected", "info");
      setReviewModal({ isOpen: false, content: null });
      fetchContent();
      setActionLoading(false);
    } catch (error: any) {
      console.error("Error rejecting content:", error);

      // ✅ LOG ERROR
      const item = contentItems.find((c) => c.id === id);
      await logError(
        "Content Approval",
        `Failed to reject content: ${error.message}`,
        {
          contentId: id,
          contentTitle: item?.title,
          contentType: item?.type,
          rejectionReason: reason,
          error: error.stack || error.message,
        },
      );

      showToast("Failed to reject content", "error");
      setActionLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
      case "approved":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      case "rejected":
        return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
    }
  };

  const typeIcons = {
    movie: Film,
    webseries: Tv,
    "short-film": Video,
  };

  // Stats
  const stats = {
    total: contentItems.length,
    pending: contentItems.filter((i) => i.status === "pending").length,
    approved: contentItems.filter((i) => i.status === "approved").length,
    rejected: contentItems.filter((i) => i.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-600 dark:text-slate-400 font-semibold">
          Loading content...
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

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, content: null })}
        content={reviewModal.content}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
      />

      <div className="space-y-6 w-full">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
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
                  <CheckSquare size={32} />
                </div>
                <div>
                  <h1 className="text-4xl font-black mb-2">Content Approval</h1>
                  <p className="text-white/90 text-lg">
                    Review and manage submitted content
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchContent}
                className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <RefreshCw size={20} />
                Refresh
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                  Total Content
                </p>
                <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Film size={24} className="text-blue-600 dark:text-blue-400" />
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
                  Pending
                </p>
                <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400 mt-2">
                  {stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <Clock
                  size={24}
                  className="text-yellow-600 dark:text-yellow-400"
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
                  Approved
                </p>
                <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-2">
                  {stats.approved}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle
                  size={24}
                  className="text-green-600 dark:text-green-400"
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
                  Rejected
                </p>
                <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-2">
                  {stats.rejected}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <XCircle size={24} className="text-red-600 dark:text-red-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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
                  placeholder="Search by title, creator..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="appearance-none px-6 py-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white font-semibold cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="movie">Movies</option>
                <option value="webseries">Web Series</option>
                <option value="short-film">Short Films</option>
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
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="appearance-none px-6 py-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white font-semibold cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={20}
              />
            </div>
          </div>
        </motion.div>

        {/* CONTENT LIST */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle
                size={64}
                className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
              />
              <p className="text-xl font-bold text-slate-500 dark:text-slate-400">
                No content found
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
                      Content
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Submitted By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredItems.map((item, index) => {
                    const TypeIcon = typeIcons[item.type];
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-12 h-16 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-12 h-16 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center">
                                <TypeIcon
                                  size={20}
                                  className="text-slate-400"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">
                                {item.title}
                              </p>
                              {item.titleHindi && (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {item.titleHindi}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold inline-flex items-center gap-1">
                            <TypeIcon size={14} />
                            {item.type === "webseries"
                              ? "Series"
                              : item.type === "short-film"
                                ? "Short"
                                : "Movie"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-300 font-semibold">
                              {item.submittedBy}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-300">
                              {item.submittedDate instanceof Timestamp
                                ? item.submittedDate
                                    .toDate()
                                    .toLocaleDateString()
                                : new Date(
                                    item.submittedDate,
                                  ).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-lg text-sm font-bold ${getStatusColor(
                              item.status,
                            )}`}
                          >
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                setReviewModal({ isOpen: true, content: item })
                              }
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-all"
                              title="Review"
                            >
                              <Eye size={18} />
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
      </div>
    </div>
  );
};

export default ContentApproval;
