// ═══════════════════════════════════════════════════════════════════════════════
// 📺 ADD/EDIT WEB SERIES - PRODUCTION READY
// Path: src/pages/admin/content/AddEditWebSeries.tsx
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Film,
  X,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  Image as ImageIcon,
  User,
  Star,
  Calendar,
  Tag,
  Crown,
  Sparkles,
  TrendingUp,
  PlayCircle,
  Edit,
  List,
  Users,
  Globe,
} from "lucide-react";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type {
  WebSeries,
  Season,
  Episode,
  CastMember,
  CrewMember,
} from "../../types";

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 TOAST NOTIFICATION (Same as Movie)
// ═══════════════════════════════════════════════════════════════════════════════

interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  isVisible: boolean;
  onClose: () => void;
}

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
    error: XCircle,
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
// 📺 EPISODE MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface EpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (episode: Episode) => void;
  initialData?: Episode;
  mode: "add" | "edit";
  seasonNumber: number;
  existingEpisodes: Episode[];
}

const EpisodeModal: React.FC<EpisodeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
  seasonNumber,
  existingEpisodes,
}) => {
  const [episodeData, setEpisodeData] = useState<Episode>({
    id: "",
    episodeNumber: existingEpisodes.length + 1,
    seasonNumber: seasonNumber,
    title: "",
    titleHindi: "",
    description: "",
    descriptionHindi: "",
    thumbnail: "",
    videoUrl: "",
    duration: "",
    releaseDate: "",
    director: "",
    directorHindi: "",
    writer: "",
    writerHindi: "",
    rating: 0,
    isActive: true,
    isPremium: false,
    isDownloadable: true,
    views: 0,
    likes: 0,
  });

  useEffect(() => {
    if (initialData) {
      setEpisodeData(initialData);
    } else {
      setEpisodeData((prev) => ({
        ...prev,
        seasonNumber,
        episodeNumber: existingEpisodes.length + 1,
      }));
    }
  }, [initialData, seasonNumber, existingEpisodes]);

  const handleSave = () => {
    if (!episodeData.title.trim()) {
      alert("Episode title is required");
      return;
    }
    if (!episodeData.description.trim()) {
      alert("Episode description is required");
      return;
    }
    if (!episodeData.videoUrl.trim()) {
      alert("Video URL is required");
      return;
    }
    if (!episodeData.thumbnail.trim()) {
      alert("Thumbnail URL is required");
      return;
    }

    const episodeToSave: Episode = {
      ...episodeData,
      id:
        episodeData.id ||
        `ep-s${seasonNumber}-e${episodeData.episodeNumber}-${Date.now()}`,
    };

    onSave(episodeToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 text-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <PlayCircle size={24} />
                </div>
                <h3 className="text-2xl font-black">
                  {mode === "add" ? "Add Episode" : "Edit Episode"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Episode Number & Title */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Episode Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={episodeData.episodeNumber}
                  onChange={(e) =>
                    setEpisodeData({
                      ...episodeData,
                      episodeNumber: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={episodeData.title}
                  onChange={(e) =>
                    setEpisodeData({ ...episodeData, title: e.target.value })
                  }
                  placeholder="Episode title"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Title (Hindi)
                </label>
                <input
                  type="text"
                  value={episodeData.titleHindi}
                  onChange={(e) =>
                    setEpisodeData({
                      ...episodeData,
                      titleHindi: e.target.value,
                    })
                  }
                  placeholder="एपिसोड शीर्षक"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={episodeData.description}
                onChange={(e) =>
                  setEpisodeData({
                    ...episodeData,
                    description: e.target.value,
                  })
                }
                placeholder="Episode description"
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Description (Hindi)
              </label>
              <textarea
                value={episodeData.descriptionHindi}
                onChange={(e) =>
                  setEpisodeData({
                    ...episodeData,
                    descriptionHindi: e.target.value,
                  })
                }
                placeholder="एपिसोड विवरण"
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Media URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Video URL (HLS) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={episodeData.videoUrl}
                  onChange={(e) =>
                    setEpisodeData({ ...episodeData, videoUrl: e.target.value })
                  }
                  placeholder="https://example.com/video.m3u8"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Thumbnail URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={episodeData.thumbnail}
                  onChange={(e) =>
                    setEpisodeData({
                      ...episodeData,
                      thumbnail: e.target.value,
                    })
                  }
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={episodeData.duration}
                  onChange={(e) =>
                    setEpisodeData({ ...episodeData, duration: e.target.value })
                  }
                  placeholder="45 min"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Release Date
                </label>
                <input
                  type="date"
                  value={episodeData.releaseDate}
                  onChange={(e) =>
                    setEpisodeData({
                      ...episodeData,
                      releaseDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Rating
                </label>
                <input
                  type="number"
                  value={episodeData.rating}
                  onChange={(e) =>
                    setEpisodeData({
                      ...episodeData,
                      rating: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Director
                </label>
                <input
                  type="text"
                  value={episodeData.director}
                  onChange={(e) =>
                    setEpisodeData({ ...episodeData, director: e.target.value })
                  }
                  placeholder="Director name"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Writer
                </label>
                <input
                  type="text"
                  value={episodeData.writer}
                  onChange={(e) =>
                    setEpisodeData({ ...episodeData, writer: e.target.value })
                  }
                  placeholder="Writer name"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Status Flags */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={episodeData.isActive}
                  onChange={(e) =>
                    setEpisodeData({
                      ...episodeData,
                      isActive: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="font-semibold text-slate-800 dark:text-white">
                  Active
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={episodeData.isPremium}
                  onChange={(e) =>
                    setEpisodeData({
                      ...episodeData,
                      isPremium: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-yellow-500 rounded focus:ring-2 focus:ring-yellow-500"
                />
                <span className="font-semibold text-slate-800 dark:text-white">
                  Premium
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={episodeData.isDownloadable}
                  onChange={(e) =>
                    setEpisodeData({
                      ...episodeData,
                      isDownloadable: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800 dark:text-white">
                  Downloadable
                </span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3 sticky bottom-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Save size={20} />
              Save Episode
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 CAST MEMBER MODAL
// ═══════════════════════════════════════════════════════════════════════════════

// Add this BEFORE the main AddEditWebSeries component (after EpisodeModal)

// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 CAST MEMBER MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface CastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cast: CastMember) => void;
  initialData?: CastMember;
  mode: "add" | "edit";
}

const CastModal: React.FC<CastModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}) => {
  const [castData, setCastData] = useState<CastMember>({
    name: "",
    nameHindi: "",
    role: "Actor",
    characterName: "",
    characterNameHindi: "",
    profileImage: "",
    bio: "",
    bioHindi: "",
    socialMedia: {},
    order: 0,
  });

  useEffect(() => {
    if (initialData) {
      setCastData(initialData);
    }
  }, [initialData]);

  const handleSave = () => {
    if (!castData.name.trim()) {
      alert("Name is required");
      return;
    }
    onSave(castData);
    onClose();
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
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <User size={24} />
                </div>
                <h3 className="text-2xl font-black">
                  {mode === "add" ? "Add Cast Member" : "Edit Cast Member"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={castData.name}
                  onChange={(e) =>
                    setCastData({ ...castData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Name Hindi */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Name (Hindi)
                </label>
                <input
                  type="text"
                  value={castData.nameHindi}
                  onChange={(e) =>
                    setCastData({ ...castData, nameHindi: e.target.value })
                  }
                  placeholder="जॉन डो"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={castData.role}
                  onChange={(e) =>
                    setCastData({ ...castData, role: e.target.value as any })
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Actor">Actor</option>
                  <option value="Actress">Actress</option>
                  <option value="Supporting Actor">Supporting Actor</option>
                  <option value="Supporting Actress">Supporting Actress</option>
                  <option value="Child Actor">Child Actor</option>
                  <option value="Guest">Guest</option>
                </select>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={castData.order}
                  onChange={(e) =>
                    setCastData({
                      ...castData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Character Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Character Name
                </label>
                <input
                  type="text"
                  value={castData.characterName}
                  onChange={(e) =>
                    setCastData({ ...castData, characterName: e.target.value })
                  }
                  placeholder="Tony Stark"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Character Name Hindi */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Character Name (Hindi)
                </label>
                <input
                  type="text"
                  value={castData.characterNameHindi}
                  onChange={(e) =>
                    setCastData({
                      ...castData,
                      characterNameHindi: e.target.value,
                    })
                  }
                  placeholder="टोनी स्टार्क"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Profile Image */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Profile Image URL
              </label>
              <input
                type="text"
                value={castData.profileImage}
                onChange={(e) =>
                  setCastData({ ...castData, profileImage: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Bio
              </label>
              <textarea
                value={castData.bio}
                onChange={(e) =>
                  setCastData({ ...castData, bio: e.target.value })
                }
                placeholder="Brief biography..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Bio Hindi */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Bio (Hindi)
              </label>
              <textarea
                value={castData.bioHindi}
                onChange={(e) =>
                  setCastData({ ...castData, bioHindi: e.target.value })
                }
                placeholder="संक्षिप्त जीवनी..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Social Media Links */}
            <div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                Social Media
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={castData.socialMedia?.facebook || ""}
                  onChange={(e) =>
                    setCastData({
                      ...castData,
                      socialMedia: {
                        ...castData.socialMedia,
                        facebook: e.target.value,
                      },
                    })
                  }
                  placeholder="Facebook URL"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={castData.socialMedia?.instagram || ""}
                  onChange={(e) =>
                    setCastData({
                      ...castData,
                      socialMedia: {
                        ...castData.socialMedia,
                        instagram: e.target.value,
                      },
                    })
                  }
                  placeholder="Instagram URL"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={castData.socialMedia?.twitter || ""}
                  onChange={(e) =>
                    setCastData({
                      ...castData,
                      socialMedia: {
                        ...castData.socialMedia,
                        twitter: e.target.value,
                      },
                    })
                  }
                  placeholder="Twitter URL"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={castData.socialMedia?.imdb || ""}
                  onChange={(e) =>
                    setCastData({
                      ...castData,
                      socialMedia: {
                        ...castData.socialMedia,
                        imdb: e.target.value,
                      },
                    })
                  }
                  placeholder="IMDb URL"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3 sticky bottom-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Save size={20} />
              Save Cast Member
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 👷 CREW MEMBER MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface CrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (crew: CrewMember) => void;
  initialData?: CrewMember;
  mode: "add" | "edit";
}

const CrewModal: React.FC<CrewModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}) => {
  const [crewData, setCrewData] = useState<CrewMember>({
    name: "",
    nameHindi: "",
    role: "",
    department: "Direction",
    profileImage: "",
    bio: "",
    bioHindi: "",
    socialMedia: {},
    order: 0,
  });

  useEffect(() => {
    if (initialData) {
      setCrewData(initialData);
    }
  }, [initialData]);

  const handleSave = () => {
    if (!crewData.name.trim() || !crewData.role.trim()) {
      alert("Name and Role are required");
      return;
    }
    onSave(crewData);
    onClose();
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
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 text-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <Users size={24} />
                </div>
                <h3 className="text-2xl font-black">
                  {mode === "add" ? "Add Crew Member" : "Edit Crew Member"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Form - Similar structure as CastModal */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={crewData.name}
                  onChange={(e) =>
                    setCrewData({ ...crewData, name: e.target.value })
                  }
                  placeholder="Christopher Nolan"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={crewData.role}
                  onChange={(e) =>
                    setCrewData({ ...crewData, role: e.target.value })
                  }
                  placeholder="Director, Producer, etc."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Department
                </label>
                <select
                  value={crewData.department}
                  onChange={(e) =>
                    setCrewData({
                      ...crewData,
                      department: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Direction">Direction</option>
                  <option value="Production">Production</option>
                  <option value="Writing">Writing</option>
                  <option value="Cinematography">Cinematography</option>
                  <option value="Music">Music</option>
                  <option value="Editing">Editing</option>
                  <option value="Art">Art</option>
                  <option value="Costume">Costume</option>
                  <option value="Makeup">Makeup</option>
                  <option value="Sound">Sound</option>
                  <option value="VFX">VFX</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={crewData.order}
                  onChange={(e) =>
                    setCrewData({
                      ...crewData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Profile Image, Bio, Social Media - Same as Cast */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Profile Image URL
              </label>
              <input
                type="text"
                value={crewData.profileImage}
                onChange={(e) =>
                  setCrewData({ ...crewData, profileImage: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3 sticky bottom-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Save size={20} />
              Save Crew Member
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🎬 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const AddEditWebSeries: React.FC = () => {
  const { seriesId } = useParams<{ seriesId?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!seriesId;

  // States
  const [loading, setLoading] = useState(false);
  const [fetchingSeries, setFetchingSeries] = useState(isEditMode);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Toast State
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });

  // Episode Modal State
  const [episodeModal, setEpisodeModal] = useState({
    isOpen: false,
    mode: "add" as "add" | "edit",
    data: undefined as Episode | undefined,
    seasonIndex: -1,
    episodeIndex: -1,
  });

  const [castModal, setCastModal] = useState({
    isOpen: false,
    mode: "add" as "add" | "edit",
    data: undefined as CastMember | undefined,
    index: -1,
  });

  const [crewModal, setCrewModal] = useState({
    isOpen: false,
    mode: "add" as "add" | "edit",
    data: undefined as CrewMember | undefined,
    index: -1,
  });

  // Form Data - Using WebSeries interface
  const [formData, setFormData] = useState<Partial<WebSeries>>({
    category: "webseries",
    title: "",
    titleHindi: "",
    description: "",
    descriptionHindi: "",
    thumbnail: "",
    posterUrl: "",
    backdropUrl: "",
    trailerUrl: "",
    teaserUrl: "",
    creator: "",
    creatorHindi: "",
    episodeDuration: "",
    releaseDate: "",
    lastAirDate: "",
    year: "",
    language: "Hindi",
    genre: [],
    director: [],
    producer: "",
    producerHindi: "",
    writer: [],
    cast: [],
    crew: [],
    ageRating: "U/A",
    maturityRating: "",
    studio: "",
    network: "",
    networkHindi: "",
    plotSummary: "",
    plotSummaryHindi: "",
    status: "ongoing",
    tags: [],
    socialMedia: {},
    seasons: [
      {
        id: `season-1-${Date.now()}`,
        seasonNumber: 1,
        title: "Season 1",
        titleHindi: "सीजन 1",
        description: "",
        descriptionHindi: "",
        posterUrl: "",
        year: "",
        releaseDate: "",
        totalEpisodes: 0,
        episodes: [],
        isActive: true,
      },
    ],
    isActive: true,
    isPublished: true,
    isPremium: false,
    isFeatured: false,
    isTrending: false,
    isNewRelease: true,
  });

  // Temporary input states for arrays
  const [genreInput, setGenreInput] = useState("");
  const [directorInput, setDirectorInput] = useState("");
  const [writerInput, setWriterInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const handleAddCast = (cast: CastMember) => {
    setFormData((prev) => ({
      ...prev,
      cast: [...(prev.cast || []), cast],
    }));
  };

  const handleEditCast = (cast: CastMember) => {
    const index = castModal.index;
    setFormData((prev) => ({
      ...prev,
      cast: prev.cast?.map((c, i) => (i === index ? cast : c)),
    }));
  };

  // Crew handlers
  const handleAddCrew = (crew: CrewMember) => {
    setFormData((prev) => ({
      ...prev,
      crew: [...(prev.crew || []), crew],
    }));
  };

  const handleEditCrew = (crew: CrewMember) => {
    const index = crewModal.index;
    setFormData((prev) => ({
      ...prev,
      crew: prev.crew?.map((c, i) => (i === index ? crew : c)),
    }));
  };

  // Fetch series data for edit mode
  useEffect(() => {
    if (isEditMode && seriesId) {
      fetchSeriesData();
    }
  }, [isEditMode, seriesId]);

  const fetchSeriesData = async () => {
    try {
      setFetchingSeries(true);
      console.log("Fetching series data for:", seriesId);

      const seriesDoc = await getDoc(doc(db, "webseries", seriesId!));

      if (!seriesDoc.exists()) {
        showToast("Web series not found", "error");
        navigate("/admin/content");
        return;
      }

      const seriesData = seriesDoc.data() as WebSeries;
      console.log("Series data loaded:", seriesData);

      setFormData({
        ...seriesData,
        tags: seriesData.tags || [],
        socialMedia: seriesData.socialMedia || {},
        seasons:
          seriesData.seasons && seriesData.seasons.length > 0
            ? seriesData.seasons
            : [
                {
                  id: `season-1-${Date.now()}`,
                  seasonNumber: 1,
                  title: "Season 1",
                  titleHindi: "सीजन 1",
                  description: "",
                  descriptionHindi: "",
                  posterUrl: "",
                  year: "",
                  releaseDate: "",
                  totalEpisodes: 0,
                  episodes: [],
                  isActive: true,
                },
              ],
      });

      setFetchingSeries(false);
    } catch (error) {
      console.error("Error fetching series:", error);
      showToast("Failed to load series data", "error");
      setFetchingSeries(false);
      navigate("/admin/content");
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 2) {
      newErrors.title = "Title must be at least 2 characters";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.genre || formData.genre.length === 0) {
      newErrors.genre = "At least one genre is required";
    }

    if (!formData.creator?.trim()) {
      newErrors.creator = "Creator is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix all errors before submitting", "error");
      return;
    }

    try {
      setLoading(true);

      // Calculate totals
      const totalSeasons = formData.seasons?.length || 0;
      const totalEpisodes =
        formData.seasons?.reduce(
          (total, season) => total + (season.episodes?.length || 0),
          0,
        ) || 0;

      if (isEditMode) {
        await handleUpdateSeries(totalSeasons, totalEpisodes);
      } else {
        await handleCreateSeries(totalSeasons, totalEpisodes);
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      showToast(error.message || "Failed to save series", "error");
      setLoading(false);
    }
  };

  // Create new series
  const handleCreateSeries = async (
    totalSeasons: number,
    totalEpisodes: number,
  ) => {
    try {
      console.log("Creating new web series...");

      const newSeriesRef = doc(collection(db, "webseries"));
      const newSeriesId = newSeriesRef.id;

      const seriesData: Record<string, any> = {
        id: newSeriesId,
        category: "webseries",

        // Basic Info
        title: formData.title!.trim(),
        description: formData.description!.trim(),
        creator: formData.creator!.trim(),

        // Details
        genre: formData.genre,
        language: formData.language,
        ageRating: formData.ageRating,
        status: formData.status,

        // Totals
        totalSeasons,
        totalEpisodes,

        // Seasons with episodes
        seasons: formData.seasons?.map((season) => ({
          ...season,
          totalEpisodes: season.episodes?.length || 0,
        })),

        // Status
        isActive: formData.isActive,
        isPublished: formData.isPublished,
        isPremium: formData.isPremium,
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        isNewRelease: formData.isNewRelease,

        // Stats
        views: 0,
        likes: 0,
        watchCount: 0,

        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Add optional fields
      if (formData.titleHindi?.trim())
        seriesData.titleHindi = formData.titleHindi.trim();
      if (formData.descriptionHindi?.trim())
        seriesData.descriptionHindi = formData.descriptionHindi.trim();
      if (formData.thumbnail?.trim())
        seriesData.thumbnail = formData.thumbnail.trim();
      if (formData.posterUrl?.trim())
        seriesData.posterUrl = formData.posterUrl.trim();
      if (formData.backdropUrl?.trim())
        seriesData.backdropUrl = formData.backdropUrl.trim();
      if (formData.trailerUrl?.trim())
        seriesData.trailerUrl = formData.trailerUrl.trim();
      if (formData.teaserUrl?.trim())
        seriesData.teaserUrl = formData.teaserUrl.trim();
      if (formData.creatorHindi?.trim())
        seriesData.creatorHindi = formData.creatorHindi.trim();
      if (formData.producer?.trim())
        seriesData.producer = formData.producer.trim();
      if (formData.producerHindi?.trim())
        seriesData.producerHindi = formData.producerHindi.trim();
      if (formData.director && formData.director.length > 0)
        seriesData.director = formData.director;
      if (formData.writer && formData.writer.length > 0)
        seriesData.writer = formData.writer;
      if (formData.studio?.trim()) seriesData.studio = formData.studio.trim();
      if (formData.network?.trim())
        seriesData.network = formData.network.trim();
      if (formData.networkHindi?.trim())
        seriesData.networkHindi = formData.networkHindi.trim();
      if (formData.plotSummary?.trim())
        seriesData.plotSummary = formData.plotSummary.trim();
      if (formData.plotSummaryHindi?.trim())
        seriesData.plotSummaryHindi = formData.plotSummaryHindi.trim();
      if (formData.episodeDuration?.trim())
        seriesData.episodeDuration = formData.episodeDuration.trim();
      if (formData.releaseDate) seriesData.releaseDate = formData.releaseDate;
      if (formData.lastAirDate) seriesData.lastAirDate = formData.lastAirDate;
      if (formData.year) seriesData.year = formData.year;
      if (formData.cast && formData.cast.length > 0)
        seriesData.cast = formData.cast;
      if (formData.crew && formData.crew.length > 0)
        seriesData.crew = formData.crew;
      if (formData.tags && formData.tags.length > 0)
        seriesData.tags = formData.tags;
      if (
        formData.socialMedia &&
        Object.keys(formData.socialMedia).length > 0
      ) {
        seriesData.socialMedia = formData.socialMedia;
      }

      await setDoc(newSeriesRef, seriesData);
      showToast("Web series created successfully!", "success");
      setLoading(false);

      setTimeout(() => navigate("/admin/content"), 1500);
    } catch (error: any) {
      console.error("Error creating series:", error);
      throw error;
    }
  };

  // Update existing series
  const handleUpdateSeries = async (
    totalSeasons: number,
    totalEpisodes: number,
  ) => {
    try {
      console.log("Updating web series...");

      const updateData: Record<string, any> = {
        title: formData.title!.trim(),
        description: formData.description!.trim(),
        creator: formData.creator!.trim(),
        genre: formData.genre,
        language: formData.language,
        ageRating: formData.ageRating,
        status: formData.status,
        totalSeasons,
        totalEpisodes,
        seasons: formData.seasons?.map((season) => ({
          ...season,
          totalEpisodes: season.episodes?.length || 0,
        })),
        isActive: formData.isActive,
        isPublished: formData.isPublished,
        isPremium: formData.isPremium,
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        isNewRelease: formData.isNewRelease,
        updatedAt: serverTimestamp(),
      };

      // Add optional fields
      if (formData.titleHindi?.trim())
        updateData.titleHindi = formData.titleHindi.trim();
      if (formData.descriptionHindi?.trim())
        updateData.descriptionHindi = formData.descriptionHindi.trim();
      if (formData.thumbnail?.trim())
        updateData.thumbnail = formData.thumbnail.trim();
      if (formData.posterUrl?.trim())
        updateData.posterUrl = formData.posterUrl.trim();
      if (formData.backdropUrl?.trim())
        updateData.backdropUrl = formData.backdropUrl.trim();
      if (formData.trailerUrl?.trim())
        updateData.trailerUrl = formData.trailerUrl.trim();
      if (formData.teaserUrl?.trim())
        updateData.teaserUrl = formData.teaserUrl.trim();
      if (formData.cast && formData.cast.length > 0)
        updateData.cast = formData.cast;
      if (formData.crew && formData.crew.length > 0)
        updateData.crew = formData.crew;
      if (formData.tags && formData.tags.length > 0)
        updateData.tags = formData.tags;
      if (
        formData.socialMedia &&
        Object.keys(formData.socialMedia).length > 0
      ) {
        updateData.socialMedia = formData.socialMedia;
      }

      await updateDoc(doc(db, "webseries", seriesId!), updateData);
      showToast("Web series updated successfully!", "success");
      setLoading(false);

      setTimeout(() => navigate("/admin/content/webseries"), 1500);
    } catch (error: any) {
      console.error("Error updating series:", error);
      throw error;
    }
  };

  // Helper functions
  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning",
  ) => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Array handlers
  const addToArray = (
    field: "genre" | "director" | "writer" | "tags",
    value: string,
  ) => {
    if (value.trim()) {
      const currentArray = (formData[field] as string[]) || [];
      if (!currentArray.includes(value.trim())) {
        setFormData((prev) => ({
          ...prev,
          [field]: [...currentArray, value.trim()],
        }));
      }
    }
  };

  const removeFromArray = (
    field: "genre" | "director" | "writer" | "tags",
    value: string,
  ) => {
    const currentArray = (formData[field] as string[]) || [];
    setFormData((prev) => ({
      ...prev,
      [field]: currentArray.filter((item) => item !== value),
    }));
  };

  // Season handlers
  const addSeason = () => {
    const newSeasonNumber = (formData.seasons?.length || 0) + 1;
    const newSeason: Season = {
      id: `season-${newSeasonNumber}-${Date.now()}`,
      seasonNumber: newSeasonNumber,
      title: `Season ${newSeasonNumber}`,
      titleHindi: `सीजन ${newSeasonNumber}`,
      description: "",
      descriptionHindi: "",
      posterUrl: "",
      year: "",
      releaseDate: "",
      totalEpisodes: 0,
      episodes: [],
      isActive: true,
    };
    setFormData((prev) => ({
      ...prev,
      seasons: [...(prev.seasons || []), newSeason],
    }));
  };

  const removeSeason = (seasonIndex: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this season? All episodes will be lost.",
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        seasons: prev.seasons?.filter((_, i) => i !== seasonIndex),
      }));
    }
  };

  const updateSeason = (
    seasonIndex: number,
    field: keyof Season,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      seasons: prev.seasons?.map((season, i) =>
        i === seasonIndex ? { ...season, [field]: value } : season,
      ),
    }));
  };

  // Episode handlers
  const handleAddEpisode = (episode: Episode) => {
    const seasonIndex = episodeModal.seasonIndex;
    setFormData((prev) => ({
      ...prev,
      seasons: prev.seasons?.map((season, i) =>
        i === seasonIndex
          ? { ...season, episodes: [...(season.episodes || []), episode] }
          : season,
      ),
    }));
  };

  const handleEditEpisode = (episode: Episode) => {
    const { seasonIndex, episodeIndex } = episodeModal;
    setFormData((prev) => ({
      ...prev,
      seasons: prev.seasons?.map((season, si) =>
        si === seasonIndex
          ? {
              ...season,
              episodes: season.episodes?.map((ep, ei) =>
                ei === episodeIndex ? episode : ep,
              ),
            }
          : season,
      ),
    }));
  };

  const handleDeleteEpisode = (seasonIndex: number, episodeIndex: number) => {
    if (window.confirm("Are you sure you want to delete this episode?")) {
      setFormData((prev) => ({
        ...prev,
        seasons: prev.seasons?.map((season, si) =>
          si === seasonIndex
            ? {
                ...season,
                episodes: season.episodes?.filter(
                  (_, ei) => ei !== episodeIndex,
                ),
              }
            : season,
        ),
      }));
    }
  };

  // Loading state
  if (fetchingSeries) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-600 dark:text-slate-400 font-semibold">
          Loading series data...
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

      {/* Episode Modal */}
      <EpisodeModal
        isOpen={episodeModal.isOpen}
        onClose={() => setEpisodeModal({ ...episodeModal, isOpen: false })}
        onSave={
          episodeModal.mode === "add" ? handleAddEpisode : handleEditEpisode
        }
        initialData={episodeModal.data}
        mode={episodeModal.mode}
        seasonNumber={
          episodeModal.seasonIndex >= 0
            ? formData.seasons?.[episodeModal.seasonIndex]?.seasonNumber || 1
            : 1
        }
        existingEpisodes={
          episodeModal.seasonIndex >= 0
            ? formData.seasons?.[episodeModal.seasonIndex]?.episodes || []
            : []
        }
      />

      <CastModal
        isOpen={castModal.isOpen}
        onClose={() => setCastModal({ ...castModal, isOpen: false })}
        onSave={castModal.mode === "add" ? handleAddCast : handleEditCast}
        initialData={castModal.data}
        mode={castModal.mode}
      />

      {/* Crew Modal */}
      <CrewModal
        isOpen={crewModal.isOpen}
        onClose={() => setCrewModal({ ...crewModal, isOpen: false })}
        onSave={crewModal.mode === "add" ? handleAddCrew : handleEditCrew}
        initialData={crewModal.data}
        mode={crewModal.mode}
      />

      <div className="space-y-6 w-full">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1, x: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate("/admin/content")}
                    className="p-3 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-white/30 transition-all"
                  >
                    <ArrowLeft size={24} />
                  </motion.button>

                  <div>
                    <h1 className="text-4xl font-black mb-2">
                      {isEditMode ? "Edit Web Series" : "Add New Web Series"}
                    </h1>
                    <p className="text-white/90">
                      {isEditMode
                        ? "Update web series information"
                        : "Create a new web series with seasons & episodes"}
                    </p>
                  </div>
                </div>
              </div>

              {isEditMode && (
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl font-bold">
                    ID: {seriesId?.slice(0, 8)}...
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* BASIC INFORMATION */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Film size={24} className="text-blue-500" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter series title"
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${
                      errors.title
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Title (Hindi)
                  </label>
                  <input
                    type="text"
                    name="titleHindi"
                    value={formData.titleHindi}
                    onChange={handleInputChange}
                    placeholder="श्रृंखला शीर्षक"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter series description"
                    rows={4}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${
                      errors.description
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Description (Hindi)
                  </label>
                  <textarea
                    name="descriptionHindi"
                    value={formData.descriptionHindi}
                    onChange={handleInputChange}
                    placeholder="श्रृंखला विवरण"
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Creator <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="creator"
                    value={formData.creator}
                    onChange={handleInputChange}
                    placeholder="Creator name"
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${
                      errors.creator
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white`}
                  />
                  {errors.creator && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.creator}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Creator (Hindi)
                  </label>
                  <input
                    type="text"
                    name="creatorHindi"
                    value={formData.creatorHindi}
                    onChange={handleInputChange}
                    placeholder="निर्माता का नाम"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Language
                  </label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    placeholder="Hindi, English, etc."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Year
                  </label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="2024"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Episode Duration
                  </label>
                  <input
                    type="text"
                    name="episodeDuration"
                    value={formData.episodeDuration}
                    onChange={handleInputChange}
                    placeholder="45 min"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Age Rating
                  </label>
                  <select
                    name="ageRating"
                    value={formData.ageRating}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  >
                    <option value="U">U</option>
                    <option value="U/A 7+">U/A 7+</option>
                    <option value="U/A">U/A</option>
                    <option value="U/A 13+">U/A 13+</option>
                    <option value="U/A 16+">U/A 16+</option>
                    <option value="A">A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Network
                  </label>
                  <input
                    type="text"
                    name="network"
                    value={formData.network}
                    onChange={handleInputChange}
                    placeholder="Network name"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Plot Summary
                  </label>
                  <textarea
                    name="plotSummary"
                    value={formData.plotSummary}
                    onChange={handleInputChange}
                    placeholder="Detailed plot summary"
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
            {/* MEDIA */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <ImageIcon size={24} className="text-purple-500" />
                Media URLs
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="text"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleInputChange}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Poster URL
                  </label>
                  <input
                    type="text"
                    name="posterUrl"
                    value={formData.posterUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/poster.jpg"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Backdrop URL
                  </label>
                  <input
                    type="text"
                    name="backdropUrl"
                    value={formData.backdropUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/backdrop.jpg"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Trailer URL
                  </label>
                  <input
                    type="text"
                    name="trailerUrl"
                    value={formData.trailerUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/trailer.m3u8"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
            {/* GENRE */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Tag size={24} className="text-yellow-500" />
                Genre <span className="text-red-500">*</span>
              </h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToArray("genre", genreInput);
                        setGenreInput("");
                      }
                    }}
                    placeholder="Enter genre and press Enter"
                    className={`flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${
                      errors.genre
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white`}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      addToArray("genre", genreInput);
                      setGenreInput("");
                    }}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add
                  </motion.button>
                </div>

                {errors.genre && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.genre}
                  </p>
                )}

                {formData.genre && formData.genre.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.genre.map((genre) => (
                      <motion.span
                        key={genre}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-semibold flex items-center gap-2"
                      >
                        {genre}
                        <button
                          type="button"
                          onClick={() => removeFromArray("genre", genre)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* DIRECTORS */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <User size={24} className="text-indigo-500" />
                Directors
              </h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={directorInput}
                    onChange={(e) => setDirectorInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToArray("director", directorInput);
                        setDirectorInput("");
                      }
                    }}
                    placeholder="Enter director name and press Enter"
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      addToArray("director", directorInput);
                      setDirectorInput("");
                    }}
                    className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add
                  </motion.button>
                </div>

                {formData.director && formData.director.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.director.map((director) => (
                      <motion.span
                        key={director}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold flex items-center gap-2"
                      >
                        {director}
                        <button
                          type="button"
                          onClick={() => removeFromArray("director", director)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Users size={24} className="text-cyan-500" />
                Production Team
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Producer
                  </label>
                  <input
                    type="text"
                    name="producer"
                    value={formData.producer}
                    onChange={handleInputChange}
                    placeholder="Producer name"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Producer (Hindi)
                  </label>
                  <input
                    type="text"
                    name="producerHindi"
                    value={formData.producerHindi}
                    onChange={handleInputChange}
                    placeholder="निर्माता का नाम"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Studio
                  </label>
                  <input
                    type="text"
                    name="studio"
                    value={formData.studio}
                    onChange={handleInputChange}
                    placeholder="Studio name"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Network (Hindi)
                  </label>
                  <input
                    type="text"
                    name="networkHindi"
                    value={formData.networkHindi}
                    onChange={handleInputChange}
                    placeholder="नेटवर्क का नाम"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
            {/* WRITERS */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Edit size={24} className="text-orange-500" />
                Writers
              </h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={writerInput}
                    onChange={(e) => setWriterInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToArray("writer", writerInput);
                        setWriterInput("");
                      }
                    }}
                    placeholder="Enter writer name and press Enter"
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      addToArray("writer", writerInput);
                      setWriterInput("");
                    }}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add
                  </motion.button>
                </div>

                {formData.writer && formData.writer.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.writer.map((writer) => (
                      <motion.span
                        key={writer}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl font-semibold flex items-center gap-2"
                      >
                        {writer}
                        <button
                          type="button"
                          onClick={() => removeFromArray("writer", writer)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* TAGS */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Tag size={24} className="text-pink-500" />
                Tags & Keywords
              </h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToArray("tags", tagInput);
                        setTagInput("");
                      }
                    }}
                    placeholder="Enter tag and press Enter"
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      addToArray("tags", tagInput);
                      setTagInput("");
                    }}
                    className="px-6 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-all flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add
                  </motion.button>
                </div>

                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl font-semibold flex items-center gap-2"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeFromArray("tags", tag)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Globe size={24} className="text-teal-500" />
                Social Media & External Links
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Official Website
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia?.website || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          website: e.target.value,
                        },
                      })
                    }
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia?.facebook || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          facebook: e.target.value,
                        },
                      })
                    }
                    placeholder="https://facebook.com/..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia?.instagram || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          instagram: e.target.value,
                        },
                      })
                    }
                    placeholder="https://instagram.com/..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Twitter / X
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia?.twitter || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          twitter: e.target.value,
                        },
                      })
                    }
                    placeholder="https://twitter.com/..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    YouTube
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia?.youtube || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          youtube: e.target.value,
                        },
                      })
                    }
                    placeholder="https://youtube.com/..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    IMDb
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia?.imdb || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          imdb: e.target.value,
                        },
                      })
                    }
                    placeholder="https://imdb.com/title/..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Wikipedia
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia?.wikipedia || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          wikipedia: e.target.value,
                        },
                      })
                    }
                    placeholder="https://wikipedia.org/wiki/..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <User size={24} className="text-purple-500" />
                  Cast ({formData.cast?.length || 0} Members)
                </h2>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setCastModal({
                      isOpen: true,
                      mode: "add",
                      data: undefined,
                      index: -1,
                    })
                  }
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Cast
                </motion.button>
              </div>

              {!formData.cast || formData.cast.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <User
                    size={48}
                    className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
                  />
                  <p className="text-slate-500 dark:text-slate-400 font-semibold">
                    No cast members added yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.cast.map((member, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {member.profileImage ? (
                          <img
                            src={member.profileImage}
                            alt={member.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <User size={24} className="text-purple-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 dark:text-white">
                            {member.name}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {member.role}
                          </p>
                          {member.characterName && (
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              as {member.characterName}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setCastModal({
                                isOpen: true,
                                mode: "edit",
                                data: member,
                                index,
                              })
                            }
                            className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Delete this cast member?")) {
                                setFormData((prev) => ({
                                  ...prev,
                                  cast: prev.cast?.filter(
                                    (_, i) => i !== index,
                                  ),
                                }));
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            {/* CREW MANAGEMENT */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Users size={24} className="text-cyan-500" />
                  Crew ({formData.crew?.length || 0} Members)
                </h2>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setCrewModal({
                      isOpen: true,
                      mode: "add",
                      data: undefined,
                      index: -1,
                    })
                  }
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Crew
                </motion.button>
              </div>

              {!formData.crew || formData.crew.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <Users
                    size={48}
                    className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
                  />
                  <p className="text-slate-500 dark:text-slate-400 font-semibold">
                    No crew members added yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.crew.map((member, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {member.profileImage ? (
                          <img
                            src={member.profileImage}
                            alt={member.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                            <Users size={24} className="text-cyan-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 dark:text-white">
                            {member.name}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {member.role}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {member.department}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setCrewModal({
                                isOpen: true,
                                mode: "edit",
                                data: member,
                                index,
                              })
                            }
                            className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Delete this crew member?")) {
                                setFormData((prev) => ({
                                  ...prev,
                                  crew: prev.crew?.filter(
                                    (_, i) => i !== index,
                                  ),
                                }));
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            {/* SEASONS & EPISODES */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <List size={24} className="text-green-500" />
                  Seasons & Episodes ({formData.seasons?.length || 0} Seasons)
                </h2>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addSeason}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Season
                </motion.button>
              </div>

              <div className="space-y-6">
                {formData.seasons?.map((season, seasonIndex) => (
                  <motion.div
                    key={season.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg"
                  >
                    {/* Season Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Film size={20} className="text-green-500" />
                        Season {season.seasonNumber} (
                        {season.episodes?.length || 0} Episodes)
                      </h3>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-white dark:bg-slate-700 rounded-lg">
                          <input
                            type="checkbox"
                            checked={season.isActive}
                            onChange={(e) =>
                              updateSeason(
                                seasonIndex,
                                "isActive",
                                e.target.checked,
                              )
                            }
                            className="w-4 h-4 text-green-500 rounded"
                          />
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Active
                          </span>
                        </label>
                        {(formData.seasons?.length || 0) > 1 && (
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeSeason(seasonIndex)}
                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Season Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Season Title
                        </label>
                        <input
                          type="text"
                          value={season.title}
                          onChange={(e) =>
                            updateSeason(seasonIndex, "title", e.target.value)
                          }
                          placeholder="Season 1"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Year
                        </label>
                        <input
                          type="text"
                          value={season.year || ""}
                          onChange={(e) =>
                            updateSeason(seasonIndex, "year", e.target.value)
                          }
                          placeholder="2024"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={season.description || ""}
                          onChange={(e) =>
                            updateSeason(
                              seasonIndex,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Season description"
                          rows={2}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Episodes */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                          Episodes
                        </h4>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setEpisodeModal({
                              isOpen: true,
                              mode: "add",
                              data: undefined,
                              seasonIndex,
                              episodeIndex: -1,
                            })
                          }
                          className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all flex items-center gap-2"
                        >
                          <Plus size={18} />
                          Add Episode
                        </motion.button>
                      </div>

                      {!season.episodes || season.episodes.length === 0 ? (
                        <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                          <PlayCircle
                            size={40}
                            className="text-slate-300 dark:text-slate-700 mx-auto mb-3"
                          />
                          <p className="text-slate-500 dark:text-slate-400 font-semibold">
                            No episodes added yet
                          </p>
                          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                            Click "Add Episode" to create episodes for this
                            season
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {season.episodes.map((episode, episodeIndex) => (
                            <motion.div
                              key={episode.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-bold">
                                      E{episode.episodeNumber}
                                    </span>
                                    <h5 className="font-bold text-slate-800 dark:text-white">
                                      {episode.title}
                                    </h5>
                                    {episode.isPremium && (
                                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded text-xs font-bold flex items-center gap-1">
                                        <Crown size={12} />
                                        Premium
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                    {episode.description}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-500">
                                    {episode.duration && (
                                      <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {episode.duration}
                                      </span>
                                    )}
                                    {episode.releaseDate && (
                                      <span>{episode.releaseDate}</span>
                                    )}
                                    {episode.rating && (
                                      <span className="flex items-center gap-1">
                                        <Star size={12} />
                                        {episode.rating}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      setEpisodeModal({
                                        isOpen: true,
                                        mode: "edit",
                                        data: episode,
                                        seasonIndex,
                                        episodeIndex,
                                      })
                                    }
                                    className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                  >
                                    <Edit size={16} />
                                  </motion.button>
                                  <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      handleDeleteEpisode(
                                        seasonIndex,
                                        episodeIndex,
                                      )
                                    }
                                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                  >
                                    <Trash2 size={16} />
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* STATUS FLAGS */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Sparkles size={24} className="text-pink-500" />
                Status & Visibility
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">
                      Active
                    </p>
                    <p className="text-xs text-slate-500">Enable series</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-green-500 transition-all">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">
                      Published
                    </p>
                    <p className="text-xs text-slate-500">Make visible</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-yellow-500 transition-all">
                  <input
                    type="checkbox"
                    name="isPremium"
                    checked={formData.isPremium}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-yellow-500 rounded focus:ring-2 focus:ring-yellow-500"
                  />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                      <Crown size={14} />
                      Premium
                    </p>
                    <p className="text-xs text-slate-500">Paid content</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 transition-all">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                      <Star size={14} />
                      Featured
                    </p>
                    <p className="text-xs text-slate-500">Show on home</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-red-500 transition-all">
                  <input
                    type="checkbox"
                    name="isTrending"
                    checked={formData.isTrending}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-red-500 rounded focus:ring-2 focus:ring-red-500"
                  />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                      <TrendingUp size={14} />
                      Trending
                    </p>
                    <p className="text-xs text-slate-500">Hot content</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-pink-500 transition-all">
                  <input
                    type="checkbox"
                    name="isNewRelease"
                    checked={formData.isNewRelease}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-2 focus:ring-pink-500"
                  />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                      <Sparkles size={14} />
                      New Release
                    </p>
                    <p className="text-xs text-slate-500">Recently added</p>
                  </div>
                </label>
              </div>
            </div>
            {/* SUBMIT BUTTON */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/admin/content")}
                className="px-8 py-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {isEditMode ? "Update Series" : "Create Series"}
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddEditWebSeries;
