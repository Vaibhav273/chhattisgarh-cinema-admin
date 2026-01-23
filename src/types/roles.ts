// ═══════════════════════════════════════════════════════════════
// 👤 USER ROLES
// ═══════════════════════════════════════════════════════════════

export type UserRole =
    | 'viewer'          // 1. Free Registered User
    | 'premium'         // 1. Premium Subscriber
    | 'profile_user'    // 2. Profile User (sub-user)
    | 'creator'         // 3. Content Creator
    | 'content_manager' // 4. Content Manager
    | 'moderator'       // 5. Moderator
    | 'finance'         // 6. Finance Manager
    | 'analyst'         // 7. Analyst/Marketing
    | 'tech_admin'      // 8. Technical Admin
    | 'super_admin';    // 9. Super Admin

// ═══════════════════════════════════════════════════════════════
// 🔐 PERMISSIONS ENUM
// ═══════════════════════════════════════════════════════════════

export enum Permission {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👁️ CONTENT VIEWING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    VIEW_FREE_CONTENT = 'view_free_content',
    VIEW_PREMIUM_CONTENT = 'view_premium_content',
    DOWNLOAD_CONTENT = 'download_content',
    VIEW_4K_CONTENT = 'view_4k_content',

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💬 USER INTERACTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    LIKE_CONTENT = 'like_content',
    RATE_CONTENT = 'rate_content',
    COMMENT = 'comment',
    REPLY_COMMENT = 'reply_comment',
    ADD_TO_WATCHLIST = 'add_to_watchlist',
    CREATE_PLAYLIST = 'create_playlist',
    SHARE_CONTENT = 'share_content',

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👤 PROFILE MANAGEMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    MANAGE_OWN_PROFILE = 'manage_own_profile',
    CREATE_SUB_PROFILES = 'create_sub_profiles',
    MANAGE_SUB_PROFILES = 'manage_sub_profiles',
    SET_PARENTAL_CONTROLS = 'set_parental_controls',
    VIEW_WATCH_HISTORY = 'view_watch_history',

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎬 CONTENT CREATION (CREATOR)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    UPLOAD_CONTENT = 'upload_content',
    EDIT_OWN_CONTENT = 'edit_own_content',
    DELETE_OWN_CONTENT = 'delete_own_content',
    MANAGE_OWN_METADATA = 'manage_own_metadata',
    VIEW_OWN_ANALYTICS = 'view_own_analytics',
    VIEW_OWN_REVENUE = 'view_own_revenue',
    MONETIZE_CONTENT = 'monetize_content',

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📝 CONTENT MANAGEMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    APPROVE_CONTENT = 'approve_content',
    REJECT_CONTENT = 'reject_content',
    EDIT_ANY_CONTENT = 'edit_any_content',
    DELETE_ANY_CONTENT = 'delete_any_content',
    MANAGE_METADATA = 'manage_metadata',
    SCHEDULE_RELEASES = 'schedule_releases',
    MANAGE_CATEGORIES = 'manage_categories',
    MANAGE_GENRES = 'manage_genres',
    MANAGE_LANGUAGES = 'manage_languages',
    SET_FEATURED = 'set_featured',
    SET_TRENDING = 'set_trending',
    MANAGE_VISIBILITY = 'manage_visibility',

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🛡️ MODERATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    REVIEW_REPORTS = 'review_reports',
    DELETE_COMMENTS = 'delete_comments',
    BAN_USERS = 'ban_users',
    SUSPEND_USERS = 'suspend_users',
    UNBAN_USERS = 'unban_users',
    HANDLE_COPYRIGHT = 'handle_copyright',
    CONTENT_TAKEDOWN = 'content_takedown',
    MODERATE_COMMENTS = 'moderate_comments',
    VIEW_USER_ACTIVITY = 'view_user_activity',

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💰 FINANCE & BILLING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    MANAGE_SUBSCRIPTIONS = 'manage_subscriptions',
    PROCESS_REFUNDS = 'process_refunds',
    VIEW_REVENUE = 'view_revenue',
    VIEW_ALL_TRANSACTIONS = 'view_all_transactions',
    MANAGE_PAYOUTS = 'manage_payouts',
    VIEW_TAX_REPORTS = 'view_tax_reports',
    MANAGE_PRICING = 'manage_pricing',
    VIEW_INVOICES = 'view_invoices',
    GENERATE_REPORTS = 'generate_financial_reports',

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 ANALYTICS & MARKETING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    VIEW_PLATFORM_ANALYTICS = 'view_platform_analytics',
    VIEW_USER_ANALYTICS = 'view_user_analytics',
    VIEW_CONTENT_ANALYTICS = 'view_content_analytics',
    RUN_PROMOTIONS = 'run_promotions',
    SEND_NOTIFICATIONS = 'send_notifications',
    MANAGE_BANNERS = 'manage_banners',
    MANAGE_FEATURED_CONTENT = 'manage_featured_content',
    RUN_CAMPAIGNS = 'run_campaigns',
    VIEW_RETENTION_DATA = 'view_retention_data',
    VIEW_CHURN_DATA = 'view_churn_data',
    EXPORT_ANALYTICS = 'export_analytics',

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚙️ TECHNICAL ADMINISTRATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    MANAGE_CDN = 'manage_cdn',
    MANAGE_ENCODING = 'manage_encoding',
    MANAGE_DRM = 'manage_drm',
    MANAGE_API_KEYS = 'manage_api_keys',
    MANAGE_APP_SETTINGS = 'manage_app_settings',
    VIEW_SERVER_LOGS = 'view_server_logs',
    MANAGE_DATABASE = 'manage_database',
    CONFIGURE_STORAGE = 'configure_storage',
    MANAGE_MAINTENANCE_MODE = 'manage_maintenance_mode',

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👑 SUPER ADMIN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    FULL_ACCESS = 'full_access',
    MANAGE_ADMINS = 'manage_admins',
    ASSIGN_ROLES = 'assign_roles',
    REVOKE_ROLES = 'revoke_roles',
    MANAGE_ROLES = 'manage_roles',
    DELETE_PERMANENTLY = 'delete_permanently',
    VIEW_AUDIT_LOGS = 'view_audit_logs',
    MANAGE_PLATFORM_SETTINGS = 'manage_platform_settings',
}

// ═══════════════════════════════════════════════════════════════
// 📝 PERMISSION DESCRIPTIONS - COMPLETE
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// 📝 PERMISSION DESCRIPTIONS - MATCHING YOUR ENUM
// ═══════════════════════════════════════════════════════════════
export interface PermissionDescription {
    name: string;
    description: string;
    category: string;
}

export const PERMISSION_DESCRIPTIONS: Record<Permission, PermissionDescription> = {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👁️ CONTENT VIEWING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    [Permission.VIEW_FREE_CONTENT]: {
        name: 'View Free Content',
        description: 'Can access and watch free content on the platform',
        category: 'Content Viewing',
    },
    [Permission.VIEW_PREMIUM_CONTENT]: {
        name: 'View Premium Content',
        description: 'Can access and watch premium/paid content',
        category: 'Content Viewing',
    },
    [Permission.DOWNLOAD_CONTENT]: {
        name: 'Download Content',
        description: 'Can download videos for offline viewing',
        category: 'Content Viewing',
    },
    [Permission.VIEW_4K_CONTENT]: {
        name: 'View 4K Content',
        description: 'Can stream content in 4K Ultra HD quality',
        category: 'Content Viewing',
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💬 USER INTERACTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    [Permission.LIKE_CONTENT]: {
        name: 'Like Content',
        description: 'Can like/favorite content',
        category: 'User Interactions',
    },
    [Permission.RATE_CONTENT]: {
        name: 'Rate Content',
        description: 'Can rate and review content',
        category: 'User Interactions',
    },
    [Permission.COMMENT]: {
        name: 'Comment',
        description: 'Can post comments on content',
        category: 'User Interactions',
    },
    [Permission.REPLY_COMMENT]: {
        name: 'Reply to Comments',
        description: 'Can reply to other users comments',
        category: 'User Interactions',
    },
    [Permission.ADD_TO_WATCHLIST]: {
        name: 'Add to Watchlist',
        description: 'Can add content to personal watchlist',
        category: 'User Interactions',
    },
    [Permission.CREATE_PLAYLIST]: {
        name: 'Create Playlist',
        description: 'Can create custom playlists',
        category: 'User Interactions',
    },
    [Permission.SHARE_CONTENT]: {
        name: 'Share Content',
        description: 'Can share content with others',
        category: 'User Interactions',
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👤 PROFILE MANAGEMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    [Permission.MANAGE_OWN_PROFILE]: {
        name: 'Manage Own Profile',
        description: 'Can edit personal profile settings',
        category: 'Profile Management',
    },
    [Permission.CREATE_SUB_PROFILES]: {
        name: 'Create Sub Profiles',
        description: 'Can create additional user profiles under account',
        category: 'Profile Management',
    },
    [Permission.MANAGE_SUB_PROFILES]: {
        name: 'Manage Sub Profiles',
        description: 'Can manage and edit sub-profiles',
        category: 'Profile Management',
    },
    [Permission.SET_PARENTAL_CONTROLS]: {
        name: 'Set Parental Controls',
        description: 'Can set parental control restrictions',
        category: 'Profile Management',
    },
    [Permission.VIEW_WATCH_HISTORY]: {
        name: 'View Watch History',
        description: 'Can view personal watch history',
        category: 'Profile Management',
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎬 CONTENT CREATION (CREATOR)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    [Permission.UPLOAD_CONTENT]: {
        name: 'Upload Content',
        description: 'Can upload new content to the platform',
        category: 'Content Creation',
    },
    [Permission.EDIT_OWN_CONTENT]: {
        name: 'Edit Own Content',
        description: 'Can edit own uploaded content',
        category: 'Content Creation',
    },
    [Permission.DELETE_OWN_CONTENT]: {
        name: 'Delete Own Content',
        description: 'Can delete own uploaded content',
        category: 'Content Creation',
    },
    [Permission.MANAGE_OWN_METADATA]: {
        name: 'Manage Own Metadata',
        description: 'Can manage metadata for own content',
        category: 'Content Creation',
    },
    [Permission.VIEW_OWN_ANALYTICS]: {
        name: 'View Own Analytics',
        description: 'Can view analytics for own content',
        category: 'Content Creation',
    },
    [Permission.VIEW_OWN_REVENUE]: {
        name: 'View Own Revenue',
        description: 'Can view revenue from own content',
        category: 'Content Creation',
    },
    [Permission.MONETIZE_CONTENT]: {
        name: 'Monetize Content',
        description: 'Can enable monetization for content',
        category: 'Content Creation',
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📝 CONTENT MANAGEMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    [Permission.APPROVE_CONTENT]: {
        name: 'Approve Content',
        description: 'Can approve content for publishing',
        category: 'Content Management',
    },
    [Permission.REJECT_CONTENT]: {
        name: 'Reject Content',
        description: 'Can reject submitted content',
        category: 'Content Management',
    },
    [Permission.EDIT_ANY_CONTENT]: {
        name: 'Edit Any Content',
        description: 'Can edit any content on the platform',
        category: 'Content Management',
    },
    [Permission.DELETE_ANY_CONTENT]: {
        name: 'Delete Any Content',
        description: 'Can delete any content from the platform',
        category: 'Content Management',
    },
    [Permission.MANAGE_METADATA]: {
        name: 'Manage Metadata',
        description: 'Can manage metadata for all content',
        category: 'Content Management',
    },
    [Permission.SCHEDULE_RELEASES]: {
        name: 'Schedule Releases',
        description: 'Can schedule content for future release',
        category: 'Content Management',
    },
    [Permission.MANAGE_CATEGORIES]: {
        name: 'Manage Categories',
        description: 'Can create and manage content categories',
        category: 'Content Management',
    },
    [Permission.MANAGE_GENRES]: {
        name: 'Manage Genres',
        description: 'Can create and manage content genres',
        category: 'Content Management',
    },
    [Permission.MANAGE_LANGUAGES]: {
        name: 'Manage Languages',
        description: 'Can manage available language options',
        category: 'Content Management',
    },
    [Permission.SET_FEATURED]: {
        name: 'Set Featured',
        description: 'Can mark content as featured',
        category: 'Content Management',
    },
    [Permission.SET_TRENDING]: {
        name: 'Set Trending',
        description: 'Can mark content as trending',
        category: 'Content Management',
    },
    [Permission.MANAGE_VISIBILITY]: {
        name: 'Manage Visibility',
        description: 'Can control content visibility settings',
        category: 'Content Management',
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🛡️ MODERATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    [Permission.REVIEW_REPORTS]: {
        name: 'Review Reports',
        description: 'Can review user reports and complaints',
        category: 'Moderation',
    },
    [Permission.DELETE_COMMENTS]: {
        name: 'Delete Comments',
        description: 'Can delete user comments',
        category: 'Moderation',
    },
    [Permission.BAN_USERS]: {
        name: 'Ban Users',
        description: 'Can permanently ban users from the platform',
        category: 'Moderation',
    },
    [Permission.SUSPEND_USERS]: {
        name: 'Suspend Users',
        description: 'Can temporarily suspend user accounts',
        category: 'Moderation',
    },
    [Permission.UNBAN_USERS]: {
        name: 'Unban Users',
        description: 'Can unban previously banned users',
        category: 'Moderation',
    },
    [Permission.HANDLE_COPYRIGHT]: {
        name: 'Handle Copyright',
        description: 'Can handle copyright claims and disputes',
        category: 'Moderation',
    },
    [Permission.CONTENT_TAKEDOWN]: {
        name: 'Content Takedown',
        description: 'Can remove content for policy violations',
        category: 'Moderation',
    },
    [Permission.MODERATE_COMMENTS]: {
        name: 'Moderate Comments',
        description: 'Can moderate and approve comments',
        category: 'Moderation',
    },
    [Permission.VIEW_USER_ACTIVITY]: {
        name: 'View User Activity',
        description: 'Can view detailed user activity logs',
        category: 'Moderation',
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💰 FINANCE & BILLING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    [Permission.MANAGE_SUBSCRIPTIONS]: {
        name: 'Manage Subscriptions',
        description: 'Can manage user subscription plans',
        category: 'Finance & Billing',
    },
    [Permission.PROCESS_REFUNDS]: {
        name: 'Process Refunds',
        description: 'Can process payment refunds',
        category: 'Finance & Billing',
    },
    [Permission.VIEW_REVENUE]: {
        name: 'View Revenue',
        description: 'Can view platform revenue data',
        category: 'Finance & Billing',
    },
    [Permission.VIEW_ALL_TRANSACTIONS]: {
        name: 'View All Transactions',
        description: 'Can view all payment transactions',
        category: 'Finance & Billing',
    },
    [Permission.MANAGE_PAYOUTS]: {
        name: 'Manage Payouts',
        description: 'Can manage creator payouts',
        category: 'Finance & Billing',
    },
    [Permission.VIEW_TAX_REPORTS]: {
        name: 'View Tax Reports',
        description: 'Can view and download tax reports',
        category: 'Finance & Billing',
    },
    [Permission.MANAGE_PRICING]: {
        name: 'Manage Pricing',
        description: 'Can set and update pricing plans',
        category: 'Finance & Billing',
    },
    [Permission.VIEW_INVOICES]: {
        name: 'View Invoices',
        description: 'Can view user invoices',
        category: 'Finance & Billing',
    },
    [Permission.GENERATE_REPORTS]: {
        name: 'Generate Financial Reports',
        description: 'Can generate detailed financial reports',
        category: 'Finance & Billing',
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 ANALYTICS & MARKETING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    [Permission.VIEW_PLATFORM_ANALYTICS]: {
        name: 'View Platform Analytics',
        description: 'Can view overall platform analytics',
        category: 'Analytics & Marketing',
    },
    [Permission.VIEW_USER_ANALYTICS]: {
        name: 'View User Analytics',
        description: 'Can view user behavior analytics',
        category: 'Analytics & Marketing',
    },
    [Permission.VIEW_CONTENT_ANALYTICS]: {
        name: 'View Content Analytics',
        description: 'Can view content performance analytics',
        category: 'Analytics & Marketing',
    },
    [Permission.RUN_PROMOTIONS]: {
        name: 'Run Promotions',
        description: 'Can create and run promotional campaigns',
        category: 'Analytics & Marketing',
    },
    [Permission.SEND_NOTIFICATIONS]: {
        name: 'Send Notifications',
        description: 'Can send push notifications to users',
        category: 'Analytics & Marketing',
    },
    [Permission.MANAGE_BANNERS]: {
        name: 'Manage Banners',
        description: 'Can create and manage promotional banners',
        category: 'Analytics & Marketing',
    },
    [Permission.MANAGE_FEATURED_CONTENT]: {
        name: 'Manage Featured Content',
        description: 'Can manage featured content sections',
        category: 'Analytics & Marketing',
    },
    [Permission.RUN_CAMPAIGNS]: {
        name: 'Run Campaigns',
        description: 'Can run marketing campaigns',
        category: 'Analytics & Marketing',
    },
    [Permission.VIEW_RETENTION_DATA]: {
        name: 'View Retention Data',
        description: 'Can view user retention analytics',
        category: 'Analytics & Marketing',
    },
    [Permission.VIEW_CHURN_DATA]: {
        name: 'View Churn Data',
        description: 'Can view user churn analytics',
        category: 'Analytics & Marketing',
    },
    [Permission.EXPORT_ANALYTICS]: {
        name: 'Export Analytics',
        description: 'Can export analytics data and reports',
        category: 'Analytics & Marketing',
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚙️ TECHNICAL ADMINISTRATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    [Permission.MANAGE_CDN]: {
        name: 'Manage CDN',
        description: 'Can manage CDN and streaming configuration',
        category: 'Technical Administration',
    },
    [Permission.MANAGE_ENCODING]: {
        name: 'Manage Encoding',
        description: 'Can manage video encoding settings',
        category: 'Technical Administration',
    },
    [Permission.MANAGE_DRM]: {
        name: 'Manage DRM',
        description: 'Can manage Digital Rights Management settings',
        category: 'Technical Administration',
    },
    [Permission.MANAGE_API_KEYS]: {
        name: 'Manage API Keys',
        description: 'Can create and manage API keys',
        category: 'Technical Administration',
    },
    [Permission.MANAGE_APP_SETTINGS]: {
        name: 'Manage App Settings',
        description: 'Can manage application configuration',
        category: 'Technical Administration',
    },
    [Permission.VIEW_SERVER_LOGS]: {
        name: 'View Server Logs',
        description: 'Can view server and system logs',
        category: 'Technical Administration',
    },
    [Permission.MANAGE_DATABASE]: {
        name: 'Manage Database',
        description: 'Can manage database operations',
        category: 'Technical Administration',
    },
    [Permission.CONFIGURE_STORAGE]: {
        name: 'Configure Storage',
        description: 'Can configure storage systems',
        category: 'Technical Administration',
    },
    [Permission.MANAGE_MAINTENANCE_MODE]: {
        name: 'Manage Maintenance Mode',
        description: 'Can enable/disable maintenance mode',
        category: 'Technical Administration',
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👑 SUPER ADMIN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    [Permission.FULL_ACCESS]: {
        name: 'Full Access',
        description: 'Complete unrestricted access to all features',
        category: 'Super Admin',
    },
    [Permission.MANAGE_ADMINS]: {
        name: 'Manage Admins',
        description: 'Can add, edit, and remove admin users',
        category: 'Super Admin',
    },
    [Permission.ASSIGN_ROLES]: {
        name: 'Assign Roles',
        description: 'Can assign roles to users and admins',
        category: 'Super Admin',
    },
    [Permission.REVOKE_ROLES]: {
        name: 'Revoke Roles',
        description: 'Can revoke roles from users',
        category: 'Super Admin',
    },
    [Permission.MANAGE_ROLES]: {
        name: 'Manage Roles',
        description: 'Can create, edit and manage role definitions',
        category: 'Super Admin',
    },
    [Permission.DELETE_PERMANENTLY]: {
        name: 'Delete Permanently',
        description: 'Can permanently delete any data from system',
        category: 'Super Admin',
    },
    [Permission.VIEW_AUDIT_LOGS]: {
        name: 'View Audit Logs',
        description: 'Can view complete audit trail logs',
        category: 'Super Admin',
    },
    [Permission.MANAGE_PLATFORM_SETTINGS]: {
        name: 'Manage Platform Settings',
        description: 'Can manage core platform settings',
        category: 'Super Admin',
    },
};


// ═══════════════════════════════════════════════════════════════
// 📊 ROLE CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export interface RoleConfig {
    id: UserRole;
    name: string;
    nameHindi: string;
    description: string;
    descriptionHindi: string;
    level: number;
    permissions: Permission[];
    color: string;
    gradient: string;
    icon: string;
    maxDevices?: number;
    maxProfiles?: number;
    maxScreens?: number;
    canManageOthers: boolean;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1️⃣ VIEWER (Free Registered User)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    viewer: {
        id: 'viewer',
        name: 'Registered User',
        nameHindi: 'पंजीकृत उपयोगकर्ता',
        description: 'Free registered user with basic access',
        descriptionHindi: 'बुनियादी पहुंच के साथ मुफ्त पंजीकृत उपयोगकर्ता',
        level: 1,
        permissions: [
            Permission.VIEW_FREE_CONTENT,
            Permission.LIKE_CONTENT,
            Permission.RATE_CONTENT,
            Permission.COMMENT,
            Permission.REPLY_COMMENT,
            Permission.ADD_TO_WATCHLIST,
            Permission.CREATE_PLAYLIST,
            Permission.SHARE_CONTENT,
            Permission.MANAGE_OWN_PROFILE,
            Permission.VIEW_WATCH_HISTORY,
        ],
        color: '#3b82f6',
        gradient: 'from-blue-500 to-blue-600',
        icon: 'User',
        maxDevices: 1,
        maxProfiles: 1,
        maxScreens: 1,
        canManageOthers: false,
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1️⃣ PREMIUM (Premium Subscriber)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    premium: {
        id: 'premium',
        name: 'Premium Subscriber',
        nameHindi: 'प्रीमियम सदस्य',
        description: 'Paid subscriber with full content access',
        descriptionHindi: 'पूर्ण कंटेंट पहुंच के साथ भुगतान सदस्य',
        level: 2,
        permissions: [
            Permission.VIEW_FREE_CONTENT,
            Permission.VIEW_PREMIUM_CONTENT,
            Permission.VIEW_4K_CONTENT,
            Permission.DOWNLOAD_CONTENT,
            Permission.LIKE_CONTENT,
            Permission.RATE_CONTENT,
            Permission.COMMENT,
            Permission.REPLY_COMMENT,
            Permission.ADD_TO_WATCHLIST,
            Permission.CREATE_PLAYLIST,
            Permission.SHARE_CONTENT,
            Permission.MANAGE_OWN_PROFILE,
            Permission.CREATE_SUB_PROFILES,
            Permission.MANAGE_SUB_PROFILES,
            Permission.SET_PARENTAL_CONTROLS,
            Permission.VIEW_WATCH_HISTORY,
        ],
        color: '#f59e0b',
        gradient: 'from-amber-500 to-orange-600',
        icon: 'Crown',
        maxDevices: 4,
        maxProfiles: 5,
        maxScreens: 2,
        canManageOthers: false,
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2️⃣ PROFILE USER (Sub-User)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    profile_user: {
        id: 'profile_user',
        name: 'Profile User',
        nameHindi: 'प्रोफाइल उपयोगकर्ता',
        description: 'Family profile under premium account',
        descriptionHindi: 'प्रीमियम खाते के तहत पारिवारिक प्रोफ़ाइल',
        level: 2,
        permissions: [
            Permission.VIEW_FREE_CONTENT,
            Permission.VIEW_PREMIUM_CONTENT,
            Permission.LIKE_CONTENT,
            Permission.ADD_TO_WATCHLIST,
            Permission.MANAGE_OWN_PROFILE,
            Permission.VIEW_WATCH_HISTORY,
        ],
        color: '#8b5cf6',
        gradient: 'from-purple-500 to-purple-600',
        icon: 'Users',
        maxDevices: 1,
        maxProfiles: 0,
        maxScreens: 1,
        canManageOthers: false,
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 3️⃣ CREATOR (Content Creator)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    creator: {
        id: 'creator',
        name: 'Content Creator',
        nameHindi: 'कंटेंट क्रिएटर',
        description: 'Independent creators and studios',
        descriptionHindi: 'स्वतंत्र रचनाकार और स्टूडियो',
        level: 3,
        permissions: [
            Permission.VIEW_FREE_CONTENT,
            Permission.VIEW_PREMIUM_CONTENT,
            Permission.UPLOAD_CONTENT,
            Permission.EDIT_OWN_CONTENT,
            Permission.DELETE_OWN_CONTENT,
            Permission.MANAGE_OWN_METADATA,
            Permission.VIEW_OWN_ANALYTICS,
            Permission.VIEW_OWN_REVENUE,
            Permission.MONETIZE_CONTENT,
            Permission.MANAGE_OWN_PROFILE,
        ],
        color: '#ec4899',
        gradient: 'from-pink-500 to-rose-600',
        icon: 'Video',
        maxDevices: 2,
        maxProfiles: 1,
        maxScreens: 1,
        canManageOthers: false,
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 4️⃣ CONTENT MANAGER (Editorial Team)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    content_manager: {
        id: 'content_manager',
        name: 'Content Manager',
        nameHindi: 'कंटेंट मैनेजर',
        description: 'Editorial team managing content quality',
        descriptionHindi: 'कंटेंट गुणवत्ता प्रबंधन टीम',
        level: 5,
        permissions: [
            Permission.VIEW_FREE_CONTENT,
            Permission.VIEW_PREMIUM_CONTENT,
            Permission.APPROVE_CONTENT,
            Permission.REJECT_CONTENT,
            Permission.EDIT_ANY_CONTENT,
            Permission.DELETE_ANY_CONTENT,
            Permission.MANAGE_METADATA,
            Permission.SCHEDULE_RELEASES,
            Permission.MANAGE_CATEGORIES,
            Permission.MANAGE_GENRES,
            Permission.MANAGE_LANGUAGES,
            Permission.SET_FEATURED,
            Permission.SET_TRENDING,
            Permission.MANAGE_VISIBILITY,
            Permission.VIEW_CONTENT_ANALYTICS,
        ],
        color: '#10b981',
        gradient: 'from-green-500 to-emerald-600',
        icon: 'FileEdit',
        canManageOthers: true,
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 5️⃣ MODERATOR (Trust & Safety)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    moderator: {
        id: 'moderator',
        name: 'Moderator',
        nameHindi: 'मॉडरेटर',
        description: 'Trust & safety team',
        descriptionHindi: 'विश्वास और सुरक्षा टीम',
        level: 5,
        permissions: [
            Permission.VIEW_FREE_CONTENT,
            Permission.VIEW_PREMIUM_CONTENT,
            Permission.REVIEW_REPORTS,
            Permission.DELETE_COMMENTS,
            Permission.BAN_USERS,
            Permission.SUSPEND_USERS,
            Permission.UNBAN_USERS,
            Permission.HANDLE_COPYRIGHT,
            Permission.CONTENT_TAKEDOWN,
            Permission.MODERATE_COMMENTS,
            Permission.VIEW_USER_ACTIVITY,
        ],
        color: '#ef4444',
        gradient: 'from-red-500 to-red-600',
        icon: 'Shield',
        canManageOthers: true,
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 6️⃣ FINANCE (Finance Manager)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    finance: {
        id: 'finance',
        name: 'Finance Manager',
        nameHindi: 'वित्त प्रबंधक',
        description: 'Accounts and billing team',
        descriptionHindi: 'खाता और बिलिंग टीम',
        level: 6,
        permissions: [
            Permission.MANAGE_SUBSCRIPTIONS,
            Permission.PROCESS_REFUNDS,
            Permission.VIEW_REVENUE,
            Permission.VIEW_ALL_TRANSACTIONS,
            Permission.MANAGE_PAYOUTS,
            Permission.VIEW_TAX_REPORTS,
            Permission.MANAGE_PRICING,
            Permission.VIEW_INVOICES,
            Permission.GENERATE_REPORTS,
        ],
        color: '#06b6d4',
        gradient: 'from-cyan-500 to-blue-600',
        icon: 'DollarSign',
        canManageOthers: false,
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 7️⃣ ANALYST (Analyst/Marketing)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    analyst: {
        id: 'analyst',
        name: 'Analyst/Marketing',
        nameHindi: 'विश्लेषक/मार्केटिंग',
        description: 'Growth and marketing team',
        descriptionHindi: 'विकास और मार्केटिंग टीम',
        level: 6,
        permissions: [
            Permission.VIEW_PLATFORM_ANALYTICS,
            Permission.VIEW_USER_ANALYTICS,
            Permission.VIEW_CONTENT_ANALYTICS,
            Permission.RUN_PROMOTIONS,
            Permission.SEND_NOTIFICATIONS,
            Permission.MANAGE_BANNERS,
            Permission.MANAGE_FEATURED_CONTENT,
            Permission.RUN_CAMPAIGNS,
            Permission.VIEW_RETENTION_DATA,
            Permission.VIEW_CHURN_DATA,
            Permission.EXPORT_ANALYTICS,
        ],
        color: '#8b5cf6',
        gradient: 'from-violet-500 to-purple-600',
        icon: 'BarChart',
        canManageOthers: false,
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 8️⃣ TECH ADMIN (Technical Admin)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    tech_admin: {
        id: 'tech_admin',
        name: 'Technical Admin',
        nameHindi: 'तकनीकी व्यवस्थापक',
        description: 'Tech/DevOps team',
        descriptionHindi: 'तकनीकी/DevOps टीम',
        level: 8,
        permissions: [
            Permission.MANAGE_CDN,
            Permission.MANAGE_ENCODING,
            Permission.MANAGE_DRM,
            Permission.MANAGE_API_KEYS,
            Permission.MANAGE_APP_SETTINGS,
            Permission.VIEW_SERVER_LOGS,
            Permission.MANAGE_DATABASE,
            Permission.CONFIGURE_STORAGE,
            Permission.MANAGE_MAINTENANCE_MODE,
            Permission.VIEW_PLATFORM_ANALYTICS,
        ],
        color: '#6366f1',
        gradient: 'from-indigo-500 to-indigo-600',
        icon: 'Settings',
        canManageOthers: false,
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 9️⃣ SUPER ADMIN (Platform Owner)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    super_admin: {
        id: 'super_admin',
        name: 'Super Admin',
        nameHindi: 'सुपर व्यवस्थापक',
        description: 'Platform owner with full access',
        descriptionHindi: 'पूर्ण पहुंच के साथ प्लेटफार्म स्वामी',
        level: 9,
        permissions: [Permission.FULL_ACCESS], // Has all permissions by default
        color: '#dc2626',
        gradient: 'from-red-600 to-rose-600',
        icon: 'Crown',
        canManageOthers: true,
    },
};

// ═══════════════════════════════════════════════════════════════
// 🔐 PERMISSION CHECKING HELPERS
// ═══════════════════════════════════════════════════════════════

export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
    const roleConfig = ROLE_CONFIGS[userRole];

    // Super admin has all permissions
    if (userRole === 'super_admin') return true;

    return roleConfig.permissions.includes(permission);
};

export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole: UserRole, permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(userRole, permission));
};

export const getRolePermissions = (userRole: UserRole): Permission[] => {
    if (userRole === 'super_admin') {
        return Object.values(Permission);
    }
    return ROLE_CONFIGS[userRole].permissions;
};

export const canAccessAdminPanel = (userRole: UserRole): boolean => {
    const adminRoles: UserRole[] = [
        'content_manager',
        'moderator',
        'finance',
        'analyst',
        'tech_admin',
        'super_admin',
    ];
    return adminRoles.includes(userRole);
};

export const getRoleLevel = (userRole: UserRole): number => {
    return ROLE_CONFIGS[userRole].level;
};

export const canManageRole = (managerRole: UserRole, targetRole: UserRole): boolean => {
    const managerLevel = getRoleLevel(managerRole);
    const targetLevel = getRoleLevel(targetRole);

    // Super admin can manage everyone
    if (managerRole === 'super_admin') return true;

    // Can only manage roles with lower level
    return managerLevel > targetLevel && ROLE_CONFIGS[managerRole].canManageOthers;
};
