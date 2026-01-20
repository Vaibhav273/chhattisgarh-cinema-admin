import type {
    User,
    Movie,
    WebSeries,
    ShortFilm,
    SubscriptionPlan,
    Booking,
    Event,
    Invoice,
    Content
} from '../../types';

// Admin-specific types
export type { User, Movie, WebSeries, ShortFilm, SubscriptionPlan, Booking, Event, Invoice, Content };

export interface AdminStats {
    totalUsers: number;
    activeSubscriptions: number;
    freeUsers: number;
    totalContent: number;
    totalMovies: number;
    totalSeries: number;
    totalShortFilms: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalBookings: number;
    activeEvents: number;
}

export interface PaymentRecord {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    planId: string;
    planName: string;
    amount: number;
    billingCycle: 'monthly' | 'annual';
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: string;
    createdAt: any;
    paidAt?: any;
}
