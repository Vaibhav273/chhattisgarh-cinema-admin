// ═══════════════════════════════════════════════════════════════
// 📊 ANALYTICS & STATISTICS TYPES
// ═══════════════════════════════════════════════════════════════

import type { ContentCategory } from './common';
import { Timestamp } from 'firebase/firestore';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 CONTENT ANALYTICS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ContentAnalytics {
    contentId: string;
    contentType: ContentCategory;
    totalViews: number;
    uniqueViews: number;
    totalWatchTime: number;
    averageWatchTime: number;
    completionRate: number;
    likes: number;
    dislikes?: number;
    shares: number;
    bookmarks: number;
    comments?: number;
    averageRating: number;
    totalRatings: number;
    viewsByDate: ViewsByDate[];
    viewsByRegion: ViewsByRegion[];
    popularEpisodes?: EpisodeAnalytics[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📅 VIEWS BY DATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ViewsByDate {
    date: string;
    views: number;
    watchTime: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌍 VIEWS BY REGION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ViewsByRegion {
    region: string;
    views: number;
    percentage: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📺 EPISODE ANALYTICS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface EpisodeAnalytics {
    episodeId: string;
    episodeNumber: number;
    seasonNumber: number;
    views: number;
    completionRate: number;
    averageRating: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 STATS (for content pages)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Stats {
    total: number;
    premium: number;
    avgRating: string;
    awarded: number;
    totalSeasons?: number;
    totalEpisodes?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 NEW: DASHBOARD ANALYTICS (for Recharts Integration)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Main analytics data point for time-series charts
 * Used for: User Growth, Revenue, Views, Watch Time charts
 */
export interface AnalyticsDataPoint {
    date: string; // ISO date string (YYYY-MM-DD)
    timestamp: Timestamp; // Firestore timestamp

    // User metrics
    users: number; // Total cumulative users
    newUsers: number; // New signups on this date
    activeUsers: number; // Active users on this date
    premiumUsers: number; // Premium subscribers on this date

    // Revenue metrics
    revenue: number; // Total revenue in rupees
    subscriptionRevenue: number; // Revenue from subscriptions
    eventRevenue: number; // Revenue from events
    ppvRevenue: number; // Pay-per-view revenue

    // Content metrics
    views: number; // Total content views
    movieViews: number; // Movie-specific views
    seriesViews: number; // Series-specific views
    shortFilmViews: number; // Short film views
    eventViews: number; // Event views

    // Engagement metrics
    watchTime: number; // Total watch time in minutes
    avgWatchTime: number; // Average watch time per user
    engagement: number; // Engagement rate percentage (0-100)
    completionRate: number; // Content completion rate percentage

    // Rating metrics
    avgRating: number; // Average rating (0-5)
    totalRatings: number; // Number of ratings submitted

    // Transaction metrics
    transactions: number; // Number of transactions
    successfulPayments: number; // Successful payment count
    failedPayments: number; // Failed payment count
}

/**
 * Content performance breakdown by category
 * Used for: Content Performance Charts (Pie/Bar charts)
 */
export interface ContentPerformance {
    contentType: ContentCategory;
    label: string; // Display label (e.g., "Movies", "Web Series")
    views: number;
    watchTime: number; // in minutes
    revenue: number;
    avgRating: number;
    totalContent: number; // Number of content items
    color: string; // Hex color for charts
}

/**
 * Revenue breakdown by source
 * Used for: Revenue Distribution Pie Chart
 */
export interface RevenueBreakdown {
    source: 'subscriptions' | 'events' | 'ppv' | 'other';
    label: string;
    amount: number;
    percentage: number;
    color: string;
}

/**
 * Watch time analytics by hour/day
 * Used for: Peak Hours Heatmap/Bar Chart
 */
export interface WatchTimeByPeriod {
    period: string; // "00:00", "01:00", etc. for hours OR "Monday", "Tuesday" for days
    watchTime: number; // Total minutes watched
    users: number; // Unique users active
    avgSessionTime: number; // Average session duration
}

/**
 * Device/Platform distribution
 * Used for: Platform Usage Pie Chart
 */
export interface PlatformAnalytics {
    platform: 'web' | 'android' | 'ios' | 'tv' | 'other';
    label: string;
    users: number;
    sessions: number;
    watchTime: number;
    percentage: number;
    color: string;
}

/**
 * Geographic distribution
 * Used for: Regional Analytics Map/Chart
 */
export interface RegionAnalytics {
    state: string;
    users: number;
    views: number;
    revenue: number;
    topContent: string[]; // Array of content IDs
}

/**
 * Time range selector options
 */
export interface TimeRange {
    label: string;
    value: '7d' | '30d' | '90d' | '1y' | 'all';
    days: number;
}

/**
 * Chart filter options
 */
export interface ChartFilter {
    timeRange: TimeRange['value'];
    contentType?: ContentCategory | 'all';
    region?: string | 'all';
    platform?: PlatformAnalytics['platform'] | 'all';
}

/**
 * Top performing content item
 * Used for: Top Content Leaderboard
 */
export interface TopContentItem {
    id: string;
    title: string;
    type: ContentCategory;
    thumbnail: string;
    views: number;
    watchTime: number;
    rating: number;
    revenue: number;
    trend: 'up' | 'down' | 'stable'; // Growth trend
    trendPercentage: number;
}

/**
 * Real-time dashboard metrics
 * Used for: Live Stats Cards
 */
export interface LiveMetrics {
    activeUsers: number; // Currently watching
    concurrentStreams: number;
    serverLoad: number; // Percentage
    bandwidth: number; // Mbps
    lastUpdated: Timestamp;
}

/**
 * Monthly comparison metrics
 * Used for: Month-over-month growth indicators
 */
export interface MonthlyComparison {
    currentMonth: {
        users: number;
        revenue: number;
        views: number;
        content: number;
    };
    previousMonth: {
        users: number;
        revenue: number;
        views: number;
        content: number;
    };
    changes: {
        usersChange: number; // Percentage
        revenueChange: number;
        viewsChange: number;
        contentChange: number;
    };
}

/**
 * Subscription analytics
 * Used for: Subscription Growth Charts
 */
export interface SubscriptionAnalytics {
    date: string;
    newSubscriptions: number;
    renewals: number;
    cancellations: number;
    netGrowth: number; // new + renewals - cancellations
    mrr: number; // Monthly Recurring Revenue
    churnRate: number; // Percentage
}

/**
 * User retention cohort data
 * Used for: Retention Heatmap
 */
export interface RetentionCohort {
    cohortDate: string; // Sign-up month
    cohortSize: number; // Users in cohort
    retention: {
        month0: number; // Percentage retained in month 0
        month1: number;
        month2: number;
        month3: number;
        month6: number;
        month12: number;
    };
}

/**
 * Aggregated analytics summary
 * Stored in Firestore at: analytics/summary
 */
export interface AnalyticsSummary {
    lastUpdated: Timestamp;
    totalUsers: number;
    totalPremiumUsers: number;
    totalRevenue: number;
    totalViews: number;
    totalWatchTime: number;
    totalDownloads: number;
    engagementRate: number;
    averageRating: number;
    topPerformingContent: TopContentItem[];
    revenueBreakdown: RevenueBreakdown[];
    platformDistribution: PlatformAnalytics[];
}

/**
 * Daily analytics snapshot
 * Stored in Firestore at: analytics/daily/stats/{YYYY-MM-DD}
 */
export interface DailyAnalyticsSnapshot {
    date: string;
    timestamp: Timestamp;
    newUsers: number;
    activeUsers: number;
    revenue: number;
    views: number;
    watchTime: number;
    transactions: number;
    avgRating: number;
    topContent: string[]; // Content IDs
}

/**
 * Monthly analytics snapshot
 * Stored in Firestore at: analytics/monthly/stats/{YYYY-MM}
 */
export interface MonthlyAnalyticsSnapshot {
    month: string; // YYYY-MM
    timestamp: Timestamp;
    users: number;
    newUsers: number;
    premiumUsers: number;
    revenue: number;
    views: number;
    watchTime: number;
    content: number; // Total content count
    subscriptions: number;
    transactions: number;
    avgRating: number;
    topContent: TopContentItem[];
    platformBreakdown: PlatformAnalytics[];
    regionBreakdown: RegionAnalytics[];
}
