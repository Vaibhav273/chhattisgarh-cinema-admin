// ═══════════════════════════════════════════════════════════════
// 🔔 NOTIFICATION TYPES
// ═══════════════════════════════════════════════════════════════

import type { Timestamp } from 'firebase/firestore';

export type NotificationType =
    | 'new_content'
    | 'subscription'
    | 'payment'
    | 'promotion'
    | 'system'
    | 'content_update'
    | 'event'
    | 'reminder'
    | 'announcement';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationStatus = 'sent' | 'delivered' | 'read' | 'failed';

export type NotificationTarget = 'all' | 'premium' | 'free' | 'custom' | 'individual';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    status: NotificationStatus;

    // Targeting
    target: NotificationTarget;
    targetUsers?: string[]; // User IDs for custom targeting
    userId?: string; // For individual notifications

    // Content
    imageUrl?: string;
    thumbnailUrl?: string;
    actionUrl?: string;
    actionLabel?: string;

    // Metadata
    contentId?: string;
    contentType?: 'movie' | 'series' | 'short-film' | 'event';

    // Timestamps
    createdAt: Timestamp | Date;
    scheduledFor?: Timestamp | Date;
    sentAt?: Timestamp | Date;
    deliveredAt?: Timestamp | Date;
    readAt?: Timestamp | Date;

    // Stats
    sentCount?: number;
    deliveredCount?: number;
    readCount?: number;
    clickCount?: number;

    // Settings
    isRead?: boolean;
    isSilent?: boolean;
    isArchived?: boolean;

    // Created by
    createdBy?: string;
    createdByName?: string;
}

export interface NotificationTemplate {
    id: string;
    name: string;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    imageUrl?: string;
    actionUrl?: string;
    actionLabel?: string;
    variables?: string[]; // e.g., ['{{userName}}', '{{contentTitle}}']
    isActive: boolean;
    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
    usageCount: number;
}

export interface NotificationPreferences {
    userId: string;
    enablePushNotifications: boolean;
    enableEmailNotifications: boolean;
    enableSMSNotifications: boolean;

    // Types
    newContent: boolean;
    subscription: boolean;
    payment: boolean;
    promotion: boolean;
    system: boolean;
    contentUpdate: boolean;
    event: boolean;
    reminder: boolean;
    announcement: boolean;

    // Schedule
    quietHoursEnabled: boolean;
    quietHoursStart?: string; // HH:MM
    quietHoursEnd?: string; // HH:MM

    updatedAt: Timestamp | Date;
}

export interface NotificationStats {
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalClicked: number;
    deliveryRate: number;
    readRate: number;
    clickRate: number;

    byType: Record<NotificationType, number>;
    byPriority: Record<NotificationPriority, number>;
    byStatus: Record<NotificationStatus, number>;

    last24Hours: number;
    last7Days: number;
    last30Days: number;
}

export interface UserNotification {
    id: string;
    notificationId: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    imageUrl?: string;
    actionUrl?: string;
    actionLabel?: string;
    isRead: boolean;
    readAt?: Timestamp | Date;
    createdAt: Timestamp | Date;
}