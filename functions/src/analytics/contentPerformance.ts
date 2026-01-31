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
            subModule: 'Content Performance',
            action,
            message,
            performedBy: {
                uid: 'system',
                email: 'analytics@functions.cloudrun',
                name: 'Content Performance Service',
                role: 'system',
            },
            status: level === 'success' ? 'success' : level === 'error' ? 'failed' : 'pending',
            details: details || {},
        });
    } catch (error) {
        console.error('Failed to log analytics activity:', error);
    }
};

export const updateContentPerformance = onSchedule(
    {
        schedule: "0 */6 * * *", // Every 6 hours
        timeZone: "Asia/Kolkata",
        timeoutSeconds: 300,
        memory: "512MiB",
    },
    async (event) => {
        const startTime = Date.now();

        try {
            await logAnalyticsActivity(
                'content_performance_update_started',
                'info',
                'Started content performance update',
                {
                    scheduledTime: event.scheduleTime,
                }
            );

            console.log("🎬 Updating content performance...");

            const [moviesSnapshot, seriesSnapshot, shortFilmsSnapshot, eventsSnapshot] =
                await Promise.all([
                    db.collection("movies").get(),
                    db.collection("webseries").get(),
                    db.collection("shortfilms").get(),
                    db.collection("events").get(),
                ]);

            const aggregateContent = (
                snapshot: admin.firestore.QuerySnapshot,
                watchTimeMultiplier: number,
                revenueMultiplier: number
            ) => {
                let views = 0, watchTime = 0, revenue = 0, ratingSum = 0, ratingCount = 0;

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    views += data.views || 0;
                    watchTime += (data.views || 0) * watchTimeMultiplier;
                    if (data.isPremium) revenue += (data.views || 0) * revenueMultiplier;
                    if (data.rating && data.rating > 0) {
                        ratingSum += data.rating;
                        ratingCount++;
                    }
                });

                return {
                    views,
                    watchTime,
                    revenue,
                    avgRating: ratingCount > 0 ? ratingSum / ratingCount : 0,
                    count: snapshot.size
                };
            };

            const movies = aggregateContent(moviesSnapshot, 120, 50);
            const series = aggregateContent(seriesSnapshot, 180, 60);
            const shortFilms = aggregateContent(shortFilmsSnapshot, 30, 30);
            const events = aggregateContent(eventsSnapshot, 150, 100);

            const contentPerformanceData = {
                lastUpdated: admin.firestore.Timestamp.now(),
                movieViews: movies.views,
                movieWatchTime: movies.watchTime,
                movieRevenue: movies.revenue,
                movieAvgRating: movies.avgRating,
                movieCount: movies.count,
                seriesViews: series.views,
                seriesWatchTime: series.watchTime,
                seriesRevenue: series.revenue,
                seriesAvgRating: series.avgRating,
                seriesCount: series.count,
                shortFilmViews: shortFilms.views,
                shortFilmWatchTime: shortFilms.watchTime,
                shortFilmRevenue: shortFilms.revenue,
                shortFilmAvgRating: shortFilms.avgRating,
                shortFilmCount: shortFilms.count,
                eventViews: events.views,
                eventWatchTime: events.watchTime,
                eventRevenue: events.revenue,
                eventAvgRating: events.avgRating,
                eventCount: events.count,
            };

            await db.collection("analytics").doc("contentPerformance").set(contentPerformanceData);

            const processingTime = Math.round((Date.now() - startTime) / 1000);

            await logAnalyticsActivity(
                'content_performance_update_completed',
                'success',
                'Content performance updated successfully',
                {
                    processingTime: `${processingTime}s`,
                    totalContent: movies.count + series.count + shortFilms.count + events.count,
                    totalViews: movies.views + series.views + shortFilms.views + events.views,
                }
            );

            console.log("✅ Content performance updated");

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const processingTime = Math.round((Date.now() - startTime) / 1000);

            await logAnalyticsActivity(
                'content_performance_update_failed',
                'error',
                'Content performance update failed',
                {
                    error: errorMessage,
                    processingTime: `${processingTime}s`,
                }
            );

            console.error("❌ Error updating content performance:", error);
            throw error;
        }
    }
);
