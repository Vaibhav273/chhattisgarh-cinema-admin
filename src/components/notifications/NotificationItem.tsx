// ═══════════════════════════════════════════════════════════════
// 📋 NOTIFICATION ITEM - REUSABLE COMPONENT (CLEAN VERSION)
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { motion } from "framer-motion";
import { Eye, Trash2, ExternalLink, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { UserNotification } from "../../types/notification";

interface NotificationItemProps {
  notification: UserNotification;
  index?: number;
  compact?: boolean;
  showActions?: boolean;
  onClick?: () => void;
  onMarkAsRead?: (notificationId: string) => void; // ✅ NEW: Delegate to parent
  onDelete?: (notificationId: string) => void; // ✅ NEW: Delegate to parent
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  index = 0,
  compact = false,
  showActions = true,
  onClick,
  onMarkAsRead,
  onDelete,
}) => {
  const navigate = useNavigate();

  // ✅ Mark as read - Delegate to parent
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.isRead || !onMarkAsRead) return;
    onMarkAsRead(notification.id);
  };

  // ✅ Delete - Delegate to parent
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    onDelete(notification.id);
  };

  // ✅ Handle click
  const handleClick = () => {
    // Mark as read if unread
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    // Custom onClick or navigate
    if (onClick) {
      onClick();
    } else if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      new_content: "🎬",
      subscription: "💳",
      payment: "💰",
      promotion: "🎁",
      system: "⚙️",
      content_update: "🔄",
      event: "🎪",
      reminder: "⏰",
      announcement: "📢",
    };
    return icons[type] || "🔔";
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      new_content: "from-blue-500 to-cyan-500",
      subscription: "from-purple-500 to-pink-500",
      payment: "from-green-500 to-emerald-500",
      promotion: "from-orange-500 to-amber-500",
      system: "from-red-500 to-pink-500",
      content_update: "from-teal-500 to-cyan-500",
      event: "from-pink-500 to-rose-500",
      reminder: "from-yellow-500 to-orange-500",
      announcement: "from-cyan-500 to-blue-500",
    };
    return colors[type] || "from-blue-500 to-cyan-500";
  };

  const formatDate = (date: any) => {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (compact) {
    // Compact version for lists
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={handleClick}
        className={`p-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all cursor-pointer border-l-4 ${
          !notification.isRead
            ? "border-blue-500 bg-blue-50/30 dark:bg-blue-900/20"
            : "border-transparent"
        }`}
      >
        <div className="flex gap-3 items-start">
          <div
            className={`w-8 h-8 bg-gradient-to-br ${getTypeColor(notification.type)} rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-lg`}
          >
            <span className="text-sm">{getTypeIcon(notification.type)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">
                {notification.title}
              </h4>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1 shadow-lg" />
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-0.5">
              {notification.message}
            </p>
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 inline-block">
              {formatDate(notification.createdAt)}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full version for detailed view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleClick}
      className={`bg-white dark:bg-slate-900 rounded-2xl shadow-lg border-2 overflow-hidden cursor-pointer hover:shadow-xl transition-all ${
        !notification.isRead
          ? "border-blue-500"
          : "border-gray-200 dark:border-slate-800"
      }`}
    >
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${getTypeColor(notification.type)} p-4 text-white`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
              {getTypeIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-lg mb-1 line-clamp-2">
                {notification.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <Clock size={12} />
                <span>{formatDate(notification.createdAt)}</span>
              </div>
            </div>
          </div>
          {!notification.isRead && (
            <div className="w-3 h-3 bg-white rounded-full flex-shrink-0 mt-1 shadow-lg" />
          )}
        </div>
      </div>

      {/* Image */}
      {notification.imageUrl && (
        <div className="relative">
          <img
            src={notification.imageUrl}
            alt=""
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          {notification.message}
        </p>

        {/* Action Button */}
        {notification.actionUrl && notification.actionLabel && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full px-4 py-3 bg-gradient-to-r ${getTypeColor(notification.type)} text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all`}
          >
            <span>{notification.actionLabel}</span>
            <ExternalLink size={16} />
          </motion.button>
        )}
      </div>

      {/* Actions Footer */}
      {showActions && (onMarkAsRead || onDelete) && (
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {notification.type.replace("_", " ")}
          </span>
          <div className="flex gap-2">
            {!notification.isRead && onMarkAsRead && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleMarkAsRead}
                className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                title="Mark as read"
              >
                <Eye size={16} className="text-gray-500 dark:text-gray-400" />
              </motion.button>
            )}
            {onDelete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDelete}
                className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                title="Delete"
              >
                <Trash2 size={16} className="text-red-500" />
              </motion.button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationItem;
