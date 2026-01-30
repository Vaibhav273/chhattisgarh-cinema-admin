// ═══════════════════════════════════════════════════════════════
// 📤 FILE UPLOAD HELPER WITH GOOGLE CDN SUPPORT
// ═══════════════════════════════════════════════════════════════

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";
import { generateGoogleCDNUrl } from "./cdnHelper";

export interface UploadResult {
    directUrl: string;
    cdnUrl: string;
}

/**
 * Upload file to Firebase Storage and generate CDN URL
 */
export const uploadFileWithCDN = async (
    file: File,
    path: string,
    onProgress?: (progress: number) => void
): Promise<UploadResult> => {
    try {
        const storageRef = ref(storage, path);

        // Upload to Firebase Storage (Google Cloud Storage)
        const snapshot = await uploadBytes(storageRef, file);

        // Get Firebase Storage download URL
        const directUrl = await getDownloadURL(snapshot.ref);

        // Generate Google Cloud CDN URL
        // Since Firebase Storage already uses Google CDN, we can use the direct URL
        // Or generate a custom CDN URL if configured
        const cdnUrl = generateGoogleCDNUrl(path) || directUrl;

        if (onProgress) onProgress(100);

        return { directUrl, cdnUrl };
    } catch (error) {
        console.error("Upload error:", error);
        throw error;
    }
};

/**
 * Upload multiple files
 */
export const uploadMultipleFiles = async (
    files: File[],
    basePath: string,
    onProgress?: (fileIndex: number, progress: number) => void
): Promise<UploadResult[]> => {
    const uploadPromises = files.map(async (file, index) => {
        const path = `${basePath}/${Date.now()}-${index}-${file.name}`;
        return uploadFileWithCDN(file, path, (progress) => {
            if (onProgress) onProgress(index, progress);
        });
    });

    return Promise.all(uploadPromises);
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File, maxSizeMB: number = 5): boolean => {
    // Check file type
    if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file");
    }

    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error(`Image size should be less than ${maxSizeMB}MB`);
    }

    return true;
};

/**
 * Validate video file
 */
export const validateVideoFile = (file: File, maxSizeMB: number = 100): boolean => {
    // Check file type
    if (!file.type.startsWith("video/")) {
        throw new Error("Please select a video file");
    }

    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error(`Video size should be less than ${maxSizeMB}MB`);
    }

    return true;
};
