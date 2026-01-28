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

admin.initializeApp({
    storageBucket: "chhattisgarhi-cinema.firebasestorage.app"
});
const storage = new Storage();

// Test function
export const helloWorld = onRequest((request, response) => {
    response.json({ message: "Encoding service is ready!" });
});

// Video encoding function
export const encodeVideo = onObjectFinalized(
    {
        timeoutSeconds: 540,
        memory: "2GiB",
        bucket: "chhattisgarhi-cinema.firebasestorage.app",
    },
    async (event) => {
        const filePath = event.data.name;

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

        console.log("Processing video:", filePath);

        const bucket = storage.bucket(event.bucket);
        const fileName = path.basename(filePath);
        const tempFilePath = path.join(os.tmpdir(), fileName);

        try {
            // Download video
            await bucket.file(filePath).download({ destination: tempFilePath });
            console.log("Video downloaded to:", tempFilePath);

            // Encode to 720p
            const outputFileName = `720p_${fileName}`;
            const outputPath = path.join(os.tmpdir(), outputFileName);

            await new Promise<void>((resolve, reject) => {
                ffmpeg(tempFilePath)
                    .outputOptions([
                        "-c:v libx264",
                        "-preset medium",
                        "-crf 23",
                        "-vf scale=1280:720",
                        "-c:a aac",
                        "-b:a 128k",
                    ])
                    .on("start", (cmd: string) => console.log("FFmpeg started:", cmd))
                    .on("progress", (progress: { percent?: number }) =>
                        console.log("Processing:", progress.percent, "%")
                    )
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

            // Upload encoded video
            const encodedFilePath = filePath.replace(
                "videos/uploads/",
                "videos/encoded/"
            );
            await bucket.upload(outputPath, {
                destination: encodedFilePath,
                metadata: {
                    contentType: "video/mp4",
                },
            });

            console.log("Encoded video uploaded:", encodedFilePath);

            // Update Firestore (optional - for status tracking)
            const videoId = path.parse(fileName).name;
            try {
                await admin.firestore().collection("videos").doc(videoId).update({
                    encodedUrl: encodedFilePath,
                    encodingStatus: "completed",
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            } catch (firestoreError) {
                console.log("Firestore update skipped (document may not exist)");
            }

            // Cleanup temp files
            fs.unlinkSync(tempFilePath);
            fs.unlinkSync(outputPath);

            console.log("Processing completed successfully");
        } catch (error) {
            console.error("Error processing video:", error);

            // Update error status in Firestore
            const videoId = path.parse(fileName).name;
            try {
                await admin.firestore().collection("videos").doc(videoId).update({
                    encodingStatus: "failed",
                    encodingError: String(error),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            } catch (firestoreError) {
                console.log("Firestore error update skipped");
            }

            // Cleanup on error
            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            throw error;
        }
    }
);
