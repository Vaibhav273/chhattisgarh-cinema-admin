// ═══════════════════════════════════════════════════════════════════════════════
// 🎬 ADD/EDIT MOVIE - PRODUCTION READY WITH CAST/CREW MANAGEMENT
// Path: src/pages/admin/content/AddEditMovie.tsx
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
  Users,
  User,
  Star,
  Calendar,
  Globe,
  Tag,
  Crown,
  Sparkles,
  TrendingUp,
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
import type { CastMember, CrewMember, SocialMedia } from "../../types";

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 TOAST NOTIFICATION
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
                  value={crewData.name}
                  onChange={(e) =>
                    setCrewData({ ...crewData, name: e.target.value })
                  }
                  placeholder="Christopher Nolan"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Name Hindi */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Name (Hindi)
                </label>
                <input
                  type="text"
                  value={crewData.nameHindi}
                  onChange={(e) =>
                    setCrewData({ ...crewData, nameHindi: e.target.value })
                  }
                  placeholder="क्रिस्टोफर नोलन"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Role */}
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
                  placeholder="Director, Producer, Writer, etc."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Department */}
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

              {/* Order */}
              <div className="md:col-span-2">
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

            {/* Profile Image */}
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

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Bio
              </label>
              <textarea
                value={crewData.bio}
                onChange={(e) =>
                  setCrewData({ ...crewData, bio: e.target.value })
                }
                placeholder="Brief biography..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Bio Hindi */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Bio (Hindi)
              </label>
              <textarea
                value={crewData.bioHindi}
                onChange={(e) =>
                  setCrewData({ ...crewData, bioHindi: e.target.value })
                }
                placeholder="संक्षिप्त जीवनी..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  value={crewData.socialMedia?.facebook || ""}
                  onChange={(e) =>
                    setCrewData({
                      ...crewData,
                      socialMedia: {
                        ...crewData.socialMedia,
                        facebook: e.target.value,
                      },
                    })
                  }
                  placeholder="Facebook URL"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={crewData.socialMedia?.instagram || ""}
                  onChange={(e) =>
                    setCrewData({
                      ...crewData,
                      socialMedia: {
                        ...crewData.socialMedia,
                        instagram: e.target.value,
                      },
                    })
                  }
                  placeholder="Instagram URL"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={crewData.socialMedia?.twitter || ""}
                  onChange={(e) =>
                    setCrewData({
                      ...crewData,
                      socialMedia: {
                        ...crewData.socialMedia,
                        twitter: e.target.value,
                      },
                    })
                  }
                  placeholder="Twitter URL"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={crewData.socialMedia?.imdb || ""}
                  onChange={(e) =>
                    setCrewData({
                      ...crewData,
                      socialMedia: {
                        ...crewData.socialMedia,
                        imdb: e.target.value,
                      },
                    })
                  }
                  placeholder="IMDb URL"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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

const AddEditMovie: React.FC = () => {
  const { movieId } = useParams<{ movieId?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!movieId;

  // States
  const [loading, setLoading] = useState(false);
  const [fetchingMovie, setFetchingMovie] = useState(isEditMode);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Toast State
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });

  // Modal States
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

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    titleHindi: "",
    description: "",
    descriptionHindi: "",
    thumbnail: "",
    posterUrl: "",
    backdropUrl: "",
    trailerUrl: "",
    videoUrl: "",
    duration: "",
    releaseDate: "",
    year: "",
    language: "Chhattisgarhi",
    genre: [] as string[],
    director: "",
    directorHindi: "",
    producer: "",
    producerHindi: "",
    writer: "",
    musicDirector: "",
    cast: [] as CastMember[],
    crew: [] as CrewMember[],
    ageRating: "U/A",
    certification: "U/A",
    studio: "",
    plotSummary: "",
    budget: "",
    boxOfficeCollection: "",
    tags: [] as string[],
    keywords: [] as string[],
    officialWebsite: "",
    socialMedia: {} as SocialMedia,
    isActive: true,
    isPublished: true,
    isPremium: false,
    isFeatured: false,
    isTrending: false,
    isNewRelease: true,
  });

  // Temporary input states for arrays
  const [genreInput, setGenreInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  // Fetch movie data for edit mode
  useEffect(() => {
    if (isEditMode && movieId) {
      fetchMovieData();
    }
  }, [isEditMode, movieId]);

  const fetchMovieData = async () => {
    try {
      setFetchingMovie(true);
      console.log("Fetching movie data for:", movieId);

      const movieDoc = await getDoc(doc(db, "movies", movieId!));

      if (!movieDoc.exists()) {
        showToast("Movie not found", "error");
        navigate("/admin/content");
        return;
      }

      const movieData = movieDoc.data();
      console.log("Movie data loaded:", movieData);

      setFormData({
        title: movieData.title || "",
        titleHindi: movieData.titleHindi || "",
        description: movieData.description || "",
        descriptionHindi: movieData.descriptionHindi || "",
        thumbnail: movieData.thumbnail || "",
        posterUrl: movieData.posterUrl || "",
        backdropUrl: movieData.backdropUrl || "",
        trailerUrl: movieData.trailerUrl || "",
        videoUrl: movieData.videoUrl || "",
        duration: movieData.duration || "",
        releaseDate: movieData.releaseDate || "",
        year: movieData.year || "",
        language: movieData.language || "Chhattisgarhi",
        genre: Array.isArray(movieData.genre) ? movieData.genre : [],
        director: movieData.director || "",
        directorHindi: movieData.directorHindi || "",
        producer: movieData.producer || "",
        producerHindi: movieData.producerHindi || "",
        writer: movieData.writer || "",
        musicDirector: movieData.musicDirector || "",
        cast: Array.isArray(movieData.cast) ? movieData.cast : [],
        crew: Array.isArray(movieData.crew) ? movieData.crew : [],
        ageRating: movieData.ageRating || "U/A",
        certification: movieData.certification || "U/A",
        studio: movieData.studio || "",
        plotSummary: movieData.plotSummary || "",
        budget: movieData.budget || "",
        boxOfficeCollection: movieData.boxOfficeCollection || "",
        tags: Array.isArray(movieData.tags) ? movieData.tags : [],
        keywords: Array.isArray(movieData.keywords) ? movieData.keywords : [],
        officialWebsite: movieData.officialWebsite || "",
        socialMedia: movieData.socialMedia || {},
        isActive: movieData.isActive !== false,
        isPublished: movieData.isPublished !== false,
        isPremium: movieData.isPremium === true,
        isFeatured: movieData.isFeatured === true,
        isTrending: movieData.isTrending === true,
        isNewRelease: movieData.isNewRelease === true,
      });

      setFetchingMovie(false);
    } catch (error) {
      console.error("Error fetching movie:", error);
      showToast("Failed to load movie data", "error");
      setFetchingMovie(false);
      navigate("/admin/content");
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 2) {
      newErrors.title = "Title must be at least 2 characters";
    }

    // Description
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // Video URL
    if (!formData.videoUrl.trim()) {
      newErrors.videoUrl = "Video URL is required";
    }

    // Duration
    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    }

    // Release Date
    if (!formData.releaseDate.trim()) {
      newErrors.releaseDate = "Release date is required";
    }

    // Year
    if (!formData.year.trim()) {
      newErrors.year = "Year is required";
    }

    // Genre
    if (formData.genre.length === 0) {
      newErrors.genre = "At least one genre is required";
    }

    // Director
    if (!formData.director.trim()) {
      newErrors.director = "Director is required";
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

      if (isEditMode) {
        await handleUpdateMovie();
      } else {
        await handleCreateMovie();
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      showToast(error.message || "Failed to save movie", "error");
      setLoading(false);
    }
  };

  // Create new movie
  const handleCreateMovie = async () => {
    try {
      console.log("Creating new movie...");

      const newMovieRef = doc(collection(db, "movies"));
      const newMovieId = newMovieRef.id;

      const movieData: Record<string, any> = {
        id: newMovieId,
        category: "movie",

        // Basic Info
        title: formData.title.trim(),
        description: formData.description.trim(),
        videoUrl: formData.videoUrl.trim(),

        // Details
        duration: formData.duration.trim(),
        releaseDate: formData.releaseDate.trim(),
        year: formData.year.trim(),
        language: formData.language,
        genre: formData.genre,

        // People
        director: formData.director.trim(),
        cast: formData.cast,
        crew: formData.crew,

        // Additional
        ageRating: formData.ageRating,
        certification: formData.certification,

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

      // Add optional fields only if they have values
      if (formData.titleHindi?.trim()) {
        movieData.titleHindi = formData.titleHindi.trim();
      }
      if (formData.descriptionHindi?.trim()) {
        movieData.descriptionHindi = formData.descriptionHindi.trim();
      }
      if (formData.thumbnail?.trim()) {
        movieData.thumbnail = formData.thumbnail.trim();
      }
      if (formData.posterUrl?.trim()) {
        movieData.posterUrl = formData.posterUrl.trim();
      }
      if (formData.backdropUrl?.trim()) {
        movieData.backdropUrl = formData.backdropUrl.trim();
      }
      if (formData.trailerUrl?.trim()) {
        movieData.trailerUrl = formData.trailerUrl.trim();
      }
      if (formData.directorHindi?.trim()) {
        movieData.directorHindi = formData.directorHindi.trim();
      }
      if (formData.producer?.trim()) {
        movieData.producer = formData.producer.trim();
      }
      if (formData.producerHindi?.trim()) {
        movieData.producerHindi = formData.producerHindi.trim();
      }
      if (formData.writer?.trim()) {
        movieData.writer = formData.writer.trim();
      }
      if (formData.musicDirector?.trim()) {
        movieData.musicDirector = formData.musicDirector.trim();
      }
      if (formData.studio?.trim()) {
        movieData.studio = formData.studio.trim();
      }
      if (formData.plotSummary?.trim()) {
        movieData.plotSummary = formData.plotSummary.trim();
      }
      if (formData.budget?.trim()) {
        movieData.budget = formData.budget.trim();
      }
      if (formData.boxOfficeCollection?.trim()) {
        movieData.boxOfficeCollection = formData.boxOfficeCollection.trim();
      }
      if (formData.tags.length > 0) {
        movieData.tags = formData.tags;
      }
      if (formData.keywords.length > 0) {
        movieData.keywords = formData.keywords;
      }
      if (formData.officialWebsite?.trim()) {
        movieData.officialWebsite = formData.officialWebsite.trim();
      }
      if (Object.keys(formData.socialMedia).length > 0) {
        movieData.socialMedia = formData.socialMedia;
      }

      await setDoc(newMovieRef, movieData);
      console.log("Movie created successfully:", newMovieId);

      showToast("Movie created successfully!", "success");
      setLoading(false);

      // Navigate to content list after 1.5 seconds
      setTimeout(() => {
        navigate("/admin/content");
      }, 1500);
    } catch (error: any) {
      console.error("Error creating movie:", error);
      throw error;
    }
  };

  // Update existing movie
  const handleUpdateMovie = async () => {
    try {
      console.log("Updating movie:", movieId);

      const movieRef = doc(db, "movies", movieId!);

      const updateData: Record<string, any> = {
        // Basic Info
        title: formData.title.trim(),
        description: formData.description.trim(),
        videoUrl: formData.videoUrl.trim(),

        // Details
        duration: formData.duration.trim(),
        releaseDate: formData.releaseDate.trim(),
        year: formData.year.trim(),
        language: formData.language,
        genre: formData.genre,

        // People
        director: formData.director.trim(),
        cast: formData.cast,
        crew: formData.crew,

        // Additional
        ageRating: formData.ageRating,
        certification: formData.certification,

        // Status
        isActive: formData.isActive,
        isPublished: formData.isPublished,
        isPremium: formData.isPremium,
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        isNewRelease: formData.isNewRelease,

        // Timestamp
        updatedAt: serverTimestamp(),
      };

      // Add optional fields only if they have values
      if (formData.titleHindi?.trim()) {
        updateData.titleHindi = formData.titleHindi.trim();
      }
      if (formData.descriptionHindi?.trim()) {
        updateData.descriptionHindi = formData.descriptionHindi.trim();
      }
      if (formData.thumbnail?.trim()) {
        updateData.thumbnail = formData.thumbnail.trim();
      }
      if (formData.posterUrl?.trim()) {
        updateData.posterUrl = formData.posterUrl.trim();
      }
      if (formData.backdropUrl?.trim()) {
        updateData.backdropUrl = formData.backdropUrl.trim();
      }
      if (formData.trailerUrl?.trim()) {
        updateData.trailerUrl = formData.trailerUrl.trim();
      }
      if (formData.directorHindi?.trim()) {
        updateData.directorHindi = formData.directorHindi.trim();
      }
      if (formData.producer?.trim()) {
        updateData.producer = formData.producer.trim();
      }
      if (formData.producerHindi?.trim()) {
        updateData.producerHindi = formData.producerHindi.trim();
      }
      if (formData.writer?.trim()) {
        updateData.writer = formData.writer.trim();
      }
      if (formData.musicDirector?.trim()) {
        updateData.musicDirector = formData.musicDirector.trim();
      }
      if (formData.studio?.trim()) {
        updateData.studio = formData.studio.trim();
      }
      if (formData.plotSummary?.trim()) {
        updateData.plotSummary = formData.plotSummary.trim();
      }
      if (formData.budget?.trim()) {
        updateData.budget = formData.budget.trim();
      }
      if (formData.boxOfficeCollection?.trim()) {
        updateData.boxOfficeCollection = formData.boxOfficeCollection.trim();
      }
      if (formData.tags.length > 0) {
        updateData.tags = formData.tags;
      }
      if (formData.keywords.length > 0) {
        updateData.keywords = formData.keywords;
      }
      if (formData.officialWebsite?.trim()) {
        updateData.officialWebsite = formData.officialWebsite.trim();
      }
      if (Object.keys(formData.socialMedia).length > 0) {
        updateData.socialMedia = formData.socialMedia;
      }

      await updateDoc(movieRef, updateData);
      console.log("Movie updated successfully");

      showToast("Movie updated successfully!", "success");
      setLoading(false);

      // Navigate to content list after 1.5 seconds
      setTimeout(() => {
        navigate("/admin/content");
      }, 1500);
    } catch (error: any) {
      console.error("Error updating movie:", error);
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

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Array handlers
  const addGenre = () => {
    if (genreInput.trim() && !formData.genre.includes(genreInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        genre: [...prev.genre, genreInput.trim()],
      }));
      setGenreInput("");
      if (errors.genre) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.genre;
          return newErrors;
        });
      }
    }
  };

  const removeGenre = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genre: prev.genre.filter((g) => g !== genre),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const addKeyword = () => {
    if (
      keywordInput.trim() &&
      !formData.keywords.includes(keywordInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  // Cast handlers
  const handleAddCast = (cast: CastMember) => {
    setFormData((prev) => ({
      ...prev,
      cast: [...prev.cast, { ...cast, id: Date.now().toString() }],
    }));
  };

  const handleEditCast = (cast: CastMember) => {
    setFormData((prev) => ({
      ...prev,
      cast: prev.cast.map((c, i) => (i === castModal.index ? cast : c)),
    }));
  };

  const handleDeleteCast = (index: number) => {
    if (window.confirm("Are you sure you want to remove this cast member?")) {
      setFormData((prev) => ({
        ...prev,
        cast: prev.cast.filter((_, i) => i !== index),
      }));
    }
  };

  // Crew handlers
  const handleAddCrew = (crew: CrewMember) => {
    setFormData((prev) => ({
      ...prev,
      crew: [...prev.crew, { ...crew, id: Date.now().toString() }],
    }));
  };

  const handleEditCrew = (crew: CrewMember) => {
    setFormData((prev) => ({
      ...prev,
      crew: prev.crew.map((c, i) => (i === crewModal.index ? crew : c)),
    }));
  };

  const handleDeleteCrew = (index: number) => {
    if (window.confirm("Are you sure you want to remove this crew member?")) {
      setFormData((prev) => ({
        ...prev,
        crew: prev.crew.filter((_, i) => i !== index),
      }));
    }
  };

  // Loading state
  if (fetchingMovie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-600 dark:text-slate-400 font-semibold">
          Loading movie data...
        </p>
      </div>
    );
  }

  // Render
  return (
    <div className="min-h-screen w-full pb-8">
      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Cast Modal */}
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
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
            }}
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1, x: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate("/admin/content/movies")}
                    className="p-3 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-white/30 transition-all"
                  >
                    <ArrowLeft size={24} />
                  </motion.button>

                  <div>
                    <h1 className="text-4xl font-black mb-2">
                      {isEditMode ? "Edit Movie" : "Add New Movie"}
                    </h1>
                    <p className="text-white/90">
                      {isEditMode
                        ? "Update movie information"
                        : "Create a new movie entry"}
                    </p>
                  </div>
                </div>
              </div>

              {isEditMode && (
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl font-bold">
                    ID: {movieId?.slice(0, 8)}...
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
            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 📝 BASIC INFORMATION */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Film size={24} className="text-blue-500" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter movie title"
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

                {/* Title Hindi */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Title (Hindi)
                  </label>
                  <input
                    type="text"
                    name="titleHindi"
                    value={formData.titleHindi}
                    onChange={handleInputChange}
                    placeholder="फिल्म का शीर्षक"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter movie description"
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

                {/* Description Hindi */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Description (Hindi)
                  </label>
                  <textarea
                    name="descriptionHindi"
                    value={formData.descriptionHindi}
                    onChange={handleInputChange}
                    placeholder="फिल्म का विवरण"
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Plot Summary */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Plot Summary
                  </label>
                  <textarea
                    name="plotSummary"
                    value={formData.plotSummary}
                    onChange={handleInputChange}
                    placeholder="Brief plot summary..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 🎨 MEDIA */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <ImageIcon size={24} className="text-purple-500" />
                Media URLs
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Video URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Video URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/video.m3u8"
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${
                      errors.videoUrl
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white`}
                  />
                  {errors.videoUrl && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.videoUrl}
                    </p>
                  )}
                </div>

                {/* Thumbnail */}
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

                {/* Poster URL */}
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

                {/* Backdrop URL */}
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

                {/* Trailer URL */}
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

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 📅 MOVIE DETAILS */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Calendar size={24} className="text-green-500" />
                Movie Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="2h 30m"
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${
                      errors.duration
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white`}
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.duration}
                    </p>
                  )}
                </div>

                {/* Release Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Release Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${
                      errors.releaseDate
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white`}
                  />
                  {errors.releaseDate && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.releaseDate}
                    </p>
                  )}
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="2024"
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${
                      errors.year
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white`}
                  />
                  {errors.year && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.year}
                    </p>
                  )}
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Language
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  >
                    <option value="Chhattisgarhi">Chhattisgarhi</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>

                {/* Age Rating */}
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
                    <option value="U/A">U/A</option>
                    <option value="A">A</option>
                    <option value="18+">18+</option>
                  </select>
                </div>

                {/* Certification */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Certification
                  </label>
                  <input
                    type="text"
                    name="certification"
                    value={formData.certification}
                    onChange={handleInputChange}
                    placeholder="U/A"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Studio */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Studio / Production House
                  </label>
                  <input
                    type="text"
                    name="studio"
                    value={formData.studio}
                    onChange={handleInputChange}
                    placeholder="Production house name"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Budget
                  </label>
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="₹50 Crore"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Box Office */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Box Office Collection
                  </label>
                  <input
                    type="text"
                    name="boxOfficeCollection"
                    value={formData.boxOfficeCollection}
                    onChange={handleInputChange}
                    placeholder="₹100 Crore"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 🎭 GENRE */}
            {/* ═══════════════════════════════════════════════════════════ */}
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
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addGenre())
                    }
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
                    onClick={addGenre}
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

                {formData.genre.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.genre.map((genre) => (
                      <span
                        key={genre}
                        className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-semibold flex items-center gap-2"
                      >
                        {genre}
                        <button
                          type="button"
                          onClick={() => removeGenre(genre)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 👥 CAST & CREW */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Users size={24} className="text-purple-500" />
                People
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Director */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Director <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="director"
                    value={formData.director}
                    onChange={handleInputChange}
                    placeholder="Director name"
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${
                      errors.director
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white`}
                  />
                  {errors.director && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.director}
                    </p>
                  )}
                </div>

                {/* Director Hindi */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Director (Hindi)
                  </label>
                  <input
                    type="text"
                    name="directorHindi"
                    value={formData.directorHindi}
                    onChange={handleInputChange}
                    placeholder="निर्देशक का नाम"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Producer */}
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

                {/* Producer Hindi */}
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

                {/* Writer */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Writer
                  </label>
                  <input
                    type="text"
                    name="writer"
                    value={formData.writer}
                    onChange={handleInputChange}
                    placeholder="Writer name"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Music Director */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Music Director
                  </label>
                  <input
                    type="text"
                    name="musicDirector"
                    value={formData.musicDirector}
                    onChange={handleInputChange}
                    placeholder="Music director name"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* CAST LIST */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <User size={20} className="text-purple-500" />
                    Cast Members ({formData.cast.length})
                  </h3>
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

                {formData.cast.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                    <User
                      size={48}
                      className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
                    />
                    <p className="text-slate-500 dark:text-slate-400">
                      No cast members added yet
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.cast
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((cast, index) => (
                        <motion.div
                          key={cast.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 transition-all"
                        >
                          {/* Profile Image */}
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 flex-shrink-0">
                            {cast.profileImage ? (
                              <img
                                src={cast.profileImage}
                                alt={cast.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                                {cast.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white truncate">
                              {cast.name}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              {cast.role}
                              {cast.characterName && ` • ${cast.characterName}`}
                            </p>
                            {cast.order !== undefined && (
                              <span className="inline-block mt-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
                                Order: {cast.order}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setCastModal({
                                  isOpen: true,
                                  mode: "edit",
                                  data: cast,
                                  index,
                                })
                              }
                              className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Film size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCast(index)}
                              className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </div>

              {/* CREW LIST */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Users size={20} className="text-blue-500" />
                    Crew Members ({formData.crew.length})
                  </h3>
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

                {formData.crew.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                    <Users
                      size={48}
                      className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
                    />
                    <p className="text-slate-500 dark:text-slate-400">
                      No crew members added yet
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.crew
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((crew, index) => (
                        <motion.div
                          key={crew.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all"
                        >
                          {/* Profile Image */}
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 flex-shrink-0">
                            {crew.profileImage ? (
                              <img
                                src={crew.profileImage}
                                alt={crew.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                                {crew.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white truncate">
                              {crew.name}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              {crew.role}
                              {crew.department && ` • ${crew.department}`}
                            </p>
                            {crew.order !== undefined && (
                              <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                Order: {crew.order}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setCrewModal({
                                  isOpen: true,
                                  mode: "edit",
                                  data: crew,
                                  index,
                                })
                              }
                              className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Film size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCrew(index)}
                              className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 🏷️ TAGS & KEYWORDS */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Tag size={24} className="text-pink-500" />
                Tags & Keywords
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tags */}
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                    Tags
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addTag())
                        }
                        placeholder="Enter tag and press Enter"
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-800 dark:text-white"
                      />
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addTag}
                        className="px-6 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-all flex items-center gap-2"
                      >
                        <Plus size={20} />
                      </motion.button>
                    </div>

                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl font-semibold flex items-center gap-2"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                    Keywords
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addKeyword())
                        }
                        placeholder="Enter keyword and press Enter"
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white"
                      />
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addKeyword}
                        className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all flex items-center gap-2"
                      >
                        <Plus size={20} />
                      </motion.button>
                    </div>

                    {formData.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl font-semibold flex items-center gap-2"
                          >
                            {keyword}
                            <button
                              type="button"
                              onClick={() => removeKeyword(keyword)}
                              className="hover:text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 🌐 SOCIAL MEDIA */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Globe size={24} className="text-cyan-500" />
                Social Media & Links
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Official Website
                  </label>
                  <input
                    type="text"
                    name="officialWebsite"
                    value={formData.officialWebsite}
                    onChange={handleInputChange}
                    placeholder="https://moviewebsite.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia.facebook || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          facebook: e.target.value,
                        },
                      })
                    }
                    placeholder="https://facebook.com/movie"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia.instagram || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          instagram: e.target.value,
                        },
                      })
                    }
                    placeholder="https://instagram.com/movie"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Twitter
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia.twitter || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          twitter: e.target.value,
                        },
                      })
                    }
                    placeholder="https://twitter.com/movie"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    YouTube
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia.youtube || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          youtube: e.target.value,
                        },
                      })
                    }
                    placeholder="https://youtube.com/movie"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    IMDb
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia.imdb || ""}
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
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* ⚙️ STATUS FLAGS */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Sparkles size={24} className="text-yellow-500" />
                Status & Visibility
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Active */}
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      Active
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Visible in the platform
                    </p>
                  </div>
                </label>

                {/* Published */}
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      Published
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Public access
                    </p>
                  </div>
                </label>

                {/* Premium */}
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                  <input
                    type="checkbox"
                    name="isPremium"
                    checked={formData.isPremium}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-yellow-500 rounded focus:ring-2 focus:ring-yellow-500"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                      <Crown size={16} className="text-yellow-500" />
                      Premium Content
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Requires subscription
                    </p>
                  </div>
                </label>

                {/* Featured */}
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                      <Star size={16} className="text-purple-500" />
                      Featured
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Show in featured section
                    </p>
                  </div>
                </label>

                {/* Trending */}
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                  <input
                    type="checkbox"
                    name="isTrending"
                    checked={formData.isTrending}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-2 focus:ring-pink-500"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                      <TrendingUp size={16} className="text-pink-500" />
                      Trending
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Show in trending section
                    </p>
                  </div>
                </label>

                {/* New Release */}
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                  <input
                    type="checkbox"
                    name="isNewRelease"
                    checked={formData.isNewRelease}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-cyan-500 rounded focus:ring-2 focus:ring-cyan-500"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-cyan-500" />
                      New Release
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Show "NEW" badge
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 💾 FORM ACTIONS */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/admin/content")}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {isEditMode ? "Update Movie" : "Create Movie"}
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

export default AddEditMovie;
