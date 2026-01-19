import type { Timestamp } from "firebase/firestore";

export interface AdminUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: 'super_admin' | 'content_manager' | 'support';
    createdAt: Date;
}

export interface Content {
    id: string;
    title: string;
    description: string;
    type: 'movie' | 'series' | 'short_film' | 'event';
    genre: string[];
    language: string[];
    thumbnailUrl: string;
    bannerUrl: string;
    videoUrl: string;
    trailerUrl?: string;
    duration: number;
    releaseDate: Date;
    rating: number;
    cast: CastMember[];
    crew: CrewMember[];
    seasons?: Season[];
    views: number;
    likes: number;
    status: 'draft' | 'published' | 'archived';
    isPremium: boolean;
    createdAt: Timestamp | Date | any;
    updatedAt: Timestamp | Date | any;
}

export interface Season {
    seasonNumber: number;
    title: string;
    episodes: Episode[];
}

export interface Episode {
    episodeNumber: number;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
}

export interface CastMember {
    id: string;
    name: string;
    role: string;
    imageUrl: string;
}

export interface CrewMember {
    id: string;
    name: string;
    role: 'director' | 'producer' | 'writer' | 'cinematographer' | 'music_director';
    imageUrl: string;
}

export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    phoneNumber?: string;
    subscription: {
        plan: 'free' | 'monthly' | 'annual';
        status: 'active' | 'expired' | 'cancelled';
        startDate?: Date;
        endDate?: Date;
    };
    profiles: Profile[];
    watchHistory: WatchHistory[];
    myList: string[];
    createdAt: Timestamp | Date | any;
    lastActive: Timestamp | Date | any;
}

export interface Profile {
    id: string;
    name: string;
    avatar: string;
    isKid: boolean;
}

export interface WatchHistory {
    contentId: string;
    progress: number;
    lastWatched: Date;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    duration: 'monthly' | 'annual';
    features: string[];
    razorpayPlanId: string;
    isActive: boolean;
    displayOrder: number;
}

export interface Transaction {
    id: string;
    userId: string;
    userEmail: string;
    amount: number;
    planId: string;
    planName: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
    status: 'success' | 'failed' | 'pending';
    createdAt: Timestamp | Date | any;
}

export interface DashboardStats {
    totalUsers: number;
    activeSubscribers: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalContent: number;
    totalViews: number;
    revenueGrowth: number;
    userGrowth: number;
    subscriberGrowth: number;
    contentGrowth: number;
}

export interface RevenueData {
    month: string;
    revenue: number;
    users: number;
}

export interface ContentStats {
    type: string;
    count: number;
    views: number;
}
