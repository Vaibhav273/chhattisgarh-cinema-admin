import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Image as ImageIcon,
    Plus,
    Edit2,
    Trash2,
    Eye,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    Layers,
    ExternalLink,
    MousePointerClick,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    collection,
    query,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
    orderBy,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type { Banner, BannerStats } from "../../types/ui";
interface ToastProps {
    message: string;
    type: "success" | "error" | "info" | "warning";
    isVisible: boolean;
    onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 TOAST NOTIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const colors = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500",
        warning: "bg-yellow-500",
    };

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        info: AlertCircle,
        warning: AlertCircle,
    };

    const Icon = icons[type];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: -50, x: "-50%" }}
                className="fixed top-6 left-1/2 z-50"
            >
                <div
                    className={`${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 min-w-[300px]`}
                >
                    <Icon size={24} />
                    <p className="font-bold text-lg">{message}</p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const BannersManagement: React.FC = () => {
    const navigate = useNavigate();

    // States
    const [loading, setLoading] = useState(true);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [stats, setStats] = useState<BannerStats>({
        totalBanners: 0,
        activeBanners: 0,
        inactiveBanners: 0,
        totalClicks: 0,
        totalViews: 0,
        averageCTR: 0,
    });

    // Preview modal
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

    // Toast
    const [toast, setToast] = useState({
        isVisible: false,
        message: "",
        type: "success" as "success" | "error" | "info" | "warning",
    });

    // Fetch banners
    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            console.log("Fetching banners...");

            const bannersQuery = query(
                collection(db, "banners"),
                orderBy("priority", "asc")
            );
            const bannersSnapshot = await getDocs(bannersQuery);

            const bannersList: Banner[] = [];
            let totalClicks = 0;
            let totalViews = 0;
            let activeBanners = 0;
            let inactiveBanners = 0;

            bannersSnapshot.forEach((doc) => {
                const data = doc.data();
                const banner: Banner = {
                    id: doc.id,
                    title: data.title || "",
                    imageUrl: data.imageUrl || "",
                    position: data.position || "Home Hero",
                    priority: data.priority || 0,
                    link: data.link || "",
                    clicks: data.clicks || 0,
                    views: data.views || 0,
                    isActive: data.isActive ?? true,
                    startDate: data.startDate || "",
                    endDate: data.endDate || "",
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                };

                bannersList.push(banner);
                totalClicks += banner.clicks;
                totalViews += banner.views;

                if (banner.isActive) activeBanners++;
                else inactiveBanners++;
            });

            const averageCTR = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

            setStats({
                totalBanners: bannersList.length,
                activeBanners,
                inactiveBanners,
                totalClicks,
                totalViews,
                averageCTR,
            });

            setBanners(bannersList);
            console.log("✅ Banners fetched successfully");
            setLoading(false);
        } catch (error) {
            console.error("Error fetching banners:", error);
            showToast("Failed to load banners", "error");
            setLoading(false);
        }
    };

    const showToast = (
        message: string,
        type: "success" | "error" | "info" | "warning"
    ) => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    const handleEdit = (banner: Banner) => {
        // Navigate to edit page with banner ID
        navigate(`/admin/banners/edit/${banner.id}`);
    };

    const handleDelete = async (banner: Banner) => {
        if (!window.confirm(`Are you sure you want to delete "${banner.title}"?`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, "banners", banner.id));
            showToast("Banner deleted successfully", "success");
            fetchBanners();
        } catch (error) {
            console.error("Error deleting banner:", error);
            showToast("Failed to delete banner", "error");
        }
    };

    const handleToggleActive = async (banner: Banner) => {
        try {
            await updateDoc(doc(db, "banners", banner.id), {
                isActive: !banner.isActive,
                updatedAt: Timestamp.now(),
            });
            showToast(
                `Banner ${!banner.isActive ? "activated" : "deactivated"} successfully`,
                "success"
            );
            fetchBanners();
        } catch (error) {
            console.error("Error toggling banner status:", error);
            showToast("Failed to update banner status", "error");
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mb-4"
                />
                <p className="text-slate-600 dark:text-slate-400 font-semibold">
                    Loading banners...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full pb-8">
            {/* Toast */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            <div className="space-y-6 w-full">
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                    />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                                    <ImageIcon size={32} />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black mb-2">Banners Management</h1>
                                    <p className="text-white/90 text-lg">
                                        Manage promotional banners and campaigns
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={fetchBanners}
                                    className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                                >
                                    <RefreshCw size={20} />
                                    Refresh
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate("/admin/marketing/banners/new")}
                                    className="px-8 py-3 bg-white text-pink-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                    <Plus size={20} />
                                    Add New Banner
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <Layers size={24} className="text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                            Total Banners
                        </p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                            {stats.totalBanners}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Active: {stats.activeBanners} • Inactive: {stats.inactiveBanners}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <Eye size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                            Total Views
                        </p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                            {formatNumber(stats.totalViews)}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
                            Across all banners
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                <MousePointerClick size={24} className="text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                            Total Clicks
                        </p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                            {formatNumber(stats.totalClicks)}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 font-bold">
                            User interactions
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                <TrendingUp size={24} className="text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                            Average CTR
                        </p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                            {stats.averageCTR.toFixed(2)}%
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-400 font-bold">
                            Click-through rate
                        </p>
                    </motion.div>
                </div>

                {/* BANNERS TABLE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">
                            All Banners
                        </h3>
                    </div>

                    {banners.length === 0 ? (
                        <div className="text-center py-16">
                            <ImageIcon
                                size={64}
                                className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
                            />
                            <p className="text-xl font-bold text-slate-500 dark:text-slate-400 mb-2">
                                No banners found
                            </p>
                            <p className="text-slate-400 dark:text-slate-500 mb-4">
                                Create your first promotional banner
                            </p>
                            <button
                                onClick={() => navigate("/admin/marketing/banners/new")}
                                className="px-6 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-all"
                            >
                                Add New Banner
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                            Banner
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                            Position
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                            Priority
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                            Views
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                            Clicks
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                            CTR
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {banners.map((banner, index) => (
                                        <motion.tr
                                            key={banner.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 + index * 0.05 }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-20 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                                                        <img
                                                            src={banner.imageUrl}
                                                            alt={banner.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <span className="font-bold text-slate-800 dark:text-white">
                                                        {banner.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold">
                                                    {banner.position}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-800 dark:text-white">
                                                    {banner.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-800 dark:text-white">
                                                    {formatNumber(banner.views)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-800 dark:text-white">
                                                    {formatNumber(banner.clicks)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-green-600 dark:text-green-400">
                                                    {banner.views > 0
                                                        ? ((banner.clicks / banner.views) * 100).toFixed(2)
                                                        : 0}
                                                    %
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleActive(banner)}
                                                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${banner.isActive
                                                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                                            : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                                        }`}
                                                >
                                                    {banner.isActive ? "Active" : "Inactive"}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedBanner(banner);
                                                            setIsPreviewOpen(true);
                                                        }}
                                                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                                        title="Preview"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(banner)}
                                                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(banner)}
                                                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* PREVIEW MODAL (Only this modal remains) */}
            <AnimatePresence>
                {isPreviewOpen && selectedBanner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsPreviewOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                                        Banner Preview
                                    </h2>
                                    <button
                                        onClick={() => setIsPreviewOpen(false)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                                    >
                                        <AlertCircle size={24} className="text-slate-600 dark:text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <img
                                    src={selectedBanner.imageUrl}
                                    alt={selectedBanner.title}
                                    className="w-full rounded-2xl shadow-lg"
                                />
                                <div className="mt-6 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                                            {selectedBanner.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-bold">
                                                {selectedBanner.position}
                                            </span>
                                            <span>Priority: {selectedBanner.priority}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                                Views
                                            </p>
                                            <p className="text-2xl font-black text-slate-800 dark:text-white">
                                                {formatNumber(selectedBanner.views)}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                                Clicks
                                            </p>
                                            <p className="text-2xl font-black text-slate-800 dark:text-white">
                                                {formatNumber(selectedBanner.clicks)}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                                CTR
                                            </p>
                                            <p className="text-2xl font-black text-green-600 dark:text-green-400">
                                                {selectedBanner.views > 0
                                                    ? ((selectedBanner.clicks / selectedBanner.views) * 100).toFixed(2)
                                                    : 0}
                                                %
                                            </p>
                                        </div>
                                    </div>

                                    {selectedBanner.link && (
                                        <div className="flex items-center gap-2">
                                            <ExternalLink size={18} className="text-slate-400" />
                                            <a
                                                href={selectedBanner.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                {selectedBanner.link}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BannersManagement;