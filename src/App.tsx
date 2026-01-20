import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import AdminLayout from "./admin/layouts/AdminLayout";
import Login from "./admin/pages/login/login";
import Dashboard from "./admin/pages/dasboard/Dashboard";
import UserList from "./admin/pages/Users/UserList";
import SubscriptionList from "./admin/pages/Subscriptions/SubscriptionList";
import PaymentList from "./admin/pages/Payments/PaymentList";
import GenreList from "./admin/pages/Genres/GenreList";
import LanguageList from "./admin/pages/Languages/LanguageList";
import CastCrewList from "./admin/pages/CastCrew/CastCrewList";
import Analytics from "./admin/pages/Analytics/Analytics";
import Settings from "./admin/pages/Settings/Settings";
import MoviesList from "./admin/pages/content/MoviesList";
import SeriesList from "./admin/pages/content/SeriesList";
import ShortFilmsList from "./admin/pages/content/ShortFilmsList";
import VideosList from "./admin/pages/content/VideosList";
import EventsList from "./admin/pages/content/EventsList";
import MovieForm from "./admin/pages/content/MovieForm";

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          fontFamily: "'Poppins', sans-serif",
          borderRadius: 12,
          // The "Onyx Black" Palette
          colorBgBase: "#02040a", // True Cinema Black
          colorBgContainer: "#0d1117", // Deep Slate for cards
          colorPrimary: "#faad14", // CG Cinema Gold
          colorInfo: "#faad14",
          colorSuccess: "#00ffa3", // Neon Success
          colorBgLayout: "#02040a",
          // Text
          colorTextBase: "#e6edf3",
          colorTextSecondary: "#8b949e",
        },
        components: {
          Card: {
            colorBgContainer: "rgba(13, 17, 23, 0.8)", // Glass effect
            borderRadiusLG: 20,
          },
          Table: {
            headerBg: "transparent",
            headerColor: "#8b949e",
            headerSplitColor: "transparent",
            rowHoverBg: "rgba(250, 173, 20, 0.05)",
          },
          Menu: {
            itemBg: "transparent",
            itemSelectedBg: "rgba(250, 173, 20, 0.1)",
            itemSelectedColor: "#faad14",
          },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="movies" element={<MoviesList />} />
            <Route path="movies/new" element={<MovieForm />} />
            <Route path="movies/edit/:id" element={<MovieForm />} />

            <Route path="series" element={<SeriesList />} />
            <Route path="short-films" element={<ShortFilmsList />} />
            <Route path="videos" element={<VideosList />} />
            <Route path="events" element={<EventsList />} />

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
