// src/types/systemLog.ts
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
    | "notification_created"
    | "notification_updated"
    | "notification_deleted"
    | "notification_sent"
    | "notification_create_failed"
    | "notification_update_failed"
    | "user_created"
    | "user_updated"
    | "user_deleted"
    | "movie_created"
    | "movie_updated"
    | "movie_deleted"
    | "admin_login"
    | "admin_logout"
    | "settings_updated"
    | "payment_processed"
    | "subscription_created"
    | "booking_created";
