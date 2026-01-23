// ═══════════════════════════════════════════════════════════════
// 🔄 COMMON & SHARED TYPES
// ═══════════════════════════════════════════════════════════════

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⭐ RATING TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type RatingObject = { average: number; count?: number };
export type RatingType = number | RatingObject | string | null | undefined;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎭 CAST & CREW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CastMember {
    id?: string;
    name: string;
    nameHindi?: string;
    role: string;
    roleHindi?: string;
    characterName?: string;
    characterNameHindi?: string;
    profileImage?: string;
    bio?: string;
    bioHindi?: string;
    socialMedia?: SocialMedia;
}

export interface CrewMember {
    id?: string;
    name: string;
    nameHindi?: string;
    role: string;
    roleHindi?: string;
    department?: string;
    profileImage?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 VIDEO QUALITY & STREAMING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Subtitle {
    language: string;
    languageCode: string;
    url: string;
    isDefault?: boolean;
}

export interface VideoQuality {
    quality: 'auto' | '360p' | '480p' | '720p' | '1080p' | '4K';
    url: string;
    size?: string;
    bitrate?: string;
}

export interface StreamingQuality {
    auto: string;
    low: string;
    medium: string;
    high: string;
    fullHD: string;
    ultraHD?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏆 AWARDS & RECOGNITION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Award {
    name: string;
    nameHindi?: string;
    category: string;
    categoryHindi?: string;
    year: string;
    won: boolean;
    festival?: string;
    festivalHindi?: string;
}

export interface FestivalScreening {
    festivalName: string;
    festivalNameHindi?: string;
    location: string;
    locationHindi?: string;
    date: string;
    award?: string;
    awardHindi?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎵 SOUNDTRACK & MUSIC
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Soundtrack {
    id: string;
    title: string;
    titleHindi?: string;
    artist: string;
    artistHindi?: string;
    duration: string;
    audioUrl?: string;
    lyrics?: string;
    lyricsHindi?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💬 USER RATINGS & REVIEWS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface UserRating {
    userId: string;
    userName?: string;
    rating: number;
    review?: string;
    reviewHindi?: string;
    date: string;
    helpful?: number;
    verified?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔗 SOCIAL MEDIA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SocialMedia {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💬 COMMENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    text: string;
    timestamp: any;
    likes: number;
    likedBy?: string[];
    replies?: number;
    edited?: boolean;
    editedAt?: any;
    reported?: boolean;
    parentCommentId?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📺 CHANNEL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Channel {
    id: string;
    name: string;
    nameHindi?: string;
    slug?: string;
    avatar: string;
    banner?: string;
    logo?: string;
    description?: string;
    descriptionHindi?: string;
    verified: boolean;
    officialChannel?: boolean;
    subscribers: number;
    videosCount: number;
    totalViews: number;
    socialLinks?: SocialMedia;
    email?: string;
    phone?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    createdAt: string;
    updatedAt: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📂 CATEGORY & GENRE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Category {
    id: string;
    name: string;
    nameHindi: string;
    slug: string;
    icon?: string;
    thumbnail?: string;
    description?: string;
    descriptionHindi?: string;
    isActive: boolean;
    order?: number;
    contentCount?: number;
}

export interface Genre {
    id: string;
    name: string;
    nameHindi: string;
    slug: string;
    icon?: string;
    color?: string;
    isActive: boolean;
    contentCount?: number;
}

export interface FirestoreGenre {
    id: string;
    name: string;
    nameHindi: string;
    description: string;
    iconKey: string;
    color: string;
    gradientFrom: string;
    gradientTo: string;
    count: number;
    image: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 BANNER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Banner {
    id: string;
    title: string;
    titleHindi?: string;
    contentId?: string;
    contentType?: ContentCategory | 'event';
    imageUrl: string;
    mobileImageUrl?: string;
    link?: string;
    externalLink?: string;
    isActive: boolean;
    priority: number;
    startDate?: string;
    endDate?: string;
    clickCount?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔔 NOTIFICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Notification {
    id: string;
    userId: string;
    type: 'new_video' | 'comment_reply' | 'like' | 'subscription' | 'event' | 'booking' | 'general';
    title: string;
    titleHindi?: string;
    message: string;
    messageHindi?: string;
    thumbnail?: string;
    link?: string;
    read: boolean;
    createdAt: string;
    contentId?: string;
    contentType?: ContentCategory;
    eventId?: string;
    bookingId?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💳 PAYMENT METHOD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PaymentMethod {
    id: string;
    type: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cash';
    last4: string;
    cardBrand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    upiHandle?: string;
    bankName?: string;
    isDefault: boolean;
    createdAt: string;
}

export type PaymentStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'refunded';

export type BookingStatus =
    | 'confirmed'
    | 'pending'
    | 'cancelled'
    | 'completed';

export type RefundStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'rejected';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 ENUMS & TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ContentCategory = 'movie' | 'series' | 'short-film' | 'video';

export type VideoType =
    | 'documentary'
    | 'music-video'
    | 'interview'
    | 'behind-scenes'
    | 'trailer'
    | 'teaser'
    | 'promotional'
    | 'educational'
    | 'other';

export type SortType =
    | 'popular'
    | 'latest'
    | 'rating'
    | 'title'
    | 'duration'
    | 'az'
    | 'za'
    | 'recent';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⏱️ FIRESTORE TIMESTAMP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface FirestoreTimestamp {
    seconds: number;
    nanoseconds: number;
    toDate(): Date;
    toMillis(): number;
}
