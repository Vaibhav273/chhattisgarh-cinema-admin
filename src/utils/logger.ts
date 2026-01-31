import { logSystemActivity } from "./systemLogger";
import {
    logImageUpload as activityLogImageUpload,
    logImageDelete as activityLogImageDelete,
    logGalleryAdd as activityLogGalleryAdd,
    logGalleryRemove as activityLogGalleryRemove,
    logVideoUpload as activityLogVideoUpload,
    logContentCreate as activityLogContentCreate,
    logContentUpdate as activityLogContentUpdate,
    logCastAdd as activityLogCastAdd,
    logCrewAdd as activityLogCrewAdd,
    logEpisodeAdd as activityLogEpisodeAdd,
    logError as activityLogError,
    logNotificationSend as activityLogNotificationSend,
    logNotificationRead as activityLogNotificationRead,
    logNotificationDelete as activityLogNotificationDelete,
    logTemplateCreate as activityLogTemplateCreate,
    logTemplateUpdate as activityLogTemplateUpdate,
    logTemplateDelete as activityLogTemplateDelete,
} from "./activityLogger";
import type { SystemLogAction } from "../types/systemLog";

// ═══════════════════════════════════════════════════════════════
// 🖼️ IMAGE LOGGING (Logs to BOTH collections)
// ═══════════════════════════════════════════════════════════════

export const logImageUpload = async (
    url: string,
    cdnUrl: string,
    module: string,
    imageType: string,
    additionalDetails: any = {}
) => {
    const fileName = url.split("/").pop() || "unknown";

    // 🔥 Log to systemLogs
    await logSystemActivity(
        "image_uploaded",
        module,
        {
            url,
            cdnUrl,
            imageType,
            fileName,
            ...additionalDetails,
        },
        `Image Upload - ${imageType}`,
        "success"
    );

    // 🔥 Log to activityLogs
    await activityLogImageUpload(url, cdnUrl, module, imageType, additionalDetails);
};

export const logImageDelete = async (
    url: string,
    module: string,
    imageType: string,
    additionalDetails: any = {}
) => {
    const fileName = url.split("/").pop() || "unknown";

    // 🔥 Log to systemLogs
    await logSystemActivity(
        "image_deleted",
        module,
        {
            url,
            imageType,
            fileName,
            ...additionalDetails,
        },
        `Image Delete - ${imageType}`,
        "success"
    );

    // 🔥 Log to activityLogs
    await activityLogImageDelete(url, module, imageType, additionalDetails);
};

export const logGalleryAdd = async (
    images: { url: string; cdnUrl: string }[],
    module: string,
    totalImages: number,
    additionalDetails: any = {}
) => {
    // 🔥 Log to systemLogs
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

    // 🔥 Log to activityLogs
    await activityLogGalleryAdd(images, module, totalImages, additionalDetails);
};

export const logGalleryRemove = async (
    url: string,
    index: number,
    module: string,
    remainingImages: number,
    additionalDetails: any = {}
) => {
    // 🔥 Log to systemLogs
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

    // 🔥 Log to activityLogs
    await activityLogGalleryRemove(url, index, module, remainingImages, additionalDetails);
};

// ═══════════════════════════════════════════════════════════════
// 📹 VIDEO LOGGING (Logs to BOTH collections)
// ═══════════════════════════════════════════════════════════════

export const logVideoUpload = async (
    url: string,
    cdnUrl: string,
    module: string,
    videoType: string,
    metadata: any = {},
    additionalDetails: any = {}
) => {
    const fileName = url.split("/").pop() || "unknown";

    // 🔥 Log to systemLogs
    await logSystemActivity(
        "video_uploaded",
        module,
        {
            url,
            cdnUrl,
            videoType,
            fileName,
            metadata,
            ...additionalDetails,
        },
        `Video Upload - ${videoType}`,
        "success"
    );

    // 🔥 Log to activityLogs
    await activityLogVideoUpload(url, cdnUrl, module, videoType, metadata, additionalDetails);
};

// ═══════════════════════════════════════════════════════════════
// 📝 CONTENT LOGGING (Logs to BOTH collections)
// ═══════════════════════════════════════════════════════════════

export const logContentCreate = async (
    contentType: "event" | "movie" | "webseries" | "shortfilm" | "banner",
    contentId: string,
    title: string,
    module: string,
    additionalDetails: any = {}
) => {
    const actionMap = {
        event: "event_created" as SystemLogAction,
        movie: "movie_created" as SystemLogAction,
        webseries: "webseries_created" as SystemLogAction,
        shortfilm: "shortfilm_created" as SystemLogAction,
        banner: "banner_created" as SystemLogAction,
    };

    // 🔥 Log to systemLogs
    await logSystemActivity(
        actionMap[contentType],
        module,
        {
            contentId,
            title,
            contentType,
            ...additionalDetails,
        },
        "Content Creation",
        "success"
    );

    // 🔥 Log to activityLogs
    await activityLogContentCreate(contentType, contentId, title, module, additionalDetails);
};

export const logContentUpdate = async (
    contentType: "event" | "movie" | "webseries" | "shortfilm" | "banner",
    contentId: string,
    title: string,
    module: string,
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

    // 🔥 Log to systemLogs
    await logSystemActivity(
        actionMap[contentType],
        module,
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

    // 🔥 Log to activityLogs
    await activityLogContentUpdate(contentType, contentId, title, module, changes, additionalDetails);
};

// ═══════════════════════════════════════════════════════════════
// 👥 CAST & CREW LOGGING (Logs to BOTH collections)
// ═══════════════════════════════════════════════════════════════

export const logCastAdd = async (
    name: string,
    role: string,
    module: string,
    additionalDetails: any = {}
) => {
    // 🔥 Log to systemLogs
    await logSystemActivity(
        "cast_added",
        module,
        {
            memberName: name,
            role,
            ...additionalDetails,
        },
        "Cast & Crew Management",
        "success"
    );

    // 🔥 Log to activityLogs
    await activityLogCastAdd(name, role, module, additionalDetails);
};

export const logCrewAdd = async (
    name: string,
    role: string,
    module: string,
    additionalDetails: any = {}
) => {
    // 🔥 Log to systemLogs
    await logSystemActivity(
        "crew_added",
        module,
        {
            memberName: name,
            role,
            ...additionalDetails,
        },
        "Cast & Crew Management",
        "success"
    );

    // 🔥 Log to activityLogs
    await activityLogCrewAdd(name, role, module, additionalDetails);
};

// ═══════════════════════════════════════════════════════════════
// 📺 EPISODE LOGGING (Logs to BOTH collections)
// ═══════════════════════════════════════════════════════════════

export const logEpisodeAdd = async (
    seasonNumber: number,
    episodeNumber: number,
    title: string,
    module: string,
    additionalDetails: any = {}
) => {
    // 🔥 Log to systemLogs
    await logSystemActivity(
        "episode_added",
        module,
        {
            seasonNumber,
            episodeNumber,
            title,
            ...additionalDetails,
        },
        "Episode Management",
        "success"
    );

    // 🔥 Log to activityLogs
    await activityLogEpisodeAdd(seasonNumber, episodeNumber, title, module, additionalDetails);
};

// ═══════════════════════════════════════════════════════════════
// 🔔 NOTIFICATION LOGGING (Logs to BOTH collections)
// ═══════════════════════════════════════════════════════════════

export const logNotificationSend = async (
    notificationId: string,
    title: string,
    target: string,
    recipientCount: number,
    notificationType: string,
    priority: string,
    additionalDetails: any = {}
) => {
    // 🔥 Log to systemLogs
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

    // 🔥 Log to activityLogs
    await activityLogNotificationSend(
        notificationId,
        title,
        target,
        recipientCount,
        notificationType,
        priority,
        "Notifications",
        additionalDetails
    );
};

export const logNotificationRead = async (
    notificationId: string,
    userId: string,
    title?: string,
    additionalDetails: any = {}
) => {
    // 🔥 Log to systemLogs
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

    // 🔥 Log to activityLogs
    await activityLogNotificationRead(notificationId, userId, title, "Notifications", additionalDetails);
};

export const logNotificationDelete = async (
    notificationId: string,
    title?: string,
    additionalDetails: any = {}
) => {
    // 🔥 Log to systemLogs
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

    // 🔥 Log to activityLogs
    await activityLogNotificationDelete(notificationId, title, "Notifications", additionalDetails);
};

export const logTemplateCreate = async (
    templateId: string,
    templateName: string,
    additionalDetails: any = {}
) => {
    // 🔥 Log to systemLogs
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

    // 🔥 Log to activityLogs
    await activityLogTemplateCreate(templateId, templateName, "Notifications", additionalDetails);
};

export const logTemplateUpdate = async (
    templateId: string,
    templateName: string,
    additionalDetails: any = {}
) => {
    // 🔥 Log to systemLogs
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

    // 🔥 Log to activityLogs
    await activityLogTemplateUpdate(templateId, templateName, "Notifications", additionalDetails);
};

export const logTemplateDelete = async (
    templateId: string,
    templateName?: string,
    additionalDetails: any = {}
) => {
    // 🔥 Log to systemLogs
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

    // 🔥 Log to activityLogs
    await activityLogTemplateDelete(templateId, templateName, "Notifications", additionalDetails);
};

// ═══════════════════════════════════════════════════════════════
// ❌ ERROR LOGGING (Logs to BOTH collections)
// ═══════════════════════════════════════════════════════════════

export const logError = async (
    module: string,
    errorMessage: string,
    errorDetails: any = {}
) => {
    // 🔥 Log to systemLogs
    await logSystemActivity(
        "notification_create_failed",
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

    // 🔥 Log to activityLogs
    await activityLogError(module, errorMessage, errorDetails);
};
