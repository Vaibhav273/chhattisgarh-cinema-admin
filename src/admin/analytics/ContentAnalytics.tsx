import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Download,
  RefreshCw,
  Eye,
  Clock,
  Heart,
  MessageCircle,
  Film,
  Star,
  Target,
  BarChart3,
  AlertCircle,
  ChevronDown,
  Award,
  CheckCircle,
} from "lucide-react";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type { ContentItem, ContentStats, GenreStats, LanguageStats } from "../../types";

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

const ContentAnalytics: React.FC = () => {
  // States
  const [loading, setLoading] = useState(true);
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState<ContentStats>({
    totalContent: 0,
    totalViews: 0,
    totalWatchTime: 0,
    averageCompletionRate: 0,
    averageRating: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    moviesCount: 0,
    seriesCount: 0,
    shortFilmsCount: 0,
  });
  const [genreStats, setGenreStats] = useState<GenreStats[]>([]);
  const [languageStats, setLanguageStats] = useState<LanguageStats[]>([]);
  const [sortBy, setSortBy] = useState<string>("views");
  const [filterType, setFilterType] = useState<string>("all");

  // Toast
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });

  // Fetch content analytics
  useEffect(() => {
    fetchContentAnalytics();
  }, []);

  const fetchContentAnalytics = async () => {
    try {
      setLoading(true);
      console.log("Fetching content analytics...");

      // Fetch movies
      const moviesSnapshot = await getDocs(collection(db, "movies"));
      const movies: ContentItem[] = [];

      moviesSnapshot.forEach((doc) => {
        const data = doc.data();
        movies.push({
          id: doc.id,
          title: data.title || "Unknown",
          type: "Movie",
          views: data.views || 0,
          watchTime: Math.floor((data.totalWatchTime || 0) / 60), // convert minutes to hours
          completionRate: data.completionRate || 0,
          rating: data.rating || 0,
          likes: data.likes || 0,
          comments: data.comments || 0,
          shares: data.shares || 0,
          genre: data.genre || "Unknown",
          language: data.language || "Unknown",
          publishedDate: data.publishedDate || "",
        });
      });

      // Fetch series
      const seriesSnapshot = await getDocs(collection(db, "webseries"));
      const series: ContentItem[] = [];

      seriesSnapshot.forEach((doc) => {
        const data = doc.data();
        series.push({
          id: doc.id,
          title: data.title || "Unknown",
          type: "Series",
          views: data.views || 0,
          watchTime: Math.floor((data.totalWatchTime || 0) / 60),
          completionRate: data.completionRate || 0,
          rating: data.rating || 0,
          likes: data.likes || 0,
          comments: data.comments || 0,
          shares: data.shares || 0,
          genre: data.genre || "Unknown",
          language: data.language || "Unknown",
          publishedDate: data.publishedDate || "",
        });
      });

      // Fetch short films
      const shortFilmsSnapshot = await getDocs(collection(db, "shortfilms"));
      const shortFilms: ContentItem[] = [];

      shortFilmsSnapshot.forEach((doc) => {
        const data = doc.data();
        shortFilms.push({
          id: doc.id,
          title: data.title || "Unknown",
          type: "Short Film",
          views: data.views || 0,
          watchTime: Math.floor((data.totalWatchTime || 0) / 60),
          completionRate: data.completionRate || 0,
          rating: data.rating || 0,
          likes: data.likes || 0,
          comments: data.comments || 0,
          shares: data.shares || 0,
          genre: data.genre || "Unknown",
          language: data.language || "Unknown",
          publishedDate: data.publishedDate || "",
        });
      });

      const allContent = [...movies, ...series, ...shortFilms];

      // Calculate stats
      const totalContent = allContent.length;
      const totalViews = allContent.reduce((sum, item) => sum + item.views, 0);
      const totalWatchTime = allContent.reduce((sum, item) => sum + item.watchTime, 0);
      const totalLikes = allContent.reduce((sum, item) => sum + item.likes, 0);
      const totalComments = allContent.reduce((sum, item) => sum + item.comments, 0);
      const totalShares = allContent.reduce((sum, item) => sum + item.shares, 0);

      const averageCompletionRate =
        totalContent > 0
          ? allContent.reduce((sum, item) => sum + item.completionRate, 0) / totalContent
          : 0;

      const averageRating =
        totalContent > 0
          ? allContent.reduce((sum, item) => sum + item.rating, 0) / totalContent
          : 0;

      // Genre stats
      const genreMap: { [key: string]: { count: number; views: number } } = {};
      allContent.forEach((item) => {
        if (!genreMap[item.genre]) {
          genreMap[item.genre] = { count: 0, views: 0 };
        }
        genreMap[item.genre].count++;
        genreMap[item.genre].views += item.views;
      });

      const genreStatsArray: GenreStats[] = Object.entries(genreMap)
        .map(([genre, data]) => ({
          genre,
          count: data.count,
          views: data.views,
          percentage: (data.count / totalContent) * 100,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // Language stats
      const languageMap: { [key: string]: { count: number; views: number } } = {};
      allContent.forEach((item) => {
        if (!languageMap[item.language]) {
          languageMap[item.language] = { count: 0, views: 0 };
        }
        languageMap[item.language].count++;
        languageMap[item.language].views += item.views;
      });

      const languageStatsArray: LanguageStats[] = Object.entries(languageMap)
        .map(([language, data]) => ({
          language,
          count: data.count,
          views: data.views,
          percentage: (data.count / totalContent) * 100,
        }))
        .sort((a, b) => b.views - a.views);

      setStats({
        totalContent,
        totalViews,
        totalWatchTime,
        averageCompletionRate,
        averageRating,
        totalLikes,
        totalComments,
        totalShares,
        moviesCount: movies.length,
        seriesCount: series.length,
        shortFilmsCount: shortFilms.length,
      });

      setContentList(allContent.sort((a, b) => b.views - a.views));
      setGenreStats(genreStatsArray);
      setLanguageStats(languageStatsArray);

      console.log("✅ Content analytics fetched successfully");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching content analytics:", error);
      showToast("Failed to load content analytics", "error");
      setLoading(false);
    }
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

  const handleExportReport = () => {
    showToast("Exporting content analytics report...", "info");
    // Export logic here
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Movie":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      case "Series":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
      case "Short Film":
        return "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
    }
  };

  const getSortedContent = () => {
    let filtered = [...contentList];

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((item) => {
        if (filterType === "movie") return item.type === "Movie";
        if (filterType === "series") return item.type === "Series";
        if (filterType === "shortfilm") return item.type === "Short Film";
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "views":
          return b.views - a.views;
        case "watchTime":
          return b.watchTime - a.watchTime;
        case "rating":
          return b.rating - a.rating;
        case "likes":
          return b.likes - a.likes;
        case "completion":
          return b.completionRate - a.completionRate;
        default:
          return 0;
      }
    });

    return filtered.slice(0, 20); // Top 20
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
          Loading content analytics...
        </p>
      </div>
    );
  }

  const sortedContent = getSortedContent();

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
                  <Video size={32} />
                </div>
                <div>
                  <h1 className="text-4xl font-black mb-2">Content Analytics</h1>
                  <p className="text-white/90 text-lg">
                    Performance metrics for all content
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchContentAnalytics}
                  className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                >
                  <RefreshCw size={20} />
                  Refresh
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportReport}
                  className="px-8 py-3 bg-white text-purple-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Download size={20} />
                  Export Report
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* MAIN STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Video size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Total Content
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {stats.totalContent}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Movies: {stats.moviesCount} • Series: {stats.seriesCount} • Shorts:{" "}
              {stats.shortFilmsCount}
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
                <Eye size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Total Views
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {formatNumber(stats.totalViews!)}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
              Across all content
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
                <Clock size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Total Watch Time
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {formatNumber(stats.totalWatchTime!)}h
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 font-bold">
              Hours streamed
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <Star size={24} className="text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Avg Rating
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {stats.averageRating!.toFixed(1)}
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 font-bold">
              ⭐ Out of 5.0
            </p>
          </motion.div>
        </div>

        {/* ENGAGEMENT STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                  Total Likes
                </p>
                <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                  {formatNumber(stats.totalLikes!)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <Heart size={24} className="text-red-600 dark:text-red-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                  Total Comments
                </p>
                <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                  {formatNumber(stats.totalComments!)}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <MessageCircle size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                  Avg Completion
                </p>
                <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                  {stats.averageCompletionRate!.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                <Target size={24} className="text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* GENRE & LANGUAGE STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Genre Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <Film size={20} className="text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                  Top Genres
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {genreStats.map((genre, index) => (
                <motion.div
                  key={genre.genre}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-white">
                      {genre.genre}
                    </span>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      {genre.count} • {formatNumber(genre.views)} views
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${genre.percentage}%` }}
                      transition={{ duration: 1, delay: 1 + index * 0.1 }}
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Language Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                  <BarChart3 size={20} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                  Languages
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {languageStats.map((language, index) => (
                <motion.div
                  key={language.language}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-white">
                      {language.language}
                    </span>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      {language.count} • {formatNumber(language.views)} views
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${language.percentage}%` }}
                      transition={{ duration: 1, delay: 1.1 + index * 0.1 }}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Sort by:
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-2 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white font-semibold cursor-pointer"
                >
                  <option value="views">Views</option>
                  <option value="watchTime">Watch Time</option>
                  <option value="rating">Rating</option>
                  <option value="likes">Likes</option>
                  <option value="completion">Completion Rate</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Filter:
              </span>
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="appearance-none px-4 py-2 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white font-semibold cursor-pointer"
                >
                  <option value="all">All Content</option>
                  <option value="movie">Movies</option>
                  <option value="series">Series</option>
                  <option value="shortfilm">Short Films</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>

            <div className="ml-auto text-sm text-slate-600 dark:text-slate-400">
              Showing top {sortedContent.length} results
            </div>
          </div>
        </motion.div>

        {/* TOP PERFORMING CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <Award size={20} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">
                Top Performing Content
              </h3>
            </div>
          </div>

          {sortedContent.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle
                size={64}
                className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
              />
              <p className="text-xl font-bold text-slate-500 dark:text-slate-400">
                No content found
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
                      Views
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Watch Time (hrs)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Completion
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Engagement
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {sortedContent.map((content, index) => (
                    <motion.tr
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + index * 0.05 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">
                            {content.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {content.genre} • {content.language}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${getTypeColor(
                            content.type
                          )}`}
                        >
                          {content.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Eye size={16} className="text-slate-400" />
                          <span className="font-bold text-slate-800 dark:text-white">
                            {formatNumber(content.views)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-slate-400" />
                          <span className="font-bold text-slate-800 dark:text-white">
                            {formatNumber(content.watchTime)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-teal-500 to-green-500 h-2 rounded-full"
                              style={{ width: `${content.completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {content.completionRate.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star
                            size={16}
                            className="text-yellow-500 fill-yellow-500"
                          />
                          <span className="font-bold text-slate-800 dark:text-white">
                            {content.rating.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <Heart size={14} />
                            <span className="text-xs font-bold">
                              {formatNumber(content.likes)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <MessageCircle size={14} />
                            <span className="text-xs font-bold">
                              {formatNumber(content.comments)}
                            </span>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ContentAnalytics;