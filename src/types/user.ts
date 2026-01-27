// ═══════════════════════════════════════════════════════════════
// 👤 USER TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

import type { PaymentMethod, SocialMedia } from './common';
import type { UserRole } from './roles';

// ═══════════════════════════════════════════════════════════════
// 👤 USER INTERFACE (MAIN)
// ═══════════════════════════════════════════════════════════════

export interface User {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔑 CORE IDENTITY
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    uid: string;
    email: string;
    phoneNumber?: string | null;
    displayName: string;
    photoURL?: string | null;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎭 ROLE & PERMISSIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    role: UserRole;  // ✅ Updated to use UserRole type

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💰 SUBSCRIPTION INFO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    currentPlanId: string;        // "free", "basic", "premium", "ultra"
    isPremium: boolean;           // Quick check for premium features

    subscriptionPlanId?: string;  // Detailed plan ID
    subscriptionStatus?: 'active' | 'expired' | 'cancelled' | 'trial' | 'paused';
    subscriptionStartDate?: string | null;
    subscriptionEndDate?: string | null;

    subscription?: {
        planId: string;
        planName: string;
        status: 'active' | 'expired' | 'cancelled' | 'trial' | 'paused';
        startDate: string;
        endDate: string;
        autoRenew: boolean;
        billingCycle?: 'monthly' | 'annual';
        nextBillingDate?: string;
        cancelledAt?: string;
        pausedAt?: string;
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👤 USER PREFERENCES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    preferences: {
        language: string;                    // 'en' | 'hi'
        contentTypes: string[];              // ['movies', 'series', 'short-films']
        autoPlay: boolean;
        notificationsEnabled: boolean;
        downloadQuality?: '480p' | '720p' | '1080p';
        streamingQuality?: 'auto' | '480p' | '720p' | '1080p' | '4K';
        subtitlesEnabled?: boolean;
        subtitleLanguage?: string;
        audioLanguage?: string;
        parentalControlsEnabled?: boolean;
        maturityRating?: string;             // 'U', 'U/A', 'A'
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📱 DEVICE MANAGEMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    devices?: UserDevice[];
    maxDevices?: number;
    currentDeviceCount?: number;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👥 PROFILE MANAGEMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    profiles?: string[];           // Array of profile IDs
    maxProfiles?: number;
    currentProfileId?: string;     // Active profile

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎬 CREATOR SPECIFIC (for role: 'creator')
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    creatorProfile?: {
        channelId: string;
        channelName: string;
        channelNameHindi?: string;
        verified: boolean;
        totalUploads: number;
        totalViews: number;
        totalRevenue: number;
        subscriberCount: number;
        joinedDate: string;
        bio?: string;
        bioHindi?: string;
        socialLinks?: SocialMedia;
        bankDetails?: {
            accountNumber?: string;
            ifscCode?: string;
            accountHolderName?: string;
            panNumber?: string;
            gstNumber?: string;
        };
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 USER STATS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    stats?: {
        totalWatchTime: number;        // in minutes
        totalViews: number;
        totalLikes: number;
        totalComments: number;
        favoriteGenres: string[];
        favoriteLanguages: string[];
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔐 SECURITY & STATUS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    status?: 'active' | 'suspended' | 'banned' | 'pending';
    emailVerified?: boolean;
    phoneVerified?: boolean;
    kycVerified?: boolean;           // For creators
    twoFactorEnabled?: boolean;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📅 TIMESTAMPS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createdAt: any;              // serverTimestamp()
    updatedAt?: any;             // serverTimestamp()
    lastLogin?: any;             // serverTimestamp()
    lastActive?: any;            // serverTimestamp()

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎟️ REFERRAL & REWARDS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    referralCode?: string;
    referredBy?: string;
    rewardPoints?: number;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚫 MODERATION (for banned/suspended users)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    moderation?: {
        bannedAt?: string;
        bannedBy?: string;          // Admin UID
        banReason?: string;
        banDuration?: number;        // in days, 0 = permanent
        suspendedAt?: string;
        suspendedUntil?: string;
        warnings?: number;
        strikes?: number;
    };
}

// ═══════════════════════════════════════════════════════════════
// 📱 USER DEVICE INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface UserDevice {
    deviceId: string;
    deviceName: string;
    deviceType: 'web' | 'mobile' | 'tv' | 'tablet';
    os: string;                      // 'Windows', 'Android', 'iOS', etc.
    browser?: string;
    appVersion?: string;
    ipAddress?: string;
    lastUsed: string;
    isActive: boolean;
    registeredAt: string;
    location?: {
        city?: string;
        state?: string;
        country?: string;
    };
}

// ═══════════════════════════════════════════════════════════════
// 👥 PROFILE INTERFACE (Netflix-style profiles)
// ═══════════════════════════════════════════════════════════════

export interface Profile {
    id: string;
    userId: string;              // Parent user ID
    name: string;
    avatar: string;
    password?: string;           // Optional PIN for profile
    isKids: boolean;
    isPremium: boolean;
    isDefault: boolean;
    isProtected: boolean;        // Requires PIN/password
    ageRestriction?: number;     // Max age rating allowed
    createdAt: any;
    updatedAt?: any;
    preferences?: {
        genres?: string[];
        language?: string;
        autoPlay?: boolean;
        maturityRating?: string;
    };
    watchHistory?: string[];     // Content IDs
    favorites?: string[];        // Content IDs
    continueWatching?: string[]; // Content IDs
}

// ═══════════════════════════════════════════════════════════════
// 👨‍💼 ADMIN USER INTERFACE (for admins collection)
// ═══════════════════════════════════════════════════════════════

export interface AdminUser {
    uid: string;
    email: string;
    name: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;  // Only admin roles: content_manager, moderator, finance, analyst, tech_admin, super_admin

    // Admin specific
    department?: string;
    permissions?: string[];          // Custom additional permissions
    assignedBy?: string;             // UID of admin who assigned this role
    assignedAt?: string;

    // Contact
    phone?: string;
    emergencyContact?: string;

    // Status
    status: 'active' | 'inactive' | 'suspended';
    isActive: boolean;

    // Access control
    lastLogin?: any;
    lastActive?: any;
    loginAttempts?: number;
    lockedUntil?: string;

    // Audit
    activityLogs?: AdminActivityLog[];

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// 📋 ADMIN ACTIVITY LOG
// ═══════════════════════════════════════════════════════════════

export interface AdminActivityLog {
    id: string;
    adminId: string;
    adminName: string;
    action: string;                  // 'created_content', 'deleted_user', 'approved_content', etc.
    actionType: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'ban' | 'unban';
    targetType: 'user' | 'content' | 'comment' | 'subscription' | 'settings';
    targetId: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: any;
}

// ═══════════════════════════════════════════════════════════════
// 🔐 USER CONTEXT (for React Context)
// ═══════════════════════════════════════════════════════════════

export interface UserContext {
    user: User | null;
    profile: Profile | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isContentManager: boolean;
    isModerator: boolean;
    isCreator: boolean;
    isPremium: boolean;
    canAccessAdminPanel: boolean;
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
    loading: boolean;
}

// ═══════════════════════════════════════════════════════════════
// 💳 SUBSCRIPTION & PAYMENT TYPES
// ═══════════════════════════════════════════════════════════════

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

export interface Invoice {
    id: string;
    invoiceNumber: string;
    userId: string;
    planName: string;
    amount: number;
    billingCycle: 'monthly' | 'annual';
    issueDate: string;
    dueDate: string;
    paidDate?: string;
    status: 'pending' | 'paid' | 'failed';
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
    billingCycle: 'monthly' | 'annual';
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

// ═══════════════════════════════════════════════════════════════
// 📊 USER STATISTICS
// ═══════════════════════════════════════════════════════════════

export interface UserStats {
    userId: string;
    totalWatchTime: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalDownloads: number;
    favoriteGenres: string[];
    favoriteLanguages: string[];
    mostWatchedContent: string[];
    lastUpdated: any;
}

// ═══════════════════════════════════════════════════════════════
// 🎯 WATCH HISTORY
// ═══════════════════════════════════════════════════════════════

export interface WatchHistory {
    id: string;
    userId: string;
    profileId?: string;
    contentId: string;
    contentType: 'movie' | 'series' | 'short-film';
    contentTitle: string;
    contentTitleHindi?: string;
    contentThumbnail?: string;
    watchedAt: any;
    progress: number;
    duration: number;
    completed: boolean;
    episodeId?: string;
    seasonNumber?: number;
    episodeNumber?: number;
    episodeTitle?: string;
}


export interface Transaction {
    id: string;
    transactionId: string;
    userId: string;
    userName: string;
    userEmail: string;
    type: "subscription" | "event_booking" | "refund" | "payout";
    amount: number;
    currency: string;
    status: "success" | "pending" | "failed" | "refunded";
    paymentMethod: {
        type: "card" | "upi" | "netbanking" | "wallet";
        last4?: string;
        upiId?: string;
        bank?: string;
    };
    gatewayTransactionId?: string;
    gatewayName?: string;
    description: string;
    metadata?: {
        subscriptionPlan?: string;
        eventId?: string;
        eventName?: string;
        deviceType?: string;
        [key: string]: any;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Payout {
    id: string;
    payoutId: string;
    creatorId: string;
    creatorName: string;
    creatorEmail: string;
    amount: number;
    currency: string;
    period: string; // e.g., "Jan 2024"
    periodStartDate: string;
    periodEndDate: string;
    status: "pending" | "approved" | "processing" | "paid" | "rejected";
    paymentMethod?: {
        type: "bank_transfer" | "upi" | "paypal";
        accountNumber?: string;
        ifscCode?: string;
        upiId?: string;
        paypalEmail?: string;
    };
    earnings: {
        subscriptionRevenue: number;
        eventRevenue: number;
        totalEarnings: number;
        platformFee: number;
        netPayout: number;
    };
    transactionId?: string;
    processedBy?: string;
    processedAt?: string;
    rejectionReason?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RevenueStats {
    totalRevenue: number;
    subscriptionRevenue: number;
    eventRevenue: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    activeSubscribers: number;
    totalBookings: number;
    averageOrderValue: number;
}

export interface MonthlyRevenue {
    month: string;
    year: number;
    subscriptions: number;
    events: number;
    total: number;
    growth: number;
}

export interface TaxInfo {
    gstCollected: number;
    tdsDeducted: number;
    platformFee: number;
    netPayable: number;
}

export interface AnalyticsStats {
    totalUsers: number;
    totalViews: number;
    watchHours: number;
    engagementRate: number;
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    premiumUsers: number;
    freeUsers: number;
    newUsersThisMonth: number;
    userGrowth: number;
    viewsGrowth: number;
    watchTimeGrowth: number;
}
export interface TopContent {
    id: string;
    title: string;
    type: string;
    views: number;
    likes: number;
    watchTime: number;
}

export interface DeviceStats {
    mobile: number;
    web: number;
    tv: number;
}

export interface ContentItem {
    id: string;
    title: string;
    type: "Movie" | "Series" | "Short Film";
    views: number;
    watchTime: number; // in hours
    completionRate: number;
    rating: number;
    likes: number;
    comments: number;
    shares: number;
    genre: string;
    language: string;
    publishedDate: string;
}

export interface ContentStats {
    totalContent?: number;
    totalViews?: number;
    totalWatchTime?: number;
    averageCompletionRate?: number;
    averageRating?: number;
    totalLikes?: number;
    totalComments?: number;
    totalShares?: number;
    moviesCount?: number;
    seriesCount?: number;
    shortFilmsCount?: number;
}

export interface GenreStats {
    genre: string;
    count: number;
    views: number;
    percentage: number;
}

export interface LanguageStats {
    language: string;
    count: number;
    views: number;
    percentage: number;
}

export interface UserStatsAnalytics {
    totalUsers: number;
    newUsersThisMonth: number;
    churnedUsers: number;
    activeSessions: number;
    averageSessionTime: number;
    premiumUsers: number;
    freeUsers: number;
    monthlyActiveUsers: number;
    weeklyActiveUsers: number;
    dailyActiveUsers: number;
    newUserGrowth: number;
    churnRate: number;
    sessionTimeGrowth: number;
}

export interface DeviceUsage {
    mobile: number;
    desktop: number;
    tv: number;
    mobilePercentage: number;
    desktopPercentage: number;
    tvPercentage: number;
}

export interface ActivityTime {
    timeSlot: string;
    userCount: number;
    percentage: number;
}

export interface RetentionData {
    day: string;
    percentage: number;
    userCount: number;
}

export interface DemographicData {
    ageGroup: string;
    count: number;
    percentage: number;
}

export interface LocationData {
    location: string;
    count: number;
    percentage: number;
}