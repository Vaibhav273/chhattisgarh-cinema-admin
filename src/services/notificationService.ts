// ═══════════════════════════════════════════════════════════════
// 🔔 NOTIFICATION SERVICE
// ═══════════════════════════════════════════════════════════════

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Notification, NotificationTemplate } from '../types/notification';
import {
    logNotificationSend,
    logNotificationRead,
    logNotificationDelete,
    logTemplateCreate,
    logTemplateUpdate,
    logTemplateDelete,
    logError
} from '../utils/logger';

// ═══════════════════════════════════════════════════════════════
// 📤 SEND NOTIFICATION
// ═══════════════════════════════════════════════════════════════
export const sendNotification = async (notification: Omit<Notification, 'id'>): Promise<string> => {
    try {
        const notificationData = {
            ...notification,
            createdAt: Timestamp.now(),
            sentAt: Timestamp.now(),
            status: 'sent' as const,
            sentCount: 0,
            deliveredCount: 0,
            readCount: 0,
            clickCount: 0,
        };

        // Add to notifications collection
        const docRef = await addDoc(collection(db, 'notifications'), notificationData);

        // Get target users
        let targetUserIds: string[] = [];

        if (notification.target === 'all') {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            targetUserIds = usersSnapshot.docs.map(doc => doc.id);
        } else if (notification.target === 'premium') {
            const usersQuery = query(collection(db, 'users'), where('isPremium', '==', true));
            const usersSnapshot = await getDocs(usersQuery);
            targetUserIds = usersSnapshot.docs.map(doc => doc.id);
        } else if (notification.target === 'free') {
            const usersQuery = query(collection(db, 'users'), where('isPremium', '==', false));
            const usersSnapshot = await getDocs(usersQuery);
            targetUserIds = usersSnapshot.docs.map(doc => doc.id);
        } else if (notification.target === 'custom' && notification.targetUsers) {
            targetUserIds = notification.targetUsers;
        } else if (notification.target === 'individual' && notification.userId) {
            targetUserIds = [notification.userId];
        }

        // Create user notifications in batch
        const batch = writeBatch(db);
        targetUserIds.forEach(userId => {
            const userNotificationRef = doc(collection(db, 'users', userId, 'notifications'));
            batch.set(userNotificationRef, {
                notificationId: docRef.id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                priority: notification.priority,
                imageUrl: notification.imageUrl,
                actionUrl: notification.actionUrl,
                actionLabel: notification.actionLabel,
                contentId: notification.contentId,
                contentType: notification.contentType,
                isRead: false,
                createdAt: Timestamp.now(),
            });
        });

        await batch.commit();

        // Update sent count
        await updateDoc(doc(db, 'notifications', docRef.id), {
            sentCount: targetUserIds.length,
        });

        // ✅ LOG NOTIFICATION SEND
        await logNotificationSend(
            docRef.id,
            notification.title,
            notification.target,
            targetUserIds.length,
            notification.type,
            notification.priority,
            {
                contentId: notification.contentId,
                contentType: notification.contentType,
            }
        );

        return docRef.id;
    } catch (error) {
        console.error('Error sending notification:', error);

        // ❌ LOG ERROR
        await logError(
            'Notifications',
            error instanceof Error ? error.message : 'Failed to send notification',
            {
                title: notification.title,
                target: notification.target,
                type: notification.type,
                error: error instanceof Error ? error.stack : 'Unknown error',
            }
        );

        throw error;
    }
};

// ═══════════════════════════════════════════════════════════════
// 📥 GET USER NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
export const getUserNotifications = async (userId: string, limitCount: number = 50) => {
    try {
        const notificationsQuery = query(
            collection(db, 'users', userId, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        const snapshot = await getDocs(notificationsQuery);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting user notifications:', error);

        // ❌ LOG ERROR
        await logError(
            'Notifications',
            error instanceof Error ? error.message : 'Failed to fetch user notifications',
            {
                userId,
                limitCount,
                error: error instanceof Error ? error.stack : 'Unknown error',
            }
        );

        throw error;
    }
};

// ═══════════════════════════════════════════════════════════════
// ✅ MARK AS READ
// ═══════════════════════════════════════════════════════════════
export const markNotificationAsRead = async (
    userId: string,
    notificationId: string,
    notificationTitle?: string
) => {
    try {
        await updateDoc(doc(db, 'users', userId, 'notifications', notificationId), {
            isRead: true,
            readAt: Timestamp.now(),
        });

        // ✅ LOG NOTIFICATION READ
        await logNotificationRead(notificationId, userId, notificationTitle);
    } catch (error) {
        console.error('Error marking notification as read:', error);

        // ❌ LOG ERROR
        await logError(
            'Notifications',
            error instanceof Error ? error.message : 'Failed to mark notification as read',
            {
                userId,
                notificationId,
                error: error instanceof Error ? error.stack : 'Unknown error',
            }
        );

        throw error;
    }
};

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE NOTIFICATION
// ═══════════════════════════════════════════════════════════════
export const deleteNotification = async (
    userId: string,
    notificationId: string,
    notificationTitle?: string
) => {
    try {
        await deleteDoc(doc(db, 'users', userId, 'notifications', notificationId));

        // ✅ LOG NOTIFICATION DELETE
        await logNotificationDelete(notificationId, notificationTitle);
    } catch (error) {
        console.error('Error deleting notification:', error);

        // ❌ LOG ERROR
        await logError(
            'Notifications',
            error instanceof Error ? error.message : 'Failed to delete notification',
            {
                userId,
                notificationId,
                error: error instanceof Error ? error.stack : 'Unknown error',
            }
        );

        throw error;
    }
};

// ═══════════════════════════════════════════════════════════════
// 📊 GET NOTIFICATION STATS
// ═══════════════════════════════════════════════════════════════
export const getNotificationStats = async () => {
    try {
        const notificationsSnapshot = await getDocs(collection(db, 'notifications'));

        let totalSent = 0;
        let totalDelivered = 0;
        let totalRead = 0;
        let totalClicked = 0;

        notificationsSnapshot.forEach(doc => {
            const data = doc.data();
            totalSent += data.sentCount || 0;
            totalDelivered += data.deliveredCount || 0;
            totalRead += data.readCount || 0;
            totalClicked += data.clickCount || 0;
        });

        return {
            totalSent,
            totalDelivered,
            totalRead,
            totalClicked,
            deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
            readRate: totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0,
            clickRate: totalRead > 0 ? (totalClicked / totalRead) * 100 : 0,
        };
    } catch (error) {
        console.error('Error getting notification stats:', error);

        // ❌ LOG ERROR
        await logError(
            'Notifications',
            error instanceof Error ? error.message : 'Failed to fetch notification stats',
            {
                error: error instanceof Error ? error.stack : 'Unknown error',
            }
        );

        throw error;
    }
};

// ═══════════════════════════════════════════════════════════════
// 📝 TEMPLATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════
export const createTemplate = async (template: Omit<NotificationTemplate, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, 'notificationTemplates'), {
            ...template,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            usageCount: 0,
        });

        // ✅ LOG TEMPLATE CREATE
        await logTemplateCreate(docRef.id, template.name);

        return docRef.id;
    } catch (error) {
        console.error('Error creating template:', error);

        // ❌ LOG ERROR
        await logError(
            'Notifications',
            error instanceof Error ? error.message : 'Failed to create template',
            {
                templateName: template.name,
                error: error instanceof Error ? error.stack : 'Unknown error',
            }
        );

        throw error;
    }
};

export const getTemplates = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'notificationTemplates'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationTemplate));
    } catch (error) {
        console.error('Error getting templates:', error);

        // ❌ LOG ERROR
        await logError(
            'Notifications',
            error instanceof Error ? error.message : 'Failed to fetch templates',
            {
                error: error instanceof Error ? error.stack : 'Unknown error',
            }
        );

        throw error;
    }
};

export const updateTemplate = async (id: string, data: Partial<NotificationTemplate>) => {
    try {
        await updateDoc(doc(db, 'notificationTemplates', id), {
            ...data,
            updatedAt: Timestamp.now(),
        });

        // ✅ LOG TEMPLATE UPDATE
        await logTemplateUpdate(id, data.name || 'Unknown Template');
    } catch (error) {
        console.error('Error updating template:', error);

        // ❌ LOG ERROR
        await logError(
            'Notifications',
            error instanceof Error ? error.message : 'Failed to update template',
            {
                templateId: id,
                error: error instanceof Error ? error.stack : 'Unknown error',
            }
        );

        throw error;
    }
};

export const deleteTemplate = async (id: string) => {
    try {
        await deleteDoc(doc(db, 'notificationTemplates', id));

        // ✅ LOG TEMPLATE DELETE
        await logTemplateDelete(id);
    } catch (error) {
        console.error('Error deleting template:', error);

        // ❌ LOG ERROR
        await logError(
            'Notifications',
            error instanceof Error ? error.message : 'Failed to delete template',
            {
                templateId: id,
                error: error instanceof Error ? error.stack : 'Unknown error',
            }
        );

        throw error;
    }
};
