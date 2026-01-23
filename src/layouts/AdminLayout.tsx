// ═══════════════════════════════════════════════════════════════
// 🎨 ADMIN LAYOUT WITH LIGHT/DARK MODE TOGGLE
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Film,
    Users,
    DollarSign,
    TrendingUp,
    Settings,
    LogOut,
    Bell,
    Search,
    ChevronRight,
    Clapperboard,
    Calendar,
    Shield,
    Flag,
    BarChart3,
    Megaphone,
    Server,
    Crown,
    Sparkles,
    UserCog,
    FileText,
    Sun,
    Moon,
} from "lucide-react";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { Permission } from "../types/roles";

const AdminLayout: React.FC = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { can, canAny, roleConfig, isSuperAdmin } = usePermissions();

    // Load theme preference from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem("adminTheme");
        if (savedTheme === "dark") {
            setDarkMode(true);
        }
    }, []);

    // Save theme preference
    const toggleTheme = () => {
        const newTheme = !darkMode;
        setDarkMode(newTheme);
        localStorage.setItem("adminTheme", newTheme ? "dark" : "light");
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/admin/login");
    };

    // ═══════════════════════════════════════════════════════════════
    // 📋 DYNAMIC MENU ITEMS WITH PERMISSIONS
    // ═══════════════════════════════════════════════════════════════
    const menuItems = [
        // Dashboard
        {
            icon: LayoutDashboard,
            label: "Dashboard",
            path: "/admin/dashboard",
            badge: null,
            show: true,
            color: "from-blue-400 to-cyan-500",
        },

        // Content Management
        {
            icon: Film,
            label: "Movies",
            path: "/admin/content/movies",
            badge: null,
            show: canAny([Permission.EDIT_ANY_CONTENT, Permission.UPLOAD_CONTENT]),
            color: "from-purple-400 to-pink-500",
        },
        {
            icon: TrendingUp,
            label: "Series",
            path: "/admin/content/series",
            badge: null,
            show: canAny([Permission.EDIT_ANY_CONTENT, Permission.UPLOAD_CONTENT]),
            color: "from-indigo-400 to-purple-500",
        },
        {
            icon: Clapperboard,
            label: "Short Films",
            path: "/admin/content/short-films",
            badge: null,
            show: canAny([Permission.EDIT_ANY_CONTENT, Permission.UPLOAD_CONTENT]),
            color: "from-pink-400 to-rose-500",
        },
        {
            icon: FileText,
            label: "Content Approval",
            path: "/admin/content/approval",
            badge: "3",
            show: can(Permission.APPROVE_CONTENT),
            color: "from-green-400 to-emerald-500",
        },

        // Events
        {
            icon: Calendar,
            label: "Events",
            path: "/admin/events/all",
            badge: null,
            show: can(Permission.UPLOAD_CONTENT),
            color: "from-orange-400 to-amber-500",
        },
        {
            icon: Calendar,
            label: "Event Bookings",
            path: "/admin/events/bookings",
            badge: null,
            show: can(Permission.VIEW_REVENUE),
            color: "from-teal-400 to-cyan-500",
        },

        // User Management
        {
            icon: Users,
            label: "All Users",
            path: "/admin/users/all",
            badge: null,
            show: can(Permission.MANAGE_ADMINS),
            color: "from-blue-400 to-indigo-500",
        },
        {
            icon: UserCog,
            label: "Admin Users",
            path: "/admin/users/admins",
            badge: null,
            show: can(Permission.MANAGE_ADMINS),
            color: "from-violet-400 to-purple-500",
        },
        {
            icon: Shield,
            label: "Roles & Permissions",
            path: "/admin/users/roles",
            badge: null,
            show: can(Permission.ASSIGN_ROLES),
            color: "from-amber-400 to-orange-500",
        },

        // Moderation
        {
            icon: Flag,
            label: "Comments",
            path: "/admin/moderation/comments",
            badge: "12",
            show: can(Permission.DELETE_COMMENTS),
            color: "from-red-400 to-pink-500",
        },
        {
            icon: Flag,
            label: "Reports",
            path: "/admin/moderation/reports",
            badge: "5",
            show: can(Permission.REVIEW_REPORTS),
            color: "from-orange-400 to-red-500",
        },
        {
            icon: Flag,
            label: "Banned Users",
            path: "/admin/moderation/banned-users",
            badge: null,
            show: can(Permission.BAN_USERS),
            color: "from-gray-400 to-gray-600",
        },

        // Finance
        {
            icon: DollarSign,
            label: "Subscriptions",
            path: "/admin/finance/subscriptions",
            badge: null,
            show: can(Permission.MANAGE_SUBSCRIPTIONS),
            color: "from-green-400 to-teal-500",
        },
        {
            icon: DollarSign,
            label: "Transactions",
            path: "/admin/finance/transactions",
            badge: null,
            show: can(Permission.VIEW_ALL_TRANSACTIONS),
            color: "from-emerald-400 to-green-500",
        },
        {
            icon: DollarSign,
            label: "Payouts",
            path: "/admin/finance/payouts",
            badge: null,
            show: can(Permission.MANAGE_PAYOUTS),
            color: "from-lime-400 to-green-500",
        },
        {
            icon: DollarSign,
            label: "Revenue Reports",
            path: "/admin/finance/reports",
            badge: null,
            show: can(Permission.VIEW_REVENUE),
            color: "from-yellow-400 to-amber-500",
        },

        // Analytics
        {
            icon: BarChart3,
            label: "Platform Analytics",
            path: "/admin/analytics/platform",
            badge: null,
            show: can(Permission.VIEW_PLATFORM_ANALYTICS),
            color: "from-cyan-400 to-blue-500",
        },
        {
            icon: BarChart3,
            label: "Content Analytics",
            path: "/admin/analytics/content",
            badge: null,
            show: can(Permission.VIEW_CONTENT_ANALYTICS),
            color: "from-blue-400 to-indigo-500",
        },
        {
            icon: BarChart3,
            label: "User Analytics",
            path: "/admin/analytics/users",
            badge: null,
            show: can(Permission.VIEW_USER_ANALYTICS),
            color: "from-indigo-400 to-purple-500",
        },

        // Marketing
        {
            icon: Megaphone,
            label: "Banners",
            path: "/admin/marketing/banners",
            badge: null,
            show: can(Permission.MANAGE_BANNERS),
            color: "from-pink-400 to-rose-500",
        },
        {
            icon: Megaphone,
            label: "Notifications",
            path: "/admin/marketing/notifications",
            badge: null,
            show: can(Permission.SEND_NOTIFICATIONS),
            color: "from-purple-400 to-pink-500",
        },
        {
            icon: Megaphone,
            label: "Promotions",
            path: "/admin/marketing/promotions",
            badge: null,
            show: can(Permission.RUN_PROMOTIONS),
            color: "from-orange-400 to-pink-500",
        },

        // Technical
        {
            icon: Server,
            label: "CDN Settings",
            path: "/admin/technical/cdn",
            badge: null,
            show: can(Permission.MANAGE_CDN),
            color: "from-slate-400 to-gray-600",
        },
        {
            icon: Server,
            label: "Encoding",
            path: "/admin/technical/encoding",
            badge: null,
            show: can(Permission.MANAGE_ENCODING),
            color: "from-gray-400 to-slate-600",
        },
        {
            icon: Server,
            label: "API Settings",
            path: "/admin/technical/api",
            badge: null,
            show: can(Permission.MANAGE_API_KEYS),
            color: "from-zinc-400 to-gray-600",
        },
        {
            icon: Server,
            label: "System Logs",
            path: "/admin/technical/logs",
            badge: null,
            show: can(Permission.VIEW_SERVER_LOGS),
            color: "from-neutral-400 to-gray-600",
        },

        // Settings
        {
            icon: Settings,
            label: "Platform Settings",
            path: "/admin/settings/platform",
            badge: null,
            show: can(Permission.MANAGE_PLATFORM_SETTINGS),
            color: "from-slate-400 to-zinc-600",
        },
        {
            icon: Settings,
            label: "Profile Settings",
            path: "/admin/settings/profile",
            badge: null,
            show: true,
            color: "from-gray-400 to-slate-600",
        },
    ].filter((item) => item.show);

    // Theme-based styles
    const bgClass = darkMode
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        : "bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50";

    const sidebarBg = darkMode
        ? "bg-slate-900/80 border-slate-800/50"
        : "bg-white/80 border-white/20";

    const textPrimary = darkMode ? "text-white" : "text-slate-800";
    const textSecondary = darkMode ? "text-slate-400" : "text-slate-600";
    const textMuted = darkMode ? "text-slate-500" : "text-slate-400";

    const itemHoverBg = darkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-100";
    const itemInactiveBg = darkMode ? "text-slate-400" : "text-slate-600";

    const searchBg = darkMode
        ? "bg-slate-900/80 border-slate-800 text-white placeholder-slate-500"
        : "bg-white/80 border-slate-200 text-slate-800 placeholder-slate-400";

    const buttonBg = darkMode
        ? "bg-slate-800/50 hover:bg-slate-800 border-slate-700/50"
        : "bg-slate-100 hover:bg-slate-200 border-slate-200";

    const notificationBg = darkMode
        ? "bg-slate-900/80 border-slate-800 hover:bg-slate-800"
        : "bg-white/80 border-slate-200 hover:bg-orange-50";

    return (
        <div className={`min-h-screen ${bgClass} flex font-Poppins transition-colors duration-300`}>
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: darkMode ? [0.1, 0.2, 0.1] : [0.05, 0.1, 0.05],
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [90, 0, 90],
                        opacity: darkMode ? [0.1, 0.2, 0.1] : [0.05, 0.1, 0.05],
                    }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
                />
            </div>

            {/* Modern Floating Sidebar */}
            <motion.aside
                animate={{ width: sidebarCollapsed ? 80 : 280 }}
                className={`fixed left-4 top-4 bottom-4 ${sidebarBg} backdrop-blur-2xl rounded-3xl shadow-2xl shadow-orange-500/10 border z-50 overflow-hidden transition-colors duration-300`}
            >
                {/* Logo */}
                <div className={`h-20 flex items-center px-6 border-b ${darkMode ? 'border-slate-800/50' : 'border-slate-200/50'}`}>
                    <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className="w-11 h-11 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30"
                    >
                        <Film size={22} className="text-white" />
                    </motion.div>
                    <AnimatePresence>
                        {!sidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="ml-3"
                            >
                                <h1 className="text-lg font-black bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
                                    CG Cinema
                                </h1>
                                <p className={`text-xs ${textMuted}`}>Admin Panel</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <nav className="mt-4 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-240px)] scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <motion.button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                whileHover={{ x: 4, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative group overflow-hidden ${isActive
                                    ? "bg-gradient-to-r " + item.color + " text-white shadow-lg"
                                    : `${itemInactiveBg} ${itemHoverBg}`
                                    }`}
                            >
                                {/* Glow effect on active */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-2xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                <Icon size={20} strokeWidth={2.5} className="relative z-10" />

                                <AnimatePresence>
                                    {!sidebarCollapsed && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex-1 flex items-center justify-between relative z-10"
                                        >
                                            <span className="font-semibold text-sm">
                                                {item.label}
                                            </span>
                                            {item.badge && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg"
                                                >
                                                    {item.badge}
                                                </motion.span>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Tooltip for collapsed state */}
                                {sidebarCollapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        whileHover={{ opacity: 1, x: 0 }}
                                        className={`absolute left-full ml-2 px-3 py-2 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'} text-sm rounded-xl whitespace-nowrap shadow-xl pointer-events-none border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}
                                    >
                                        {item.label}
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </nav>

                {/* Collapse Toggle & Logout */}
                <div className="absolute bottom-2 left-0 right-0 px-3 space-y-2">
                    <motion.button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center justify-center gap-3 px-4 py-3 ${buttonBg} rounded-2xl transition-all border`}
                    >
                        <motion.div
                            animate={{ rotate: sidebarCollapsed ? 0 : 180 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChevronRight size={20} className={textSecondary} />
                        </motion.div>
                    </motion.button>

                    <motion.button
                        onClick={handleLogout}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 rounded-2xl transition-all border border-red-500/20"
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
                animate={{ marginLeft: sidebarCollapsed ? 100 : 300 }}
                className="flex-1 transition-all duration-300"
            >
                {/* Top Bar */}
                <header className="h-24 flex items-center justify-between px-8 mb-8 relative">
                    <div>
                        <h2 className={`text-3xl font-black ${textPrimary} flex items-center gap-3`}>
                            {isSuperAdmin && <Crown className="text-yellow-500" size={32} />}
                            Admin Panel
                        </h2>
                        <p className={`${textSecondary} flex items-center gap-2`}>
                            Welcome back, <span className={`font-semibold ${textPrimary}`}>{user?.displayName || "Admin"}</span>
                            <span
                                className="px-2 py-0.5 text-xs font-bold rounded-full"
                                style={{
                                    backgroundColor: roleConfig.color + "20",
                                    color: roleConfig.color,
                                    border: `1px solid ${roleConfig.color}40`,
                                }}
                            >
                                {roleConfig.name}
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <motion.button
                            onClick={toggleTheme}
                            whileHover={{ scale: 1.05, rotate: 180 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-3 ${notificationBg} backdrop-blur-xl border rounded-2xl transition-all group`}
                        >
                            <AnimatePresence mode="wait">
                                {darkMode ? (
                                    <motion.div
                                        key="sun"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Sun size={20} className="text-yellow-500" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="moon"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Moon size={20} className="text-slate-700" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        {/* Search */}
                        <motion.div whileHover={{ scale: 1.02 }} className="relative">
                            <Search
                                className={`absolute left-4 top-1/2 -translate-y-1/2 ${textMuted}`}
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className={`w-80 pl-12 pr-4 py-3 ${searchBg} backdrop-blur-xl border rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all`}
                            />
                        </motion.div>

                        {/* Notifications */}
                        <motion.button
                            whileHover={{ scale: 1.05, rotate: 15 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative p-3 ${notificationBg} backdrop-blur-xl border rounded-2xl transition-all group`}
                        >
                            <Bell size={20} className={`${textSecondary} group-hover:text-orange-500 transition-colors`} />
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"
                            />
                        </motion.button>

                        {/* Profile */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl shadow-lg shadow-orange-500/30 cursor-pointer relative overflow-hidden group"
                        >
                            <motion.div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center font-black text-orange-500 text-sm relative z-10 shadow-lg">
                                {user?.displayName?.charAt(0).toUpperCase() || "A"}
                            </div>
                            <div className="relative z-10">
                                <span className="text-white font-bold text-sm block">
                                    {user?.displayName || "Admin"}
                                </span>
                            </div>
                            {isSuperAdmin && (
                                <Sparkles size={16} className="text-yellow-300 relative z-10" />
                            )}
                        </motion.div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="px-8 pb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Outlet />
                    </motion.div>
                </div>
            </motion.main>
        </div>
    );
};

export default AdminLayout;
