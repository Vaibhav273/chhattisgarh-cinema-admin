import { onSchedule } from "firebase-functions/v2/scheduler"; // ✅ V2 import
import * as admin from "firebase-admin";

const db = admin.firestore();

// ═══════════════════════════════════════════════════════════════
// 📅 MONTHLY ANALYTICS AGGREGATION - V2 VERSION
// Runs on 1st of every month at 1:00 AM IST
// ═══════════════════════════════════════════════════════════════
export const scheduledMonthlyAnalytics = onSchedule(
    {
        schedule: "0 19 1 * *", // 1st of month, 1:00 AM IST
        timeZone: "Asia/Kolkata",
        timeoutSeconds: 540,
        memory: "512MiB",
    },
    async (event) => { // ✅ Changed from (context) to (event)
        try {
            // Get previous month
            const now = new Date();
            const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const monthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;

            console.log(`📅 Starting monthly analytics aggregation for ${monthStr}`);

            // Get month date range
            const monthStart = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
            const monthEnd = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0, 23, 59, 59, 999);

            // ═══════════════════════════════════════════════════════════
            // 📊 AGGREGATE DAILY STATS - Get all and filter in code
            // ═══════════════════════════════════════════════════════════

            const dailyStatsSnapshot = await db
                .collection("analytics")
                .doc("daily")
                .collection("stats")
                .get();

            let totalRevenue = 0;
            let totalViews = 0;
            let totalWatchTime = 0;
            let totalNewUsers = 0;
            let totalTransactions = 0;
            let avgRatingSum = 0;
            let avgRatingCount = 0;

            const startDateStr = monthStart.toISOString().split("T")[0];
            const endDateStr = monthEnd.toISOString().split("T")[0];

            dailyStatsSnapshot.forEach((doc) => {
                const data = doc.data();
                const date = data.date;

                // Filter dates in the target month
                if (date >= startDateStr && date <= endDateStr) {
                    totalRevenue += data.revenue || 0;
                    totalViews += data.views || 0;
                    totalWatchTime += data.watchTime || 0;
                    totalNewUsers += data.newUsers || 0;
                    totalTransactions += data.transactions || 0;

                    if (data.avgRating && data.avgRating > 0) {
                        avgRatingSum += data.avgRating;
                        avgRatingCount++;
                    }
                }
            });

            console.log(`📊 Aggregated ${avgRatingCount} days of data for ${monthStr}`);

            // ═══════════════════════════════════════════════════════════
            // 👥 USER COUNTS - Get all and filter in code
            // ═══════════════════════════════════════════════════════════

            const allUsersSnapshot = await db.collection("users").get();

            let totalUsers = 0;
            let premiumUsers = 0;

            allUsersSnapshot.forEach((doc) => {
                const data = doc.data();
                const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;

                if (createdAt && createdAt <= monthEnd) {
                    totalUsers++;

                    if (data.subscription?.status === "active") {
                        premiumUsers++;
                    }
                }
            });

            console.log(`👥 Month End: Total=${totalUsers}, Premium=${premiumUsers}`);

            // ═══════════════════════════════════════════════════════════
            // 📺 CONTENT COUNTS
            // ═══════════════════════════════════════════════════════════

            const [moviesCount, seriesCount, shortFilmsCount, eventsCount] = await Promise.all([
                db.collection("movies").count().get(),
                db.collection("webseries").count().get(),
                db.collection("shortfilms").count().get(),
                db.collection("events").count().get(),
            ]);

            // ═══════════════════════════════════════════════════════════
            // 💾 SAVE MONTHLY SUMMARY
            // ═══════════════════════════════════════════════════════════

            const monthlyData = {
                month: monthStr,
                timestamp: admin.firestore.Timestamp.fromDate(prevMonth),

                users: totalUsers,
                newUsers: totalNewUsers,
                premiumUsers: premiumUsers,

                revenue: totalRevenue,
                views: totalViews,
                watchTime: totalWatchTime,
                transactions: totalTransactions,

                content: moviesCount.data().count +
                    seriesCount.data().count +
                    shortFilmsCount.data().count +
                    eventsCount.data().count,

                avgRating: avgRatingCount > 0 ? avgRatingSum / avgRatingCount : 0,

                // Breakdown
                movies: moviesCount.data().count,
                series: seriesCount.data().count,
                shortFilms: shortFilmsCount.data().count,
                events: eventsCount.data().count,
            };

            await db
                .collection("analytics")
                .doc("monthly")
                .collection("stats")
                .doc(monthStr)
                .set(monthlyData);

            console.log(`✅ Monthly analytics saved for ${monthStr}`);
            console.log(`📊 Summary: ${totalNewUsers} new users, ₹${totalRevenue} revenue, ${totalViews} views`);

        } catch (error) {
            console.error("❌ Error in monthly analytics aggregation:", error);
            throw error;
        }
    }
);
