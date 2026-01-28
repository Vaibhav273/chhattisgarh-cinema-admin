// src/components/admin/MediaLibrary.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Search,
    Image as ImageIcon,
    Film,
    Loader,
    CheckCircle,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

interface MediaLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (mediaUrl: string) => void;
    mediaType?: "image" | "video" | "all";
    title?: string;
}

interface MediaItem {
    id: string;
    url: string;
    type: "image" | "video";
    name: string;
    uploadedAt: any;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({
    isOpen,
    onClose,
    onSelect,
    mediaType = "all",
    title = "Select Media",
}) => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<"all" | "image" | "video">(mediaType);

    useEffect(() => {
        if (isOpen) {
            fetchMediaItems();
        }
    }, [isOpen]);

    const fetchMediaItems = async () => {
        try {
            setLoading(true);

            // Fetch from movies collection (posters and trailers)
            const moviesRef = collection(db, "movies");
            const moviesSnapshot = await getDocs(moviesRef);

            const items: MediaItem[] = [];

            moviesSnapshot.forEach((doc) => {
                const data = doc.data();

                // Add poster image
                if (data.posterUrl && (mediaType === "all" || mediaType === "image")) {
                    items.push({
                        id: `${doc.id}-poster`,
                        url: data.posterUrl,
                        type: "image",
                        name: `${data.title} - Poster`,
                        uploadedAt: data.createdAt,
                    });
                }

                // Add backdrop image
                if (data.backdropUrl && (mediaType === "all" || mediaType === "image")) {
                    items.push({
                        id: `${doc.id}-backdrop`,
                        url: data.backdropUrl,
                        type: "image",
                        name: `${data.title} - Backdrop`,
                        uploadedAt: data.createdAt,
                    });
                }

                // Add trailer video
                if (data.trailerUrl && (mediaType === "all" || mediaType === "video")) {
                    items.push({
                        id: `${doc.id}-trailer`,
                        url: data.trailerUrl,
                        type: "video",
                        name: `${data.title} - Trailer`,
                        uploadedAt: data.createdAt,
                    });
                }
            });

            setMediaItems(items);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching media:", error);
            setLoading(false);
        }
    };

    const filteredMedia = mediaItems.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || item.type === filterType;
        return matchesSearch && matchesType;
    });

    const handleSelect = () => {
        if (selectedMedia) {
            onSelect(selectedMedia);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-5xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                                {title}
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all shadow-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Search
                                    size={20}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search media..."
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {mediaType === "all" && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilterType("all")}
                                        className={`px-4 py-3 rounded-xl font-semibold transition-all ${filterType === "all"
                                                ? "bg-blue-500 text-white"
                                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                            }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setFilterType("image")}
                                        className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${filterType === "image"
                                                ? "bg-blue-500 text-white"
                                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                            }`}
                                    >
                                        <ImageIcon size={18} />
                                        Images
                                    </button>
                                    <button
                                        onClick={() => setFilterType("video")}
                                        className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${filterType === "video"
                                                ? "bg-blue-500 text-white"
                                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                            }`}
                                    >
                                        <Film size={18} />
                                        Videos
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Media Grid */}
                    <div className="flex-1 overflow-y-auto p-8">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader size={40} className="animate-spin text-blue-500" />
                            </div>
                        ) : filteredMedia.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                <ImageIcon size={64} className="mb-4 opacity-20" />
                                <p className="text-lg font-semibold">No media found</p>
                                <p className="text-sm">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredMedia.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => setSelectedMedia(item.url)}
                                        className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-4 transition-all ${selectedMedia === item.url
                                                ? "border-blue-500 shadow-lg shadow-blue-500/50"
                                                : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                                            }`}
                                    >
                                        {item.type === "image" ? (
                                            <img
                                                src={item.url}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                                <Film size={32} className="text-slate-400" />
                                            </div>
                                        )}

                                        {/* Selected Check */}
                                        {selectedMedia === item.url && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
                                            >
                                                <CheckCircle size={20} className="text-white" />
                                            </motion.div>
                                        )}

                                        {/* Type Badge */}
                                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded-lg text-xs font-semibold text-white flex items-center gap-1">
                                            {item.type === "image" ? (
                                                <ImageIcon size={12} />
                                            ) : (
                                                <Film size={12} />
                                            )}
                                            {item.type}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {selectedMedia
                                ? "Click 'Select' to use this media"
                                : "Click on any media to select"}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSelect}
                                disabled={!selectedMedia}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all ${selectedMedia
                                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg"
                                        : "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                                    }`}
                            >
                                Select Media
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MediaLibrary;
