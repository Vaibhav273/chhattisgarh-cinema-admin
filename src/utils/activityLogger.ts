// ═══════════════════════════════════════════════════════════════
// 📝 ACTIVITY LOGGER - PRODUCTION READY v2.0
// ═══════════════════════════════════════════════════════════════

import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import type { User as FirebaseUser } from 'firebase/auth';

// ═══════════════════════════════════════════════════════════════
// 📊 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

interface ActivityLog {
  action: string;
  description: string;
  module: string;
  performedBy: {
    uid: string;
    email: string;
    displayName: string;
    role?: string;
  };
  timestamp: any;
  metadata?: Record<string, any>;
}

interface LogActivityEnhancedParams {
  level: 'info' | 'warning' | 'error' | 'success';
  module: string;
  subModule?: string;
  action?: string;
  message: string;
  performedBy?: {
    uid: string;
    email: string;
    name: string;
    role?: string;
  };
  details?: any;
  status?: 'success' | 'failed' | 'pending';
}

// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Get current user from localStorage/auth
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

// Get browser info
const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let browser = "Unknown";

  if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";

  return { browser, userAgent };
};

// ═══════════════════════════════════════════════════════════════
// 🔧 BASE LOGGING FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Main Activity Logger - Simple Version
 * Logs to both activityLogs and console
 */
export const logActivity = async (
  action: string,
  module: string,
  description: string,
  details: any = {},
  status: "success" | "error" | "warning" = "success"
) => {
  try {
    const user = getCurrentUser();
    const browserInfo = getBrowserInfo();
    const timestamp = new Date();

    // Create activity log
    const activityLog = {
      // Action Info
      action,
      module,
      description,
      status,

      // User Info
      performedBy: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
      },

      // Details
      details: {
        ...details,
        timestamp: timestamp.toISOString(),
        date: timestamp.toLocaleDateString(),
        time: timestamp.toLocaleTimeString(),
      },

      // System Info
      browser: browserInfo.browser,
      userAgent: browserInfo.userAgent,

      // Timestamps
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    // Console log with emoji for better visibility
    const emoji = status === "success" ? "✅" : status === "error" ? "❌" : "⚠️";
    console.log(`${emoji} [${module}] ${action}:`, {
      user: user.email,
      description,
      details,
      time: timestamp.toLocaleTimeString(),
    });

    // Detailed console table
    console.table({
      "🎯 Action": action,
      "📦 Module": module,
      "👤 User": user.email,
      "📝 Description": description,
      "✅ Status": status,
      "⏰ Time": timestamp.toLocaleTimeString(),
    });

    // Save to Firestore (activityLogs collection)
    await addDoc(collection(db, "activityLogs"), activityLog);

    console.log("💾 Activity logged to Firestore");
  } catch (error) {
    console.error("❌ Failed to log activity:", error);
  }
};

/**
 * Enhanced Activity Logger - Full Featured Version
 * Logs to systemLogs collection with detailed structure
 */
export const logActivityEnhanced = async (
  params: LogActivityEnhancedParams
): Promise<void> => {
  try {
    const browserInfo = getBrowserInfo();

    await addDoc(collection(db, 'systemLogs'), {
      timestamp: serverTimestamp(),
      level: params.level,
      module: params.module,
      subModule: params.subModule || null,
      action: params.action || null,
      message: params.message,
      performedBy: params.performedBy || null,
      status: params.status || null,
      details: params.details || null,
      browser: browserInfo.browser,
      userAgent: browserInfo.userAgent,
    });

    console.log(`✅ [${params.level.toUpperCase()}] ${params.message}`);
  } catch (error) {
    console.error('❌ Failed to log enhanced activity:', error);
  }
};

/**
 * System Event Logger
 * For automated system events
 */
export const logSystemEvent = async (
  action: string,
  description: string,
  module: string,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    const user = auth.currentUser;

    const activityLog: ActivityLog = {
      action,
      description,
      module,
      performedBy: user ? {
        uid: user.uid,
        email: user.email || 'unknown',
        displayName: user.displayName || 'System',
        role: 'system',
      } : {
        uid: 'system',
        email: 'system@automated',
        displayName: 'System',
        role: 'system',
      },
      timestamp: Timestamp.now(),
      metadata: metadata || {},
    };

    await addDoc(collection(db, 'activityLogs'), activityLog);
    console.log('✅ System event logged:', action);
  } catch (error) {
    console.error('❌ Error logging system event:', error);
  }
};

// ═══════════════════════════════════════════════════════════════
// 🖼️ IMAGE ACTIVITIES
// ═══════════════════════════════════════════════════════════════

export const logImageUpload = async (
  url: string,
  cdnUrl: string,
  module: string,
  imageType: string,
  additionalDetails: any = {}
) => {
  const fileName = url.split("/").pop() || "unknown";

  await logActivity(
    "IMAGE_UPLOAD",
    module,
    `Uploaded ${imageType} image: ${fileName}`,
    {
      imageType,
      url,
      cdnUrl,
      fileName,
      uploadTime: new Date().toISOString(),
      ...additionalDetails,
    },
    "success"
  );
};

export const logImageDelete = async (
  url: string,
  module: string,
  imageType: string,
  additionalDetails: any = {}
) => {
  const fileName = url.split("/").pop() || "unknown";

  await logActivity(
    "IMAGE_DELETE",
    module,
    `Deleted ${imageType} image: ${fileName}`,
    {
      imageType,
      url,
      fileName,
      deleteTime: new Date().toISOString(),
      ...additionalDetails,
    },
    "success"
  );
};

export const logGalleryAdd = async (
  images: { url: string; cdnUrl: string }[],
  module: string,
  totalImages: number,
  additionalDetails: any = {}
) => {
  await logActivity(
    "GALLERY_ADD",
    module,
    `Added ${images.length} image(s) to gallery. Total: ${totalImages}`,
    {
      imagesAdded: images.length,
      totalGalleryImages: totalImages,
      imageDetails: images.map((img, idx) => ({
        index: idx,
        url: img.url,
        cdnUrl: img.cdnUrl,
        fileName: img.url.split("/").pop(),
      })),
      ...additionalDetails,
    },
    "success"
  );
};

export const logGalleryRemove = async (
  url: string,
  index: number,
  module: string,
  remainingImages: number,
  additionalDetails: any = {}
) => {
  const fileName = url.split("/").pop() || "unknown";

  await logActivity(
    "GALLERY_REMOVE",
    module,
    `Removed image from gallery (Index: ${index}). Remaining: ${remainingImages}`,
    {
      url,
      fileName,
      index,
      remainingImages,
      ...additionalDetails,
    },
    "success"
  );
};

// ═══════════════════════════════════════════════════════════════
// 📹 VIDEO ACTIVITIES
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

  await logActivity(
    "VIDEO_UPLOAD",
    module,
    `Uploaded ${videoType} video: ${fileName}`,
    {
      videoType,
      url,
      cdnUrl,
      fileName,
      metadata,
      uploadTime: new Date().toISOString(),
      ...additionalDetails,
    },
    "success"
  );
};

export const logVideoDelete = async (
  url: string,
  module: string,
  videoType: string,
  additionalDetails: any = {}
) => {
  const fileName = url.split("/").pop() || "unknown";

  await logActivity(
    "VIDEO_DELETE",
    module,
    `Deleted ${videoType} video: ${fileName}`,
    {
      videoType,
      url,
      fileName,
      ...additionalDetails,
    },
    "success"
  );
};

// ═══════════════════════════════════════════════════════════════
// 📝 CONTENT ACTIVITIES (Create, Update, Delete)
// ═══════════════════════════════════════════════════════════════

export const logContentCreate = async (
  contentType: string,
  contentId: string,
  title: string,
  module: string,
  additionalDetails: any = {}
) => {
  await logActivity(
    "CONTENT_CREATE",
    module,
    `Created new ${contentType}: "${title}"`,
    {
      contentType,
      contentId,
      title,
      createdTime: new Date().toISOString(),
      ...additionalDetails,
    },
    "success"
  );
};

export const logContentUpdate = async (
  contentType: string,
  contentId: string,
  title: string,
  module: string,
  changes: any = {},
  additionalDetails: any = {}
) => {
  await logActivity(
    "CONTENT_UPDATE",
    module,
    `Updated ${contentType}: "${title}"`,
    {
      contentType,
      contentId,
      title,
      changes,
      updatedTime: new Date().toISOString(),
      ...additionalDetails,
    },
    "success"
  );
};

export const logContentDelete = async (
  contentType: string,
  contentId: string,
  title: string,
  module: string,
  additionalDetails: any = {}
) => {
  await logActivity(
    "CONTENT_DELETE",
    module,
    `Deleted ${contentType}: "${title}"`,
    {
      contentType,
      contentId,
      title,
      deletedTime: new Date().toISOString(),
      ...additionalDetails,
    },
    "warning"
  );
};

// ═══════════════════════════════════════════════════════════════
// ✅ CONTENT APPROVAL & REJECTION
// ═══════════════════════════════════════════════════════════════

export const logContentApproval = async (
  contentType: string,
  contentId: string,
  contentTitle: string,
  module: string,
  additionalDetails: any = {}
) => {
  await logActivity(
    "CONTENT_APPROVE",
    module,
    `Approved ${contentType}: "${contentTitle}"`,
    {
      contentType,
      contentId,
      contentTitle,
      approvalStatus: "approved",
      approvedTime: new Date().toISOString(),
      approvedBy: additionalDetails.approvedBy || "Admin",
      notes: additionalDetails.notes || "",
      genre: additionalDetails.genre,
      language: additionalDetails.language,
      isPremium: additionalDetails.isPremium,
      ...additionalDetails,
    },
    "success"
  );
};

export const logContentRejection = async (
  contentType: string,
  contentId: string,
  contentTitle: string,
  module: string,
  rejectionReason: string,
  additionalDetails: any = {}
) => {
  await logActivity(
    "CONTENT_REJECT",
    module,
    `Rejected ${contentType}: "${contentTitle}"`,
    {
      contentType,
      contentId,
      contentTitle,
      approvalStatus: "rejected",
      rejectionReason,
      rejectedTime: new Date().toISOString(),
      rejectedBy: additionalDetails.rejectedBy || "Admin",
      genre: additionalDetails.genre,
      language: additionalDetails.language,
      isPremium: additionalDetails.isPremium,
      ...additionalDetails,
    },
    "warning"
  );
};

// ═══════════════════════════════════════════════════════════════
// 👥 CAST & CREW ACTIVITIES
// ═══════════════════════════════════════════════════════════════

export const logCastAdd = async (
  name: string,
  role: string,
  module: string,
  additionalDetails: any = {}
) => {
  await logActivity(
    "CAST_ADD",
    module,
    `Added cast member: ${name} (${role})`,
    {
      name,
      role,
      ...additionalDetails,
    },
    "success"
  );
};

export const logCastUpdate = async (
  name: string,
  role: string,
  module: string,
  additionalDetails: any = {}
) => {
  await logActivity(
    "CAST_UPDATE",
    module,
    `Updated cast member: ${name} (${role})`,
    {
      name,
      role,
      ...additionalDetails,
    },
    "success"
  );
};

export const logCastDelete = async (
  name: string,
  role: string,
  module: string,
  additionalDetails: any = {}
) => {
  await logActivity(
    "CAST_DELETE",
    module,
    `Removed cast member: ${name} (${role})`,
    {
      name,
      role,
      ...additionalDetails,
    },
    "warning"
  );
};

export const logCrewAdd = async (
  name: string,
  role: string,
  module: string,
  additionalDetails: any = {}
) => {
  await logActivity(
    "CREW_ADD",
    module,
    `Added crew member: ${name} (${role})`,
    {
      name,
      role,
      ...additionalDetails,
    },
    "success"
  );
};

export const logCrewUpdate = async (
  name: string,
  role: string,
  module: string,
  additionalDetails: any = {}
) => {
  await logActivity(
    "CREW_UPDATE",
    module,
    `Updated crew member: ${name} (${role})`,
    {
      name,
      role,
      ...additionalDetails,
    },
    "success"
  );
};

export const logCrewDelete = async (
  name: string,
  role: string,
  module: string,
  additionalDetails: any = {}
) => {
  await logActivity(
    "CREW_DELETE",
    module,
    `Removed crew member: ${name} (${role})`,
    {
      name,
      role,
      ...additionalDetails,
    },
    "warning"
  );
};

// ═══════════════════════════════════════════════════════════════
// 📺 EPISODE ACTIVITIES (Web Series)
// ═══════════════════════════════════════════════════════════════

export const logEpisodeAdd = async (
  seasonNumber: number,
  episodeNumber: number,
  title: string,
  module: string,
  additionalDetails: any = {}
) => {
  await logActivity(
    "EPISODE_ADD",
    module,
    `Added Episode ${episodeNumber} to Season ${seasonNumber}: "${title}"`,
    {
      seasonNumber,
      episodeNumber,
      title,
      ...additionalDetails,
    },
    "success"
  );
};

export const logEpisodeUpdate = async (
  seasonNumber: number,
  episodeNumber: number,
  title: string,
  module: string,
  additionalDetails: any = {}
) => {
  await logActivity(
    "EPISODE_UPDATE",
    module,
    `Updated Episode ${episodeNumber} of Season ${seasonNumber}: "${title}"`,
    {
      seasonNumber,
      episodeNumber,
      title,
      ...additionalDetails,
    },
    "success"
  );
};

export const logEpisodeDelete = async (
  seasonNumber: number,
  episodeNumber: number,
  title: string,
  module: string,
  additionalDetails: any = {}
) => {
  await logActivity(
    "EPISODE_DELETE",
    module,
    `Deleted Episode ${episodeNumber} from Season ${seasonNumber}: "${title}"`,
    {
      seasonNumber,
      episodeNumber,
      title,
      ...additionalDetails,
    },
    "warning"
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
  await logActivity(
    "ERROR",
    module,
    `Error occurred: ${errorMessage}`,
    {
      errorMessage,
      errorStack: errorDetails.stack,
      errorCode: errorDetails.code,
      errorName: errorDetails.name,
      ...errorDetails,
    },
    "error"
  );
};

// ═══════════════════════════════════════════════════════════════
// 🔐 AUTH ACTIVITIES
// ═══════════════════════════════════════════════════════════════

export const logLogin = async (
  email: string,
  role: string,
  additionalDetails: any = {}
) => {
  await logActivity(
    "LOGIN",
    "Authentication",
    `User logged in: ${email}`,
    {
      email,
      role,
      loginTime: new Date().toISOString(),
      ...additionalDetails,
    },
    "success"
  );
};

export const logLogout = async (email: string) => {
  await logActivity(
    "LOGOUT",
    "Authentication",
    `User logged out: ${email}`,
    {
      email,
      logoutTime: new Date().toISOString(),
    },
    "success"
  );
};

// ═══════════════════════════════════════════════════════════════
// 🔔 NOTIFICATION ACTIVITIES
// ═══════════════════════════════════════════════════════════════

export const logNotificationSend = async (
  notificationId: string,
  title: string,
  target: string,
  recipientCount: number,
  notificationType: string,
  priority: string,
  module: string = "Notifications",
  additionalDetails: any = {}
) => {
  await logActivity(
    "NOTIFICATION_SEND",
    module,
    `Sent notification to ${target} (${recipientCount} recipients): "${title}"`,
    {
      notificationId,
      title,
      target,
      recipientCount,
      notificationType,
      priority,
      sentTime: new Date().toISOString(),
      ...additionalDetails,
    },
    "success"
  );
};

export const logNotificationRead = async (
  notificationId: string,
  userId: string,
  title?: string,
  module: string = "Notifications",
  additionalDetails: any = {}
) => {
  await logActivity(
    "NOTIFICATION_READ",
    module,
    `Notification marked as read by user: ${userId}${title ? ` - "${title}"` : ''}`,
    {
      notificationId,
      userId,
      title,
      readTime: new Date().toISOString(),
      ...additionalDetails,
    },
    "success"
  );
};

export const logNotificationDelete = async (
  notificationId: string,
  title?: string,
  module: string = "Notifications",
  additionalDetails: any = {}
) => {
  await logActivity(
    "NOTIFICATION_DELETE",
    module,
    `Deleted notification${title ? `: "${title}"` : ''}`,
    {
      notificationId,
      title,
      deleteTime: new Date().toISOString(),
      ...additionalDetails,
    },
    "warning"
  );
};

export const logTemplateCreate = async (
  templateId: string,
  templateName: string,
  module: string = "Notifications",
  additionalDetails: any = {}
) => {
  await logActivity(
    "TEMPLATE_CREATE",
    module,
    `Created notification template: "${templateName}"`,
    {
      templateId,
      templateName,
      ...additionalDetails,
    },
    "success"
  );
};

export const logTemplateUpdate = async (
  templateId: string,
  templateName: string,
  module: string = "Notifications",
  additionalDetails: any = {}
) => {
  await logActivity(
    "TEMPLATE_UPDATE",
    module,
    `Updated notification template: "${templateName}"`,
    {
      templateId,
      templateName,
      ...additionalDetails,
    },
    "success"
  );
};

export const logTemplateDelete = async (
  templateId: string,
  templateName?: string,
  module: string = "Notifications",
  additionalDetails: any = {}
) => {
  await logActivity(
    "TEMPLATE_DELETE",
    module,
    `Deleted notification template${templateName ? `: "${templateName}"` : ''}`,
    {
      templateId,
      templateName,
      ...additionalDetails,
    },
    "warning"
  );
};

// ═══════════════════════════════════════════════════════════════
// 🎯 MARKETING & PROMOTIONS
// ═══════════════════════════════════════════════════════════════

export const logBannerAction = async (
  action: "create" | "update" | "delete" | "activate" | "deactivate",
  bannerId: string,
  bannerTitle: string,
  additionalInfo?: Record<string, any>
): Promise<void> => {
  const actionText =
    action === "create"
      ? "Created"
      : action === "update"
        ? "Updated"
        : action === "delete"
          ? "Deleted"
          : action === "activate"
            ? "Activated"
            : "Deactivated";

  await logActivity(
    "banner_action",
    `${actionText} banner: ${bannerTitle}`,
    "Marketing",
    {
      action,
      bannerId,
      bannerTitle,
      ...additionalInfo,
    }
  );
};

export const logPromotionAction = async (
  action: "create" | "update" | "delete" | "activate" | "deactivate",
  promotionId: string,
  promoCode: string,
  additionalInfo?: Record<string, any>
): Promise<void> => {
  const actionText =
    action === "create"
      ? "Created"
      : action === "update"
        ? "Updated"
        : action === "delete"
          ? "Deleted"
          : action === "activate"
            ? "Activated"
            : "Deactivated";

  await logActivity(
    "promotion_action",
    `${actionText} promo code: ${promoCode}`,
    "Marketing",
    {
      action,
      promotionId,
      promoCode,
      ...additionalInfo,
    }
  );
};

// ═══════════════════════════════════════════════════════════════
// 👤 USER & ADMIN MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export const logUserModerationAction = async (
  action: "ban" | "unban" | "warn" | "suspend" | "unsuspend",
  userId: string,
  userName: string,
  additionalInfo?: Record<string, any>
): Promise<void> => {
  const actionText =
    action === "ban"
      ? "Banned"
      : action === "unban"
        ? "Unbanned"
        : action === "warn"
          ? "Warned"
          : action === "suspend"
            ? "Suspended"
            : "Unsuspended";

  await logActivity(
    "user_moderation",
    `${actionText} user: ${userName}`,
    "User Management",
    {
      action,
      userId,
      userName,
      ...additionalInfo,
    }
  );
};

export const logUserManagementAction = async (
  action: string,
  status: 'success' | 'failed' | 'pending',
  message: string,
  currentUser: FirebaseUser | null,
  details?: Record<string, any>
): Promise<void> => {
  await logActivityEnhanced({
    level: status === 'success' ? 'success' : status === 'failed' ? 'error' : 'warning',
    module: 'User Management',
    action,
    message,
    performedBy: currentUser ? {
      uid: currentUser.uid,
      email: currentUser.email || 'Unknown',
      name: currentUser.displayName || currentUser.email || 'Unknown',
    } : undefined,
    status,
    details,
  });
};

export const logAdminManagementAction = async (
  action: string,
  status: 'success' | 'failed' | 'pending',
  message: string,
  currentUser: FirebaseUser | null,
  details?: Record<string, any>
): Promise<void> => {
  await logActivityEnhanced({
    level: status === 'success'
      ? (action.includes('delete') || action.includes('suspend') ? 'warning' : 'success')
      : status === 'failed' ? 'error' : 'warning',
    module: 'Admin Management',
    subModule: 'Team Management',
    action,
    message,
    performedBy: currentUser ? {
      uid: currentUser.uid,
      email: currentUser.email || 'Unknown',
      name: currentUser.displayName || currentUser.email || 'Unknown',
    } : undefined,
    status,
    details,
  });
};

// ═══════════════════════════════════════════════════════════════
// 💬 MODERATION ACTIVITIES
// ═══════════════════════════════════════════════════════════════

export const logCommentModerationAction = async (
  action: "approve" | "reject" | "delete",
  commentId: string,
  userName: string,
  additionalInfo?: Record<string, any>
): Promise<void> => {
  const actionText =
    action === "approve"
      ? "Approved"
      : action === "reject"
        ? "Rejected"
        : "Deleted";

  await logActivity(
    "comment_moderation",
    `${actionText} comment by ${userName}`,
    "Content Moderation",
    {
      action,
      commentId,
      userName,
      ...additionalInfo,
    }
  );
};

export const logReportAction = async (
  action: "resolve" | "dismiss" | "delete",
  reportId: string,
  contentTitle: string,
  additionalInfo?: Record<string, any>
): Promise<void> => {
  const actionText =
    action === "resolve"
      ? "Resolved"
      : action === "dismiss"
        ? "Dismissed"
        : "Deleted";

  await logActivity(
    "report_management",
    `${actionText} report for: ${contentTitle}`,
    "Content Moderation",
    {
      action,
      reportId,
      contentTitle,
      ...additionalInfo,
    }
  );
};

// ═══════════════════════════════════════════════════════════════
// 🔔 NOTIFICATION ACTIONS (Specialized)
// ═══════════════════════════════════════════════════════════════

export const logNotificationAction = async (
  action: string,
  status: 'success' | 'failed' | 'pending',
  message: string,
  currentUser: FirebaseUser | null,
  details?: Record<string, any>
): Promise<void> => {
  await logActivityEnhanced({
    level: status === 'success' ? 'info' : status === 'failed' ? 'error' : 'warning',
    module: 'Notifications',
    subModule: 'User Interactions',
    action,
    message,
    performedBy: currentUser ? {
      uid: currentUser.uid,
      email: currentUser.email || 'Unknown',
      name: currentUser.displayName || currentUser.email || 'Unknown',
    } : undefined,
    status,
    details,
  });
};


export const logNotificationTemplateAction = async (
  action: "create" | "update" | "delete" | "activate" | "deactivate",
  templateId: string,
  templateName: string,
  additionalInfo?: Record<string, any>
): Promise<void> => {
  const actionText =
    action === "create"
      ? "Created"
      : action === "update"
        ? "Updated"
        : action === "delete"
          ? "Deleted"
          : action === "activate"
            ? "Activated"
            : "Deactivated";

  await logActivity(
    "notification_template",
    `${actionText} template: ${templateName}`,
    "Notifications",
    {
      action,
      templateId,
      templateName,
      ...additionalInfo,
    }
  );
};

// ═══════════════════════════════════════════════════════════════
// ⚙️ SYSTEM & SETTINGS
// ═══════════════════════════════════════════════════════════════

export const logSettingsAction = async (
  action: "update" | "reset",
  settingsType: "general" | "seo" | "security" | "payment" | "storage",
  additionalInfo?: Record<string, any>
): Promise<void> => {
  await logActivity(
    "platform_settings",
    `${action === "update" ? "Updated" : "Reset"} ${settingsType} settings`,
    "System",
    {
      action,
      settingsType,
      ...additionalInfo,
    }
  );
};

export const logProfileAction = async (
  action: "update_profile" | "change_password" | "update_avatar",
  additionalInfo?: Record<string, any>
): Promise<void> => {
  const actionText =
    action === "update_profile"
      ? "Updated profile information"
      : action === "change_password"
        ? "Changed password"
        : "Updated avatar";

  await logActivity(
    "profile",
    actionText,
    "Account",
    {
      action,
      ...additionalInfo,
    }
  );
};

export const logAPIAction = async (
  action: "create" | "update" | "delete",
  itemType: "api_key" | "api_config" | "webhook_config",
  itemName: string,
  additionalInfo?: Record<string, any>
): Promise<void> => {
  const actionText =
    action === "create"
      ? `Generated ${itemType === "api_key" ? "API key" : "configuration"}: ${itemName}`
      : action === "update"
        ? `Updated ${itemType.replace("_", " ")}`
        : `Revoked API key: ${itemName}`;

  await logActivity(
    "api_management",
    actionText,
    "System",
    {
      action,
      itemType,
      itemName,
      ...additionalInfo,
    }
  );
};

export const logCDNAction = async (
  action: "update_config" | "test_connection" | "purge_cache" | "toggle_region",
  additionalInfo?: Record<string, any>
): Promise<void> => {
  const actionText =
    action === "update_config"
      ? "Updated CDN configuration"
      : action === "test_connection"
        ? "Tested CDN connection"
        : action === "purge_cache"
          ? "Purged CDN cache"
          : "Toggled CDN region";

  await logActivity(
    "cdn_management",
    actionText,
    "System",
    {
      action,
      ...additionalInfo,
    }
  );
};

export const logEncodingAction = async (
  action: "update_config" | "test_encoding" | "start_batch" | "stop_batch",
  additionalInfo?: Record<string, any>
): Promise<void> => {
  const actionText =
    action === "update_config"
      ? "Updated video encoding configuration"
      : action === "test_encoding"
        ? "Tested encoding configuration"
        : action === "start_batch"
          ? "Started batch encoding"
          : "Stopped batch encoding";

  await logActivity(
    "encoding_management",
    actionText,
    "System",
    {
      action,
      ...additionalInfo,
    }
  );
};

export const logRoleManagementAction = async (
  action: string,
  status: 'success' | 'failed' | 'pending',
  message: string,
  currentUser: FirebaseUser | null,
  details?: Record<string, any>
): Promise<void> => {
  await logActivityEnhanced({
    level: status === 'success' ? 'success' : status === 'failed' ? 'error' : 'warning',
    module: 'Role Management',
    subModule: 'Permissions',
    action,
    message,
    performedBy: currentUser ? {
      uid: currentUser.uid,
      email: currentUser.email || 'Unknown',
      name: currentUser.displayName || currentUser.email || 'Unknown',
    } : undefined,
    status,
    details,
  });
};

export const logSystemAction = async (
  action: string,
  status: 'success' | 'failed' | 'pending',
  message: string,
  currentUser: FirebaseUser | null,
  details?: Record<string, any>
): Promise<void> => {
  await logActivityEnhanced({
    level: status === 'success' ? 'info' : status === 'failed' ? 'error' : 'warning',
    module: 'System',
    subModule: 'Operations',
    action,
    message,
    performedBy: currentUser ? {
      uid: currentUser.uid,
      email: currentUser.email || 'Unknown',
      name: currentUser.displayName || currentUser.email || 'Unknown',
    } : undefined,
    status,
    details,
  });
};
