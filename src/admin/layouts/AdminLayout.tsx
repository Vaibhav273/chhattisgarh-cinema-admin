import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Film,
  Users,
  DollarSign,
  Package,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  TrendingUp,
  Clapperboard,
  Video,
  Calendar,
} from "lucide-react";
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";

const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin", badge: null },
    { icon: Film, label: "Movies", path: "/admin/movies", badge: null },
    { icon: TrendingUp, label: "Series", path: "/admin/series", badge: null },
    {
      icon: Clapperboard,
      label: "Short Films",
      path: "/admin/short-films",
      badge: null,
    },
    { icon: Video, label: "Videos", path: "/admin/videos", badge: null },
    { icon: Calendar, label: "Events", path: "/admin/events", badge: null },
    { icon: Users, label: "Users", path: "/admin/users", badge: null },
    {
      icon: Package,
      label: "Plans",
      path: "/admin/subscriptions",
      badge: null,
    },
    {
      icon: DollarSign,
      label: "Payments",
      path: "/admin/payments",
      badge: null,
    },
    { icon: Settings, label: "Settings", path: "/admin/settings", badge: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex font-['Poppins']">
      {/* Modern Floating Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        className="fixed left-4 top-4 bottom-4 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-orange-500/10 border border-white/20 z-50 overflow-hidden"
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-200/50">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Film size={20} className="text-white" />
          </motion.div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="ml-3"
              >
                <h1 className="text-lg font-black text-slate-800">CG Cinema</h1>
                <p className="text-xs text-slate-500">Admin Panel</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-240px)]">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative group ${
                  isActive
                    ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg shadow-orange-400/30"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={20} strokeWidth={2.5} />

                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex items-center justify-between"
                    >
                      <span className="font-semibold text-sm">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-bold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </nav>

        {/* Collapse Toggle & Logout */}
        <div className="absolute bottom-8 left-0 right-0 px-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all mb-2"
          >
            <motion.div animate={{ rotate: sidebarCollapsed ? 0 : 180 }}>
              <ChevronRight size={20} className="text-slate-600" />
            </motion.div>
          </button>

          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl transition-all"
          >
            <LogOut size={20} />
            {!sidebarCollapsed && (
              <span className="font-semibold text-sm">Logout</span>
            )}
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        animate={{ marginLeft: sidebarCollapsed ? 100 : 280 }}
        className="flex-1 transition-all duration-300"
      >
        {/* Top Bar */}
        <header className="h-24 flex items-center justify-between px-8 mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800">Admin Panel</h2>
            <p className="text-slate-500">Manage your OTT platform 🚀</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-80 pl-12 pr-4 py-3 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition-all"
              />
            </div>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-3 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl hover:bg-orange-50 transition-all"
            >
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </motion.button>

            {/* Profile */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl shadow-lg shadow-orange-400/30 cursor-pointer"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-orange-500">
                A
              </div>
              <span className="text-white font-semibold text-sm">Admin</span>
            </motion.div>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-8 pb-8">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};

export default AdminLayout;
