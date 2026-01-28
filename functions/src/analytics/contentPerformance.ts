import { onSchedule } from "firebase-functions/v2/scheduler"; // ✅ V2 import
import * as admin from "firebase-admin";

const db = admin.firestore();

// ═══════════════════════════════════════════════════════════════
// 🎬 CONTENT PERFORMANCE AGGREGATION - V2 VERSION
// Runs every 6 hours to update content performance stats
// ═══════════════════════════════════════════════════════════════
export const updateContentPerformance = onSchedule(
    {
        schedule: "0 */6 * * *", // Every 6 hours
        timeZone: "Asia/Kolkata",
        timeoutSeconds: 300,
        memory: "512MiB",
    },
    async (event) => { // ✅ Changed from (context) to (event)
        try {
            console.log("🎬 Starting content performance aggregation...");

            // ═══════════════════════════════════════════════════════════
            // 📊 FETCH ALL CONTENT
            // ═══════════════════════════════════════════════════════════

            const [moviesSnapshot, seriesSnapshot, shortFilmsSnapshot, eventsSnapshot] =
                await Promise.all([
                    db.collection("movies").get(),
                    db.collection("webseries").get(),
                    db.collection("shortfilms").get(),
                    db.collection("events").get(),
                ]);

            // ═══════════════════════════════════════════════════════════
            // 🎥 MOVIES AGGREGATION
            // ═══════════════════════════════════════════════════════════

            let movieViews = 0;
            let movieWatchTime = 0;
            let movieRevenue = 0;
            let movieRatingSum = 0;
            let movieRatingCount = 0;

            moviesSnapshot.forEach((doc) => {
                const data = doc.data();
                movieViews += data.views || 0;

                // Estimate watch time (assume avg 120 min per movie)
                movieWatchTime += (data.views || 0) * 120;

                // Revenue estimation based on views and premium status
                if (data.isPremium) {
                    movieRevenue += (data.views || 0) * 50; // Avg ₹50 per premium view
                }

                if (data.rating && data.rating > 0) {
                    movieRatingSum += data.rating;
                    movieRatingCount++;
                }
            });

            // ═══════════════════════════════════════════════════════════
            // 📺 WEB SERIES AGGREGATION
            // ═══════════════════════════════════════════════════════════

            let seriesViews = 0;
            let seriesWatchTime = 0;
            let seriesRevenue = 0;
            let seriesRatingSum = 0;
            let seriesRatingCount = 0;

            seriesSnapshot.forEach((doc) => {
                const data = doc.data();
                seriesViews += data.views || 0;

                // Series have longer watch time (assume avg 45 min per episode, multiple episodes)
                seriesWatchTime += (data.views || 0) * 180;

                if (data.isPremium) {
                    seriesRevenue += (data.views || 0) * 60;
                }

                if (data.rating && data.rating > 0) {
                    seriesRatingSum += data.rating;
                    seriesRatingCount++;
                }
            });

            // ═══════════════════════════════════════════════════════════
            // 🎬 SHORT FILMS AGGREGATION
            // ═══════════════════════════════════════════════════════════

            let shortFilmViews = 0;
            let shortFilmWatchTime = 0;
            let shortFilmRevenue = 0;
            let shortFilmRatingSum = 0;
            let shortFilmRatingCount = 0;

            shortFilmsSnapshot.forEach((doc) => {
                const data = doc.data();
                shortFilmViews += data.views || 0;

                // Short films (assume avg 30 min)
                shortFilmWatchTime += (data.views || 0) * 30;

                if (data.isPremium) {
                    shortFilmRevenue += (data.views || 0) * 30;
                }

                if (data.rating && data.rating > 0) {
                    shortFilmRatingSum += data.rating;
                    shortFilmRatingCount++;
                }
            });

            // ═══════════════════════════════════════════════════════════
            // 🎪 EVENTS AGGREGATION
            // ═══════════════════════════════════════════════════════════

            let eventViews = 0;
            let eventWatchTime = 0;
            let eventRevenue = 0;
            let eventRatingSum = 0;
            let eventRatingCount = 0;

            eventsSnapshot.forEach((doc) => {
                const data = doc.data();
                eventViews += data.views || 0;

                // Events (assume avg 150 min)
                eventWatchTime += (data.views || 0) * 150;

                // Events typically have ticket prices
                eventRevenue += (data.views || 0) * (data.ticketPrice || 100);

                if (data.rating && data.rating > 0) {
                    eventRatingSum += data.rating;
                    eventRatingCount++;
                }
            });

            // ═══════════════════════════════════════════════════════════
            // 💾 SAVE TO FIRESTORE
            // ═══════════════════════════════════════════════════════════

            const contentPerformanceData = {
                lastUpdated: admin.firestore.Timestamp.now(),

                // Movies
                movieViews: movieViews,
                movieWatchTime: movieWatchTime,
                movieRevenue: movieRevenue,
                movieAvgRating: movieRatingCount > 0 ? movieRatingSum / movieRatingCount : 0,
                movieCount: moviesSnapshot.size,

                // Series
                seriesViews: seriesViews,
                seriesWatchTime: seriesWatchTime,
                seriesRevenue: seriesRevenue,
                seriesAvgRating: seriesRatingCount > 0 ? seriesRatingSum / seriesRatingCount : 0,
                seriesCount: seriesSnapshot.size,

                // Short Films
                shortFilmViews: shortFilmViews,
                shortFilmWatchTime: shortFilmWatchTime,
                shortFilmRevenue: shortFilmRevenue,
                shortFilmAvgRating: shortFilmRatingCount > 0 ? shortFilmRatingSum / shortFilmRatingCount : 0,
                shortFilmCount: shortFilmsSnapshot.size,

                // Events
                eventViews: eventViews,
                eventWatchTime: eventWatchTime,
                eventRevenue: eventRevenue,
                eventAvgRating: eventRatingCount > 0 ? eventRatingSum / eventRatingCount : 0,
                eventCount: eventsSnapshot.size,
            };

            await db
                .collection("analytics")
                .doc("contentPerformance")
                .set(contentPerformanceData);

            console.log("✅ Content performance updated successfully");
            console.log(`📊 Total: ${movieViews + seriesViews + shortFilmViews + eventViews} views across all content`);

        } catch (error) {
            console.error("❌ Error updating content performance:", error);
            throw error;
        }
    }
);
