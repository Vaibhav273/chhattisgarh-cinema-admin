// ═══════════════════════════════════════════════════════════════
// 🌐 API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 API RESPONSE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📑 PAGINATED RESPONSE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 SEARCH RESULT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SearchResult {
    id: string;
    type: 'movie' | 'series' | 'short-film' | 'video' | 'event';
    title: string;
    titleHindi: string;
    thumbnail: string;
    rating?: number;
    year?: string;
    genre?: string[];
    description: string;
    descriptionHindi: string;
    date?: string;
    venue?: string;
    isTrending?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔎 SEARCH FILTERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SearchFilters {
    query?: string;
    category?: ('movie' | 'series' | 'short-film' | 'video')[];
    genre?: string[];
    year?: string[];
    language?: string[];
    rating?: number;
    sortBy?: 'relevance' | 'rating' | 'year' | 'popularity' | 'recent';
    isPremium?: boolean;
    isTrending?: boolean;
    isNewRelease?: boolean;
}
