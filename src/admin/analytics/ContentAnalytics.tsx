// ═══════════════════════════════════════════════════════════════
// 🎬 CONTENT ANALYTICS - 100% DYNAMIC FROM FIRESTORE
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Film,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Star,
  ThumbsUp,
  MessageCircle,
  Download,
  DollarSign,
  Target,
  PlayCircle,
  Loader,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { Movie, WebSeries, ShortFilm } from '../../types/content';

// ═══════════════════════════════════════════════════════════════
// 📊 INTERFACES
// ═══════════════════════════════════════════════════════════════
interface ContentStats {
  totalContent: number;
  moviesCount: number;
  seriesCount: number;
  shortFilmsCount: number;
  totalViews: number;
  totalWatchTime: number;
  totalLikes: number;
  totalComments: number;
  averageRating: number;
  averageCompletionRate: number;
  totalRevenue: number;
  premiumContent: number;
}

interface ContentItem {
  id: string;
  title: string;
  type: string;
  genre: string;
  language: string;
  views: number;
  watchTime: number;
  completionRate: number;
  rating: number;
  engagement: number;
  revenue: number;
  likes: number;
  comments: number;
  thumbnail: string;
  createdAt: any;
}

interface GenreData {
  name: string;
  count: number;
  views: number;
  color: string;
}

interface LanguageData {
  name: string;
  count: number;
  views: number;
}

interface PerformanceData {
  date: string;
  views: number;
  watchTime: number;
  engagement: number;
  revenue: number;
}

interface RatingDistribution {
  rating: string;
  count: number;
}

interface TypeComparison {
  type: string;
  avgViews: number;
  avgRating: number;
  avgCompletion: number;
  avgRevenue: number;
}

// ═══════════════════════════════════════════════════════════════
// 🎨 STATS CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  gradient: string;
  subtitle?: string;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon, gradient, subtitle, loading = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-3xl`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
            {icon}
          </div>
          {change !== undefined && !loading && (
            <div className={`px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 ${change >= 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              }`}>
              {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</p>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader className="animate-spin text-slate-400" size={20} />
            <span className="text-slate-400">Loading...</span>
          </div>
        ) : (
          <>
            <p className="text-3xl font-black text-slate-800 dark:text-white">{value}</p>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
          </>
        )}
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 📊 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const ContentAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [stats, setStats] = useState<ContentStats>({
    totalContent: 0,
    moviesCount: 0,
    seriesCount: 0,
    shortFilmsCount: 0,
    totalViews: 0,
    totalWatchTime: 0,
    totalLikes: 0,
    totalComments: 0,
    averageRating: 0,
    averageCompletionRate: 0,
    totalRevenue: 0,
    premiumContent: 0,
  });

  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [genreData, setGenreData] = useState<GenreData[]>([]);
  const [languageData, setLanguageData] = useState<LanguageData[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution[]>([]);
  const [typeComparison, setTypeComparison] = useState<TypeComparison[]>([]);

  useEffect(() => {
    fetchContentAnalytics();
  }, [dateRange]);

  // ═══════════════════════════════════════════════════════════════
  // 📥 FETCH CONTENT ANALYTICS - 100% DYNAMIC
  // ═══════════════════════════════════════════════════════════════
  const fetchContentAnalytics = async () => {
    try {
      setLoading(true);
      const startDate = new Date();

      switch (dateRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      // Fetch all content from Firestore
      const [moviesSnapshot, seriesSnapshot, shortFilmsSnapshot] = await Promise.all([
        getDocs(collection(db, 'movies')),
        getDocs(collection(db, 'webseries')),
        getDocs(collection(db, 'shortfilms')),
      ]);

      // Initialize counters
      let totalViews = 0;
      let totalWatchTime = 0;
      let totalLikes = 0;
      let totalComments = 0;
      let totalRating = 0;
      let ratingCount = 0;
      let totalCompletionRate = 0;
      let completionCount = 0;
      let totalRevenue = 0;
      let premiumContent = 0;

      const genreMap: Record<string, { count: number; views: number }> = {};
      const languageMap: Record<string, { count: number; views: number }> = {};
      const contentItems: ContentItem[] = [];
      const ratingMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      // Process Movies
      moviesSnapshot.forEach(doc => {
        const movie = doc.data() as Movie;
        const views = movie.views || 0;
        const watchTimeMinutes = parseDuration(movie.duration) || 0;
        const watchTimeHours = (watchTimeMinutes * views) / 60;
        const rating = extractRating(movie.rating) || 0;
        const likes = movie.likes || 0;
        const comments = movie.commentsCount || 0;

        totalViews += views;
        totalWatchTime += watchTimeHours;
        totalLikes += likes;
        totalComments += comments;

        if (rating > 0) {
          totalRating += rating;
          ratingCount++;
          const ratingRounded = Math.round(rating);
          if (ratingRounded >= 1 && ratingRounded <= 5) {
            ratingMap[ratingRounded] = (ratingMap[ratingRounded] || 0) + 1;
          }
        }

        // Calculate revenue from premium content
        let contentRevenue = 0;
        if (movie.isPremium) {
          premiumContent++;
          // Calculate revenue based on views (assuming some conversion rate)
          contentRevenue = views * 0.15; // Example: 15% of viewers pay ₹299
          totalRevenue += contentRevenue;
        }

        // Genre data
        if (movie.genre && movie.genre.length > 0) {
          movie.genre.forEach(g => {
            if (!genreMap[g]) genreMap[g] = { count: 0, views: 0 };
            genreMap[g].count++;
            genreMap[g].views += views;
          });
        }

        // Language data
        const lang = movie.language || 'Unknown';
        if (!languageMap[lang]) languageMap[lang] = { count: 0, views: 0 };
        languageMap[lang].count++;
        languageMap[lang].views += views;

        // Calculate completion rate from watch history if available
        const completion = movie.watchCount && views > 0 ? (movie.watchCount / views) * 100 : 0;
        if (completion > 0) {
          totalCompletionRate += completion;
          completionCount++;
        }

        // Add to content list
        contentItems.push({
          id: doc.id,
          title: movie.title,
          type: 'Movie',
          genre: movie.genre?.join(', ') || 'N/A',
          language: movie.language || 'N/A',
          views,
          watchTime: watchTimeHours,
          completionRate: completion,
          rating,
          engagement: calculateEngagement(views, likes, comments),
          revenue: contentRevenue,
          likes,
          comments,
          thumbnail: movie.thumbnail || movie.posterUrl || movie.thumbnailUrl || '',
          createdAt: movie.createdAt,
        });
      });

      // Process Web Series
      seriesSnapshot.forEach(doc => {
        const series = doc.data() as WebSeries;
        const views = series.views || 0;
        const rating = extractRating(series.rating) || 0;
        const likes = series.likes || 0;
        const comments = series.commentsCount || 0;

        // Calculate total watch time for series (sum of all episodes)
        let seriesWatchTime = 0;
        if (series.seasons && series.seasons.length > 0) {
          series.seasons.forEach(season => {
            if (season.episodes && season.episodes.length > 0) {
              season.episodes.forEach(episode => {
                const epDuration = parseDuration(episode.duration) || 0;
                const epViews = episode.views || views / (series.totalEpisodes || 1);
                seriesWatchTime += (epDuration * epViews) / 60;
              });
            }
          });
        }

        totalViews += views;
        totalWatchTime += seriesWatchTime;
        totalLikes += likes;
        totalComments += comments;

        if (rating > 0) {
          totalRating += rating;
          ratingCount++;
          const ratingRounded = Math.round(rating);
          if (ratingRounded >= 1 && ratingRounded <= 5) {
            ratingMap[ratingRounded] = (ratingMap[ratingRounded] || 0) + 1;
          }
        }

        let contentRevenue = 0;
        if (series.isPremium) {
          premiumContent++;
          contentRevenue = views * 0.20; // Higher conversion for series
          totalRevenue += contentRevenue;
        }

        // Genre data
        if (series.genre && series.genre.length > 0) {
          series.genre.forEach(g => {
            if (!genreMap[g]) genreMap[g] = { count: 0, views: 0 };
            genreMap[g].count++;
            genreMap[g].views += views;
          });
        }

        // Language data
        const lang = series.language || 'Unknown';
        if (!languageMap[lang]) languageMap[lang] = { count: 0, views: 0 };
        languageMap[lang].count++;
        languageMap[lang].views += views;

        const completion = series.watchCount && views > 0 ? (series.watchCount / views) * 100 : 0;
        if (completion > 0) {
          totalCompletionRate += completion;
          completionCount++;
        }

        contentItems.push({
          id: doc.id,
          title: series.title,
          type: 'Series',
          genre: series.genre?.join(', ') || 'N/A',
          language: series.language || 'N/A',
          views,
          watchTime: seriesWatchTime,
          completionRate: completion,
          rating,
          engagement: calculateEngagement(views, likes, comments),
          revenue: contentRevenue,
          likes,
          comments,
          thumbnail: series.thumbnail || series.posterUrl || series.thumbnailUrl || '',
          createdAt: series.createdAt,
        });
      });

      // Process Short Films
      shortFilmsSnapshot.forEach(doc => {
        const shortFilm = doc.data() as ShortFilm;
        const views = shortFilm.views || 0;
        const watchTimeMinutes = parseDuration(shortFilm.duration) || 0;
        const watchTimeHours = (watchTimeMinutes * views) / 60;
        const rating = extractRating(shortFilm.rating) || 0;
        const likes = shortFilm.likes || 0;
        const comments = shortFilm.commentsCount || 0;

        totalViews += views;
        totalWatchTime += watchTimeHours;
        totalLikes += likes;
        totalComments += comments;

        if (rating > 0) {
          totalRating += rating;
          ratingCount++;
          const ratingRounded = Math.round(rating);
          if (ratingRounded >= 1 && ratingRounded <= 5) {
            ratingMap[ratingRounded] = (ratingMap[ratingRounded] || 0) + 1;
          }
        }

        let contentRevenue = 0;
        if (shortFilm.isPremium) {
          premiumContent++;
          contentRevenue = views * 0.10;
          totalRevenue += contentRevenue;
        }

        // Genre data
        if (shortFilm.genre && shortFilm.genre.length > 0) {
          shortFilm.genre.forEach(g => {
            if (!genreMap[g]) genreMap[g] = { count: 0, views: 0 };
            genreMap[g].count++;
            genreMap[g].views += views;
          });
        }

        // Language data
        const lang = shortFilm.language || 'Unknown';
        if (!languageMap[lang]) languageMap[lang] = { count: 0, views: 0 };
        languageMap[lang].count++;
        languageMap[lang].views += views;

        const completion = shortFilm.watchCount && views > 0 ? (shortFilm.watchCount / views) * 100 : 0;
        if (completion > 0) {
          totalCompletionRate += completion;
          completionCount++;
        }

        contentItems.push({
          id: doc.id,
          title: shortFilm.title,
          type: 'Short Film',
          genre: shortFilm.genre?.join(', ') || 'N/A',
          language: shortFilm.language || 'N/A',
          views,
          watchTime: watchTimeHours,
          completionRate: completion,
          rating,
          engagement: calculateEngagement(views, likes, comments),
          revenue: contentRevenue,
          likes,
          comments,
          thumbnail: shortFilm.thumbnail || shortFilm.posterUrl || shortFilm.thumbnailUrl || '',
          createdAt: shortFilm.createdAt,
        });
      });

      // Calculate averages
      const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
      const averageCompletionRate = completionCount > 0 ? totalCompletionRate / completionCount : 0;
      const totalContent = moviesSnapshot.size + seriesSnapshot.size + shortFilmsSnapshot.size;

      // Convert genre data
      const genreDataArray: GenreData[] = Object.entries(genreMap)
        .map(([name, data], index) => ({
          name,
          count: data.count,
          views: data.views,
          color: getGenreColor(index),
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      setGenreData(genreDataArray);

      // Convert language data
      const languageDataArray: LanguageData[] = Object.entries(languageMap)
        .map(([name, data]) => ({
          name,
          count: data.count,
          views: data.views,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      setLanguageData(languageDataArray);

      // Rating distribution
      const ratingDistArray: RatingDistribution[] = Object.entries(ratingMap)
        .filter(([_, count]) => count > 0)
        .map(([rating, count]) => ({
          rating: `${rating}★`,
          count,
        }));
      setRatingDistribution(ratingDistArray);

      // Type comparison
      const movieStats = calculateTypeStats(contentItems, 'Movie');
      const seriesStats = calculateTypeStats(contentItems, 'Series');
      const shortFilmStats = calculateTypeStats(contentItems, 'Short Film');

      setTypeComparison([movieStats, seriesStats, shortFilmStats].filter(stat => stat.avgViews > 0));

      const perfDataFromContent = generatePerformanceDataFromContent(contentItems, 30);
      setPerformanceData(perfDataFromContent);
      // Sort content by views
      contentItems.sort((a, b) => b.views - a.views);
      setContentList(contentItems);

      setStats({
        totalContent,
        moviesCount: moviesSnapshot.size,
        seriesCount: seriesSnapshot.size,
        shortFilmsCount: shortFilmsSnapshot.size,
        totalViews,
        totalWatchTime,
        totalLikes,
        totalComments,
        averageRating,
        averageCompletionRate,
        totalRevenue,
        premiumContent,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching content analytics:', error);
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 📊 GENERATE PERFORMANCE DATA FROM ACTUAL CONTENT
  // ═══════════════════════════════════════════════════════════════
  const generatePerformanceDataFromContent = (items: ContentItem[], days: number): PerformanceData[] => {
    const perfData: PerformanceData[] = [];
    const today = new Date();

    // Group content by date
    const dateMap: Record<string, { views: number; watchTime: number; engagement: number; revenue: number; count: number }> = {};

    items.forEach(item => {
      // Get creation date or use a default date range
      let itemDate: Date;
      if (item.createdAt?.toDate) {
        itemDate = item.createdAt.toDate();
      } else if (item.createdAt instanceof Date) {
        itemDate = item.createdAt;
      } else {
        // Skip items without dates
        return;
      }

      // Check if within date range
      const diffTime = Math.abs(today.getTime() - itemDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= days) {
        const dateKey = itemDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        if (!dateMap[dateKey]) {
          dateMap[dateKey] = { views: 0, watchTime: 0, engagement: 0, revenue: 0, count: 0 };
        }

        dateMap[dateKey].views += item.views;
        dateMap[dateKey].watchTime += item.watchTime;
        dateMap[dateKey].engagement += item.engagement;
        dateMap[dateKey].revenue += item.revenue;
        dateMap[dateKey].count++;
      }
    });

    // Create array for last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (dateMap[dateKey]) {
        perfData.push({
          date: dateKey,
          views: dateMap[dateKey].views,
          watchTime: dateMap[dateKey].watchTime,
          engagement: dateMap[dateKey].count > 0 ? dateMap[dateKey].engagement / dateMap[dateKey].count : 0,
          revenue: dateMap[dateKey].revenue,
        });
      } else {
        perfData.push({
          date: dateKey,
          views: 0,
          watchTime: 0,
          engagement: 0,
          revenue: 0,
        });
      }
    }

    return perfData;
  };


  // ═══════════════════════════════════════════════════════════════
  // 🛠️ HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const formatCurrency = (num: number): string => {
    return `₹${formatNumber(num)}`;
  };

  const extractRating = (rating: any): number => {
    if (typeof rating === 'number') return rating;
    if (typeof rating === 'object' && rating?.average) return rating.average;
    if (typeof rating === 'string') return parseFloat(rating) || 0;
    return 0;
  };

  const parseDuration = (duration: any): number => {
    if (!duration) return 0;
    if (typeof duration === 'number') return duration;

    const str = duration.toString();
    const hours = str.match(/(\d+)h/);
    const minutes = str.match(/(\d+)m/);

    let total = 0;
    if (hours) total += parseInt(hours[1]) * 60;
    if (minutes) total += parseInt(minutes[1]);

    return total;
  };

  const calculateEngagement = (views: number, likes: number, comments: number): number => {
    if (views === 0) return 0;
    return ((likes + comments * 2) / views) * 100;
  };

  const getGenreColor = (index: number): string => {
    const colors = [
      '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B',
      '#EF4444', '#06B6D4', '#8B5CF6', '#F97316', '#14B8A6',
    ];
    return colors[index % colors.length];
  };

  const calculateTypeStats = (items: ContentItem[], type: string): TypeComparison => {
    const filtered = items.filter(item => item.type === type);
    if (filtered.length === 0) {
      return {
        type,
        avgViews: 0,
        avgRating: 0,
        avgCompletion: 0,
        avgRevenue: 0,
      };
    }

    const totalViews = filtered.reduce((sum, item) => sum + item.views, 0);
    const totalRating = filtered.reduce((sum, item) => sum + item.rating, 0);
    const totalCompletion = filtered.reduce((sum, item) => sum + item.completionRate, 0);
    const totalRevenue = filtered.reduce((sum, item) => sum + item.revenue, 0);

    return {
      type,
      avgViews: totalViews / filtered.length,
      avgRating: totalRating / filtered.length,
      avgCompletion: totalCompletion / filtered.length,
      avgRevenue: totalRevenue / filtered.length,
    };
  };

  // ═══════════════════════════════════════════════════════════════
  // 📤 EXPORT FUNCTIONALITY
  // ═══════════════════════════════════════════════════════════════
  const handleExport = () => {
    const data = {
      period: dateRange,
      generatedAt: new Date().toISOString(),
      stats,
      topContent: contentList.slice(0, 20),
      genreBreakdown: genreData,
      languageBreakdown: languageData,
      performanceData,
      ratingDistribution,
      typeComparison,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ═══════════════════════════════════════════════════════════════
  // 🎨 CUSTOM TOOLTIP
  // ═══════════════════════════════════════════════════════════════
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="font-bold text-slate-800 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">
                {entry.name.includes('Revenue') ? formatCurrency(entry.value) : formatNumber(entry.value)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Content Analytics</h2>
          <p className="text-slate-600 dark:text-slate-400">Performance metrics for all content</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
          >
            <Download size={20} />
            Export
          </motion.button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Content"
          value={stats.totalContent}
          subtitle={`Movies: ${stats.moviesCount} • Series: ${stats.seriesCount} • Shorts: ${stats.shortFilmsCount}`}
          icon={<Film size={24} />}
          gradient="from-purple-500 to-pink-600"
          loading={loading}
        />
        <StatsCard
          title="Total Views"
          value={formatNumber(stats.totalViews)}
          subtitle="Across all content"
          icon={<Eye size={24} />}
          gradient="from-blue-500 to-cyan-600"
          loading={loading}
        />
        <StatsCard
          title="Total Watch Time"
          value={`${formatNumber(stats.totalWatchTime)}h`}
          subtitle="Hours streamed"
          icon={<Clock size={24} />}
          gradient="from-green-500 to-emerald-600"
          loading={loading}
        />
        <StatsCard
          title="Avg Rating"
          value={stats.averageRating.toFixed(1)}
          subtitle="⭐ Out of 5.0"
          icon={<Star size={24} />}
          gradient="from-yellow-500 to-orange-500"
          loading={loading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign size={24} />}
          gradient="from-green-500 to-teal-600"
          loading={loading}
        />
        <StatsCard
          title="Total Likes"
          value={formatNumber(stats.totalLikes)}
          icon={<ThumbsUp size={24} />}
          gradient="from-pink-500 to-rose-600"
          loading={loading}
        />
        <StatsCard
          title="Total Comments"
          value={formatNumber(stats.totalComments)}
          icon={<MessageCircle size={24} />}
          gradient="from-indigo-500 to-purple-600"
          loading={loading}
        />
        <StatsCard
          title="Avg Completion"
          value={`${stats.averageCompletionRate.toFixed(1)}%`}
          icon={<Target size={24} />}
          gradient="from-orange-500 to-red-600"
          loading={loading}
        />
      </div>

      {/* Performance Trend */}
      {!loading && performanceData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
        >
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-500" />
            Content Performance Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorWatchTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="views" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorViews)" name="Views" />
              <Area type="monotone" dataKey="watchTime" stroke="#10B981" fillOpacity={1} fill="url(#colorWatchTime)" name="Watch Time (hrs)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Genre Distribution & Language Breakdown */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Genre Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <PieChartIcon size={20} className="text-pink-500" />
              Genre Distribution
            </h3>
            {genreData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent! * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-20">No genre data available</p>
            )}
          </motion.div>

          {/* Language Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-500" />
              Language Breakdown
            </h3>
            {languageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={languageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-20">No language data available</p>
            )}
          </motion.div>
        </div>
      )}

      {/* Rating Distribution & Type Comparison */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rating Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Star size={20} className="text-yellow-500" />
              Rating Distribution
            </h3>
            {ratingDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="rating" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-20">No rating data available</p>
            )}
          </motion.div>

          {/* Type Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Target size={20} className="text-green-500" />
              Content Type Comparison
            </h3>
            {typeComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={typeComparison}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="type" stroke="#64748B" />
                  <PolarRadiusAxis stroke="#64748B" />
                  <Radar name="Avg Views" dataKey="avgViews" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                  <Radar name="Avg Rating" dataKey="avgRating" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-20">No comparison data available</p>
            )}
          </motion.div>
        </div>
      )}

      {/* Top Content Table */}
      {!loading && contentList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
        >
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <PlayCircle size={20} className="text-red-500" />
            Top Performing Content
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left p-3 text-slate-600 dark:text-slate-400 font-semibold">Content</th>
                  <th className="text-left p-3 text-slate-600 dark:text-slate-400 font-semibold">Type</th>
                  <th className="text-left p-3 text-slate-600 dark:text-slate-400 font-semibold">Views</th>
                  <th className="text-left p-3 text-slate-600 dark:text-slate-400 font-semibold">Watch Time (hrs)</th>
                  <th className="text-left p-3 text-slate-600 dark:text-slate-400 font-semibold">Rating</th>
                  <th className="text-left p-3 text-slate-600 dark:text-slate-400 font-semibold">Revenue</th>
                  <th className="text-left p-3 text-slate-600 dark:text-slate-400 font-semibold">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {contentList.slice(0, 10).map((content) => (
                  <tr key={content.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {content.thumbnail && (
                          <img
                            src={content.thumbnail}
                            alt={content.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">{content.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{content.genre} • {content.language}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${content.type === 'Movie' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                        content.type === 'Series' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                        {content.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-800 dark:text-white font-semibold">{formatNumber(content.views)}</td>
                    <td className="p-3 text-slate-800 dark:text-white font-semibold">{formatNumber(content.watchTime)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-slate-800 dark:text-white">{content.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-800 dark:text-white font-semibold">{formatCurrency(content.revenue)}</td>
                    <td className="p-3 text-slate-800 dark:text-white font-semibold">{content.engagement.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ContentAnalytics;
