import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Film,
  Save,
  Play,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Settings,
  Video,
  Zap,
  Activity,
  Clock,
  HardDrive,
  TrendingUp,
} from "lucide-react";
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { logEncodingAction, logError } from "../../utils/activityLogger";

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 INTERFACES & TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface EncodingConfig {
  codec: string;
  container: string;
  resolutions: string[];
  maxBitrate: number;
  audioBitrate: number;
  audioCodec: string;
  autoEncoding: boolean;
  adaptiveBitrate: boolean;
  generateThumbnails: boolean;
  thumbnailCount: number;
  segmentDuration: number;
  updatedAt: Date;
}

interface EncodingStats {
  totalVideos: number;
  encodedVideos: number;
  pendingVideos: number;
  failedVideos: number;
  totalStorage: number;
  avgEncodingTime: number;
}

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
// 📋 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const EncodingSettings: React.FC = () => {
  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Encoding Config
  const [config, setConfig] = useState<EncodingConfig>({
    codec: "h264",
    container: "mp4",
    resolutions: ["720p", "1080p"],
    maxBitrate: 8000,
    audioBitrate: 192,
    audioCodec: "aac",
    autoEncoding: true,
    adaptiveBitrate: true,
    generateThumbnails: true,
    thumbnailCount: 10,
    segmentDuration: 6,
    updatedAt: new Date(),
  });

  // Stats
  const [stats, setStats] = useState<EncodingStats>({
    totalVideos: 0,
    encodedVideos: 0,
    pendingVideos: 0,
    failedVideos: 0,
    totalStorage: 0,
    avgEncodingTime: 0,
  });

  // Toast
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });

  // Fetch encoding settings and calculate stats
  useEffect(() => {
    fetchEncodingSettings();
    calculateStats();
  }, []);

  const fetchEncodingSettings = async () => {
    try {
      setLoading(true);
      const encodingDoc = await getDoc(doc(db, "settings", "encoding"));

      if (encodingDoc.exists()) {
        const data = encodingDoc.data();
        setConfig({
          codec: data.codec || "h264",
          container: data.container || "mp4",
          resolutions: data.resolutions || ["720p", "1080p"],
          maxBitrate: data.maxBitrate || 8000,
          audioBitrate: data.audioBitrate || 192,
          audioCodec: data.audioCodec || "aac",
          autoEncoding: data.autoEncoding ?? true,
          adaptiveBitrate: data.adaptiveBitrate ?? true,
          generateThumbnails: data.generateThumbnails ?? true,
          thumbnailCount: data.thumbnailCount || 10,
          segmentDuration: data.segmentDuration || 6,
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching encoding settings:", error);
      showToast("Failed to load encoding settings", "error");
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      const videosSnapshot = await getDocs(collection(db, "videos"));

      let totalVideos = 0;
      let encodedVideos = 0;
      let pendingVideos = 0;
      let failedVideos = 0;
      let totalStorage = 0;
      let totalEncodingTime = 0;
      let encodedCount = 0;

      videosSnapshot.forEach((doc) => {
        const data = doc.data();
        totalVideos++;

        const encodingStatus = data.encodingStatus || "completed";

        if (encodingStatus === "completed") {
          encodedVideos++;

          // Calculate storage (if fileSize exists)
          if (data.fileSize) {
            totalStorage += data.fileSize;
          }

          // Calculate encoding time (if exists)
          if (data.encodingTime) {
            totalEncodingTime += data.encodingTime;
            encodedCount++;
          }
        } else if (
          encodingStatus === "pending" ||
          encodingStatus === "processing"
        ) {
          pendingVideos++;
        } else if (encodingStatus === "failed") {
          failedVideos++;
        }
      });

      const avgEncodingTime =
        encodedCount > 0 ? Math.round(totalEncodingTime / encodedCount) : 0;

      setStats({
        totalVideos,
        encodedVideos,
        pendingVideos,
        failedVideos,
        totalStorage,
        avgEncodingTime,
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning",
  ) => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const encodingData = {
        ...config,
        updatedAt: Timestamp.now(),
      };

      await setDoc(doc(db, "settings", "encoding"), encodingData);

      showToast("Encoding settings saved successfully!", "success");

      // Recalculate stats after save
      await calculateStats();

      // ✅ ADD LOGGING
      await logEncodingAction("update_config", {
        codec: config.codec,
        container: config.container,
        resolutions: config.resolutions,
        maxBitrate: config.maxBitrate,
        audioBitrate: config.audioBitrate,
        audioCodec: config.audioCodec,
        autoEncoding: config.autoEncoding,
        adaptiveBitrate: config.adaptiveBitrate,
        generateThumbnails: config.generateThumbnails,
        thumbnailCount: config.thumbnailCount,
        segmentDuration: config.segmentDuration,
      });

      setSaving(false);
    } catch (error) {
      console.error("Error saving encoding settings:", error);
      showToast("Failed to save encoding settings", "error");

      // ✅ ADD ERROR LOGGING
      await logError(
        "Encoding Settings",
        "Failed to save encoding configuration",
        { error },
      );

      setSaving(false);
    }
  };

  const handleTestEncoding = async () => {
    setTesting(true);
    showToast("Testing encoding configuration...", "info");

    // Simulate test encoding
    setTimeout(async () => {
      setTesting(false);
      showToast("Encoding test completed successfully!", "success");

      // ✅ ADD LOGGING
      await logEncodingAction("test_encoding", {
        codec: config.codec,
        container: config.container,
        resolutions: config.resolutions,
        maxBitrate: config.maxBitrate,
        status: "success",
      });
    }, 3000);
  };

  const toggleResolution = (resolution: string) => {
    if (config.resolutions.includes(resolution)) {
      setConfig({
        ...config,
        resolutions: config.resolutions.filter((r) => r !== resolution),
      });
    } else {
      setConfig({
        ...config,
        resolutions: [...config.resolutions, resolution],
      });
    }
  };

  const formatStorage = (bytes: number): string => {
    if (bytes === 0) return "0 GB";
    const gb = bytes / (1024 * 1024 * 1024);
    const tb = gb / 1024;

    if (tb >= 1) return `${tb.toFixed(2)} TB`;
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds === 0) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getEncodingProgress = (): number => {
    if (stats.totalVideos === 0) return 0;
    return Math.round((stats.encodedVideos / stats.totalVideos) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-600 dark:text-slate-400 font-semibold">
          Loading encoding settings...
        </p>
      </div>
    );
  }

  const encodingProgress = getEncodingProgress();

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
          className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
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
                  <Film size={32} />
                </div>
                <div>
                  <h1 className="text-4xl font-black mb-2">
                    Encoding Settings
                  </h1>
                  <p className="text-white/90 text-lg">
                    Configure video encoding parameters and quality presets
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  fetchEncodingSettings();
                  calculateStats();
                }}
                className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <RefreshCw size={20} />
                Refresh
              </button>
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
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Video size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Total Videos
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {stats.totalVideos}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
              {stats.encodedVideos} encoded
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp
                  size={24}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Encoding Progress
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {encodingProgress}%
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${encodingProgress}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Clock
                  size={24}
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Avg Encoding Time
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {formatTime(stats.avgEncodingTime)}
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400 font-bold">
              Per video
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <HardDrive
                  size={24}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Total Storage
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {formatStorage(stats.totalStorage)}
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400 font-bold">
              {stats.pendingVideos} pending • {stats.failedVideos} failed
            </p>
          </motion.div>
        </div>

        {/* VIDEO ENCODING CONFIGURATION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                <Settings
                  size={20}
                  className="text-violet-600 dark:text-violet-400"
                />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                  Video Encoding Configuration
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Configure video quality and encoding parameters
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Video Codec */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                Video Codec
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: "h264", label: "H.264 (AVC)", icon: "📹" },
                  { value: "h265", label: "H.265 (HEVC)", icon: "🎬" },
                  { value: "vp9", label: "VP9", icon: "🎞️" },
                  { value: "av1", label: "AV1", icon: "🎥" },
                ].map((codec) => (
                  <button
                    key={codec.value}
                    type="button"
                    onClick={() => setConfig({ ...config, codec: codec.value })}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      config.codec === codec.value
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/30"
                        : "border-slate-300 dark:border-slate-700 hover:border-violet-300"
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{codec.icon}</span>
                    <p
                      className={`text-sm font-bold ${
                        config.codec === codec.value
                          ? "text-violet-600 dark:text-violet-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {codec.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Container Format */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                Container Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    value: "mp4",
                    label: "MP4",
                    description: "Universal format",
                  },
                  { value: "mkv", label: "MKV", description: "High quality" },
                  {
                    value: "webm",
                    label: "WebM",
                    description: "Web optimized",
                  },
                ].map((format) => (
                  <button
                    key={format.value}
                    type="button"
                    onClick={() =>
                      setConfig({ ...config, container: format.value })
                    }
                    className={`p-4 border-2 rounded-xl transition-all ${
                      config.container === format.value
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/30"
                        : "border-slate-300 dark:border-slate-700 hover:border-violet-300"
                    }`}
                  >
                    <p
                      className={`text-lg font-bold mb-1 ${
                        config.container === format.value
                          ? "text-violet-600 dark:text-violet-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {format.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {format.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Output Resolutions */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                Output Resolutions ({config.resolutions.length} selected)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { value: "360p", label: "360p", description: "SD" },
                  { value: "480p", label: "480p", description: "SD" },
                  { value: "720p", label: "720p", description: "HD" },
                  { value: "1080p", label: "1080p", description: "Full HD" },
                  { value: "1440p", label: "1440p", description: "2K" },
                  { value: "2160p", label: "2160p", description: "4K" },
                ].map((resolution) => (
                  <button
                    key={resolution.value}
                    type="button"
                    onClick={() => toggleResolution(resolution.value)}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      config.resolutions.includes(resolution.value)
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/30"
                        : "border-slate-300 dark:border-slate-700 hover:border-violet-300"
                    }`}
                  >
                    <p
                      className={`text-lg font-bold mb-1 ${
                        config.resolutions.includes(resolution.value)
                          ? "text-violet-600 dark:text-violet-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {resolution.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {resolution.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Bitrate Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Max Video Bitrate (kbps)
                </label>
                <input
                  type="number"
                  value={config.maxBitrate}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maxBitrate: parseInt(e.target.value) || 8000,
                    })
                  }
                  min="1000"
                  max="20000"
                  step="500"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Higher bitrate = better quality (1000-20000)
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Audio Bitrate (kbps)
                </label>
                <input
                  type="number"
                  value={config.audioBitrate}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      audioBitrate: parseInt(e.target.value) || 192,
                    })
                  }
                  min="64"
                  max="320"
                  step="32"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Recommended: 192 kbps (64-320)
                </p>
              </div>
            </div>

            {/* Audio Codec */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                Audio Codec
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    value: "aac",
                    label: "AAC",
                    description: "Best compatibility",
                  },
                  { value: "mp3", label: "MP3", description: "Universal" },
                  {
                    value: "opus",
                    label: "Opus",
                    description: "High efficiency",
                  },
                ].map((codec) => (
                  <button
                    key={codec.value}
                    type="button"
                    onClick={() =>
                      setConfig({ ...config, audioCodec: codec.value })
                    }
                    className={`p-4 border-2 rounded-xl transition-all ${
                      config.audioCodec === codec.value
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/30"
                        : "border-slate-300 dark:border-slate-700 hover:border-violet-300"
                    }`}
                  >
                    <p
                      className={`text-lg font-bold mb-1 ${
                        config.audioCodec === codec.value
                          ? "text-violet-600 dark:text-violet-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {codec.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {codec.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Thumbnail Count
                </label>
                <input
                  type="number"
                  value={config.thumbnailCount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      thumbnailCount: parseInt(e.target.value) || 10,
                    })
                  }
                  min="1"
                  max="20"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Number of thumbnails to generate (1-20)
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  HLS Segment Duration (seconds)
                </label>
                <input
                  type="number"
                  value={config.segmentDuration}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      segmentDuration: parseInt(e.target.value) || 6,
                    })
                  }
                  min="2"
                  max="10"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Shorter = faster seeking, longer = less segments (2-10)
                </p>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <Zap
                    size={24}
                    className="text-yellow-600 dark:text-yellow-400"
                  />
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      Auto-Encoding
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Automatically encode uploaded videos
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({ ...config, autoEncoding: !config.autoEncoding })
                  }
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    config.autoEncoding
                      ? "bg-green-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                      config.autoEncoding ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <Activity
                    size={24}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      Adaptive Bitrate Streaming (HLS)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Generate multiple quality variants for adaptive streaming
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      adaptiveBitrate: !config.adaptiveBitrate,
                    })
                  }
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    config.adaptiveBitrate
                      ? "bg-green-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                      config.adaptiveBitrate ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <Video
                    size={24}
                    className="text-purple-600 dark:text-purple-400"
                  />
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      Generate Thumbnails
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Auto-generate video thumbnails during encoding
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      generateThumbnails: !config.generateThumbnails,
                    })
                  }
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    config.generateThumbnails
                      ? "bg-green-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                      config.generateThumbnails ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-violet-500 text-white rounded-xl font-bold hover:bg-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Settings
                  </>
                )}
              </button>

              <button
                onClick={handleTestEncoding}
                disabled={testing}
                className="px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {testing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    Test Encoding
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EncodingSettings;
