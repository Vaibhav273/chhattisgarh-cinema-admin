import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import type { SystemLog, SystemLogAction } from "../types/systemLog";

/**
 * Get current user from auth/localStorage
 */
const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            return {
                uid: user.uid || "unknown",
                email: user.email || "unknown@email.com",
                name: user.displayName || user.name || "Unknown User",
                role: user.role || "admin",
            };
        }
    } catch (error) {
        console.error("Error getting user:", error);
    }

    return {
        uid: "anonymous",
        email: "anonymous@system.com",
        name: "Anonymous",
        role: "unknown",
    };
};

/**
 * Main Logger Function
 * ✅ FIXED: Correct parameter order matching usage
 */
export const logSystemActivity = async (
    action: SystemLogAction,
    module: string,
    details: any = {},
    subModule: string = "",
    status: "success" | "error" | "warning" = "success"
) => {
    try {
        const user = getCurrentUser();

        // Create log object
        const logData: Omit<SystemLog, "id"> = {
            action,
            module,
            subModule: subModule || undefined,
            performedBy: user,
            details: {
                ...details,
                actionTime: new Date().toISOString(),
            },
            timestamp: serverTimestamp() as any,
            createdAt: serverTimestamp() as any,
            userAgent: navigator.userAgent,
            status,
        };

        // Console log for development
        console.log(`📝 [${status.toUpperCase()}] ${module}:`, {
            action,
            subModule,
            user: user.email,
            details,
            time: new Date().toLocaleTimeString(),
        });

        // Save to Firestore
        await addDoc(collection(db, "systemLogs"), logData);

        // Additional console table for better visibility
        if (process.env.NODE_ENV === "development") {
            console.table({
                "📌 Action": action,
                "🔧 Module": module,
                "📂 Sub-Module": subModule || "-",
                "👤 User": user.email,
                "✅ Status": status,
                "⏰ Time": new Date().toLocaleTimeString(),
            });
        }
    } catch (error) {
        console.error("❌ Failed to log system activity:", error);
        // Don't throw - logging failure shouldn't break app
    }
};

// ═══════════════════════════════════════════════════════════════
// 🎨 IMAGE LOGGING HELPERS
// ═══════════════════════════════════════════════════════════════

export const logImageUpload = async (
    url: string,
    cdnUrl: string,
    module: string,
    imageType: "main" | "banner" | "thumbnail" | "poster" | "backdrop" | "gallery",
    additionalDetails: any = {}
) => {
    await logSystemActivity(
        "image_uploaded",
        module,
        {
            url,
            cdnUrl,
            imageType,
            fileName: url.split("/").pop(),
            fileSize: additionalDetails.fileSize || "unknown",
            ...additionalDetails,
        },
        `Image Upload - ${imageType}`,
        "success"
    );
};

export const logImageDelete = async (
    url: string,
    module: string,
    imageType: string,
    additionalDetails: any = {}
) => {
    await logSystemActivity(
        "image_deleted",
        module,
        {
            url,
            imageType,
            fileName: url.split("/").pop(),
            ...additionalDetails,
        },
        `Image Delete - ${imageType}`,
        "success"
    );
};

export const logGalleryImageAdd = async (
    images: { url: string; cdnUrl: string }[],
    module: string,
    totalImages: number,
    additionalDetails: any = {}
) => {
    await logSystemActivity(
        "gallery_image_added",
        module,
        {
            imagesAdded: images.length,
            totalGalleryImages: totalImages,
            images: images.map((img) => ({
                url: img.url,
                cdnUrl: img.cdnUrl,
                fileName: img.url.split("/").pop(),
            })),
            ...additionalDetails,
        },
        "Gallery Management",
        "success"
    );
};

export const logGalleryImageRemove = async (
    url: string,
    index: number,
    module: string,
    remainingImages: number,
    additionalDetails: any = {}
) => {
    await logSystemActivity(
        "gallery_image_removed",
        module,
        {
            url,
            index,
            fileName: url.split("/").pop(),
            remainingImages,
            ...additionalDetails,
        },
        "Gallery Management",
        "success"
    );
};

// ═══════════════════════════════════════════════════════════════
// 📹 VIDEO LOGGING HELPERS
// ═══════════════════════════════════════════════════════════════

export const logVideoUpload = async (
    url: string,
    cdnUrl: string,
    module: string,
    videoType: "main" | "trailer" | "teaser" | "promo",
    additionalDetails: any = {}
) => {
    await logSystemActivity(
        "video_uploaded",
        module,
        {
            url,
            cdnUrl,
            videoType,
            fileName: url.split("/").pop(),
            ...additionalDetails,
        },
        `Video Upload - ${videoType}`,
        "success"
    );
};

// ═══════════════════════════════════════════════════════════════
// 📝 CONTENT LOGGING HELPERS
// ═══════════════════════════════════════════════════════════════

export const logContentCreate = async (
    contentType: "event" | "movie" | "webseries" | "shortfilm" | "banner",
    contentId: string,
    title: string,
    additionalDetails: any = {}
) => {
    const actionMap = {
        event: "event_created" as SystemLogAction,
        movie: "movie_created" as SystemLogAction,
        webseries: "webseries_created" as SystemLogAction,
        shortfilm: "shortfilm_created" as SystemLogAction,
        banner: "banner_created" as SystemLogAction,
    };

    await logSystemActivity(
        actionMap[contentType],
        `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Management`,
        {
            contentId,
            title,
            contentType,
            ...additionalDetails,
        },
        "Content Creation",
        "success"
    );
};

export const logContentUpdate = async (
    contentType: "event" | "movie" | "webseries" | "shortfilm" | "banner",
    contentId: string,
    title: string,
    changes: any = {},
    additionalDetails: any = {}
) => {
    const actionMap = {
        event: "event_updated" as SystemLogAction,
        movie: "movie_updated" as SystemLogAction,
        webseries: "webseries_updated" as SystemLogAction,
        shortfilm: "shortfilm_updated" as SystemLogAction,
        banner: "banner_updated" as SystemLogAction,
    };

    await logSystemActivity(
        actionMap[contentType],
        `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Management`,
        {
            contentId,
            title,
            contentType,
            changes,
            ...additionalDetails,
        },
        "Content Update",
        "success"
    );
};

// ═══════════════════════════════════════════════════════════════
// 👥 CAST & CREW LOGGING
// ═══════════════════════════════════════════════════════════════

export const logCastCrewAction = async (
    action: "cast_added" | "cast_updated" | "cast_deleted" | "crew_added" | "crew_updated" | "crew_deleted",
    module: string,
    memberName: string,
    additionalDetails: any = {}
) => {
    await logSystemActivity(
        action,
        module,
        {
            memberName,
            ...additionalDetails,
        },
        "Cast & Crew Management",
        "success"
    );
};

// ═══════════════════════════════════════════════════════════════
// ❌ ERROR LOGGING
// ═══════════════════════════════════════════════════════════════

export const logError = async (
    module: string,
    errorMessage: string,
    errorDetails: any = {}
) => {
    await logSystemActivity(
        "notification_create_failed", // Use existing error action or add new one
        module,
        {
            errorMessage,
            errorStack: errorDetails.stack,
            errorCode: errorDetails.code,
            ...errorDetails,
        },
        "Error",
        "error"
    );
};

export const logNotificationSend = async (
    notificationId: string,
    title: string,
    target: string,
    recipientCount: number,
    notificationType: string,
    priority: string,
    additionalDetails: any = {}
) => {
    await logSystemActivity(
        "notification_sent",
        "Notifications",
        {
            notificationId,
            title,
            target,
            recipientCount,
            notificationType,
            priority,
            ...additionalDetails,
        },
        "Notification Management",
        "success"
    );
};

export const logNotificationRead = async (
    notificationId: string,
    userId: string,
    title?: string,
    additionalDetails: any = {}
) => {
    await logSystemActivity(
        "notification_read",
        "Notifications",
        {
            notificationId,
            userId,
            title,
            ...additionalDetails,
        },
        "Notification Management",
        "success"
    );
};

export const logNotificationDelete = async (
    notificationId: string,
    title?: string,
    additionalDetails: any = {}
) => {
    await logSystemActivity(
        "notification_deleted",
        "Notifications",
        {
            notificationId,
            title,
            ...additionalDetails,
        },
        "Notification Management",
        "success"
    );
};

export const logTemplateCreate = async (
    templateId: string,
    templateName: string,
    additionalDetails: any = {}
) => {
    await logSystemActivity(
        "notification_template_created",
        "Notifications",
        {
            templateId,
            templateName,
            ...additionalDetails,
        },
        "Template Management",
        "success"
    );
};

export const logTemplateUpdate = async (
    templateId: string,
    templateName: string,
    additionalDetails: any = {}
) => {
    await logSystemActivity(
        "notification_template_updated",
        "Notifications",
        {
            templateId,
            templateName,
            ...additionalDetails,
        },
        "Template Management",
        "success"
    );
};

export const logTemplateDelete = async (
    templateId: string,
    templateName?: string,
    additionalDetails: any = {}
) => {
    await logSystemActivity(
        "notification_template_deleted",
        "Notifications",
        {
            templateId,
            templateName,
            ...additionalDetails,
        },
        "Template Management",
        "success"
    );
};
