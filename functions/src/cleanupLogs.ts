import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions/v2';

// ═══════════════════════════════════════════════════════════════
// 🗑️ AUTO-CLEANUP OLD LOGS (Runs daily at 2 AM IST)
// ═══════════════════════════════════════════════════════════════

export const cleanupOldLogs = onSchedule(
    {
        schedule: '0 2 * * *', // Daily at 2 AM
        timeZone: 'Asia/Kolkata',
        region: 'asia-south1',
    },
    async (event) => {
        try {
            logger.info('🗑️ Starting log cleanup...');

            const db = admin.firestore();
            const now = admin.firestore.Timestamp.now();
            const ninetyDaysAgo = new Date(now.toDate());
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            const cutoffDate = admin.firestore.Timestamp.fromDate(ninetyDaysAgo);

            // ═══════════════════════════════════════════════════════════════
            // 🧹 CLEANUP ACTIVITY LOGS
            // ═══════════════════════════════════════════════════════════════

            const activityLogsQuery = db
                .collection('activityLogs')
                .where('timestamp', '<', cutoffDate)
                .limit(500);

            const activityLogsSnapshot = await activityLogsQuery.get();

            if (activityLogsSnapshot.empty) {
                logger.info('✅ No old activity logs to delete');
            } else {
                const batch = db.batch();
                let deleteCount = 0;

                activityLogsSnapshot.docs.forEach((doc) => {
                    batch.delete(doc.ref);
                    deleteCount++;
                });

                await batch.commit();
                logger.info(`✅ Deleted ${deleteCount} activity logs older than 90 days`);
            }

            // ═══════════════════════════════════════════════════════════════
            // 🧹 CLEANUP SYSTEM LOGS
            // ═══════════════════════════════════════════════════════════════

            const systemLogsQuery = db
                .collection('systemLogs')
                .where('timestamp', '<', cutoffDate)
                .limit(500);

            const systemLogsSnapshot = await systemLogsQuery.get();

            if (systemLogsSnapshot.empty) {
                logger.info('✅ No old system logs to delete');
            } else {
                const batch = db.batch();
                let deleteCount = 0;

                systemLogsSnapshot.docs.forEach((doc) => {
                    batch.delete(doc.ref);
                    deleteCount++;
                });

                await batch.commit();
                logger.info(`✅ Deleted ${deleteCount} system logs older than 90 days`);
            }

            // ═══════════════════════════════════════════════════════════════
            // 📊 LOG CLEANUP SUMMARY
            // ═══════════════════════════════════════════════════════════════

            await db.collection('systemLogs').add({
                action: 'logs_cleanup_completed',
                module: 'system',
                subModule: 'maintenance',
                performedBy: {
                    uid: 'system',
                    email: 'system@automated',
                    name: 'System',
                    role: 'system',
                },
                details: {
                    activityLogsDeleted: activityLogsSnapshot.size,
                    systemLogsDeleted: systemLogsSnapshot.size,
                    cutoffDate: cutoffDate.toDate().toISOString(),
                },
                timestamp: admin.firestore.Timestamp.now(),
                status: 'success',
            });

            logger.info('🎉 Log cleanup completed successfully!');
        } catch (error) {
            logger.error('❌ Error during log cleanup:', error);

            // Log the error
            await admin.firestore().collection('systemLogs').add({
                action: 'logs_cleanup_failed',
                module: 'system',
                subModule: 'maintenance',
                performedBy: {
                    uid: 'system',
                    email: 'system@automated',
                    name: 'System',
                    role: 'system',
                },
                details: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                },
                timestamp: admin.firestore.Timestamp.now(),
                status: 'error',
            });

            throw error;
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// 🗑️ MANUAL CLEANUP TRIGGER (HTTP Callable Function)
// ═══════════════════════════════════════════════════════════════

export const manualCleanupLogs = onCall(
    {
        region: 'asia-south1',
    },
    async (request) => {
        // Check if user is authenticated
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'User must be authenticated');
        }

        const db = admin.firestore();
        const userDoc = await db.collection('admins').doc(request.auth.uid).get();

        if (!userDoc.exists || userDoc.data()?.role !== 'super_admin') {
            throw new HttpsError(
                'permission-denied',
                'Only Super Admins can trigger manual cleanup'
            );
        }

        try {
            const days = request.data.days || 90; // Default 90 days
            const now = admin.firestore.Timestamp.now();
            const cutoffDate = new Date(now.toDate());
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const timestamp = admin.firestore.Timestamp.fromDate(cutoffDate);

            // Cleanup Activity Logs
            const activityQuery = db
                .collection('activityLogs')
                .where('timestamp', '<', timestamp);

            const activitySnapshot = await activityQuery.get();
            const activityBatch = db.batch();

            activitySnapshot.docs.forEach((doc) => {
                activityBatch.delete(doc.ref);
            });

            await activityBatch.commit();

            // Cleanup System Logs
            const systemQuery = db
                .collection('systemLogs')
                .where('timestamp', '<', timestamp);

            const systemSnapshot = await systemQuery.get();
            const systemBatch = db.batch();

            systemSnapshot.docs.forEach((doc) => {
                systemBatch.delete(doc.ref);
            });

            await systemBatch.commit();

            logger.info(
                `✅ Manual cleanup: ${activitySnapshot.size} activity logs, ${systemSnapshot.size} system logs deleted`
            );

            return {
                success: true,
                activityLogsDeleted: activitySnapshot.size,
                systemLogsDeleted: systemSnapshot.size,
                cutoffDate: cutoffDate.toISOString(),
            };
        } catch (error) {
            logger.error('❌ Manual cleanup failed:', error);
            throw new HttpsError(
                'internal',
                'Cleanup failed',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }
);
