import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Flag,
  AlertTriangle,
  Film,
  Calendar,
  Shield,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { usePermissions } from "../../hooks/usePermissions";
import { Permission } from "../../types/roles";
import {
  logCommentModerationAction,
  logError,
} from "../../utils/activityLogger";

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  contentId: string;
  contentTitle: string;
  contentType: "movie" | "series" | "shortfilm";
  comment: string;
  rating?: number;
  reports: number;
  reportReasons: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
// 💬 COMMENT DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface CommentDetailModalProps {
  comment: Comment | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

const CommentDetailModal: React.FC<CommentDetailModalProps> = ({
  comment,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDelete,
}) => {
  if (!isOpen || !comment) return null;

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
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-2xl font-black">Comment Details</h3>
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
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {comment.userAvatar ? (
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  comment.userName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                  {comment.userName}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  User ID: {comment.userId}
                </p>
              </div>
            </div>

            {/* Content Info */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Film size={20} className="text-orange-500" />
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Content
                </span>
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">
                {comment.contentTitle}
              </p>
              <span className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                {comment.contentType}
              </span>
            </div>

            {/* Comment */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={20} className="text-orange-500" />
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Comment
                </span>
              </div>
              <p className="text-slate-800 dark:text-white">
                {comment.comment}
              </p>
              {comment.rating && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-yellow-500">★</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {comment.rating}/10
                  </span>
                </div>
              )}
            </div>

            {/* Reports */}
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-3">
                <Flag size={20} className="text-red-500" />
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {comment.reports} Reports
                </span>
              </div>
              <div className="space-y-2">
                {comment.reportReasons.map((reason, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    {reason}
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-slate-500" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Created
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {comment.createdAt.toDate().toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={16} className="text-slate-500" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Status
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                  {comment.status}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onDelete(comment.id);
                onClose();
              }}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all flex items-center gap-2"
            >
              <Trash2 size={20} />
              Delete
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onReject(comment.id);
                onClose();
              }}
              className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition-all flex items-center gap-2"
            >
              <XCircle size={20} />
              Reject
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onApprove(comment.id);
                onClose();
              }}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <CheckCircle size={20} />
              Approve
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 💬 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const CommentsModeration: React.FC = () => {
  const { can } = usePermissions();

  // State
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<Toast>({
    message: "",
    type: "info",
    isVisible: false,
  });

  // Fetch Comments
  useEffect(() => {
    fetchComments();
  }, []);

  // Filter Comments
  useEffect(() => {
    let filtered = comments;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.contentTitle.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredComments(filtered);
  }, [comments, statusFilter, searchQuery]);

  const fetchComments = async () => {
    try {
      setLoading(true);

      // Query reported comments (reports > 0)
      const q = query(
        collection(db, "comments"),
        where("reports", ">", 0),
        orderBy("reports", "desc"),
        limit(100),
      );

      const snapshot = await getDocs(q);
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];

      setComments(commentsData);
      setFilteredComments(commentsData);
    } catch (error) {
      console.error("Error fetching comments:", error);
      showToast("Failed to load comments", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: Toast["type"]) => {
    setToast({ message, type, isVisible: true });
  };

  const handleApprove = async (id: string) => {
    if (!can(Permission.DELETE_COMMENTS)) {
      showToast("You do not have permission to approve comments", "error");
      return;
    }

    // Find comment details before approving
    const comment = comments.find((c) => c.id === id);

    try {
      await updateDoc(doc(db, "comments", id), {
        status: "approved",
        reports: 0,
        reportReasons: [],
        updatedAt: Timestamp.now(),
      });

      setComments((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, status: "approved", reports: 0, reportReasons: [] }
            : c,
        ),
      );

      showToast("Comment approved successfully", "success");

      // ✅ ADD LOGGING
      await logCommentModerationAction(
        "approve",
        id,
        comment?.userName || "Unknown User",
        {
          commentText: comment?.comment?.substring(0, 100),
          contentTitle: comment?.contentTitle,
          contentType: comment?.contentType,
          previousReports: comment?.reports,
          userId: comment?.userId,
        },
      );
    } catch (error) {
      console.error("Error approving comment:", error);
      showToast("Failed to approve comment", "error");

      // ✅ ADD ERROR LOGGING
      await logError("Comment Moderation", "Failed to approve comment", {
        error,
        commentId: id,
        userName: comment?.userName,
      });
    }
  };

  const handleReject = async (id: string) => {
    if (!can(Permission.DELETE_COMMENTS)) {
      showToast("You do not have permission to reject comments", "error");
      return;
    }

    // Find comment details before rejecting
    const comment = comments.find((c) => c.id === id);

    try {
      await updateDoc(doc(db, "comments", id), {
        status: "rejected",
        updatedAt: Timestamp.now(),
      });

      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "rejected" } : c)),
      );

      showToast("Comment rejected successfully", "success");

      // ✅ ADD LOGGING
      await logCommentModerationAction(
        "reject",
        id,
        comment?.userName || "Unknown User",
        {
          commentText: comment?.comment?.substring(0, 100),
          contentTitle: comment?.contentTitle,
          contentType: comment?.contentType,
          reports: comment?.reports,
          reportReasons: comment?.reportReasons,
          userId: comment?.userId,
        },
      );
    } catch (error) {
      console.error("Error rejecting comment:", error);
      showToast("Failed to reject comment", "error");

      // ✅ ADD ERROR LOGGING
      await logError("Comment Moderation", "Failed to reject comment", {
        error,
        commentId: id,
        userName: comment?.userName,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!can(Permission.DELETE_COMMENTS)) {
      showToast("You do not have permission to delete comments", "error");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this comment permanently?",
      )
    ) {
      return;
    }

    // Find comment details before deleting
    const comment = comments.find((c) => c.id === id);

    try {
      await deleteDoc(doc(db, "comments", id));
      setComments((prev) => prev.filter((c) => c.id !== id));
      showToast("Comment deleted successfully", "success");

      // ✅ ADD LOGGING
      await logCommentModerationAction(
        "delete",
        id,
        comment?.userName || "Unknown User",
        {
          commentText: comment?.comment?.substring(0, 100),
          contentTitle: comment?.contentTitle,
          contentType: comment?.contentType,
          reports: comment?.reports,
          reportReasons: comment?.reportReasons,
          userId: comment?.userId,
          status: comment?.status,
        },
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
      showToast("Failed to delete comment", "error");

      // ✅ ADD ERROR LOGGING
      await logError("Comment Moderation", "Failed to delete comment", {
        error,
        commentId: id,
        userName: comment?.userName,
      });
    }
  };

  const openCommentDetail = (comment: Comment) => {
    setSelectedComment(comment);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full">
      {/* Toast */}
      <Toast
        {...toast}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Comment Detail Modal */}
      <CommentDetailModal
        comment={selectedComment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
      />

      {/* Header */}
      <div className="space-y-6 w-full">
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 📊 HEADER & STATS */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden w-full"
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
                  <MessageSquare size={36} />
                  Comments Moderation
                </h1>
                <p className="text-white/90 text-lg">
                  Review and moderate reported comments
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                <p className="text-white/80 text-sm mb-1">Total Reports</p>
                <p className="text-4xl font-black">{comments.length}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                <p className="text-white/80 text-sm mb-1">Pending</p>
                <p className="text-4xl font-black text-yellow-300">
                  {comments.filter((c) => c.status === "pending").length}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                <p className="text-white/80 text-sm mb-1">Approved</p>
                <p className="text-4xl font-black text-green-300">
                  {comments.filter((c) => c.status === "approved").length}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
                <p className="text-white/80 text-sm mb-1">Rejected</p>
                <p className="text-4xl font-black text-red-300">
                  {comments.filter((c) => c.status === "rejected").length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 🔍 SEARCH & FILTERS */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 w-full"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by user, comment, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 💬 COMMENTS TABLE */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
              />
              <p className="text-slate-600 dark:text-slate-400 font-semibold mt-4">
                Loading comments...
              </p>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <MessageSquare
                className="text-slate-300 dark:text-slate-600"
                size={64}
              />
              <p className="text-xl font-bold text-slate-400 dark:text-slate-500 mt-4">
                No comments found
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
                      Comment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Reports
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredComments.map((comment) => (
                    <motion.tr
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                            {comment.userAvatar ? (
                              <img
                                src={comment.userAvatar}
                                alt={comment.userName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              comment.userName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">
                              {comment.userName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              ID: {comment.userId.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Comment */}
                      <td className="px-6 py-4">
                        <p className="text-slate-800 dark:text-white max-w-xs truncate">
                          {comment.comment}
                        </p>
                      </td>

                      {/* Content */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800 dark:text-white">
                          {comment.contentTitle}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                          {comment.contentType}
                        </p>
                      </td>

                      {/* Reports */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            comment.reports > 5
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          }`}
                        >
                          {comment.reports} reports
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                            comment.status === "approved"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : comment.status === "rejected"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {comment.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {comment.createdAt.toDate().toLocaleDateString()}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openCommentDetail(comment)}
                            className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </motion.button>

                          {can(Permission.DELETE_COMMENTS) && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleApprove(comment.id)}
                                className="p-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(comment.id)}
                                className="p-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </motion.button>
                            </>
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

export default CommentsModeration;
