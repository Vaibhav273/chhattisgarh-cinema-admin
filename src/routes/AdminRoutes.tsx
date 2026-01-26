// ═══════════════════════════════════════════════════════════════
// 🛣️ ADMIN ROUTES (ROLE-BASED ACCESS)
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 AUTH PAGES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import LoginPage from "../admin/auth/LoginPage";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import AdminDashboard from "../admin/Dashboard";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 CONTENT MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import MoviesManagement from "../admin/content/MoviesManagement";
import SeriesManagement from "../admin/content/SeriesManagement";
import ShortFilmsManagement from "../admin/content/ShortFilmsManagement";
import ContentApproval from "../admin/content/ContentApproval";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👥 USER MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import UsersManagement from "../admin/users/UsersManagement";
import ViewUser from "../admin/users/ViewUser"; // ✅ NEW
import AddEditUser from "../admin/users/AddEditUser";
import AdminUsersManagement from "../admin/users/AdminUsersManagement";
import RolesPermissions from "../admin/users/RolesPermissions";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ MODERATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import CommentsModeration from "../admin/moderation/CommentsModeration";
import ReportsManagement from "../admin/moderation/ReportsManagement";
import BannedUsers from "../admin/moderation/BannedUsers";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 FINANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import SubscriptionsManagement from "../admin/finance/SubscriptionsManagement";
import TransactionsManagement from "../admin/finance/TransactionsManagement";
import PayoutsManagement from "../admin/finance/PayoutsManagement";
import RevenueReports from "../admin/finance/RevenueReports";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 ANALYTICS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import PlatformAnalytics from "../admin/analytics/PlatformAnalytics";
import ContentAnalytics from "../admin/analytics/ContentAnalytics";
import UserAnalytics from "../admin/analytics/UserAnalytics";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📢 MARKETING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import BannersManagement from "../admin/marketing/BannersManagement";
import NotificationsManagement from "../admin/marketing/NotificationsManagement";
import PromotionsManagement from "../admin/marketing/PromotionsManagement";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ TECHNICAL SETTINGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import CDNSettings from "../admin/technical/CDNSettings";
import EncodingSettings from "../admin/technical/EncodingSettings";
import APISettings from "../admin/technical/APISettings";
import SystemLogs from "../admin/technical/SystemLogs";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎭 EVENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import EventsManagement from "../admin/events/EventsManagement";
import BookingsManagement from "../admin/events/BookingsManagement";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ SETTINGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import PlatformSettings from "../admin/settings/PlatformSettings";
import ProfileSettings from "../admin/settings/ProfileSettings";
import AddEditMovie from "../admin/content/AddEditMovie";

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 🔐 PUBLIC ROUTES (NO AUTH REQUIRED) */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Route path="/login" element={<LoginPage />} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 📊 DASHBOARD (ALL ADMINS) */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 🎬 CONTENT MANAGEMENT */}
      {/* Allowed: content_manager, super_admin */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Route
        path="/content/movies"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["content_manager", "super_admin"]}
          >
            <MoviesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/movies/view/:movieId"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["content_manager", "super_admin"]}
          >
            <></>
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/movies/add"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["content_manager", "super_admin"]}
          >
            <AddEditMovie />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/movies/edit/:movieId"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["content_manager", "super_admin"]}
          >
            <AddEditMovie />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/series"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["content_manager", "super_admin"]}
          >
            <SeriesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/short-films"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["content_manager", "super_admin"]}
          >
            <ShortFilmsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/approval"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["content_manager", "super_admin"]}
          >
            <ContentApproval />
          </ProtectedRoute>
        }
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 👥 USER MANAGEMENT */}
      {/* Allowed: super_admin, moderator */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

      {/* Users List */}
      <Route
        path="/users/all"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["super_admin", "moderator"]}
          >
            <UsersManagement />
          </ProtectedRoute>
        }
      />

      {/* ✅ View User Details */}
      <Route
        path="/users/view/:userId"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["super_admin", "moderator"]}
          >
            <ViewUser />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/add"
        element={
          <ProtectedRoute requireAdmin allowedRoles={["super_admin"]}>
            <AddEditUser />
          </ProtectedRoute>
        }
      />

      {/* ✅ Edit User */}
      <Route
        path="/users/edit/:userId"
        element={
          <ProtectedRoute requireAdmin allowedRoles={["super_admin"]}>
            <AddEditUser />
          </ProtectedRoute>
        }
      />

      {/* Admin Users Management */}
      <Route
        path="/users/admins"
        element={
          <ProtectedRoute requireAdmin allowedRoles={["super_admin"]}>
            <AdminUsersManagement />
          </ProtectedRoute>
        }
      />

      {/* Roles & Permissions */}
      <Route
        path="/users/roles"
        element={
          <ProtectedRoute requireAdmin allowedRoles={["super_admin"]}>
            <RolesPermissions />
          </ProtectedRoute>
        }
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 🛡️ MODERATION */}
      {/* Allowed: moderator, super_admin */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Route
        path="/moderation/comments"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["moderator", "super_admin"]}
          >
            <CommentsModeration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/moderation/reports"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["moderator", "super_admin"]}
          >
            <ReportsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/moderation/banned-users"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["moderator", "super_admin"]}
          >
            <BannedUsers />
          </ProtectedRoute>
        }
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 💰 FINANCE */}
      {/* Allowed: finance, super_admin */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Route
        path="/finance/subscriptions"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["finance", "super_admin"]}
          >
            <SubscriptionsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/transactions"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["finance", "super_admin"]}
          >
            <TransactionsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/payouts"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["finance", "super_admin"]}
          >
            <PayoutsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/reports"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["finance", "super_admin"]}
          >
            <RevenueReports />
          </ProtectedRoute>
        }
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 📊 ANALYTICS */}
      {/* Allowed: analyst, super_admin */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Route
        path="/analytics/platform"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["analyst", "super_admin"]}
          >
            <PlatformAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/content"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["analyst", "super_admin"]}
          >
            <ContentAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/users"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["analyst", "super_admin"]}
          >
            <UserAnalytics />
          </ProtectedRoute>
        }
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 📢 MARKETING */}
      {/* Allowed: analyst, super_admin */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Route
        path="/marketing/banners"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["analyst", "super_admin"]}
          >
            <BannersManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketing/notifications"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["analyst", "super_admin"]}
          >
            <NotificationsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketing/promotions"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["analyst", "super_admin"]}
          >
            <PromotionsManagement />
          </ProtectedRoute>
        }
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ⚙️ TECHNICAL */}
      {/* Allowed: tech_admin, super_admin */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Route
        path="/technical/cdn"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["tech_admin", "super_admin"]}
          >
            <CDNSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/technical/encoding"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["tech_admin", "super_admin"]}
          >
            <EncodingSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/technical/api"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["tech_admin", "super_admin"]}
          >
            <APISettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/technical/logs"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["tech_admin", "super_admin"]}
          >
            <SystemLogs />
          </ProtectedRoute>
        }
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 🎭 EVENTS */}
      {/* Allowed: content_manager, finance, super_admin */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Route
        path="/events/all"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["content_manager", "super_admin"]}
          >
            <EventsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/bookings"
        element={
          <ProtectedRoute
            requireAdmin
            allowedRoles={["finance", "super_admin"]}
          >
            <BookingsManagement />
          </ProtectedRoute>
        }
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ⚙️ SETTINGS */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Route
        path="/settings/platform"
        element={
          <ProtectedRoute requireAdmin allowedRoles={["super_admin"]}>
            <PlatformSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/profile"
        element={
          <ProtectedRoute requireAdmin>
            <ProfileSettings />
          </ProtectedRoute>
        }
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 🔄 REDIRECTS */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
