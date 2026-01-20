// ═══════════════════════════════════════════════════════════════
// 🎬 RATING TYPES (UNIFIED)
// ═══════════════════════════════════════════════════════════════
export type RatingObject = { average: number; count?: number };
export type RatingType = number | RatingObject | null | undefined;

// ═══════════════════════════════════════════════════════════════
// 🎬 BASE CONTENT INTERFACE (FLEXIBLE)
// ═══════════════════════════════════════════════════════════════
export interface BaseContent {
    id: string
    title: string
    titleHindi?: string                     // ✅ Optional
    description?: string                    // ✅ Optional
    descriptionHindi?: string               // ✅ Optional
    thumbnail?: string
    thumbnailUrl?: string
    posterUrl?: string
    backdropUrl?: string
    banner?: string
    rating?: RatingType                     // ✅ Use RatingType (not number)
    ratingCount?: number
    year?: string | number                  // ✅ Allow number too
    genre?: string[]                        // ✅ Optional
    language?: string                       // ✅ Optional
    languageHindi?: string
    ageRating?: string
    maturityRating?: string;              // ✅ Optional
    isFeatured?: boolean
    isTrending?: boolean
    isNewRelease?: boolean
    views?: number                          // ✅ Optional
    likes?: number                          // ✅ Optional
    dislikes?: number
    createdAt?: string | Date               // ✅ Allow Date
    updatedAt?: string | Date               // ✅ Allow Date

    // Channel Info
    channelId?: string
    channelName?: string
    channelAvatar?: string
    channelVerified?: boolean
    channelSubscribers?: string | number    // ✅ Allow number

    // Status flags
    isActive?: boolean
    isPublished?: boolean
    isPremium?: boolean

    // SEO fields
    slug?: string
    metaTitle?: string
    metaDescription?: string
    tags?: string[]
    watchProgress?: number;
}
export interface ContinueWatchingItem {
    id: string
    title: string
    titleHindi?: string
    thumbnail?: string
    posterUrl?: string
    thumbnailUrl?: string
    backdropUrl?: string
    category: string                        // ✅ Required for routing
    watchProgress?: number
    timestamp?: Date | string
    isPremium?: boolean
    rating?: RatingType                     // ✅ Consistent with BaseContent
    genre?: string[]
    views?: number
    year?: string | number
    duration?: string
    language?: string
    cast?: Array<{ name: string; role?: string }>
    director?: string | string[]
    channelName?: string
    channelId?: string
    releaseDate?: string | Date
    videoUrl?: string
    [key: string]: any                      // ✅ Allow extra props
}

// ============================================
// UNIVERSAL CONTENT TYPE
// ============================================
export type UniversalContent = Movie | WebSeries | ShortFilm;

// ═══════════════════════════════════════════════════════════════
// 🎬 MOVIE INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface Movie extends BaseContent {
    category: 'movie' | 'movies'            // ✅ Allow both
    duration?: string                       // ✅ Optional (might be missing)
    releaseDate?: string | Date             // ✅ Optional + allow Date
    director?: string | string[]            // ✅ Optional + allow array
    directorHindi?: string
    producer?: string
    producerHindi?: string
    writer?: string
    writerHindi?: string
    musicDirector?: string
    musicDirectorHindi?: string
    cast?: CastMember[]                     // ✅ Optional
    crew?: CrewMember[]
    trailerUrl?: string
    videoUrl?: string                       // ✅ Optional (might not have yet)
    videoQuality?: VideoQuality[]
    subtitles?: Subtitle[]
    awards?: Award[]
    boxOfficeCollection?: string
    budget?: string
    certification?: string
    studio?: string
    studioHindi?: string
    plotSummary?: string
    plotSummaryHindi?: string
    trivia?: string[]
    triviaHindi?: string[]
    soundtrack?: Soundtrack[]
    relatedMovies?: string[]
    userRatings?: UserRating[]
    screenshots?: string[]
    posterImages?: string[]
    downloadUrl?: string
    streamingQuality?: StreamingQuality
    isDownloadable?: boolean
    watchCount?: number
    shareCount?: number
    bookmarkCount?: number
    commentsCount?: number
}

// ═══════════════════════════════════════════════════════════════
// 📺 WEB SERIES INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface WebSeries extends BaseContent {
    category: 'series' | 'webseries'        // ✅ Allow both
    totalSeasons?: number                   // ✅ Optional
    totalEpisodes?: number                  // ✅ Optional
    currentSeason?: number
    status?: 'ongoing' | 'completed' | 'upcoming'  // ✅ Optional
    releaseDate?: string | Date
    lastAirDate?: string
    nextEpisodeDate?: string
    director?: string[]                     // ✅ Optional
    directorHindi?: string[]
    producer?: string
    producerHindi?: string
    creator?: string                        // ✅ Optional
    creatorHindi?: string
    writer?: string[]
    writerHindi?: string[]
    cast?: CastMember[]                     // ✅ Optional
    crew?: CrewMember[]
    seasons?: Season[]
    trailerUrl?: string
    teaserUrl?: string
    awards?: Award[]
    plotSummary?: string
    plotSummaryHindi?: string
    network?: string
    networkHindi?: string
    studio?: string
    studioHindi?: string
    episodeDuration?: string
    relatedSeries?: string[]
    userRatings?: UserRating[]
    screenshots?: string[]
    posterImages?: string[]
    watchCount?: number
    shareCount?: number
    bookmarkCount?: number
    commentsCount?: number
}

// ═══════════════════════════════════════════════════════════════
// 📺 SEASON INTERFACE (for Web Series)
// ═══════════════════════════════════════════════════════════════

export interface Season {
    id: string
    seasonNumber: number
    title: string
    titleHindi?: string
    description?: string
    descriptionHindi?: string
    thumbnail?: string
    posterUrl?: string
    totalEpisodes: number
    releaseDate: string
    rating?: number
    episodes?: Episode[]
    year: string
    trailerUrl?: string
    isActive?: boolean
}

// ═══════════════════════════════════════════════════════════════
// 📹 EPISODE INTERFACE (for Web Series)
// ═══════════════════════════════════════════════════════════════

export interface Episode {
    id: string
    episodeNumber: number
    seasonNumber: number
    title: string
    titleHindi?: string
    description: string
    descriptionHindi?: string
    thumbnail: string
    duration: string
    releaseDate: string
    videoUrl: string
    videoQuality?: VideoQuality[]
    subtitles?: Subtitle[]
    rating?: number
    views?: number
    likes?: number
    director?: string
    directorHindi?: string
    writer?: string
    writerHindi?: string
    guestStars?: CastMember[]
    nextEpisodeId?: string
    previousEpisodeId?: string
    isPremium?: boolean
    isDownloadable?: boolean
    screenshots?: string[]
    isActive?: boolean
}

// ═══════════════════════════════════════════════════════════════
// 🎞️ SHORT FILM INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface ShortFilm extends BaseContent {
    category: 'short-film' | 'shortfilms'   // ✅ Allow both
    duration?: string                       // ✅ Optional
    releaseDate?: string | Date
    director?: string                       // ✅ Optional
    directorHindi?: string
    producer?: string
    producerHindi?: string
    writer?: string
    writerHindi?: string
    cast?: CastMember[]                     // ✅ Optional
    crew?: CrewMember[]
    videoUrl?: string                       // ✅ Optional
    videoQuality?: VideoQuality[]
    subtitles?: Subtitle[]
    awards?: Award[]
    festivalScreenings?: FestivalScreening[]
    plotSummary?: string
    plotSummaryHindi?: string
    productionHouse?: string
    productionHouseHindi?: string
    relatedShortFilms?: string[]
    userRatings?: UserRating[]
    screenshots?: string[]
    posterImages?: string[]
    isDownloadable?: boolean
    watchCount?: number
    shareCount?: number
    bookmarkCount?: number
    filmmakerNotes?: string
    filmmakerNotesHindi?: string
    commentsCount?: number
}

// ═══════════════════════════════════════════════════════════════
// 📹 VIDEO INTERFACE (Generic Video Content)
// ═══════════════════════════════════════════════════════════════

export interface Video extends BaseContent {
    category: 'video'
    type: 'documentary' | 'music-video' | 'interview' | 'behind-scenes' | 'trailer' | 'teaser' | 'other'
    duration: string
    releaseDate: string
    creator: string
    creatorHindi?: string
    videoUrl: string
    videoQuality?: VideoQuality[]
    subtitles?: Subtitle[]
    relatedTo?: string
    relatedToType?: 'movie' | 'series' | 'short-film'
    tags?: string[]
    isDownloadable?: boolean
    watchCount?: number
    shareCount?: number
    bookmarkCount?: number
}

// ═══════════════════════════════════════════════════════════════
// 📺 CHANNEL INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface Channel {
    id: string
    name: string
    nameHindi?: string
    slug?: string
    avatar: string
    banner?: string
    logo?: string
    description?: string
    descriptionHindi?: string
    verified: boolean
    officialChannel?: boolean
    subscribers: number
    videosCount: number
    totalViews: number
    socialLinks?: {
        facebook?: string
        twitter?: string
        instagram?: string
        youtube?: string
        website?: string
    }
    email?: string
    phone?: string
    isActive?: boolean
    isFeatured?: boolean
    createdAt: string
    updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// 💬 COMMENT INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface Comment {
    id: string
    userId: string
    userName: string
    userAvatar?: string
    text: string
    timestamp: any
    likes: number
    likedBy?: string[]
    replies?: number
    edited?: boolean
    editedAt?: any
    reported?: boolean
    parentCommentId?: string
}

// ═══════════════════════════════════════════════════════════════
// 📊 WATCH PROGRESS INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface WatchProgress {
    contentId: string
    contentType: 'movie' | 'series' | 'short-film'
    contentTitle: string
    contentTitleHindi?: string
    contentThumbnail: string
    currentTime: number
    duration: number
    progress: number
    completed: boolean
    episodeId?: string
    seasonNumber?: number
    episodeNumber?: number
    episodeTitle?: string
    watchedAt: any
    lastWatchedAt: any
    channelId?: string
    channelName?: string
}

// ═══════════════════════════════════════════════════════════════
// 🎭 SUPPORTING INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface CastMember {
    id?: string
    name: string
    nameHindi?: string
    role: string
    roleHindi?: string
    characterName?: string
    characterNameHindi?: string
    profileImage?: string
    bio?: string
    bioHindi?: string
    socialMedia?: SocialMedia
}

export interface CrewMember {
    id?: string
    name: string
    nameHindi?: string
    role: string
    roleHindi?: string
    department?: string
    profileImage?: string
}

export interface Subtitle {
    language: string
    languageCode: string
    url: string
    isDefault?: boolean
}

export interface VideoQuality {
    quality: 'auto' | '360p' | '480p' | '720p' | '1080p' | '4K'
    url: string
    size?: string
    bitrate?: string
}

export interface StreamingQuality {
    auto: string
    low: string
    medium: string
    high: string
    fullHD: string
    ultraHD?: string
}

export interface Award {
    name: string
    nameHindi?: string
    category: string
    categoryHindi?: string
    year: string
    won: boolean
    festival?: string
    festivalHindi?: string
}

export interface Soundtrack {
    id: string
    title: string
    titleHindi?: string
    artist: string
    artistHindi?: string
    duration: string
    audioUrl?: string
    lyrics?: string
    lyricsHindi?: string
}

export interface UserRating {
    userId: string
    userName?: string
    rating: number
    review?: string
    reviewHindi?: string
    date: string
    helpful?: number
    verified?: boolean
}

export interface FestivalScreening {
    festivalName: string
    festivalNameHindi?: string
    location: string
    locationHindi?: string
    date: string
    award?: string
    awardHindi?: string
}

export interface SocialMedia {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
    website?: string
}

// ═══════════════════════════════════════════════════════════════
// 🎭 EVENT INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface Event {
    id: string
    title: string
    titleHindi: string
    description: string
    descriptionHindi: string
    image: string
    bannerImage?: string
    galleryImages?: string[]
    date: string
    endDate?: string
    time: string
    endTime?: string
    duration: string
    timezone?: string
    venue: string
    venueHindi: string
    venueAddress?: string
    venueAddressHindi?: string
    city: string
    cityHindi?: string
    state: string
    stateHindi?: string
    pincode?: string
    venueMap?: VenueMap
    venueCapacity?: number
    category: EventCategory
    type: EventType
    organizer: string
    organizerHindi?: string
    organizerContact?: string
    organizerEmail?: string
    organizerWebsite?: string
    hosts?: Host[]
    performers?: Performer[]
    speakers?: Speaker[]
    rating?: number
    ratingCount?: number
    totalSeats: number
    bookedSeats: number
    availableSeats: number
    views?: number
    sharesCount?: number
    interestedCount?: number
    ticketTiers: TicketTier[]

    // ADD THIS - backward compatibility
    price?: {
        min: number
        max: number
    }

    bookingStartDate?: string
    bookingEndDate?: string
    isBookingOpen: boolean
    minTicketsPerBooking?: number
    maxTicketsPerBooking?: number
    language: string
    languageHindi?: string
    ageRating: string
    dresscode?: string
    dresscodeHindi?: string
    rules?: string[]
    rulesHindi?: string[]
    amenities?: string[]
    amenitiesHindi?: string[]
    parking?: ParkingInfo
    trailerUrl?: string
    promoVideoUrl?: string
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'postponed'
    isFeatured?: boolean
    isTrending?: boolean
    isNew?: boolean  // ADD THIS
    relatedEvents?: string[]
    relatedMovies?: string[]
    relatedSeries?: string[]
    tags?: string[]  // ADD THIS
    createdAt: string
    updatedAt: string
    highlights?: string[]
    highlightsHindi?: string[]
    faq?: FAQ[]
    sponsors?: Sponsor[]
    mediaPartners?: MediaPartner[]
    totalBookings?: number
    revenue?: number
    hasLiveStreaming?: boolean
    liveStreamUrl?: string
    hasVIPMeetGreet?: boolean
    hasPhotoBooth?: boolean
    hasFoodStalls?: boolean
    hasGiftBags?: boolean
}


export interface TicketTier {
    id: string
    name: string
    nameHindi?: string
    price: number
    currency?: string
    originalPrice?: number
    discount?: number
    available: number
    total: number
    benefits: string[]
    benefitsHindi?: string[]
    color?: string
    icon?: string
    description?: string
    descriptionHindi?: string
    isRecommended?: boolean
    isSoldOut?: boolean
    maxPerBooking?: number
}

export interface VenueMap {
    latitude: number
    longitude: number
    mapUrl?: string
    googleMapsUrl?: string
    embeddedMapUrl?: string
}

export interface ParkingInfo {
    available: boolean
    type?: 'free' | 'paid' | 'valet'
    capacity?: number
    charges?: string
    chargesHindi?: string
    instructions?: string
    instructionsHindi?: string
}

export interface Host {
    id?: string
    name: string
    nameHindi?: string
    role?: string
    profileImage?: string
    bio?: string
    bioHindi?: string
    socialMedia?: SocialMedia
}

export interface Performer {
    id?: string
    name: string
    nameHindi?: string
    type: 'singer' | 'dancer' | 'actor' | 'musician' | 'comedian' | 'other'
    profileImage?: string
    bio?: string
    bioHindi?: string
    performanceTime?: string
    socialMedia?: SocialMedia
}

export interface Speaker {
    id?: string
    name: string
    nameHindi?: string
    title?: string
    titleHindi?: string
    organization?: string
    organizationHindi?: string
    profileImage?: string
    bio?: string
    bioHindi?: string
    topic?: string
    topicHindi?: string
    sessionTime?: string
    socialMedia?: SocialMedia
}

export interface FAQ {
    question: string
    questionHindi?: string
    answer: string
    answerHindi?: string
    category?: string
}

export interface Sponsor {
    id?: string
    name: string
    nameHindi?: string
    logo: string
    website?: string
    tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner'
    description?: string
    descriptionHindi?: string
}

export interface MediaPartner {
    id?: string
    name: string
    logo: string
    website?: string
    type: 'print' | 'digital' | 'tv' | 'radio' | 'social'
}

// ═══════════════════════════════════════════════════════════════
// 🎯 ENUMS & TYPES
// ═══════════════════════════════════════════════════════════════

export type ContentCategory = 'movie' | 'series' | 'short-film' | 'video'

export type EventCategory =
    | 'film-festival'
    | 'film-premiere'
    | 'award-show'
    | 'concert'
    | 'cultural'
    | 'dance'
    | 'music'
    | 'theater'
    | 'comedy'
    | 'workshop'
    | 'seminar'
    | 'conference'
    | 'meetup'
    | 'screening'
    | 'other'

export type EventType =
    | 'in-person'
    | 'virtual'
    | 'hybrid'

export type VideoType =
    | 'documentary'
    | 'music-video'
    | 'interview'
    | 'behind-scenes'
    | 'trailer'
    | 'teaser'
    | 'promotional'
    | 'educational'
    | 'other'

// ═══════════════════════════════════════════════════════════════
// 🎬 BOOKING & USER INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface Booking {
    id: string
    userId: string
    userName: string
    userEmail: string
    userPhone: string
    eventId: string
    eventTitle: string
    eventDate: string
    eventTime: string
    venue: string
    tickets: BookedTicket[]
    totalTickets: number
    totalAmount: number
    convenienceFee: number
    discount?: number
    finalAmount: number
    paymentMethod: PaymentMethod
    paymentStatus: PaymentStatus
    paymentId?: string
    transactionId?: string
    bookingDate: string
    bookingStatus: BookingStatus
    qrCode?: string
    bookingReference: string
    specialRequests?: string
    cancellationReason?: string
    refundAmount?: number
    refundStatus?: RefundStatus
}

export interface BookedTicket {
    tierId: string
    tierName: string
    quantity: number
    pricePerTicket: number
    totalPrice: number
}
// ═══════════════════════════════════════════════════════════════
// 👤 USER INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface User {
    uid: string;
    email: string;
    phoneNumber?: string | null;
    displayName: string;
    photoURL?: string | null;
    role: string;

    // 🔧 ADD THESE FIELDS from ensureUserAndProfiles
    currentPlanId: string;        // "free", "premium", etc.
    isPremium: boolean;

    // Your existing fields
    subscriptionPlanId?: string;
    subscriptionStatus?: string;  // Keep this if you use it elsewhere
    subscriptionStartDate?: string | null;
    subscriptionEndDate?: string | null;
    preferences: {
        language: string;
        contentTypes: string[];
        autoPlay: boolean;
        notificationsEnabled: boolean;
    };
    createdAt: any;  // serverTimestamp()
    lastLogin?: any; // serverTimestamp()
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    nameHindi: string;
    priceMonthly: number;
    priceYearly: number;
    popular?: boolean;
    color: string;
    gradient: string;
    badge?: string;
    maxDevices: number;
    maxProfiles: number;
    maxScreens: number;
    maxDownloadDevices: number;
    maxDownloadsPerDevice: number;
    videoQuality: ('360p' | '480p' | '720p' | '1080p' | '4K')[];
    features: string[];
    featuresHindi: string[];
    order: number;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
}

export interface WatchHistory {
    contentId: string
    contentType: ContentCategory
    contentTitle: string
    contentTitleHindi?: string
    contentThumbnail?: string
    watchedAt: string
    progress: number
    duration: number
    completed: boolean
    episodeId?: string
    seasonNumber?: number
    episodeNumber?: number
    episodeTitle?: string
}

// ═══════════════════════════════════════════════════════════════
// 🔍 SEARCH & FILTER INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface SearchFilters {
    query?: string
    category?: ContentCategory[]
    genre?: string[]
    year?: string[]
    language?: string[]
    rating?: number
    sortBy?: 'relevance' | 'rating' | 'year' | 'popularity' | 'recent'
    isPremium?: boolean
    isTrending?: boolean
    isNewRelease?: boolean
}

export interface SearchResult {
    id: string
    type: ContentCategory | 'event'
    title: string
    titleHindi: string
    thumbnail: string
    rating?: number
    year?: string
    genre?: string[]
    description: string
    descriptionHindi: string
    date?: string
    venue?: string
    isTrending?: boolean
}

// ═══════════════════════════════════════════════════════════════
// 📊 ANALYTICS INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface ContentAnalytics {
    contentId: string
    contentType: ContentCategory
    totalViews: number
    uniqueViews: number
    totalWatchTime: number
    averageWatchTime: number
    completionRate: number
    likes: number
    dislikes?: number
    shares: number
    bookmarks: number
    comments?: number
    averageRating: number
    totalRatings: number
    viewsByDate: ViewsByDate[]
    viewsByRegion: ViewsByRegion[]
    popularEpisodes?: EpisodeAnalytics[]
}

export interface ViewsByDate {
    date: string
    views: number
    watchTime: number
}

export interface ViewsByRegion {
    region: string
    views: number
    percentage: number
}

export interface EpisodeAnalytics {
    episodeId: string
    episodeNumber: number
    seasonNumber: number
    views: number
    completionRate: number
    averageRating: number
}

// ═══════════════════════════════════════════════════════════════
// 🎬 CONTENT UNION TYPE
// ═══════════════════════════════════════════════════════════════

export type Content = Movie | WebSeries | ShortFilm | Video

// ═══════════════════════════════════════════════════════════════
// 📦 API RESPONSE INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
    timestamp: string
}

export interface PaginatedResponse<T> {
    success: boolean
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
}

// ═══════════════════════════════════════════════════════════════
// 🔔 NOTIFICATION INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface Notification {
    id: string
    userId: string
    type: 'new_video' | 'comment_reply' | 'like' | 'subscription' | 'event' | 'booking' | 'general'
    title: string
    titleHindi?: string
    message: string
    messageHindi?: string
    thumbnail?: string
    link?: string
    read: boolean
    createdAt: string
    contentId?: string
    contentType?: ContentCategory
    eventId?: string
    bookingId?: string
}

// ═══════════════════════════════════════════════════════════════
// 🎨 CATEGORY & GENRE INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface Category {
    id: string
    name: string
    nameHindi: string
    slug: string
    icon?: string
    thumbnail?: string
    description?: string
    descriptionHindi?: string
    isActive: boolean
    order?: number
    contentCount?: number
}

export interface Genre {
    id: string
    name: string
    nameHindi: string
    slug: string
    icon?: string
    color?: string
    isActive: boolean
    contentCount?: number
}

// ═══════════════════════════════════════════════════════════════
// 🎬 BANNER INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface Banner {
    id: string
    title: string
    titleHindi?: string
    contentId?: string
    contentType?: ContentCategory | 'event'
    imageUrl: string
    mobileImageUrl?: string
    link?: string
    externalLink?: string
    isActive: boolean
    priority: number
    startDate?: string
    endDate?: string
    clickCount?: number
}

// ═══════════════════════════════════════════════════════════════
// 📱 PLAYLIST INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface Playlist {
    id: string
    userId: string
    title: string
    titleHindi?: string
    description?: string
    descriptionHindi?: string
    thumbnail?: string
    privacy: 'public' | 'private' | 'unlisted'
    videosCount: number
    createdAt: string
    updatedAt: string
    videos?: PlaylistVideo[]
}

export interface PlaylistVideo {
    id: string
    contentId: string
    contentType: ContentCategory
    contentTitle: string
    contentTitleHindi?: string
    contentThumbnail: string
    addedAt: string
    position: number
    duration?: string
}

// ═══════════════════════════════════════════════════════════════
// 🎯 HELPER TYPES FOR COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════

export interface VideoContent {
    id: string
    title: string
    titleHindi?: string
    description?: string
    descriptionHindi?: string
    thumbnail?: string
    thumbnailUrl?: string
    posterUrl?: string
    backdropUrl?: string
    category: 'movie' | 'series' | 'short-film'
    videoUrl?: string
    duration?: number | string
    views?: number | string
    rating?: number | { average: number; count?: number }
    releaseDate?: string
    year?: string
    director?: string
    genre?: string[]
    isPremium?: boolean
    cast?: string[]
    language?: string
    likes?: number
    dislikes?: number
    channelName?: string
    channelAvatar?: string
    channelId?: string
    channelVerified?: boolean
    channelSubscribers?: string
}

export interface FirestoreTimestamp {
    seconds: number
    nanoseconds: number
    toDate(): Date
    toMillis(): number
}

export interface ContentPageConfig {
    contentType: "movies" | "webseries" | "shortfilm" | "mylist";
    firestoreCollection: string;
    title: string;
    titleHindi: string;
    description: string;
    descriptionHindi: string;
    icon?: React.ReactNode;
    routePrefix: string;
    genres: Array<{ value: string; label: string }>;
}

export type SortType = "popular" | "latest" | "rating" | "title" | "duration" | "az" | "za" | "recent";

export interface Stats {
    total: number;
    premium: number;
    avgRating: string;
    awarded: number;
    totalSeasons?: number;
    totalEpisodes?: number;
}

export interface SearchFilterBarProps {
    config: ContentPageConfig;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    sortBy: SortType;
    setSortBy: (s: SortType) => void;
    filter: string;
    setFilter: (f: string) => void;
    showFilters: boolean;
    setShowFilters: (s: boolean) => void;
    filteredCount: number;
}

export interface GenreButtonProps {
    value: string;
    label: string;
    filter: string;
    setFilter: (f: string) => void;
    icon: React.ReactNode;
}

export interface SubscriptionModalProps {
    show: boolean;
    onClose: () => void;
    navigate: (path: string) => void;
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

export type MyListItemType = "movie" | "series" | "short-film";

export interface MyListItem {
    id: string;
    type: MyListItemType;
}


export interface Profile {
    id: string;
    name: string;
    avatar: string;
    password?: string;
    isKids: boolean;
    isPremium: boolean;
    isDefault: boolean;
    isProtected: boolean;
    createdAt: any;
    preferences?: {
        genres?: string[];
        language?: string[];
    };
}


export interface PricingPlan {
    id: string;
    name: string;
    nameHindi: string;
    icon: React.ReactNode;
    priceMonthly: number;
    priceYearly: number;
    popular?: boolean;
    features: string[];
    featuresHindi: string[];
    color: string;
    gradient: string;
    badge?: string;
    maxProfiles: number;
    maxDevices: number;
    maxScreens: number;
    videoQuality: string[];
    maxDownloadDevices: number;
    maxDownloadsPerDevice: number;
    order: number;
}

export interface PlanLimits {
    id: string;
    name: string;
    maxProfiles: number;
    maxDevices: number;
    maxScreens: number;
    videoQuality: string[];
    maxDownloadDevices: number;
    maxDownloadsPerDevice: number;
}


export type PaymentStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'refunded'

export type BookingStatus =
    | 'confirmed'
    | 'pending'
    | 'cancelled'
    | 'completed'

export type RefundStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'rejected'


export interface PaymentMethod {
    id: string;
    type: | 'upi'
    | 'card'
    | 'netbanking'
    | 'wallet'
    | 'cash';
    last4: string;
    cardBrand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    upiHandle?: string;
    bankName?: string;
    isDefault: boolean;
    createdAt: string;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    planName: string;
    amount: number;
    billingCycle: "monthly" | "annual";
    issueDate: string;
    dueDate: string;
    paidDate?: string;
    status: "pending" | "paid" | "failed";
    paymentMethod: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    downloadUrl?: string;
}

export interface RazorpayPaymentData {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    status: string;
    planId: string;
    planName: string;
    billingCycle: "monthly" | "annual";
    startDate: string;
    endDate: string;
    paidAt: string;
}

export interface AutoRenewalStatus {
    enabled: boolean;
    nextRenewalDate: string;
    paymentMethod: PaymentMethod | null;
    lastRenewalDate?: string;
    renewalAttempts: number;
}