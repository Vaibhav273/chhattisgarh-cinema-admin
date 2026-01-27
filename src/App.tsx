// ═══════════════════════════════════════════════════════════════
// 🚀 MAIN APP WITH ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import { AuthProvider } from "./context/AuthContext";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 ADMIN LAYOUT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import AdminLayout from "./layouts/AdminLayout";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 AUTH & SETUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import LoginPage from "./admin/auth/LoginPage";
// import SetupSuperAdmin from './admin/SetupSuperAdmin';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ PROTECTED ROUTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { ProtectedRoute } from "./components/ProtectedRoute";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import AdminDashboard from "./admin/Dashboard";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 CONTENT MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import MoviesManagement from "./admin/content/MoviesManagement";
import SeriesManagement from "./admin/content/SeriesManagement";
import ShortFilmsManagement from "./admin/content/ShortFilmsManagement";
import ContentApproval from "./admin/content/ContentApproval";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👥 USER MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import UsersManagement from "./admin/users/UsersManagement";
import AdminUsersManagement from "./admin/users/AdminUsersManagement";
import RolesPermissions from "./admin/users/RolesPermissions";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ MODERATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import CommentsModeration from "./admin/moderation/CommentsModeration";
import ReportsManagement from "./admin/moderation/ReportsManagement";
import BannedUsers from "./admin/moderation/BannedUsers";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 FINANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import SubscriptionsManagement from "./admin/finance/SubscriptionsManagement";
import TransactionsManagement from "./admin/finance/TransactionsManagement";
import PayoutsManagement from "./admin/finance/PayoutsManagement";
import RevenueReports from "./admin/finance/RevenueReports";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 ANALYTICS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import PlatformAnalytics from "./admin/analytics/PlatformAnalytics";
import ContentAnalytics from "./admin/analytics/ContentAnalytics";
import UserAnalytics from "./admin/analytics/UserAnalytics";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📢 MARKETING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import BannersManagement from "./admin/marketing/BannersManagement";
import NotificationsManagement from "./admin/marketing/NotificationsManagement";
import PromotionsManagement from "./admin/marketing/PromotionsManagement";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ TECHNICAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import CDNSettings from "./admin/technical/CDNSettings";
import EncodingSettings from "./admin/technical/EncodingSettings";
import APISettings from "./admin/technical/APISettings";
import SystemLogs from "./admin/technical/SystemLogs";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎭 EVENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import EventsManagement from "./admin/events/EventsManagement";
import BookingsManagement from "./admin/events/BookingsManagement";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ SETTINGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import PlatformSettings from "./admin/settings/PlatformSettings";
import ProfileSettings from "./admin/settings/ProfileSettings";
import ViewUser from "./admin/users/ViewUser";
import AddEditUser from "./admin/users/AddEditUser";
import AddEditMovie from "./admin/content/AddEditMovie";
import AddEditWebSeries from "./admin/content/AddEditWebSeries";
import AddEditShortFilm from "./admin/content/AddEditShortFilm";
import AddNewBanner from "./admin/marketing/AddNewBanner";

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#f59e0b",
          borderRadius: 8,
          fontFamily: "Poppins, sans-serif",
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 🔐 PUBLIC ROUTES */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <Route path="/admin/login" element={<LoginPage />} />
            {/* <Route path="/setup-super-admin" element={<SetupSuperAdmin />} /> */}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 🛡️ PROTECTED ADMIN ROUTES */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard */}
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route path="dashboard" element={<AdminDashboard />} />

              {/* Content Management */}
              <Route
                path="content/movies"
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
                path="content/movies/add"
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
                path="content/movies/edit/:movieId"
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
                path="content/series"
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
                path="content/series/add"
                element={
                  <ProtectedRoute
                    requireAdmin
                    allowedRoles={["content_manager", "super_admin"]}
                  >
                    <AddEditWebSeries />
                  </ProtectedRoute>
                }
              />
              <Route
                path="content/short-films"
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
                path="content/shortfilms/add"
                element={
                  <ProtectedRoute
                    requireAdmin
                    allowedRoles={["content_manager", "super_admin"]}
                  >
                    <AddEditShortFilm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="content/approval"
                element={
                  <ProtectedRoute
                    requireAdmin
                    allowedRoles={["content_manager", "super_admin"]}
                  >
                    <ContentApproval />
                  </ProtectedRoute>
                }
              />

              {/* User Management */}
              <Route
                path="users/all"
                element={
                  <ProtectedRoute
                    requireAdmin
                    allowedRoles={["super_admin", "moderator"]}
                  >
                    <UsersManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users/view/:userId"
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
                path="users/add"
                element={
                  <ProtectedRoute requireAdmin allowedRoles={["super_admin"]}>
                    <AddEditUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users/edit/:userId"
                element={
                  <ProtectedRoute requireAdmin allowedRoles={["super_admin"]}>
                    <AddEditUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users/admins"
                element={
                  <ProtectedRoute requireAdmin allowedRoles={["super_admin"]}>
                    <AdminUsersManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users/roles"
                element={
                  <ProtectedRoute requireAdmin allowedRoles={["super_admin"]}>
                    <RolesPermissions />
                  </ProtectedRoute>
                }
              />

              {/* Moderation */}
              <Route
                path="moderation/comments"
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
                path="moderation/reports"
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
                path="moderation/banned-users"
                element={
                  <ProtectedRoute
                    requireAdmin
                    allowedRoles={["moderator", "super_admin"]}
                  >
                    <BannedUsers />
                  </ProtectedRoute>
                }
              />

              {/* Finance */}
              <Route
                path="finance/subscriptions"
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
                path="finance/transactions"
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
                path="finance/payouts"
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
                path="finance/reports"
                element={
                  <ProtectedRoute
                    requireAdmin
                    allowedRoles={["finance", "super_admin"]}
                  >
                    <RevenueReports />
                  </ProtectedRoute>
                }
              />

              {/* Analytics */}
              <Route
                path="analytics/platform"
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
                path="analytics/content"
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
                path="analytics/users"
                element={
                  <ProtectedRoute
                    requireAdmin
                    allowedRoles={["analyst", "super_admin"]}
                  >
                    <UserAnalytics />
                  </ProtectedRoute>
                }
              />

              {/* Marketing */}
              <Route
                path="marketing/banners"
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
                path="marketing/banners/new"
                element={
                  <ProtectedRoute
                    requireAdmin
                    allowedRoles={["analyst", "super_admin"]}
                  >
                    <AddNewBanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="marketing/notifications"
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
                path="marketing/promotions"
                element={
                  <ProtectedRoute
                    requireAdmin
                    allowedRoles={["analyst", "super_admin"]}
                  >
                    <PromotionsManagement />
                  </ProtectedRoute>
                }
              />

              {/* Technical */}
              <Route
                path="technical/cdn"
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
                path="technical/encoding"
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
                path="technical/api"
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
                path="technical/logs"
                element={
                  <ProtectedRoute
                    requireAdmin
                    allowedRoles={["tech_admin", "super_admin"]}
                  >
                    <SystemLogs />
                  </ProtectedRoute>
                }
              />

              {/* Events */}
              <Route
                path="events/all"
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
                path="events/bookings"
                element={
                  <ProtectedRoute
                    requireAdmin
                    allowedRoles={["finance", "super_admin"]}
                  >
                    <BookingsManagement />
                  </ProtectedRoute>
                }
              />

              {/* Settings */}
              <Route
                path="settings/platform"
                element={
                  <ProtectedRoute requireAdmin allowedRoles={["super_admin"]}>
                    <PlatformSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings/profile"
                element={
                  <ProtectedRoute requireAdmin>
                    <ProfileSettings />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 🔄 FALLBACK */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <Route
              path="/"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="*"
              element={<Navigate to="/admin/dashboard" replace />}
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
