// ═══════════════════════════════════════════════════════════════
// 🌐 GOOGLE CLOUD CDN HELPER UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Get CDN-optimized URL for images and videos
 * Falls back to direct URL if CDN URL is not available
 */
export const getCdnUrl = (cdnUrl?: string, directUrl?: string): string => {
    // Priority: CDN URL > Direct URL > Empty string
    return cdnUrl || directUrl || "";
};

/**
 * Get multiple CDN URLs for arrays (like gallery images)
 */
export const getCdnUrls = (cdnUrls?: string[], directUrls?: string[]): string[] => {
    if (!cdnUrls && !directUrls) return [];

    const maxLength = Math.max(cdnUrls?.length || 0, directUrls?.length || 0);
    const result: string[] = [];

    for (let i = 0; i < maxLength; i++) {
        result.push(getCdnUrl(cdnUrls?.[i], directUrls?.[i]));
    }

    return result;
};

/**
 * Generate Google Cloud CDN URL from path
 */
export const generateGoogleCDNUrl = (path: string): string => {
    const GCS_BUCKET_NAME = process.env.REACT_APP_GCS_BUCKET_NAME;
    const GCS_CDN_DOMAIN = process.env.REACT_APP_GCS_CDN_DOMAIN;
    const USE_FIREBASE_CDN = process.env.REACT_APP_USE_FIREBASE_CDN === "true";

    // Option 1: Use Firebase Storage's built-in CDN (recommended)
    if (USE_FIREBASE_CDN && GCS_BUCKET_NAME) {
        const encodedPath = encodeURIComponent(path);
        return `https://firebasestorage.googleapis.com/v0/b/${GCS_BUCKET_NAME}/o/${encodedPath}?alt=media`;
    }

    // Option 2: Use custom domain with Cloud CDN
    if (GCS_CDN_DOMAIN) {
        return `https://${GCS_CDN_DOMAIN}/${path}`;
    }

    // Option 3: Use GCS public URL
    if (GCS_BUCKET_NAME) {
        return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${path}`;
    }

    // Fallback: return empty
    return "";
};

/**
 * Check if URL is a CDN URL
 */
export const isCdnUrl = (url: string): boolean => {
    return url.includes('firebasestorage.googleapis.com') ||
        url.includes('storage.googleapis.com') ||
        url.includes(process.env.REACT_APP_GCS_CDN_DOMAIN || '');
};
