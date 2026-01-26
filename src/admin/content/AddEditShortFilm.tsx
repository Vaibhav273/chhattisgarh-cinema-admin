// ═══════════════════════════════════════════════════════════════════════════════
// 🎞️ ADD/EDIT SHORT FILM - PRODUCTION READY
// Path: src/pages/admin/content/AddEditShortFilm.tsx
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
  Edit,
  Award,
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
  ShortFilm,
  CastMember,
  CrewMember,
  FestivalScreening,
} from "../../types";

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 TOAST NOTIFICATION (Same as Movie/WebSeries)
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
// 🏆 FESTIVAL SCREENING MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface FestivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (festival: FestivalScreening) => void;
  initialData?: FestivalScreening;
  mode: "add" | "edit";
}

const FestivalModal: React.FC<FestivalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}) => {
  const [festivalData, setFestivalData] = useState<FestivalScreening>({
    festivalName: "",
    festivalNameHindi: "",
    location: "",
    locationHindi: "",
    date: "",
    award: "",
    awardHindi: "",
  });

  useEffect(() => {
    if (initialData) {
      setFestivalData(initialData);
    } else {
      setFestivalData({
        festivalName: "",
        festivalNameHindi: "",
        location: "",
        locationHindi: "",
        date: "",
        award: "",
        awardHindi: "",
      });
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    if (!festivalData.festivalName.trim()) {
      alert("Festival name is required");
      return;
    }
    if (!festivalData.location.trim()) {
      alert("Location is required");
      return;
    }
    if (!festivalData.date.trim()) {
      alert("Date is required");
      return;
    }
    onSave(festivalData);
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
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <Award size={24} />
                </div>
                <h3 className="text-2xl font-black">
                  {mode === "add"
                    ? "Add Festival Screening"
                    : "Edit Festival Screening"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Festival Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={festivalData.festivalName}
                  onChange={(e) =>
                    setFestivalData({
                      ...festivalData,
                      festivalName: e.target.value,
                    })
                  }
                  placeholder="e.g., Cannes Film Festival"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Festival Name (Hindi)
                </label>
                <input
                  type="text"
                  value={festivalData.festivalNameHindi}
                  onChange={(e) =>
                    setFestivalData({
                      ...festivalData,
                      festivalNameHindi: e.target.value,
                    })
                  }
                  placeholder="समारोह का नाम"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={festivalData.location}
                  onChange={(e) =>
                    setFestivalData({
                      ...festivalData,
                      location: e.target.value,
                    })
                  }
                  placeholder="e.g., Cannes, France"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Location (Hindi)
                </label>
                <input
                  type="text"
                  value={festivalData.locationHindi}
                  onChange={(e) =>
                    setFestivalData({
                      ...festivalData,
                      locationHindi: e.target.value,
                    })
                  }
                  placeholder="स्थान"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={festivalData.date}
                  onChange={(e) =>
                    setFestivalData({ ...festivalData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Award/Recognition
                </label>
                <input
                  type="text"
                  value={festivalData.award}
                  onChange={(e) =>
                    setFestivalData({ ...festivalData, award: e.target.value })
                  }
                  placeholder="e.g., Best Short Film"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Award (Hindi)
                </label>
                <input
                  type="text"
                  value={festivalData.awardHindi}
                  onChange={(e) =>
                    setFestivalData({
                      ...festivalData,
                      awardHindi: e.target.value,
                    })
                  }
                  placeholder="पुरस्कार"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Save size={20} />
              Save Festival
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Cast & Crew Modals - Copy from AddEditMovie.tsx or AddEditWebSeries.tsx
// For brevity, using same modals

// ═══════════════════════════════════════════════════════════════════════════════
// 🎬 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const AddEditShortFilm: React.FC = () => {
  const { filmId } = useParams<{ filmId?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!filmId;

  // States
  const [loading, setLoading] = useState(false);
  const [fetchingFilm, setFetchingFilm] = useState(isEditMode);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Toast State
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });

  // Festival Modal State
  const [festivalModal, setFestivalModal] = useState({
    isOpen: false,
    mode: "add" as "add" | "edit",
    data: undefined as FestivalScreening | undefined,
    index: -1,
  });

  // Cast & Crew Modal States (same as Movie/WebSeries)
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

  // Form Data - Using ShortFilm interface
  const [formData, setFormData] = useState<Partial<ShortFilm>>({
    category: "short-film",
    title: "",
    titleHindi: "",
    description: "",
    descriptionHindi: "",
    thumbnail: "",
    posterUrl: "",
    backdropUrl: "",
    videoUrl: "",
    duration: "",
    releaseDate: "",
    year: "",
    language: "Hindi",
    genre: [],
    director: "",
    directorHindi: "",
    producer: "",
    producerHindi: "",
    writer: "",
    writerHindi: "",
    cast: [],
    crew: [],
    ageRating: "U/A",
    plotSummary: "",
    plotSummaryHindi: "",
    productionHouse: "",
    productionHouseHindi: "",
    filmmakerNotes: "",
    filmmakerNotesHindi: "",
    festivalScreenings: [],
    tags: [],
    socialMedia: {},
    isActive: true,
    isPublished: true,
    isPremium: false,
    isFeatured: false,
    isTrending: false,
    isNewRelease: true,
    isDownloadable: false,
  });

  // Temporary input states
  const [genreInput, setGenreInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  // Fetch film data for edit mode
  useEffect(() => {
    if (isEditMode && filmId) {
      fetchFilmData();
    }
  }, [isEditMode, filmId]);

  const fetchFilmData = async () => {
    try {
      setFetchingFilm(true);
      console.log("Fetching short film data for:", filmId);

      const filmDoc = await getDoc(doc(db, "shortfilms", filmId!));

      if (!filmDoc.exists()) {
        showToast("Short film not found", "error");
        navigate("/admin/content/short-films");
        return;
      }

      const filmData = filmDoc.data() as ShortFilm;
      console.log("Film data loaded:", filmData);

      setFormData({
        ...filmData,
        festivalScreenings: filmData.festivalScreenings || [],
      });

      setFetchingFilm(false);
    } catch (error) {
      console.error("Error fetching short film:", error);
      showToast("Failed to load short film data", "error");
      setFetchingFilm(false);
      navigate("/admin/content/short-films");
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

    if (!formData.videoUrl?.trim()) {
      newErrors.videoUrl = "Video URL is required";
    }

    if (!formData.duration?.trim()) {
      newErrors.duration = "Duration is required";
    }

    if (!formData.releaseDate) {
      newErrors.releaseDate = "Release date is required";
    }

    if (!formData.genre || formData.genre.length === 0) {
      newErrors.genre = "At least one genre is required";
    }

    if (!formData.director?.trim()) {
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
        await handleUpdateFilm();
      } else {
        await handleCreateFilm();
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      showToast(error.message || "Failed to save short film", "error");
      setLoading(false);
    }
  };

  // Create new film
  const handleCreateFilm = async () => {
    try {
      console.log("Creating new short film...");

      const newFilmRef = doc(collection(db, "shortfilms"));
      const newFilmId = newFilmRef.id;

      const filmData: Record<string, any> = {
        id: newFilmId,
        category: "short-film",

        // Basic Info
        title: formData.title!.trim(),
        description: formData.description!.trim(),
        videoUrl: formData.videoUrl!.trim(),

        // Details
        duration: formData.duration!.trim(),
        releaseDate: formData.releaseDate,
        year: formData.year,
        language: formData.language,
        genre: formData.genre,

        // People
        director: formData.director!.trim(),
        cast: formData.cast,
        crew: formData.crew,

        // Additional
        ageRating: formData.ageRating,

        // Status
        isActive: formData.isActive,
        isPublished: formData.isPublished,
        isPremium: formData.isPremium,
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        isNewRelease: formData.isNewRelease,
        isDownloadable: formData.isDownloadable,

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
        filmData.titleHindi = formData.titleHindi.trim();
      if (formData.descriptionHindi?.trim())
        filmData.descriptionHindi = formData.descriptionHindi.trim();
      if (formData.thumbnail?.trim())
        filmData.thumbnail = formData.thumbnail.trim();
      if (formData.posterUrl?.trim())
        filmData.posterUrl = formData.posterUrl.trim();
      if (formData.backdropUrl?.trim())
        filmData.backdropUrl = formData.backdropUrl.trim();
      if (formData.directorHindi?.trim())
        filmData.directorHindi = formData.directorHindi.trim();
      if (formData.producer?.trim())
        filmData.producer = formData.producer.trim();
      if (formData.producerHindi?.trim())
        filmData.producerHindi = formData.producerHindi.trim();
      if (formData.writer?.trim()) filmData.writer = formData.writer.trim();
      if (formData.writerHindi?.trim())
        filmData.writerHindi = formData.writerHindi.trim();
      if (formData.plotSummary?.trim())
        filmData.plotSummary = formData.plotSummary.trim();
      if (formData.plotSummaryHindi?.trim())
        filmData.plotSummaryHindi = formData.plotSummaryHindi.trim();
      if (formData.productionHouse?.trim())
        filmData.productionHouse = formData.productionHouse.trim();
      if (formData.productionHouseHindi?.trim())
        filmData.productionHouseHindi = formData.productionHouseHindi.trim();
      if (formData.filmmakerNotes?.trim())
        filmData.filmmakerNotes = formData.filmmakerNotes.trim();
      if (formData.filmmakerNotesHindi?.trim())
        filmData.filmmakerNotesHindi = formData.filmmakerNotesHindi.trim();
      if (
        formData.festivalScreenings &&
        formData.festivalScreenings.length > 0
      ) {
        filmData.festivalScreenings = formData.festivalScreenings;
      }
      if (formData.tags && formData.tags.length > 0)
        filmData.tags = formData.tags;
      if (
        formData.socialMedia &&
        Object.keys(formData.socialMedia).length > 0
      ) {
        filmData.socialMedia = formData.socialMedia;
      }

      await setDoc(newFilmRef, filmData);
      showToast("Short film created successfully!", "success");
      setLoading(false);

      setTimeout(() => navigate("/admin/content/short-films"), 1500);
    } catch (error: any) {
      console.error("Error creating short film:", error);
      throw error;
    }
  };

  // Update existing film
  const handleUpdateFilm = async () => {
    try {
      console.log("Updating short film...");

      const updateData: Record<string, any> = {
        title: formData.title!.trim(),
        description: formData.description!.trim(),
        videoUrl: formData.videoUrl!.trim(),
        duration: formData.duration!.trim(),
        releaseDate: formData.releaseDate,
        year: formData.year,
        language: formData.language,
        genre: formData.genre,
        director: formData.director!.trim(),
        cast: formData.cast,
        crew: formData.crew,
        ageRating: formData.ageRating,
        isActive: formData.isActive,
        isPublished: formData.isPublished,
        isPremium: formData.isPremium,
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        isNewRelease: formData.isNewRelease,
        isDownloadable: formData.isDownloadable,
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
      if (
        formData.festivalScreenings &&
        formData.festivalScreenings.length > 0
      ) {
        updateData.festivalScreenings = formData.festivalScreenings;
      }
      if (formData.tags && formData.tags.length > 0)
        updateData.tags = formData.tags;
      if (
        formData.socialMedia &&
        Object.keys(formData.socialMedia).length > 0
      ) {
        updateData.socialMedia = formData.socialMedia;
      }

      await updateDoc(doc(db, "shortfilms", filmId!), updateData);
      showToast("Short film updated successfully!", "success");
      setLoading(false);

      setTimeout(() => navigate("/admin/content/short-films"), 1500);
    } catch (error: any) {
      console.error("Error updating short film:", error);
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
  const addToArray = (field: "genre" | "tags", value: string) => {
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

  const removeFromArray = (field: "genre" | "tags", value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    setFormData((prev) => ({
      ...prev,
      [field]: currentArray.filter((item) => item !== value),
    }));
  };

  // Festival handlers
  const handleAddFestival = (festival: FestivalScreening) => {
    setFormData((prev) => ({
      ...prev,
      festivalScreenings: [...(prev.festivalScreenings || []), festival],
    }));
  };

  const handleEditFestival = (festival: FestivalScreening) => {
    const index = festivalModal.index;
    setFormData((prev) => ({
      ...prev,
      festivalScreenings: prev.festivalScreenings?.map((f, i) =>
        i === index ? festival : f,
      ),
    }));
  };

  const handleDeleteFestival = (index: number) => {
    if (
      window.confirm("Are you sure you want to delete this festival screening?")
    ) {
      setFormData((prev) => ({
        ...prev,
        festivalScreenings: prev.festivalScreenings?.filter(
          (_, i) => i !== index,
        ),
      }));
    }
  };

  // Cast & Crew handlers (same as Movie/WebSeries)
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

  // Loading state
  if (fetchingFilm) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-600 dark:text-slate-400 font-semibold">
          Loading short film data...
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

      {/* Festival Modal */}
      <FestivalModal
        isOpen={festivalModal.isOpen}
        onClose={() => setFestivalModal({ ...festivalModal, isOpen: false })}
        onSave={
          festivalModal.mode === "add" ? handleAddFestival : handleEditFestival
        }
        initialData={festivalModal.data}
        mode={festivalModal.mode}
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
          className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
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
                    onClick={() => navigate("/admin/content/short-films")}
                    className="p-3 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-white/30 transition-all"
                  >
                    <ArrowLeft size={24} />
                  </motion.button>

                  <div>
                    <h1 className="text-4xl font-black mb-2">
                      {isEditMode ? "Edit Short Film" : "Add New Short Film"}
                    </h1>
                    <p className="text-white/90">
                      {isEditMode
                        ? "Update short film information"
                        : "Create a new short film entry"}
                    </p>
                  </div>
                </div>
              </div>

              {isEditMode && (
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl font-bold">
                    ID: {filmId?.slice(0, 8)}...
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
                <Film size={24} className="text-orange-500" />
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
                    placeholder="Enter short film title"
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
                    placeholder="लघु फिल्म शीर्षक"
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
                    placeholder="Enter short film description"
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
                    placeholder="लघु फिल्म विवरण"
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 15 min"
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

                <div className="md:col-span-2">
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

            {/* PRODUCTION TEAM */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Users size={24} className="text-indigo-500" />
                Production Team
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Writer (Hindi)
                  </label>
                  <input
                    type="text"
                    name="writerHindi"
                    value={formData.writerHindi}
                    onChange={handleInputChange}
                    placeholder="लेखक का नाम"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Production House
                  </label>
                  <input
                    type="text"
                    name="productionHouse"
                    value={formData.productionHouse}
                    onChange={handleInputChange}
                    placeholder="Production house name"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Production House (Hindi)
                  </label>
                  <input
                    type="text"
                    name="productionHouseHindi"
                    value={formData.productionHouseHindi}
                    onChange={handleInputChange}
                    placeholder="प्रोडक्शन हाउस का नाम"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* FILMMAKER NOTES */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Edit size={24} className="text-teal-500" />
                Filmmaker Notes
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Filmmaker Notes
                  </label>
                  <textarea
                    name="filmmakerNotes"
                    value={formData.filmmakerNotes}
                    onChange={handleInputChange}
                    placeholder="Behind the scenes notes, creative vision, production challenges..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Filmmaker Notes (Hindi)
                  </label>
                  <textarea
                    name="filmmakerNotesHindi"
                    value={formData.filmmakerNotesHindi}
                    onChange={handleInputChange}
                    placeholder="फिल्म निर्माता के नोट्स..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* CAST MANAGEMENT - Copy from AddEditWebSeries */}
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

            {/* CREW MANAGEMENT - Copy from AddEditWebSeries */}
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

            {/* FESTIVAL SCREENINGS */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Award size={24} className="text-amber-500" />
                  Festival Screenings (
                  {formData.festivalScreenings?.length || 0})
                </h2>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setFestivalModal({
                      isOpen: true,
                      mode: "add",
                      data: undefined,
                      index: -1,
                    })
                  }
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Festival
                </motion.button>
              </div>

              {!formData.festivalScreenings ||
              formData.festivalScreenings.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <Award
                    size={48}
                    className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
                  />
                  <p className="text-slate-500 dark:text-slate-400 font-semibold">
                    No festival screenings added yet
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Add festivals where this film was screened
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.festivalScreenings.map((festival, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Award
                              size={20}
                              className="text-amber-600 dark:text-amber-400"
                            />
                            <h4 className="font-bold text-slate-800 dark:text-white">
                              {festival.festivalName}
                            </h4>
                          </div>
                          <div className="space-y-1 ml-8">
                            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                              <Globe size={14} />
                              {festival.location}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                              <Calendar size={14} />
                              {festival.date}
                            </p>
                            {festival.award && (
                              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                                <Star size={14} />
                                {festival.award}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              setFestivalModal({
                                isOpen: true,
                                mode: "edit",
                                data: festival,
                                index,
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
                            onClick={() => handleDeleteFestival(index)}
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

            {/* SOCIAL MEDIA - Same as WebSeries */}
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
                    <p className="text-xs text-slate-500">Enable film</p>
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

                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-teal-500 transition-all md:col-span-2">
                  <input
                    type="checkbox"
                    name="isDownloadable"
                    checked={formData.isDownloadable}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-teal-500 rounded focus:ring-2 focus:ring-teal-500"
                  />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">
                      Downloadable
                    </p>
                    <p className="text-xs text-slate-500">
                      Allow users to download this film
                    </p>
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
                onClick={() => navigate("/admin/content/short-films")}
                className="px-8 py-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="px-12 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {isEditMode ? "Update Short Film" : "Create Short Film"}
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

export default AddEditShortFilm;
