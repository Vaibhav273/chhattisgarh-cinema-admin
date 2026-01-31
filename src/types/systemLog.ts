import { Timestamp } from "firebase/firestore";

export interface SystemLog {
  id: string;
  action: string;
  module: string;
  subModule?: string;
  performedBy: {
    uid: string;
    email: string;
    name: string;
    role: string;
  };
  details: any;
  timestamp: Timestamp;
  ipAddress?: string | null;
  userAgent?: string;
  status: "success" | "error" | "warning";
  createdAt?: Timestamp;
}

export type SystemLogAction =
  // Notifications
  | "notification_created"
  | "notification_updated"
  | "notification_deleted"
  | "notification_sent"
  | "notification_read"
  | "notification_create_failed"
  | "notification_update_failed"
  | "notification_template_created"
  | "notification_template_updated"
  | "notification_template_deleted"

  // Users
  | "user_created"
  | "user_updated"
  | "user_deleted"

  // Movies
  | "movie_created"
  | "movie_updated"
  | "movie_deleted"

  // Events
  | "event_created"
  | "event_updated"
  | "event_deleted"

  // Web Series
  | "webseries_created"
  | "webseries_updated"
  | "webseries_deleted"
  | "episode_added"
  | "episode_updated"
  | "episode_deleted"

  // Short Films
  | "shortfilm_created"
  | "shortfilm_updated"
  | "shortfilm_deleted"

  // Banners
  | "banner_created"
  | "banner_updated"
  | "banner_deleted"

  // 🔥 IMAGE OPERATIONS
  | "image_uploaded"
  | "image_deleted"
  | "gallery_image_added"
  | "gallery_image_removed"
  | "thumbnail_uploaded"
  | "poster_uploaded"
  | "banner_image_uploaded"
  | "backdrop_uploaded"

  // 🔥 VIDEO OPERATIONS
  | "video_uploaded"
  | "video_deleted"
  | "trailer_uploaded"

  // Cast & Crew
  | "cast_added"
  | "cast_updated"
  | "cast_deleted"
  | "crew_added"
  | "crew_updated"
  | "crew_deleted"

  // Admin
  | "admin_login"
  | "admin_logout"

  // Settings
  | "settings_updated"

  // Payments & Subscriptions
  | "payment_processed"
  | "subscription_created"
  | "booking_created";
