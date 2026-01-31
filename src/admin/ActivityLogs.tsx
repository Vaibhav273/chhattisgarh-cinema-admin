import React, { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Activity,
  Search,
  Download,
  RefreshCw,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Eye,
  X,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  Timestamp,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";

// ═══════════════════════════════════════════════════════════════
// 📊 INTERFACES
// ═══════════════════════════════════════════════════════════════

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  module: string;
  subModule?: string;
  description: string;
  level: "info" | "warning" | "error" | "success";
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
  status: string;
}

interface LogsStats {
  total: number;
  today: number;
  success: number;
  info: number;
  warning: number;
  error: number;
}

const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [_lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState<LogsStats>({
    total: 0,
    today: 0,
    success: 0,
    info: 0,
    warning: 0,
    error: 0,
  });

  const pageSize = 50;

  // ═══════════════════════════════════════════════════════════════
  // 🔄 FETCH LOGS
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [selectedModule, selectedLevel, dateFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      let q = query(
        collection(db, "activityLogs"),
        orderBy("timestamp", "desc"),
        limit(pageSize),
      );

      // Apply filters
      if (selectedModule !== "all") {
        q = query(q, where("module", "==", selectedModule));
      }

      if (selectedLevel !== "all") {
        q = query(q, where("level", "==", selectedLevel));
      }

      // Date filter
      if (dateFilter !== "all") {
        const now = new Date();
        let startDate: Date;

        switch (dateFilter) {
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case "month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = new Date(0);
        }

        q = query(q, where("timestamp", ">=", Timestamp.fromDate(startDate)));
      }

      const snapshot = await getDocs(q);
      const logsData: ActivityLog[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        logsData.push({
          id: doc.id,
          ...data,
        } as ActivityLog);
      });

      setLogs(logsData);

      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const allSnapshot = await getDocs(collection(db, "activityLogs"));

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaySnapshot = await getDocs(
        query(
          collection(db, "activityLogs"),
          where("timestamp", ">=", Timestamp.fromDate(today)),
        ),
      );

      let success = 0,
        info = 0,
        warning = 0,
        error = 0;

      allSnapshot.forEach((doc) => {
        const level = doc.data().level;
        if (level === "success") success++;
        else if (level === "info") info++;
        else if (level === "warning") warning++;
        else if (level === "error") error++;
      });

      setStats({
        total: allSnapshot.size,
        today: todaySnapshot.size,
        success,
        info,
        warning,
        error,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🎨 HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "success":
        return CheckCircle;
      case "error":
        return AlertCircle;
      case "warning":
        return AlertTriangle;
      case "info":
      default:
        return Info;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "success":
        return "text-green-500 bg-green-100 dark:bg-green-900/30";
      case "error":
        return "text-red-500 bg-red-100 dark:bg-red-900/30";
      case "warning":
        return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30";
      case "info":
      default:
        return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
    }
  };

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const exportToCSV = () => {
    const headers = [
      "Time",
      "User",
      "Module",
      "Action",
      "Level",
      "Status",
      "Description",
    ];
    const rows = filteredLogs.map((log) => [
      log.timestamp?.toDate().toLocaleString() || "N/A",
      log.userName || "N/A",
      log.module || "N/A",
      log.action || "N/A",
      log.level || "N/A",
      log.status || "N/A",
      log.description || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.userName?.toLowerCase().includes(query) ||
      log.userEmail?.toLowerCase().includes(query) ||
      log.action?.toLowerCase().includes(query) ||
      log.module?.toLowerCase().includes(query) ||
      log.description?.toLowerCase().includes(query)
    );
  });

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
              <Activity size={28} />
            </div>
            <h1 className="text-3xl font-black">📊 Activity Logs</h1>
          </div>
          <p className="text-white/90 text-lg">
            Track all admin actions and system activities in real-time
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          {
            label: "Total Logs",
            value: stats.total,
            icon: Activity,
            color: "from-blue-500 to-cyan-500",
          },
          {
            label: "Today",
            value: stats.today,
            icon: Calendar,
            color: "from-green-500 to-emerald-500",
          },
          {
            label: "Success",
            value: stats.success,
            icon: CheckCircle,
            color: "from-green-500 to-teal-500",
          },
          {
            label: "Info",
            value: stats.info,
            icon: Info,
            color: "from-blue-500 to-indigo-500",
          },
          {
            label: "Warnings",
            value: stats.warning,
            icon: AlertTriangle,
            color: "from-yellow-500 to-orange-500",
          },
          {
            label: "Errors",
            value: stats.error,
            icon: AlertCircle,
            color: "from-red-500 to-pink-500",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 relative overflow-hidden group"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`}
              />
              <div className="relative z-10">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters & Search */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by user, action, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Module Filter */}
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Modules</option>
            <option value="movies">Movies</option>
            <option value="webseries">Web Series</option>
            <option value="shortfilms">Short Films</option>
            <option value="users">Users</option>
            <option value="subscriptions">Subscriptions</option>
            <option value="events">Events</option>
            <option value="settings">Settings</option>
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Levels</option>
            <option value="success">Success</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Download size={18} />
            Export CSV
          </button>
          <div className="ml-auto text-sm text-slate-600 dark:text-slate-400 font-semibold">
            Showing {filteredLogs.length} logs
          </div>
        </div>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Activity size={40} className="text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-bold text-lg">
              No activity logs found
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                    Module
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                    Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => {
                  const LevelIcon = getLevelIcon(log.level);
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatTime(log.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <User size={16} className="text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">
                              {log.userName || "Unknown"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {log.userEmail || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
                          {log.module}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {log.action}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${getLevelColor(log.level)}`}
                        >
                          <LevelIcon size={14} />
                          <span className="text-xs font-bold uppercase">
                            {log.level}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {log.description}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setShowDetails(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-semibold"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Details Modal */}
      {showDetails && selectedLog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetails(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white">Log Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
                    User
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {selectedLog.userName}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {selectedLog.userEmail}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
                    Time
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {selectedLog.timestamp?.toDate().toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
                    Module
                  </p>
                  <span className="inline-flex px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
                    {selectedLog.module}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
                    Level
                  </p>
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${getLevelColor(selectedLog.level)}`}
                  >
                    {React.createElement(getLevelIcon(selectedLog.level), {
                      size: 14,
                    })}
                    <span className="text-xs font-bold uppercase">
                      {selectedLog.level}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
                    Action
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {selectedLog.action}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
                    Description
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {selectedLog.description}
                  </p>
                </div>
                {selectedLog.ipAddress && (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
                      IP Address
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {selectedLog.ipAddress}
                    </p>
                  </div>
                )}
                {selectedLog.status && (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
                      Status
                    </p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        selectedLog.status === "success"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {selectedLog.status}
                    </span>
                  </div>
                )}
                {selectedLog.metadata &&
                  Object.keys(selectedLog.metadata).length > 0 && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500 font-semibold uppercase mb-2">
                        Metadata
                      </p>
                      <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-xs overflow-x-auto">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ActivityLogs;
