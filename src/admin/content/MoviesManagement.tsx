import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Film,
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
} from "lucide-react";
import { usePermissions } from "../../hooks/usePermissions";
import { Permission } from "../../types/roles";
import { type Movie } from "../../types/content";
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
          {/* Header with Gradient */}
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

          {/* Content */}
          <div className="p-6">
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
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
// 🎬 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const MoviesManagement: React.FC = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
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
    movieId: "",
    movieTitle: "",
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
  });

  // ═══════════════════════════════════════════════════════════════
  // 🎨 FETCH GENRES FROM FIRESTORE
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      // Try to get genres from settings document
      const genresDoc = await getDoc(doc(db, "settings", "genres"));

      if (genresDoc.exists()) {
        const genresData = genresDoc.data();
        setGenres(genresData.list || []);
      } else {
        // Fallback: Extract unique genres from existing movies
        const moviesSnapshot = await getDocs(collection(db, "movies"));
        const allGenres = new Set<string>();

        moviesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.genre && Array.isArray(data.genre)) {
            data.genre.forEach((g: string) => allGenres.add(g));
          }
        });

        setGenres(Array.from(allGenres).sort());
      }
    } catch (error) {
      console.error("Error fetching genres:", error);
      // Default genres as fallback
      setGenres([
        "Action",
        "Adventure",
        "Comedy",
        "Drama",
        "Horror",
        "Romance",
        "Sci-Fi",
        "Thriller",
        "Fantasy",
        "Mystery",
        "Crime",
        "Documentary",
      ]);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🔄 FETCH MOVIES
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    fetchMovies();
    fetchStats();
  }, [filterStatus, filterGenre]);

  const fetchMovies = async (loadMore = false) => {
    try {
      setLoading(true);

      // Build query
      let moviesQuery = query(
        collection(db, "movies"),
        orderBy("createdAt", "desc"),
        limit(20),
      );

      // Add filters
      if (filterStatus === "published") {
        moviesQuery = query(
          collection(db, "movies"),
          where("isPublished", "==", true),
          orderBy("createdAt", "desc"),
          limit(20),
        );
      } else if (filterStatus === "featured") {
        moviesQuery = query(
          collection(db, "movies"),
          where("isFeatured", "==", true),
          orderBy("createdAt", "desc"),
          limit(20),
        );
      } else if (filterStatus === "premium") {
        moviesQuery = query(
          collection(db, "movies"),
          where("isPremium", "==", true),
          orderBy("createdAt", "desc"),
          limit(20),
        );
      }

      if (filterGenre !== "all") {
        moviesQuery = query(
          collection(db, "movies"),
          where("genre", "array-contains", filterGenre),
          orderBy("createdAt", "desc"),
          limit(20),
        );
      }

      // Pagination
      if (loadMore && lastDoc) {
        moviesQuery = query(moviesQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(moviesQuery);

      const moviesData: Movie[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          category: "movie",
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
          trailerCdnUrl: data.trailerCdnUrl,
          videoCdnUrl: data.videoCdnUrl,
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
          musicDirector: data.musicDirector,
          musicDirectorHindi: data.musicDirectorHindi,
          cast: data.cast,
          crew: data.crew,
          trailerUrl: data.trailerUrl,
          videoUrl: data.videoUrl,
          videoQuality: data.videoQuality,
          subtitles: data.subtitles,
          awards: data.awards,
          boxOfficeCollection: data.boxOfficeCollection,
          budget: data.budget,
          certification: data.certification,
          studio: data.studio,
          studioHindi: data.studioHindi,
          plotSummary: data.plotSummary,
          plotSummaryHindi: data.plotSummaryHindi,
          trivia: data.trivia,
          triviaHindi: data.triviaHindi,
          soundtrack: data.soundtrack,
          relatedMovies: data.relatedMovies,
          userRatings: data.userRatings,
          screenshots: data.screenshots,
          posterImages: data.posterImages,
          downloadUrl: data.downloadUrl,
          streamingQuality: data.streamingQuality,
          isDownloadable: data.isDownloadable,
          watchCount: data.watchCount,
          shareCount: data.shareCount,
          bookmarkCount: data.bookmarkCount,
          commentsCount: data.commentsCount,
        };
      });

      if (loadMore) {
        setMovies((prev) => [...prev, ...moviesData]);
      } else {
        setMovies(moviesData);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === 20);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching movies:", error);
      await logError("Movies", `Failed to fetch movies: ${error.message}`, {
        filterStatus,
        filterGenre,
        error: error.stack || error.message,
      });
      showToast("Failed to load movies", "error");
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const allMoviesSnapshot = await getDocs(collection(db, "movies"));

      let total = 0;
      let published = 0;
      let featured = 0;
      let premium = 0;
      let totalViews = 0;

      allMoviesSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        total++;
        totalViews += data.views || 0;

        if (data.isPublished) published++;
        if (data.isFeatured) featured++;
        if (data.isPremium) premium++;
      });

      setStats({ total, published, featured, premium, totalViews });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🗑️ DELETE MOVIE
  // ═══════════════════════════════════════════════════════════════
  const handleDeleteClick = (movieId: string, movieTitle: string) => {
    if (!can(Permission.DELETE_ANY_CONTENT)) {
      showToast("You do not have permission to delete movies", "error");
      return;
    }

    setAlertModal({
      isOpen: true,
      movieId,
      movieTitle,
    });
  };

  const confirmDelete = async () => {
    setActionLoading(true);
    try {
      const movieToDelete = movies.find((m) => m.id === alertModal.movieId);

      await deleteDoc(doc(db, "movies", alertModal.movieId));

      // ✅ LOG DELETION
      if (movieToDelete) {
        await logContentDelete(
          "movie",
          alertModal.movieId,
          alertModal.movieTitle,
          "Movies",
          {
            genre: movieToDelete.genre,
            language: movieToDelete.language,
            year: movieToDelete.year,
            isPremium: movieToDelete.isPremium,
            isFeatured: movieToDelete.isFeatured,
            views: movieToDelete.views,
          },
        );
      }

      setMovies((prev) => prev.filter((m) => m.id !== alertModal.movieId));
      setAlertModal({ isOpen: false, movieId: "", movieTitle: "" });
      fetchStats();
      showToast("Movie deleted successfully!", "success");
    } catch (error: any) {
      console.error("Error deleting movie:", error);

      // ✅ LOG ERROR
      await logError("Movies", `Failed to delete movie: ${error.message}`, {
        movieId: alertModal.movieId,
        movieTitle: alertModal.movieTitle,
        error: error.stack || error.message,
      });

      showToast("Failed to delete movie", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ✏️ EDIT MOVIE
  // ═══════════════════════════════════════════════════════════════
  const handleEdit = (movieId: string) => {
    if (!can(Permission.EDIT_ANY_CONTENT)) {
      showToast("You do not have permission to edit movies", "error");
      return;
    }
    navigate(`/admin/content/movies/edit/${movieId}`);
  };

  // ═══════════════════════════════════════════════════════════════
  // 👁️ VIEW MOVIE
  // ═══════════════════════════════════════════════════════════════
  const handleView = (movieId: string) => {
    navigate(`/admin/content/movies/view/${movieId}`);
  };

  // ═══════════════════════════════════════════════════════════════
  // ✏️ TOGGLE PUBLISH
  // ═══════════════════════════════════════════════════════════════
  const handleTogglePublish = async (
    movieId: string,
    currentStatus: boolean,
  ) => {
    if (!can(Permission.EDIT_ANY_CONTENT)) {
      showToast("You do not have permission to edit movies", "error");
      return;
    }

    try {
      const movie = movies.find((m) => m.id === movieId);
      const newStatus = !currentStatus;

      await updateDoc(doc(db, "movies", movieId), {
        isPublished: newStatus,
        updatedAt: Timestamp.now(),
      });

      // ✅ LOG PUBLISH/UNPUBLISH
      if (movie) {
        await logContentUpdate(
          "movie",
          movieId,
          movie.title,
          "Movies",
          {
            isPublished: currentStatus,
          },
          {
            isPublished: newStatus,
            action: newStatus ? "published" : "unpublished",
            genre: movie.genre,
            language: movie.language,
          },
        );
      }

      setMovies((prev) =>
        prev.map((m) =>
          m.id === movieId ? { ...m, isPublished: newStatus } : m,
        ),
      );
      fetchStats();
      showToast(
        `Movie ${newStatus ? "published" : "unpublished"} successfully!`,
        "success",
      );
    } catch (error: any) {
      console.error("Error updating status:", error);

      // ✅ LOG ERROR
      await logError(
        "Movies",
        `Failed to update publish status: ${error.message}`,
        {
          movieId,
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
    movieId: string,
    currentStatus: boolean,
  ) => {
    if (!can(Permission.EDIT_ANY_CONTENT)) {
      showToast("You do not have permission to edit movies", "error");
      return;
    }

    try {
      const movie = movies.find((m) => m.id === movieId);
      const newStatus = !currentStatus;

      await updateDoc(doc(db, "movies", movieId), {
        isFeatured: newStatus,
        updatedAt: Timestamp.now(),
      });

      // ✅ LOG FEATURED/UNFEATURED
      if (movie) {
        await logContentUpdate(
          "movie",
          movieId,
          movie.title,
          "Movies",
          {
            isFeatured: currentStatus,
          },
          {
            isFeatured: newStatus,
            action: newStatus ? "featured" : "unfeatured",
            genre: movie.genre,
            language: movie.language,
          },
        );
      }

      setMovies((prev) =>
        prev.map((m) =>
          m.id === movieId ? { ...m, isFeatured: newStatus } : m,
        ),
      );
      fetchStats();
      showToast(
        `Movie ${newStatus ? "featured" : "unfeatured"} successfully!`,
        "success",
      );
    } catch (error: any) {
      console.error("Error updating featured status:", error);

      // ✅ LOG ERROR
      await logError(
        "Movies",
        `Failed to update featured status: ${error.message}`,
        {
          movieId,
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
  // 🔍 FILTER MOVIES
  // ═══════════════════════════════════════════════════════════════
  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movie.titleHindi &&
        movie.titleHindi.toLowerCase().includes(searchTerm.toLowerCase())),
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
          setAlertModal({ isOpen: false, movieId: "", movieTitle: "" })
        }
        onConfirm={confirmDelete}
        title="Delete Movie?"
        message={`Are you sure you want to delete "${alertModal.movieTitle}"? This action cannot be undone.`}
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
        className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
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
                <Film size={36} />
                Movies Management
              </h1>
              <p className="text-white/90 text-lg">
                Manage your entire movie collection
              </p>
            </div>

            {can(Permission.UPLOAD_CONTENT) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/admin/content/movies/add")}
                className="px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold flex items-center gap-3 shadow-2xl hover:shadow-3xl transition-all"
              >
                <Plus size={24} />
                Add New Movie
              </motion.button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5">
              <p className="text-white/80 text-sm mb-1">Total Movies</p>
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
              placeholder="Search movies by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white transition-all"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="featured">Featured</option>
            <option value="premium">Premium</option>
          </select>

          {/* Genre Filter - DYNAMIC */}
          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white transition-all"
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
            onClick={() => fetchMovies()}
            className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all"
          >
            🔄 Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 📋 MOVIES GRID */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
          />
          <p className="text-slate-600 dark:text-slate-400 font-semibold">
            Loading movies...
          </p>
        </div>
      ) : filteredMovies.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map((movie, index) => (
              <motion.div
                key={movie.id}
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
                      movie.posterCdnUrl ||
                      movie.posterUrl ||
                      movie.thumbnailCdnUrl ||
                      movie.thumbnailUrl ||
                      movie.thumbnail
                    }
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/300x450/8b5cf6/ffffff?text=" +
                        encodeURIComponent(movie.title);
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
                          {formatRating(movie.rating)}
                        </span>
                        <span className="text-white/80 text-sm ml-auto flex items-center gap-1">
                          <Eye size={14} />
                          {formatViews(movie.views || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {!movie.isPublished && (
                      <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold shadow-lg">
                        Draft
                      </span>
                    )}
                    {movie.isFeatured && (
                      <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Sparkles size={12} />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Premium Badge */}
                  {movie.isPremium && (
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
                      onClick={() => handleView(movie.id)}
                      className="w-20 h-20 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl"
                    >
                      <Play
                        size={32}
                        className="text-purple-600 ml-1"
                        fill="currentColor"
                      />
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1 truncate">
                    {movie.title}
                  </h3>
                  {movie.titleHindi && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 truncate">
                      {movie.titleHindi}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <Clock size={14} />
                    <span>{movie.duration || "N/A"}</span>
                    <span>•</span>
                    <Calendar size={14} />
                    <span>{formatYear(movie.year)}</span>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {movie.genre?.slice(0, 2).map((g) => (
                      <span
                        key={g}
                        className="px-2 py-1 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg text-xs font-semibold"
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
                      onClick={() => handleView(movie.id)}
                      className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      View
                    </motion.button>

                    {can(Permission.EDIT_ANY_CONTENT) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(movie.id)}
                        className="px-3 py-2 bg-blue-500 text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition-all"
                      >
                        <Edit size={16} />
                      </motion.button>
                    )}

                    {can(Permission.DELETE_ANY_CONTENT) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteClick(movie.id, movie.title)}
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
                              movie.id,
                              movie.isPublished || false,
                            )
                          }
                          className={`flex-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                            movie.isPublished
                              ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                              : "bg-green-100 text-green-600 dark:bg-green-900/30"
                          }`}
                        >
                          {movie.isPublished ? "Unpublish" : "Publish"}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleToggleFeatured(
                              movie.id,
                              movie.isFeatured || false,
                            )
                          }
                          className={`flex-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                            movie.isFeatured
                              ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800"
                          }`}
                        >
                          {movie.isFeatured ? "⭐ Featured" : "Feature"}
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
                onClick={() => fetchMovies(true)}
                className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-bold hover:shadow-2xl transition-all"
              >
                Load More Movies
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
          <Film size={64} className="text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">
            No Movies Found
          </h3>
          <p className="text-slate-500 dark:text-slate-500 mb-6">
            {searchTerm
              ? "Try different search terms"
              : "Start by adding your first movie"}
          </p>
          {can(Permission.UPLOAD_CONTENT) && !searchTerm && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/admin/content/movies/add")}
              className="px-8 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Add Your First Movie
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MoviesManagement;
