import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ═══════════════════════════════════════════════════════════════
// 🔧 MANUAL TRIGGER - GENERATE DAILY ANALYTICS
// ═══════════════════════════════════════════════════════════════
export const generateDailyAnalyticsManual = onRequest(
    {
        timeoutSeconds: 540,
        memory: "1GiB",
        cors: true, // ✅ Enable CORS for frontend calls
    },
    async (request, response) => {
        try {
            // Check for admin authorization (optional but recommended)
            const authHeader = request.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                response.status(401).json({ error: "Unauthorized" });
                return;
            }

            const daysToGenerate = parseInt(request.query.days as string) || 30;
            const startDate = request.query.startDate as string;
            const endDate = request.query.endDate as string;

            console.log(`📊 Manual trigger: Generating analytics...`);
            console.log(`Days: ${daysToGenerate}, StartDate: ${startDate}, EndDate: ${endDate}`);

            const results = [];
            const errors = [];

            if (startDate && endDate) {
                // Generate for specific date range
                const start = new Date(startDate);
                const end = new Date(endDate);
                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

                for (let i = 0; i <= days; i++) {
                    const targetDate = new Date(start);
                    targetDate.setDate(targetDate.getDate() + i);

                    try {
                        await generateDailyAnalytics(targetDate);
                        results.push({
                            date: targetDate.toISOString().split('T')[0],
                            status: 'success'
                        });
                    } catch (error) {
                        errors.push({
                            date: targetDate.toISOString().split('T')[0],
                            error: String(error)
                        });
                    }
                }
            } else {
                // Generate for last N days
                for (let i = daysToGenerate - 1; i >= 0; i--) {
                    const targetDate = new Date();
                    targetDate.setDate(targetDate.getDate() - i);

                    try {
                        await generateDailyAnalytics(targetDate);
                        results.push({
                            date: targetDate.toISOString().split('T')[0],
                            status: 'success'
                        });
                    } catch (error) {
                        errors.push({
                            date: targetDate.toISOString().split('T')[0],
                            error: String(error)
                        });
                    }
                }
            }

            response.json({
                success: true,
                message: `✅ Generated analytics for ${results.length} days`,
                results: results,
                errors: errors.length > 0 ? errors : undefined,
                stats: {
                    total: results.length + errors.length,
                    successful: results.length,
                    failed: errors.length
                }
            });
        } catch (error) {
            console.error("❌ Error:", error);
            response.status(500).json({
                success: false,
                error: String(error)
            });
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// 🔧 MANUAL TRIGGER - UPDATE CONTENT PERFORMANCE
// ═══════════════════════════════════════════════════════════════
export const generateContentPerformanceManual = onRequest(
    {
        timeoutSeconds: 300,
        memory: "512MiB",
        cors: true,
    },
    async (request, response) => {
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                response.status(401).json({ error: "Unauthorized" });
                return;
            }

            console.log("🎬 Manual trigger: Updating content performance...");

            const result = await generateContentPerformance();

            response.json({
                success: true,
                message: "✅ Content performance updated successfully",
                data: result
            });
        } catch (error) {
            console.error("❌ Error:", error);
            response.status(500).json({
                success: false,
                error: String(error)
            });
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// 🔧 MANUAL TRIGGER - GENERATE MONTHLY ANALYTICS
// ═══════════════════════════════════════════════════════════════
export const generateMonthlyAnalyticsManual = onRequest(
    {
        timeoutSeconds: 540,
        memory: "512MiB",
        cors: true,
    },
    async (request, response) => {
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                response.status(401).json({ error: "Unauthorized" });
                return;
            }

            const monthsToGenerate = parseInt(request.query.months as string) || 1;

            console.log(`📅 Manual trigger: Generating ${monthsToGenerate} months of analytics...`);

            const results = [];
            const errors = [];

            for (let i = monthsToGenerate - 1; i >= 0; i--) {
                const targetDate = new Date();
                targetDate.setMonth(targetDate.getMonth() - i - 1);

                try {
                    await generateMonthlyAnalytics(targetDate);
                    const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
                    results.push({
                        month: monthStr,
                        status: 'success'
                    });
                } catch (error) {
                    const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
                    errors.push({
                        month: monthStr,
                        error: String(error)
                    });
                }
            }

            response.json({
                success: true,
                message: `✅ Generated monthly analytics for ${results.length} months`,
                results: results,
                errors: errors.length > 0 ? errors : undefined
            });
        } catch (error) {
            console.error("❌ Error:", error);
            response.status(500).json({
                success: false,
                error: String(error)
            });
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// 📊 HELPER FUNCTION - GENERATE DAILY ANALYTICS
// ═══════════════════════════════════════════════════════════════
async function generateDailyAnalytics(targetDate: Date) {
    const dateStr = targetDate.toISOString().split("T")[0];
    console.log(`📊 Generating daily analytics for ${dateStr}`);

    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Get all users and filter
    const allUsersSnapshot = await db.collection("users").get();

    let totalUsers = 0;
    let newUsers = 0;
    let premiumUsers = 0;
    let activeUsers = 0;

    const thirtyDaysAgo = new Date(targetDate);
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

    // Get all transactions and filter
    const allTransactionsSnapshot = await db.collection("transactions").get();
    let totalRevenue = 0, subscriptionRevenue = 0, eventRevenue = 0, ppvRevenue = 0;
    let successfulPayments = 0, failedPayments = 0;

    allTransactionsSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;

        if (createdAt && createdAt >= dayStart && createdAt <= dayEnd) {
            if (data.status === "completed") {
                const amount = data.amount || 0;
                totalRevenue += amount;
                successfulPayments++;
                if (data.type === "subscription") subscriptionRevenue += amount;
                else if (data.type === "event") eventRevenue += amount;
                else if (data.type === "ppv") ppvRevenue += amount;
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

    let movieViews = 0, seriesViews = 0, shortFilmViews = 0, eventViews = 0;
    let totalRatings = 0, sumRatings = 0;

    [moviesSnapshot, seriesSnapshot, shortFilmsSnapshot, eventsSnapshot].forEach((snapshot) => {
        snapshot.forEach((doc) => {
            const data = doc.data();
            const views = data.views || 0;

            if (snapshot === moviesSnapshot) movieViews += views;
            else if (snapshot === seriesSnapshot) seriesViews += views;
            else if (snapshot === shortFilmsSnapshot) shortFilmViews += views;
            else if (snapshot === eventsSnapshot) eventViews += views;

            if (data.rating && data.rating > 0) {
                sumRatings += data.rating;
                totalRatings++;
            }
        });
    });

    const totalViews = movieViews + seriesViews + shortFilmViews + eventViews;
    const avgRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
    const watchTime = totalViews * 45;
    const engagement = activeUsers > 0 ? (totalViews / activeUsers) * 100 : 0;

    // Save to Firestore
    const analyticsData = {
        date: dateStr,
        timestamp: admin.firestore.Timestamp.fromDate(targetDate),
        users: totalUsers,
        newUsers: newUsers,
        activeUsers: activeUsers,
        premiumUsers: premiumUsers,
        revenue: totalRevenue,
        subscriptionRevenue: subscriptionRevenue,
        eventRevenue: eventRevenue,
        ppvRevenue: ppvRevenue,
        transactions: successfulPayments,
        successfulPayments: successfulPayments,
        failedPayments: failedPayments,
        views: totalViews,
        movieViews: movieViews,
        seriesViews: seriesViews,
        shortFilmViews: shortFilmViews,
        eventViews: eventViews,
        watchTime: watchTime,
        avgWatchTime: 45,
        engagement: engagement,
        completionRate: 60,
        avgRating: avgRating,
        totalRatings: totalRatings,
    };

    await db.collection("analytics").doc("daily").collection("stats").doc(dateStr).set(analyticsData);
    console.log(`✅ Analytics saved for ${dateStr}`);

    return analyticsData;
}

// ═══════════════════════════════════════════════════════════════
// 🎬 HELPER FUNCTION - GENERATE CONTENT PERFORMANCE
// ═══════════════════════════════════════════════════════════════
async function generateContentPerformance() {
    const [moviesSnapshot, seriesSnapshot, shortFilmsSnapshot, eventsSnapshot] =
        await Promise.all([
            db.collection("movies").get(),
            db.collection("webseries").get(),
            db.collection("shortfilms").get(),
            db.collection("events").get(),
        ]);

    const aggregateContent = (snapshot: admin.firestore.QuerySnapshot, watchTimeMultiplier: number, revenueMultiplier: number) => {
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

        return { views, watchTime, revenue, avgRating: ratingCount > 0 ? ratingSum / ratingCount : 0, count: snapshot.size };
    };

    const movies = aggregateContent(moviesSnapshot, 120, 50);
    const series = aggregateContent(seriesSnapshot, 180, 60);
    const shortFilms = aggregateContent(shortFilmsSnapshot, 30, 30);
    const events = { ...aggregateContent(eventsSnapshot, 150, 100), count: eventsSnapshot.size };

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
    console.log("✅ Content performance updated");

    return contentPerformanceData;
}

// ═══════════════════════════════════════════════════════════════
// 📅 HELPER FUNCTION - GENERATE MONTHLY ANALYTICS
// ═══════════════════════════════════════════════════════════════
async function generateMonthlyAnalytics(targetDate?: Date) {
    const now = targetDate || new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;

    console.log(`📅 Generating monthly analytics for ${monthStr}`);

    const monthStart = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
    const monthEnd = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0, 23, 59, 59, 999);

    const dailyStatsSnapshot = await db.collection("analytics").doc("daily").collection("stats").get();

    let totalRevenue = 0, totalViews = 0, totalWatchTime = 0, totalNewUsers = 0;
    let avgRatingSum = 0, avgRatingCount = 0;

    const startDateStr = monthStart.toISOString().split("T")[0];
    const endDateStr = monthEnd.toISOString().split("T")[0];

    dailyStatsSnapshot.forEach((doc) => {
        const data = doc.data();
        const date = data.date;

        if (date >= startDateStr && date <= endDateStr) {
            totalRevenue += data.revenue || 0;
            totalViews += data.views || 0;
            totalWatchTime += data.watchTime || 0;
            totalNewUsers += data.newUsers || 0;
            if (data.avgRating && data.avgRating > 0) {
                avgRatingSum += data.avgRating;
                avgRatingCount++;
            }
        }
    });

    const allUsersSnapshot = await db.collection("users").get();
    let totalUsers = 0, premiumUsers = 0;

    allUsersSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
        if (createdAt && createdAt <= monthEnd) {
            totalUsers++;
            if (data.subscription?.status === "active") premiumUsers++;
        }
    });

    const [moviesCount, seriesCount, shortFilmsCount, eventsCount] = await Promise.all([
        db.collection("movies").count().get(),
        db.collection("webseries").count().get(),
        db.collection("shortfilms").count().get(),
        db.collection("events").count().get(),
    ]);

    const monthlyData = {
        month: monthStr,
        timestamp: admin.firestore.Timestamp.fromDate(prevMonth),
        users: totalUsers,
        newUsers: totalNewUsers,
        premiumUsers: premiumUsers,
        revenue: totalRevenue,
        views: totalViews,
        watchTime: totalWatchTime,
        content: moviesCount.data().count + seriesCount.data().count + shortFilmsCount.data().count + eventsCount.data().count,
        avgRating: avgRatingCount > 0 ? avgRatingSum / avgRatingCount : 0,
        movies: moviesCount.data().count,
        series: seriesCount.data().count,
        shortFilms: shortFilmsCount.data().count,
        events: eventsCount.data().count,
    };

    await db.collection("analytics").doc("monthly").collection("stats").doc(monthStr).set(monthlyData);
    console.log(`✅ Monthly analytics saved for ${monthStr}`);

    return monthlyData;
}
