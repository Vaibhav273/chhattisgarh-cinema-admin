import { onObjectFinalized } from "firebase-functions/v2/storage";
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { Storage } from "@google-cloud/storage";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// ✅ Initialize admin WITHOUT specifying bucket
admin.initializeApp();

const db = admin.firestore();
const storage = new Storage();

// ═══════════════════════════════════════════════════════════════
// 🔄 ACTIVITY LOGGING HELPER
// ═══════════════════════════════════════════════════════════════

const logSystemActivity = async (
    action: string,
    level: 'info' | 'warning' | 'error' | 'success',
    message: string,
    details?: any
) => {
    try {
        await db.collection('systemLogs').add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            level,
            module: 'Cloud Functions',
            subModule: 'Automated Tasks',
            action,
            message,
            performedBy: {
                uid: 'system',
                email: 'system@functions.cloudrun',
                name: 'Cloud Functions',
                role: 'system',
            },
            status: level === 'success' ? 'success' : level === 'error' ? 'failed' : 'pending',
            details: details || {},
            ipAddress: 'cloud-function',
            userAgent: 'Firebase Cloud Functions v2',
        });
    } catch (error) {
        console.error('❌ Failed to log activity:', error);
    }
};

// ═══════════════════════════════════════════════════════════════
// 🔥 EXPORT ALL FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Test function
export const helloWorld = onRequest(async (request, response) => {
    await logSystemActivity(
        'health_check',
        'info',
        'Cloud Functions health check performed',
        {
            timestamp: new Date().toISOString(),
            endpoint: request.url,
        }
    );

    response.json({
        message: "🔥 Encoding + Analytics service is ready!",
        timestamp: new Date().toISOString(),
        functions: [
            "encodeVideo - Video encoding (on upload)",
            "scheduledDailyAnalytics - Daily analytics (12:00 AM IST)",
            "updateContentPerformance - Content stats (Every 6 hours)",
            "scheduledMonthlyAnalytics - Monthly analytics (1st of month)",
        ]
    });
});

// Analytics Functions (scheduled)
export { scheduledDailyAnalytics } from "./analytics/dailyAggregation";
export { updateContentPerformance } from "./analytics/contentPerformance";
export { scheduledMonthlyAnalytics } from "./analytics/monthlyAggregation";

// ═══════════════════════════════════════════════════════════════
// 🎬 VIDEO ENCODING WITH ACTIVITY LOGGING
// ═══════════════════════════════════════════════════════════════

// ✅ FIXED: Removed bucket specification - let Firebase auto-detect
export const encodeVideo = onObjectFinalized(
    {
        timeoutSeconds: 540,
        memory: "2GiB",
        // ✅ REMOVED: bucket specification
    },
    async (event) => {
        const filePath = event.data.name;
        const fileName = path.basename(filePath || '');
        const videoId = path.parse(fileName).name;

        // Only process videos in 'videos/uploads/' folder
        if (!filePath?.startsWith("videos/uploads/")) {
            console.log("Skipping - not in uploads folder");
            return;
        }

        // Skip if already encoded
        if (filePath.includes("/encoded/")) {
            console.log("Skipping - already encoded");
            return;
        }

        await logSystemActivity(
            'video_encoding_started',
            'info',
            `Started video encoding: ${fileName}`,
            {
                videoId,
                fileName,
                filePath,
                fileSize: event.data.size,
                contentType: event.data.contentType,
                bucket: event.bucket, // Log bucket name
            }
        );

        console.log("Processing video:", filePath);

        // ✅ Get bucket from event
        const bucket = storage.bucket(event.bucket);
        const tempFilePath = path.join(os.tmpdir(), fileName);
        const startTime = Date.now();

        try {
            // Download video
            await bucket.file(filePath).download({ destination: tempFilePath });
            console.log("Video downloaded to:", tempFilePath);

            // Get file stats
            const stats = fs.statSync(tempFilePath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            // Encode to 720p
            const outputFileName = `720p_${fileName}`;
            const outputPath = path.join(os.tmpdir(), outputFileName);

            await new Promise<void>((resolve, reject) => {
                let lastProgress = 0;

                ffmpeg(tempFilePath)
                    .outputOptions([
                        "-c:v libx264",
                        "-preset medium",
                        "-crf 23",
                        "-vf scale=1280:720",
                        "-c:a aac",
                        "-b:a 128k",
                    ])
                    .on("start", (cmd: string) => {
                        console.log("FFmpeg started:", cmd);
                    })
                    .on("progress", (progress: { percent?: number }) => {
                        const currentProgress = Math.floor(progress.percent || 0);
                        if (currentProgress - lastProgress >= 25) {
                            console.log("Processing:", currentProgress, "%");
                            lastProgress = currentProgress;
                        }
                    })
                    .on("end", () => {
                        console.log("Encoding completed");
                        resolve();
                    })
                    .on("error", (err: Error) => {
                        console.error("FFmpeg error:", err);
                        reject(err);
                    })
                    .save(outputPath);
            });

            // Get encoded file stats
            const encodedStats = fs.statSync(outputPath);
            const encodedSizeMB = (encodedStats.size / (1024 * 1024)).toFixed(2);
            const compressionRatio = ((1 - encodedStats.size / stats.size) * 100).toFixed(1);

            // Upload encoded video
            const encodedFilePath = filePath.replace(
                "videos/uploads/",
                "videos/encoded/"
            );
            await bucket.upload(outputPath, {
                destination: encodedFilePath,
                metadata: {
                    contentType: "video/mp4",
                    metadata: {
                        originalFile: fileName,
                        encodedAt: new Date().toISOString(),
                        resolution: '720p',
                    },
                },
            });

            console.log("Encoded video uploaded:", encodedFilePath);

            const processingTime = Math.round((Date.now() - startTime) / 1000);

            // Update Firestore
            try {
                await db.collection("videos").doc(videoId).update({
                    encodedUrl: encodedFilePath,
                    encodingStatus: "completed",
                    encodingCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
                    encodingDuration: processingTime,
                    originalSize: stats.size,
                    encodedSize: encodedStats.size,
                    compressionRatio: parseFloat(compressionRatio),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            } catch (firestoreError) {
                console.log("Firestore update skipped (document may not exist)");
            }

            // ✅ Log successful encoding
            await logSystemActivity(
                'video_encoding_completed',
                'success',
                `Video encoded successfully: ${fileName}`,
                {
                    videoId,
                    fileName,
                    originalSize: `${fileSizeMB} MB`,
                    encodedSize: `${encodedSizeMB} MB`,
                    compressionRatio: `${compressionRatio}%`,
                    processingTime: `${processingTime}s`,
                    resolution: '720p',
                    encodedFilePath,
                }
            );

            // Cleanup temp files
            fs.unlinkSync(tempFilePath);
            fs.unlinkSync(outputPath);

            console.log("Processing completed successfully");

        } catch (error) {
            console.error("Error processing video:", error);

            const errorMessage = error instanceof Error ? error.message : String(error);
            const processingTime = Math.round((Date.now() - startTime) / 1000);

            // Update error status in Firestore
            try {
                await db.collection("videos").doc(videoId).update({
                    encodingStatus: "failed",
                    encodingError: errorMessage,
                    encodingFailedAt: admin.firestore.FieldValue.serverTimestamp(),
                    encodingDuration: processingTime,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            } catch (firestoreError) {
                console.log("Firestore error update skipped");
            }

            // ✅ Log encoding failure
            await logSystemActivity(
                'video_encoding_failed',
                'error',
                `Video encoding failed: ${fileName}`,
                {
                    videoId,
                    fileName,
                    error: errorMessage,
                    processingTime: `${processingTime}s`,
                    filePath,
                }
            );

            // Cleanup on error
            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            throw error;
        }
    }
);

// Manual trigger exports
export {
    generateDailyAnalyticsManual,
    generateContentPerformanceManual,
    generateMonthlyAnalyticsManual
} from "./analytics/manualTriggers";
