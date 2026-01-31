// ═══════════════════════════════════════════════════════════════
// 🎞️ SHORT FILMS MANAGEMENT - PRODUCTION READY
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Video,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Play,
  Star,
  Clock,
  Calendar,
  Crown,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Award,
} from "lucide-react";
import { usePermissions } from "../../hooks/usePermissions";
import { Permission } from "../../types/roles";
import { type ShortFilm } from "../../types/content";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  where,
  startAfter,
  type DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import {
  logContentDelete,
  logContentUpdate,
  logError,
} from "../../utils/activityLogger";

// ═══════════════════════════════════════════════════════════════
// 🎨 CUSTOM ALERT MODAL
// ═══════════════════════════════════════════════════════════════
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: "danger" | "warning" | "success";
  loading?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  type = "danger",
  loading = false,
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: {
      bg: "from-red-500 to-pink-600",
      button: "bg-red-500 hover:bg-red-600",
    },
    warning: {
      bg: "from-orange-500 to-amber-600",
      button: "bg-orange-500 hover:bg-orange-600",
    },
    success: {
      bg: "from-green-500 to-emerald-600",
      button: "bg-green-500 hover:bg-green-600",
    },
  };

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
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          <div
            className={`bg-gradient-to-r ${colors[type].bg} p-6 text-white relative overflow-hidden`}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute inset-0 bg-white/10 rounded-full blur-3xl"
            />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black">{title}</h3>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              {message}
            </p>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-6 py-3 ${colors[type].button} text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════
// 🎉 SUCCESS/ERROR TOAST
// ═══════════════════════════════════════════════════════════════
interface ToastProps {
  message: string;
  type: "success" | "error";
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        exit={{ opacity: 0, y: -50, x: "-50%" }}
        className="fixed top-6 left-1/2 z-50"
      >
        <div
          className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 ${
            type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {type === "success" ? (
            <CheckCircle size={24} />
          ) : (
            <XCircle size={24} />
          )}
          <p className="font-bold text-lg">{message}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════
// 🎞️ MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const ShortFilmsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [shortFilms, setShortFilms] = useState<ShortFilm[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterGenre, setFilterGenre] = useState<string>("all");
  const [genres, setGenres] = useState<string[]>([]);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Alert Modal State
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    filmId: "",
    filmTitle: "",
  });

  // Toast State
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error",
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    featured: 0,
    premium: 0,
    totalViews: 0,
    awarded: 0,
  });

  // ═══════════════════════════════════════════════════════════════
  // 🎨 FETCH GENRES FROM FIRESTORE
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const genresDoc = await getDoc(doc(db, "settings", "genres"));

      if (genresDoc.exists()) {
        const genresData = genresDoc.data();
        setGenres(genresData.list || []);
      } else {
        const filmsSnapshot = await getDocs(collection(db, "shortfilms"));
        const allGenres = new Set<string>();

        filmsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.genre && Array.isArray(data.genre)) {
            data.genre.forEach((g: string) => allGenres.add(g));
          }
        });

        setGenres(Array.from(allGenres).sort());
      }
    } catch (error) {
      console.error("Error fetching genres:", error);
      setGenres([
        "Action",
        "Drama",
        "Comedy",
        "Thriller",
        "Romance",
        "Horror",
        "Sci-Fi",
        "Documentary",
        "Experimental",
        "Animation",
      ]);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🔄 FETCH SHORT FILMS
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    fetchShortFilms();
    fetchStats();
  }, [filterStatus, filterGenre]);

  const fetchShortFilms = async (loadMore = false) => {
    try {
      setLoading(true);

      let filmsQuery = query(
        collection(db, "shortfilms"),
        orderBy("createdAt", "desc"),
        limit(20),
      );

      if (filterStatus === "published") {
        filmsQuery = query(
          collection(db, "shortfilms"),
          where("isPublished", "==", true),
          orderBy("createdAt", "desc"),
          limit(20),
        );
      } else if (filterStatus === "featured") {
        filmsQuery = query(
          collection(db, "shortfilms"),
          where("isFeatured", "==", true),
          orderBy("createdAt", "desc"),
          limit(20),
        );
      } else if (filterStatus === "premium") {
        filmsQuery = query(
          collection(db, "shortfilms"),
          where("isPremium", "==", true),
          orderBy("createdAt", "desc"),
          limit(20),
        );
      }

      if (filterGenre !== "all") {
        filmsQuery = query(
          collection(db, "shortfilms"),
          where("genre", "array-contains", filterGenre),
          orderBy("createdAt", "desc"),
          limit(20),
        );
      }

      if (loadMore && lastDoc) {
        filmsQuery = query(filmsQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(filmsQuery);

      const filmsData: ShortFilm[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          category: "short-film",
          title: data.title || "",
          titleHindi: data.titleHindi,
          description: data.description,
          descriptionHindi: data.descriptionHindi,
          thumbnail: data.thumbnail,
          thumbnailUrl: data.thumbnailUrl,
          thumbnailCdnUrl: data.thumbnailCdnUrl,
          posterUrl: data.posterUrl,
          posterCdnUrl: data.posterCdnUrl,
          backdropUrl: data.backdropUrl,
          backdropCdnUrl: data.backdropCdnUrl,
          videoCdnUrl: data.videoCdnUrl,
          trailerCdnUrl: data.trailerCdnUrl,
          banner: data.banner,
          rating: data.rating,
          ratingCount: data.ratingCount,
          year: data.year,
          genre: data.genre || [],
          language: data.language,
          languageHindi: data.languageHindi,
          ageRating: data.ageRating,
          maturityRating: data.maturityRating,
          isFeatured: data.isFeatured,
          isTrending: data.isTrending,
          isNewRelease: data.isNewRelease,
          views: data.views || 0,
          likes: data.likes || 0,
          dislikes: data.dislikes || 0,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(),
          updatedAt: data.updatedAt?.toDate
            ? data.updatedAt.toDate()
            : new Date(),
          channelId: data.channelId,
          channelName: data.channelName,
          channelAvatar: data.channelAvatar,
          channelVerified: data.channelVerified,
          channelSubscribers: data.channelSubscribers,
          isActive: data.isActive,
          isPublished: data.isPublished,
          isPremium: data.isPremium,
          slug: data.slug,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          tags: data.tags,
          watchProgress: data.watchProgress,
          duration: data.duration,
          releaseDate: data.releaseDate?.toDate
            ? data.releaseDate.toDate()
            : data.releaseDate,
          director: data.director,
          directorHindi: data.directorHindi,
          producer: data.producer,
          producerHindi: data.producerHindi,
          writer: data.writer,
          writerHindi: data.writerHindi,
          cast: data.cast,
          crew: data.crew,
          videoUrl: data.videoUrl,
          videoQuality: data.videoQuality,
          subtitles: data.subtitles,
          awards: data.awards,
          festivalScreenings: data.festivalScreenings,
          plotSummary: data.plotSummary,
          plotSummaryHindi: data.plotSummaryHindi,
          productionHouse: data.productionHouse,
          productionHouseHindi: data.productionHouseHindi,
          relatedShortFilms: data.relatedShortFilms,
          userRatings: data.userRatings,
          screenshots: data.screenshots,
          posterImages: data.posterImages,
          isDownloadable: data.isDownloadable,
          watchCount: data.watchCount,
          shareCount: data.shareCount,
          bookmarkCount: data.bookmarkCount,
          filmmakerNotes: data.filmmakerNotes,
          filmmakerNotesHindi: data.filmmakerNotesHindi,
          commentsCount: data.commentsCount,
        };
      });

      if (loadMore) {
        setShortFilms((prev) => [...prev, ...filmsData]);
      } else {
        setShortFilms(filmsData);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === 20);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching short films:", error);
      await logError(
        "Short Films",
        `Failed to fetch short films: ${error.message}`,
        {
          filterStatus,
          filterGenre,
          error: error.stack || error.message,
        },
      );
      showToast("Failed to load short films", "error");
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const allFilmsSnapshot = await getDocs(collection(db, "shortfilms"));

      let total = 0;
      let published = 0;
      let featured = 0;
      let premium = 0;
      let totalViews = 0;
      let awarded = 0;

      allFilmsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        total++;
        totalViews += data.views || 0;

        if (data.isPublished) published++;
        if (data.isFeatured) featured++;
        if (data.isPremium) premium++;
        if (data.awards && data.awards.length > 0) awarded++;
      });

      setStats({ total, published, featured, premium, totalViews, awarded });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🗑️ DELETE SHORT FILM
  // ═══════════════════════════════════════════════════════════════
  const handleDeleteClick = (filmId: string, filmTitle: string) => {
    if (!can(Permission.DELETE_ANY_CONTENT)) {
      showToast("You do not have permission to delete short films", "error");
      return;
    }

    setAlertModal({
      isOpen: true,
      filmId,
      filmTitle,
    });
  };

  const confirmDelete = async () => {
    setActionLoading(true);
    try {
      const filmToDelete = shortFilms.find((f) => f.id === alertModal.filmId);

      await deleteDoc(doc(db, "shortfilms", alertModal.filmId));

      // ✅ LOG DELETION
      if (filmToDelete) {
        await logContentDelete(
          "short-film",
          alertModal.filmId,
          alertModal.filmTitle,
          "Short Films",
          {
            genre: filmToDelete.genre,
            language: filmToDelete.language,
            duration: filmToDelete.duration,
            year: filmToDelete.year,
            isPremium: filmToDelete.isPremium,
            isFeatured: filmToDelete.isFeatured,
            views: filmToDelete.views,
            awards: filmToDelete.awards?.length || 0,
          },
        );
      }

      setShortFilms((prev) => prev.filter((f) => f.id !== alertModal.filmId));
      setAlertModal({ isOpen: false, filmId: "", filmTitle: "" });
      fetchStats();
      showToast("Short film deleted successfully!", "success");
    } catch (error: any) {
      console.error("Error deleting short film:", error);

      // ✅ LOG ERROR
      await logError(
        "Short Films",
        `Failed to delete short film: ${error.message}`,
        {
          filmId: alertModal.filmId,
          filmTitle: alertModal.filmTitle,
          error: error.stack || error.message,
        },
      );

      showToast("Failed to delete short film", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ✏️ EDIT SHORT FILM
  // ═══════════════════════════════════════════════════════════════
  const handleEdit = (filmId: string) => {
    if (!can(Permission.EDIT_ANY_CONTENT)) {
      showToast("You do not have permission to edit short films", "error");
      return;
    }
    navigate(`/admin/content/shortfilms/edit/${filmId}`);
  };

  // ═══════════════════════════════════════════════════════════════
  // 👁️ VIEW SHORT FILM
  // ═══════════════════════════════════════════════════════════════
  const handleView = (filmId: string) => {
    navigate(`/admin/content/shortfilms/view/${filmId}`);
  };

  // ═══════════════════════════════════════════════════════════════
  // ✏️ TOGGLE PUBLISH
  // ═══════════════════════════════════════════════════════════════
  const handleTogglePublish = async (
    filmId: string,
    currentStatus: boolean,
  ) => {
    if (!can(Permission.EDIT_ANY_CONTENT)) {
      showToast("You do not have permission to edit short films", "error");
      return;
    }

    try {
      const film = shortFilms.find((f) => f.id === filmId);
      const newStatus = !currentStatus;

      await updateDoc(doc(db, "shortfilms", filmId), {
        isPublished: newStatus,
        updatedAt: Timestamp.now(),
      });

      // ✅ LOG PUBLISH/UNPUBLISH
      if (film) {
        await logContentUpdate(
          "short-film",
          filmId,
          film.title,
          "Short Films",
          {
            isPublished: currentStatus,
          },
          {
            isPublished: newStatus,
            action: newStatus ? "published" : "unpublished",
            genre: film.genre,
            language: film.language,
            duration: film.duration,
          },
        );
      }

      setShortFilms((prev) =>
        prev.map((f) =>
          f.id === filmId ? { ...f, isPublished: newStatus } : f,
        ),
      );
      fetchStats();
      showToast(
        `Short film ${newStatus ? "published" : "unpublished"} successfully!`,
        "success",
      );
    } catch (error: any) {
      console.error("Error updating status:", error);

      // ✅ LOG ERROR
      await logError(
        "Short Films",
        `Failed to update publish status: ${error.message}`,
        {
          filmId,
          currentStatus,
          error: error.stack || error.message,
        },
      );

      showToast("Failed to update status", "error");
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ⭐ TOGGLE FEATURED
  // ═══════════════════════════════════════════════════════════════
  const handleToggleFeatured = async (
    filmId: string,
    currentStatus: boolean,
  ) => {
    if (!can(Permission.EDIT_ANY_CONTENT)) {
      showToast("You do not have permission to edit short films", "error");
      return;
    }

    try {
      const film = shortFilms.find((f) => f.id === filmId);
      const newStatus = !currentStatus;

      await updateDoc(doc(db, "shortfilms", filmId), {
        isFeatured: newStatus,
        updatedAt: Timestamp.now(),
      });

      // ✅ LOG FEATURED/UNFEATURED
      if (film) {
        await logContentUpdate(
          "short-film",
          filmId,
          film.title,
          "Short Films",
          {
            isFeatured: currentStatus,
          },
          {
            isFeatured: newStatus,
            action: newStatus ? "featured" : "unfeatured",
            genre: film.genre,
            language: film.language,
            duration: film.duration,
          },
        );
      }

      setShortFilms((prev) =>
        prev.map((f) =>
          f.id === filmId ? { ...f, isFeatured: newStatus } : f,
        ),
      );
      fetchStats();
      showToast(
        `Short film ${newStatus ? "featured" : "unfeatured"} successfully!`,
        "success",
      );
    } catch (error: any) {
      console.error("Error updating featured status:", error);

      // ✅ LOG ERROR
      await logError(
        "Short Films",
        `Failed to update featured status: ${error.message}`,
        {
          filmId,
          currentStatus,
          error: error.stack || error.message,
        },
      );

      showToast("Failed to update featured status", "error");
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🎉 SHOW TOAST
  // ═══════════════════════════════════════════════════════════════
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  // ═══════════════════════════════════════════════════════════════
  // 🔍 FILTER SHORT FILMS
  // ═══════════════════════════════════════════════════════════════
  const filteredFilms = shortFilms.filter(
    (film) =>
      film.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (film.titleHindi &&
        film.titleHindi.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // ═══════════════════════════════════════════════════════════════
  // 🎨 FORMAT HELPERS
  // ═══════════════════════════════════════════════════════════════
  const formatRating = (rating: any): string => {
    if (typeof rating === "number") return rating.toFixed(1);
    if (rating && typeof rating === "object" && "average" in rating) {
      return rating.average?.toFixed(1) || "0.0";
    }
    return "0.0";
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + "M";
    if (views >= 1000) return (views / 1000).toFixed(1) + "K";
    return views.toString();
  };

  const formatYear = (year: string | number | undefined): string => {
    if (!year) return "N/A";
    return year.toString();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() =>
          setAlertModal({ isOpen: false, filmId: "", filmTitle: "" })
        }
        onConfirm={confirmDelete}
        title="Delete Short Film?"
        message={`Are you sure you want to delete "${alertModal.filmTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={actionLoading}
      />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 📊 HEADER & STATS */}
      {/* ═══════════════════════════════════════════════════════════ */}
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                <Video size={36} />
                Short Films Management
              </h1>
              <p className="text-white/90 text-lg">
                Manage your short films collection
              </p>
            </div>

            {can(Permission.UPLOAD_CONTENT) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/admin/content/shortfilms/add")}
                className="px-8 py-4 bg-white text-orange-600 rounded-2xl font-bold flex items-center gap-3 shadow-2xl hover:shadow-3xl transition-all"
              >
                <Plus size={24} />
                Add New Short Film
              </motion.button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
              <p className="text-white/80 text-sm mb-1">Total Films</p>
              <p className="text-4xl font-black">{stats.total}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
              <p className="text-white/80 text-sm mb-1">Published</p>
              <p className="text-4xl font-black text-green-300">
                {stats.published}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
              <p className="text-white/80 text-sm mb-1">Featured</p>
              <p className="text-4xl font-black text-yellow-300">
                {stats.featured}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
              <p className="text-white/80 text-sm mb-1">Premium</p>
              <p className="text-4xl font-black text-orange-300">
                {stats.premium}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
              <p className="text-white/80 text-sm mb-1">Awarded</p>
              <p className="text-4xl font-black text-amber-300">
                {stats.awarded}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
              <p className="text-white/80 text-sm mb-1">Total Views</p>
              <p className="text-4xl font-black">
                {formatViews(stats.totalViews)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 🔍 SEARCH & FILTERS */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search short films by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-white transition-all"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="featured">Featured</option>
            <option value="premium">Premium</option>
          </select>

          {/* Genre Filter */}
          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-white transition-all"
          >
            <option value="all">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchShortFilms()}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all"
          >
            🔄 Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 📋 SHORT FILMS GRID */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
          />
          <p className="text-slate-600 dark:text-slate-400 font-semibold">
            Loading short films...
          </p>
        </div>
      ) : filteredFilms.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFilms.map((film, index) => (
              <motion.div
                key={film.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[2/3] overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img
                    src={
                      film.posterCdnUrl ||
                      film.posterUrl ||
                      film.thumbnailCdnUrl ||
                      film.thumbnailUrl ||
                      film.thumbnail
                    }
                    alt={film.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/300x450/f97316/ffffff?text=" +
                        encodeURIComponent(film.title);
                    }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star
                          size={16}
                          className="text-yellow-400"
                          fill="currentColor"
                        />
                        <span className="text-white font-bold">
                          {formatRating(film.rating)}
                        </span>
                        <span className="text-white/80 text-sm ml-auto flex items-center gap-1">
                          <Eye size={14} />
                          {formatViews(film.views || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {!film.isPublished && (
                      <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold shadow-lg">
                        Draft
                      </span>
                    )}
                    {film.isFeatured && (
                      <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Sparkles size={12} />
                        Featured
                      </span>
                    )}
                    {film.awards && film.awards.length > 0 && (
                      <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Award size={12} />
                        {film.awards.length}
                      </span>
                    )}
                  </div>

                  {/* Premium Badge */}
                  {film.isPremium && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Crown size={12} />
                        Premium
                      </span>
                    </div>
                  )}

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleView(film.id)}
                      className="w-20 h-20 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl"
                    >
                      <Play
                        size={32}
                        className="text-orange-600 ml-1"
                        fill="currentColor"
                      />
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1 truncate">
                    {film.title}
                  </h3>
                  {film.titleHindi && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 truncate">
                      {film.titleHindi}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <Clock size={14} />
                    <span>{film.duration || "N/A"}</span>
                    <span>•</span>
                    <Calendar size={14} />
                    <span>{formatYear(film.year)}</span>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {film.genre?.slice(0, 2).map((g) => (
                      <span
                        key={g}
                        className="px-2 py-1 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg text-xs font-semibold"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleView(film.id)}
                      className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      View
                    </motion.button>

                    {can(Permission.EDIT_ANY_CONTENT) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(film.id)}
                        className="px-3 py-2 bg-blue-500 text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition-all"
                      >
                        <Edit size={16} />
                      </motion.button>
                    )}

                    {can(Permission.DELETE_ANY_CONTENT) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteClick(film.id, film.title)}
                        className="px-3 py-2 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-all"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    {can(Permission.EDIT_ANY_CONTENT) && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleTogglePublish(
                              film.id,
                              film.isPublished || false,
                            )
                          }
                          className={`flex-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                            film.isPublished
                              ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                              : "bg-green-100 text-green-600 dark:bg-green-900/30"
                          }`}
                        >
                          {film.isPublished ? "Unpublish" : "Publish"}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleToggleFeatured(
                              film.id,
                              film.isFeatured || false,
                            )
                          }
                          className={`flex-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                            film.isFeatured
                              ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800"
                          }`}
                        >
                          {film.isFeatured ? "⭐ Featured" : "Feature"}
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchShortFilms(true)}
                className="px-10 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-bold hover:shadow-2xl transition-all"
              >
                Load More Short Films
              </motion.button>
            </div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700"
        >
          <Video
            size={64}
            className="text-slate-300 dark:text-slate-700 mb-4"
          />
          <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">
            No Short Films Found
          </h3>
          <p className="text-slate-500 dark:text-slate-500 mb-6">
            {searchTerm
              ? "Try different search terms"
              : "Start by adding your first short film"}
          </p>
          {can(Permission.UPLOAD_CONTENT) && !searchTerm && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/admin/content/shortfilms/add")}
              className="px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Add Your First Short Film
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ShortFilmsManagement;
