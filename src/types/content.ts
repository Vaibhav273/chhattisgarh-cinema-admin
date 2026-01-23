// ═══════════════════════════════════════════════════════════════
// 🎬 CONTENT TYPES (Movies, Series, Short Films, Videos)
// ═══════════════════════════════════════════════════════════════

import type {
    RatingType,
    CastMember,
    CrewMember,
    VideoQuality,
    Subtitle,
    StreamingQuality,
    Award,
    Soundtrack,
    UserRating,
    FestivalScreening,
    ContentCategory,
} from './common';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 BASE CONTENT INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface BaseContent {
    id: string;
    title: string;
    titleHindi?: string;
    description?: string;
    descriptionHindi?: string;
    thumbnail?: string;
    thumbnailUrl?: string;
    posterUrl?: string;
    backdropUrl?: string;
    banner?: string;
    rating?: RatingType;
    ratingCount?: number;
    year?: string | number;
    genre?: string[];
    language?: string;
    languageHindi?: string;
    ageRating?: string;
    maturityRating?: string;
    isFeatured?: boolean;
    isTrending?: boolean;
    isNewRelease?: boolean;
    views?: number;
    likes?: number;
    dislikes?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;

    // Channel Info
    channelId?: string;
    channelName?: string;
    channelAvatar?: string;
    channelVerified?: boolean;
    channelSubscribers?: string | number;

    // Status flags
    isActive?: boolean;
    isPublished?: boolean;
    isPremium?: boolean;

    // SEO fields
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    tags?: string[];
    watchProgress?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 MOVIE INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Movie extends BaseContent {
    category: 'movie' | 'movies';
    duration?: string;
    releaseDate?: string | Date;
    director?: string | string[];
    directorHindi?: string;
    producer?: string;
    producerHindi?: string;
    writer?: string;
    writerHindi?: string;
    musicDirector?: string;
    musicDirectorHindi?: string;
    cast?: CastMember[];
    crew?: CrewMember[];
    trailerUrl?: string;
    videoUrl?: string;
    videoQuality?: VideoQuality[];
    subtitles?: Subtitle[];
    awards?: Award[];
    boxOfficeCollection?: string;
    budget?: string;
    certification?: string;
    studio?: string;
    studioHindi?: string;
    plotSummary?: string;
    plotSummaryHindi?: string;
    trivia?: string[];
    triviaHindi?: string[];
    soundtrack?: Soundtrack[];
    relatedMovies?: string[];
    userRatings?: UserRating[];
    screenshots?: string[];
    posterImages?: string[];
    downloadUrl?: string;
    streamingQuality?: StreamingQuality;
    isDownloadable?: boolean;
    watchCount?: number;
    shareCount?: number;
    bookmarkCount?: number;
    commentsCount?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📺 WEB SERIES INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface WebSeries extends BaseContent {
    category: 'series' | 'webseries';
    totalSeasons?: number;
    totalEpisodes?: number;
    currentSeason?: number;
    status?: 'ongoing' | 'completed' | 'upcoming';
    releaseDate?: string | Date;
    lastAirDate?: string;
    nextEpisodeDate?: string;
    director?: string[];
    directorHindi?: string[];
    producer?: string;
    producerHindi?: string;
    creator?: string;
    creatorHindi?: string;
    writer?: string[];
    writerHindi?: string[];
    cast?: CastMember[];
    crew?: CrewMember[];
    seasons?: Season[];
    trailerUrl?: string;
    teaserUrl?: string;
    awards?: Award[];
    plotSummary?: string;
    plotSummaryHindi?: string;
    network?: string;
    networkHindi?: string;
    studio?: string;
    studioHindi?: string;
    episodeDuration?: string;
    relatedSeries?: string[];
    userRatings?: UserRating[];
    screenshots?: string[];
    posterImages?: string[];
    watchCount?: number;
    shareCount?: number;
    bookmarkCount?: number;
    commentsCount?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📺 SEASON INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Season {
    id: string;
    seasonNumber: number;
    title: string;
    titleHindi?: string;
    description?: string;
    descriptionHindi?: string;
    thumbnail?: string;
    posterUrl?: string;
    totalEpisodes: number;
    releaseDate: string;
    rating?: number;
    episodes?: Episode[];
    year: string;
    trailerUrl?: string;
    isActive?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📹 EPISODE INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Episode {
    id: string;
    episodeNumber: number;
    seasonNumber: number;
    title: string;
    titleHindi?: string;
    description: string;
    descriptionHindi?: string;
    thumbnail: string;
    duration: string;
    releaseDate: string;
    videoUrl: string;
    videoQuality?: VideoQuality[];
    subtitles?: Subtitle[];
    rating?: number;
    views?: number;
    likes?: number;
    director?: string;
    directorHindi?: string;
    writer?: string;
    writerHindi?: string;
    guestStars?: CastMember[];
    nextEpisodeId?: string;
    previousEpisodeId?: string;
    isPremium?: boolean;
    isDownloadable?: boolean;
    screenshots?: string[];
    isActive?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎞️ SHORT FILM INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ShortFilm extends BaseContent {
    category: 'short-film' | 'shortfilms';
    duration?: string;
    releaseDate?: string | Date;
    director?: string;
    directorHindi?: string;
    producer?: string;
    producerHindi?: string;
    writer?: string;
    writerHindi?: string;
    cast?: CastMember[];
    crew?: CrewMember[];
    videoUrl?: string;
    videoQuality?: VideoQuality[];
    subtitles?: Subtitle[];
    awards?: Award[];
    festivalScreenings?: FestivalScreening[];
    plotSummary?: string;
    plotSummaryHindi?: string;
    productionHouse?: string;
    productionHouseHindi?: string;
    relatedShortFilms?: string[];
    userRatings?: UserRating[];
    screenshots?: string[];
    posterImages?: string[];
    isDownloadable?: boolean;
    watchCount?: number;
    shareCount?: number;
    bookmarkCount?: number;
    filmmakerNotes?: string;
    filmmakerNotesHindi?: string;
    commentsCount?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📹 VIDEO INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Video extends BaseContent {
    category: 'video';
    type: 'documentary' | 'music-video' | 'interview' | 'behind-scenes' | 'trailer' | 'teaser' | 'other';
    duration: string;
    releaseDate: string;
    creator: string;
    creatorHindi?: string;
    videoUrl: string;
    videoQuality?: VideoQuality[];
    subtitles?: Subtitle[];
    relatedTo?: string;
    relatedToType?: 'movie' | 'series' | 'short-film';
    tags?: string[];
    isDownloadable?: boolean;
    watchCount?: number;
    shareCount?: number;
    bookmarkCount?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 UNION TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type UniversalContent = Movie | WebSeries | ShortFilm;
export type Content = Movie | WebSeries | ShortFilm | Video;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 CONTINUE WATCHING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ContinueWatchingItem {
    id: string;
    title: string;
    titleHindi?: string;
    thumbnail?: string;
    posterUrl?: string;
    thumbnailUrl?: string;
    backdropUrl?: string;
    category: string;
    watchProgress?: number;
    timestamp?: Date | string;
    isPremium?: boolean;
    rating?: RatingType;
    genre?: string[];
    views?: number;
    year?: string | number;
    duration?: string;
    language?: string;
    cast?: Array<{ name: string; role?: string }>;
    director?: string | string[];
    channelName?: string;
    channelId?: string;
    releaseDate?: string | Date;
    videoUrl?: string;
    [key: string]: any;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 WATCH PROGRESS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface WatchProgress {
    contentId: string;
    contentType: 'movie' | 'series' | 'short-film';
    contentTitle: string;
    contentTitleHindi?: string;
    contentThumbnail: string;
    currentTime: number;
    duration: number;
    progress: number;
    completed: boolean;
    episodeId?: string;
    seasonNumber?: number;
    episodeNumber?: number;
    episodeTitle?: string;
    watchedAt: any;
    lastWatchedAt: any;
    channelId?: string;
    channelName?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 PLAYLIST
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Playlist {
    id: string;
    userId: string;
    title: string;
    titleHindi?: string;
    description?: string;
    descriptionHindi?: string;
    thumbnail?: string;
    privacy: 'public' | 'private' | 'unlisted';
    videosCount: number;
    createdAt: string;
    updatedAt: string;
    videos?: PlaylistVideo[];
}

export interface PlaylistVideo {
    id: string;
    contentId: string;
    contentType: ContentCategory;
    contentTitle: string;
    contentTitleHindi?: string;
    contentThumbnail: string;
    addedAt: string;
    position: number;
    duration?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 MY LIST
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type MyListItemType = 'movie' | 'series' | 'short-film';

export interface MyListItem {
    id: string;
    type: MyListItemType;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 HELPER TYPES FOR COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface VideoContent {
    id: string;
    title: string;
    titleHindi?: string;
    description?: string;
    descriptionHindi?: string;
    thumbnail?: string;
    thumbnailUrl?: string;
    posterUrl?: string;
    backdropUrl?: string;
    category: 'movie' | 'series' | 'short-film';
    videoUrl?: string;
    duration?: number | string;
    views?: number | string;
    rating?: number | { average: number; count?: number };
    releaseDate?: string;
    year?: string;
    director?: string;
    genre?: string[];
    isPremium?: boolean;
    cast?: string[];
    language?: string;
    likes?: number;
    dislikes?: number;
    channelName?: string;
    channelAvatar?: string;
    channelId?: string;
    channelVerified?: boolean;
    channelSubscribers?: string;
}
