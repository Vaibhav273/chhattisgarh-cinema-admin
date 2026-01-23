// ═══════════════════════════════════════════════════════════════
// 📊 ANALYTICS & STATISTICS TYPES
// ═══════════════════════════════════════════════════════════════

import type { ContentCategory } from './common';

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
