import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import AdminLayout from "./admin/layouts/AdminLayout";
import Login from "./admin/pages/login/login";
import Dashboard from "./admin/pages/dasboard/Dashboard";
import ContentList from "./admin/pages/content/ContentList";
import ContentForm from "./admin/pages/content/ContentForm";
import UserList from "./admin/pages/Users/UserList";
import SubscriptionList from "./admin/pages/Subscriptions/SubscriptionList";
import PaymentList from "./admin/pages/Payments/PaymentList";
import GenreList from "./admin/pages/Genres/GenreList";
import LanguageList from "./admin/pages/Languages/LanguageList";
import CastCrewList from "./admin/pages/CastCrew/CastCrewList";
import Analytics from "./admin/pages/Analytics/Analytics";
import Settings from "./admin/pages/Settings/Settings";

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1890ff",
          colorSuccess: "#52c41a",
          colorWarning: "#faad14",
          colorError: "#ff4d4f",
          colorInfo: "#1890ff",
          borderRadius: 8,
          fontSize: 14,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="content" element={<ContentList />} />
            <Route path="content/new" element={<ContentForm />} />
            <Route path="content/edit/:id" element={<ContentForm />} />
            <Route path="users" element={<UserList />} />
            <Route path="subscriptions" element={<SubscriptionList />} />
            <Route path="payments" element={<PaymentList />} />
            <Route path="genres" element={<GenreList />} />
            <Route path="languages" element={<LanguageList />} />
            <Route path="cast-crew" element={<CastCrewList />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
