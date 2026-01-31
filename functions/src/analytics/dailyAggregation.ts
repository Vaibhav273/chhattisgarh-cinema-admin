import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ✅ Logging helper
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
            subModule: 'Daily Aggregation',
            action,
            message,
            performedBy: {
                uid: 'system',
                email: 'analytics@functions.cloudrun',
                name: 'Analytics Service',
                role: 'system',
            },
            status: level === 'success' ? 'success' : level === 'error' ? 'failed' : 'pending',
            details: details || {},
        });
    } catch (error) {
        console.error('Failed to log analytics activity:', error);
    }
};

// ✅ FIXED: Using v2 onSchedule
export const scheduledDailyAnalytics = onSchedule(
    {
        schedule: "0 0 * * *", // 12:00 AM daily
        timeZone: "Asia/Kolkata",
        timeoutSeconds: 540,
        memory: "512MiB",
    },
    async (event) => {
        const startTime = Date.now();

        try {
            // ✅ Log analytics started
            await logAnalyticsActivity(
                'daily_analytics_started',
                'info',
                'Started daily analytics aggregation',
                {
                    scheduledTime: event.scheduleTime,
                    timeZone: 'Asia/Kolkata',
                }
            );

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split("T")[0];

            console.log(`📊 Generating daily analytics for ${dateStr}`);

            // Your analytics generation logic
            const dayStart = new Date(yesterday);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(yesterday);
            dayEnd.setHours(23, 59, 59, 999);

            // Get all users and filter
            const allUsersSnapshot = await db.collection("users").get();
            let totalUsers = 0;
            let newUsers = 0;
            let premiumUsers = 0;
            let activeUsers = 0;

            const thirtyDaysAgo = new Date(yesterday);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            allUsersSnapshot.forEach((doc) => {
                const data = doc.data();
                const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
                const lastLogin = data.lastLogin?.toDate ? data.lastLogin.toDate() : null;

                if (createdAt && createdAt <= dayEnd) {
                    totalUsers++;
                    if (createdAt >= dayStart && createdAt <= dayEnd) newUsers++;
                    if (data.subscription?.status === "active") premiumUsers++;
                    if (lastLogin && lastLogin >= thirtyDaysAgo && lastLogin <= dayEnd) activeUsers++;
                }
            });

            // Get transactions
            const allTransactionsSnapshot = await db.collection("transactions").get();
            let totalRevenue = 0;
            let successfulPayments = 0;
            let failedPayments = 0;

            allTransactionsSnapshot.forEach((doc) => {
                const data = doc.data();
                const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;

                if (createdAt && createdAt >= dayStart && createdAt <= dayEnd) {
                    if (data.status === "completed") {
                        totalRevenue += data.amount || 0;
                        successfulPayments++;
                    } else if (data.status === "failed") {
                        failedPayments++;
                    }
                }
            });

            // Get content metrics
            const [moviesSnapshot, seriesSnapshot, shortFilmsSnapshot, eventsSnapshot] =
                await Promise.all([
                    db.collection("movies").get(),
                    db.collection("webseries").get(),
                    db.collection("shortfilms").get(),
                    db.collection("events").get(),
                ]);

            let totalViews = 0;
            [moviesSnapshot, seriesSnapshot, shortFilmsSnapshot, eventsSnapshot].forEach((snapshot) => {
                snapshot.forEach((doc) => {
                    totalViews += doc.data().views || 0;
                });
            });

            // Save analytics
            const analyticsData = {
                date: dateStr,
                timestamp: admin.firestore.Timestamp.fromDate(yesterday),
                users: totalUsers,
                newUsers: newUsers,
                activeUsers: activeUsers,
                premiumUsers: premiumUsers,
                revenue: totalRevenue,
                successfulPayments: successfulPayments,
                failedPayments: failedPayments,
                views: totalViews,
                watchTime: totalViews * 45,
            };

            await db.collection("analytics").doc("daily").collection("stats").doc(dateStr).set(analyticsData);

            const processingTime = Math.round((Date.now() - startTime) / 1000);

            // ✅ Log analytics completed
            await logAnalyticsActivity(
                'daily_analytics_completed',
                'success',
                `Daily analytics completed for ${dateStr}`,
                {
                    date: dateStr,
                    processingTime: `${processingTime}s`,
                    stats: {
                        totalUsers,
                        newUsers,
                        revenue: totalRevenue,
                        views: totalViews,
                    }
                }
            );

            console.log("✅ Daily analytics completed for:", dateStr);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const processingTime = Math.round((Date.now() - startTime) / 1000);

            // ✅ Log analytics failed
            await logAnalyticsActivity(
                'daily_analytics_failed',
                'error',
                'Daily analytics aggregation failed',
                {
                    error: errorMessage,
                    processingTime: `${processingTime}s`,
                }
            );

            console.error("❌ Error in daily analytics:", error);
            throw error;
        }
    }
);
