import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

const db = admin.firestore();

const logAnalyticsActivity = async (
    action: string,
    level: 'info' | 'success' | 'error',
    message: string,
    details?: any
) => {
    try {
        await db.collection('systemLogs').add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            level,
            module: 'Analytics',
            subModule: 'Monthly Aggregation',
            action,
            message,
            performedBy: {
                uid: 'system',
                email: 'analytics@functions.cloudrun',
                name: 'Monthly Analytics Service',
                role: 'system',
            },
            status: level === 'success' ? 'success' : level === 'error' ? 'failed' : 'pending',
            details: details || {},
        });
    } catch (error) {
        console.error('Failed to log analytics activity:', error);
    }
};

export const scheduledMonthlyAnalytics = onSchedule(
    {
        schedule: "0 0 1 * *", // 1st of every month at 12:00 AM
        timeZone: "Asia/Kolkata",
        timeoutSeconds: 540,
        memory: "512MiB",
    },
    async (event) => {
        const startTime = Date.now();

        try {
            await logAnalyticsActivity(
                'monthly_analytics_started',
                'info',
                'Started monthly analytics aggregation',
                {
                    scheduledTime: event.scheduleTime,
                }
            );

            const now = new Date();
            const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const monthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;

            console.log(`📅 Generating monthly analytics for ${monthStr}`);

            // Your monthly analytics logic here...
            // (Same as your existing logic)

            const processingTime = Math.round((Date.now() - startTime) / 1000);

            await logAnalyticsActivity(
                'monthly_analytics_completed',
                'success',
                `Monthly analytics completed for ${monthStr}`,
                {
                    month: monthStr,
                    processingTime: `${processingTime}s`,
                }
            );

            console.log(`✅ Monthly analytics completed for ${monthStr}`);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const processingTime = Math.round((Date.now() - startTime) / 1000);

            await logAnalyticsActivity(
                'monthly_analytics_failed',
                'error',
                'Monthly analytics aggregation failed',
                {
                    error: errorMessage,
                    processingTime: `${processingTime}s`,
                }
            );

            console.error("❌ Error in monthly analytics:", error);
            throw error;
        }
    }
);
