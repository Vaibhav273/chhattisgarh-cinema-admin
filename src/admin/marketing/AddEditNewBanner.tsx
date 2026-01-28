import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Upload,
    Image as ImageIcon,
    Link as LinkIcon,
    Calendar,
    Eye,
    Save,
    AlertCircle,
    CheckCircle,
    MapPin,
    Hash,
    FolderOpen,
    X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    Timestamp,
    query,
    orderBy,
    limit,
    getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../config/firebase";

interface ToastProps {
    message: string;
    type: "success" | "error" | "info" | "warning";
    isVisible: boolean;
    onClose: () => void;
}

interface FormErrors {
    title?: string;
    image?: string;
    link?: string;
    dates?: string;
}

interface MediaFile {
    id: string;
    url: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: any;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 TOAST NOTIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
    React.useEffect(() => {
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
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📂 MEDIA SELECTOR MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface MediaSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

const MediaSelector: React.FC<MediaSelectorProps> = ({ isOpen, onClose, onSelect }) => {
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState<string>("");

    useEffect(() => {
        if (isOpen) {
            fetchMediaFiles();
        }
    }, [isOpen]);

    const fetchMediaFiles = async () => {
        try {
            setLoading(true);
            const q = query(
                collection(db, "mediaLibrary"),
                orderBy("uploadedAt", "desc"),
                limit(50)
            );
            const snapshot = await getDocs(q);
            const files = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as MediaFile[];
            setMediaFiles(files.filter((file) => file.type.startsWith("image/")));
        } catch (error) {
            console.error("Error fetching media:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = () => {
        if (selectedMedia) {
            onSelect(selectedMedia);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-6 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                                <FolderOpen size={24} />
                            </div>
                            <h3 className="text-2xl font-black">Select from Media Library</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full"
                                />
                            </div>
                        ) : mediaFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <ImageIcon size={64} className="text-slate-300 dark:text-slate-600 mb-4" />
                                <p className="text-lg font-bold text-slate-400 dark:text-slate-500">
                                    No images in media library
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-600">
                                    Upload some images first
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {mediaFiles.map((file) => (
                                    <motion.div
                                        key={file.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedMedia(file.url)}
                                        className={`relative cursor-pointer rounded-xl overflow-hidden border-4 transition-all ${selectedMedia === file.url
                                            ? "border-pink-500 shadow-lg"
                                            : "border-transparent hover:border-pink-200 dark:hover:border-pink-800"
                                            }`}
                                    >
                                        <img
                                            src={file.url}
                                            alt={file.name}
                                            className="w-full h-48 object-cover"
                                        />
                                        {selectedMedia === file.url && (
                                            <div className="absolute inset-0 bg-pink-500/30 flex items-center justify-center">
                                                <CheckCircle size={48} className="text-white" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                                            <p className="text-xs font-semibold truncate">{file.name}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSelect}
                            disabled={!selectedMedia}
                            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <CheckCircle size={20} />
                            Select Image
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const AddEditNewBanner: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    // Loading state
    const [loading, setLoading] = useState(isEditMode);
    const [bannerNotFound, setBannerNotFound] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        title: "",
        position: "Home Hero",
        priority: 1,
        link: "",
        startDate: "",
        endDate: "",
        description: "",
        isActive: true,
    });

    const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

    // Toast
    const [toast, setToast] = useState({
        isVisible: false,
        message: "",
        type: "success" as "success" | "error" | "info" | "warning",
    });

    // Fetch banner data if in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            fetchBannerData();
        }
    }, [isEditMode, id]);

    const fetchBannerData = async () => {
        try {
            setLoading(true);
            const bannerDoc = await getDoc(doc(db, "banners", id!));

            if (!bannerDoc.exists()) {
                setBannerNotFound(true);
                showToast("Banner not found", "error");
                setLoading(false);
                return;
            }

            const data = bannerDoc.data();
            setFormData({
                title: data.title || "",
                position: data.position || "Home Hero",
                priority: data.priority || 1,
                link: data.link || "",
                startDate: data.startDate || "",
                endDate: data.endDate || "",
                description: data.description || "",
                isActive: data.isActive ?? true,
            });

            setCurrentImageUrl(data.imageUrl || "");
            setImagePreview(data.imageUrl || "");
            setLoading(false);
        } catch (error) {
            console.error("Error fetching banner:", error);
            showToast("Failed to load banner data", "error");
            setBannerNotFound(true);
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

    // Image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, image: "Image size should be less than 5MB" });
                showToast("Image size should be less than 5MB", "error");
                return;
            }

            // Validate file type
            if (!file.type.startsWith("image/")) {
                setErrors({ ...errors, image: "Please select a valid image file" });
                showToast("Please select a valid image file", "error");
                return;
            }

            setImageFile(file);
            setErrors({ ...errors, image: undefined });

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Select from media library
    const handleMediaSelect = (url: string) => {
        setImagePreview(url);
        setCurrentImageUrl(url);
        setImageFile(null); // Clear file since we're using existing URL
        setErrors({ ...errors, image: undefined });
    };

    // Remove image
    const handleRemoveImage = () => {
        setImageFile(null);
        if (isEditMode) {
            setImagePreview(currentImageUrl);
        } else {
            setImagePreview("");
            setCurrentImageUrl("");
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Banner title is required";
        }

        if (!isEditMode && !imageFile && !imagePreview) {
            newErrors.image = "Please select a banner image";
        }

        if (formData.link && !isValidUrl(formData.link)) {
            newErrors.link = "Please enter a valid URL";
        }

        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end < start) {
                newErrors.dates = "End date must be after start date";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    // Upload image to Firebase Storage
    const uploadImage = async (file: File): Promise<string> => {
        const storageRef = ref(
            storage,
            `banners/${Date.now()}_${file.name.replace(/\s+/g, "_")}`
        );
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast("Please fix the errors in the form", "warning");
            return;
        }

        try {
            setUploading(true);

            // Upload new image or use existing URL
            let imageUrl = currentImageUrl;
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            } else if (!imageUrl && imagePreview) {
                // Using media library URL
                imageUrl = imagePreview;
            }

            // Create banner data
            const bannerData = {
                title: formData.title.trim(),
                imageUrl,
                position: formData.position,
                priority: formData.priority,
                link: formData.link.trim() || null,
                description: formData.description.trim() || null,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
                isActive: formData.isActive,
                updatedAt: Timestamp.now(),
            };

            if (isEditMode) {
                await updateDoc(doc(db, "banners", id!), bannerData);
                showToast("Banner updated successfully!", "success");
            } else {
                await addDoc(collection(db, "banners"), {
                    ...bannerData,
                    clicks: 0,
                    views: 0,
                    createdAt: Timestamp.now(),
                });
                showToast("Banner created successfully!", "success");
            }

            setTimeout(() => {
                navigate("/admin/marketing/banners");
            }, 1500);

            setUploading(false);
        } catch (error) {
            console.error(`Error ${isEditMode ? "updating" : "creating"} banner:`, error);
            showToast(`Failed to ${isEditMode ? "update" : "create"} banner. Please try again.`, "error");
            setUploading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mb-4"
                />
                <p className="text-slate-600 dark:text-slate-400 font-semibold">
                    Loading banner data...
                </p>
            </div>
        );
    }

    // Not found state
    if (bannerNotFound) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <AlertCircle size={64} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                    Banner Not Found
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                    The banner you're looking for doesn't exist.
                </p>
                <button
                    onClick={() => navigate("/admin/marketing/banners")}
                    className="px-6 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-all"
                >
                    Back to Banners
                </button>
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

            {/* Media Selector Modal */}
            <MediaSelector
                isOpen={isMediaSelectorOpen}
                onClose={() => setIsMediaSelectorOpen(false)}
                onSelect={handleMediaSelect}
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
                        <button
                            onClick={() => navigate("/admin/marketing/banners")}
                            className="mb-4 px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                        >
                            <ArrowLeft size={20} />
                            Back to Banners
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                                <ImageIcon size={32} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black mb-2">
                                    {isEditMode ? "Edit Banner" : "Add New Banner"}
                                </h1>
                                <p className="text-white/90 text-lg">
                                    {isEditMode
                                        ? "Update banner details and settings"
                                        : "Create a new promotional banner for your platform"}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT COLUMN - Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Image Upload */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
                                            <ImageIcon size={20} className="text-pink-600 dark:text-pink-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                                Banner Image
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Upload or select from media library (Max 5MB)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {imagePreview ? (
                                        <div className="relative group">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-64 object-cover rounded-2xl"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-2xl flex items-center justify-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsMediaSelectorOpen(true)}
                                                    className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all flex items-center gap-2"
                                                >
                                                    <FolderOpen size={20} />
                                                    Media Library
                                                </button>
                                                <label className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all cursor-pointer">
                                                    Upload New
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageSelect}
                                                        className="hidden"
                                                    />
                                                </label>
                                                {(imageFile || (isEditMode && currentImageUrl)) && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveImage}
                                                        className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
                                                    >
                                                        Reset
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 flex flex-col items-center cursor-pointer hover:border-pink-500 dark:hover:border-pink-500 transition-all">
                                                <Upload size={64} className="text-slate-400 dark:text-slate-600 mb-4" />
                                                <span className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                    Click to upload banner image
                                                </span>
                                                <span className="text-sm text-slate-500 dark:text-slate-500">
                                                    PNG, JPG, GIF up to 5MB
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageSelect}
                                                    className="hidden"
                                                />
                                            </label>
                                            <div className="text-center">
                                                <span className="text-slate-500 dark:text-slate-400">or</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsMediaSelectorOpen(true)}
                                                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                            >
                                                <FolderOpen size={20} />
                                                Choose from Media Library
                                            </button>
                                        </div>
                                    )}
                                    {imageFile && (
                                        <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                                            <CheckCircle size={16} />
                                            New image selected. Will be uploaded on save.
                                        </p>
                                    )}
                                    {errors.image && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            {errors.image}
                                        </p>
                                    )}
                                </div>
                            </motion.div>

                            {/* Basic Details */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                        Basic Details
                                    </h3>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Banner Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData({ ...formData, title: e.target.value })
                                            }
                                            placeholder="e.g., Summer Sale 2026"
                                            className={`w-full px-4 py-3 border ${errors.title
                                                ? "border-red-500"
                                                : "border-slate-300 dark:border-slate-700"
                                                } rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                        />
                                        {errors.title && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                                <AlertCircle size={16} />
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({ ...formData, description: e.target.value })
                                            }
                                            placeholder="Brief description of the banner..."
                                            rows={3}
                                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                        />
                                    </div>

                                    {/* Position & Priority */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={16} />
                                                    Position
                                                </div>
                                            </label>
                                            <select
                                                value={formData.position}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, position: e.target.value })
                                                }
                                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            >
                                                <option value="Home Hero">Home Hero</option>
                                                <option value="Sidebar">Sidebar</option>
                                                <option value="Footer">Footer</option>
                                                <option value="Popup">Popup</option>
                                                <option value="Top Banner">Top Banner</option>
                                                <option value="Content Banner">Content Banner</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Hash size={16} />
                                                    Priority
                                                </div>
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.priority}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        priority: parseInt(e.target.value) || 1,
                                                    })
                                                }
                                                min="1"
                                                max="100"
                                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            />
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                Lower number = Higher priority
                                            </p>
                                        </div>
                                    </div>

                                    {/* Link */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            <div className="flex items-center gap-2">
                                                <LinkIcon size={16} />
                                                Link URL (Optional)
                                            </div>
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.link}
                                            onChange={(e) =>
                                                setFormData({ ...formData, link: e.target.value })
                                            }
                                            placeholder="https://example.com/offer"
                                            className={`w-full px-4 py-3 border ${errors.link
                                                ? "border-red-500"
                                                : "border-slate-300 dark:border-slate-700"
                                                } rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                        />
                                        {errors.link && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                                <AlertCircle size={16} />
                                                {errors.link}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Where should users go when they click this banner?
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Campaign Schedule */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                            <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                                Campaign Schedule
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Set when this banner should be active (optional)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, startDate: e.target.value })
                                                }
                                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, endDate: e.target.value })
                                                }
                                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            />
                                        </div>
                                    </div>
                                    {errors.dates && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            {errors.dates}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT COLUMN - Preview & Settings */}
                        <div className="space-y-6">
                            {/* Status */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                        Status
                                    </h3>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <div>
                                            <p className="font-bold text-slate-700 dark:text-slate-300">
                                                Active Status
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                Show banner on platform
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData({ ...formData, isActive: !formData.isActive })
                                            }
                                            className={`relative w-14 h-8 rounded-full transition-all ${formData.isActive
                                                ? "bg-green-500"
                                                : "bg-slate-300 dark:bg-slate-600"
                                                }`}
                                        >
                                            <div
                                                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.isActive ? "right-1" : "left-1"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Preview */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                            <Eye size={20} className="text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                            Preview
                                        </h3>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {imagePreview ? (
                                        <div className="space-y-4">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full rounded-xl shadow-lg"
                                            />
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                                <h4 className="font-bold text-slate-800 dark:text-white mb-2">
                                                    {formData.title || "Banner Title"}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded font-bold">
                                                        {formData.position}
                                                    </span>
                                                    <span>Priority: {formData.priority}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Eye size={48} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                            <p className="text-slate-500 dark:text-slate-400">
                                                Upload an image to see preview
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="space-y-3"
                            >
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {isEditMode ? "Updating Banner..." : "Creating Banner..."}
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            {isEditMode ? "Update Banner" : "Create Banner"}
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/admin/marketing/banners")}
                                    disabled={uploading}
                                    className="w-full px-6 py-4 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditNewBanner;
