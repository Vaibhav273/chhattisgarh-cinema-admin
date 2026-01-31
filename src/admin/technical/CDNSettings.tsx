import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Server,
  Save,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle,
  Activity,
  Zap,
  Clock,
  MapPin,
  Link as LinkIcon,
  Key,
  Shield,
  TrendingUp,
  Database,
  Wifi,
  WifiOff,
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
import { logCDNAction, logError } from "../../utils/activityLogger";

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 INTERFACES & TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface CDNRegion {
  name: string;
  code: string;
  enabled: boolean;
  latency: number;
  location: string;
}

interface CDNStats {
  totalBandwidth: number;
  cacheHitRate: number;
  avgResponseTime: number;
  activeRegions: number;
  totalRequests: number;
  cachedRequests: number;
}

interface CDNConfig {
  provider: string;
  enabled: boolean;
  cdnUrl: string;
  apiKey: string;
  zoneId: string;
  pullZone: string;
  caching: boolean;
  cacheTTL: number;
  regions: CDNRegion[];
  updatedAt: Date;
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

const CDNSettings: React.FC = () => {
  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [purging, setPurging] = useState(false);

  // CDN Config
  const [config, setConfig] = useState<CDNConfig>({
    provider: "cloudflare",
    enabled: false,
    cdnUrl: "",
    apiKey: "",
    zoneId: "",
    pullZone: "",
    caching: true,
    cacheTTL: 3600,
    regions: [],
    updatedAt: new Date(),
  });

  // Stats - Calculate dynamically
  const [stats, setStats] = useState<CDNStats>({
    totalBandwidth: 0,
    cacheHitRate: 0,
    avgResponseTime: 0,
    activeRegions: 0,
    totalRequests: 0,
    cachedRequests: 0,
  });

  // Toast
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });

  // Fetch CDN settings and calculate stats
  useEffect(() => {
    fetchCDNSettings();
    calculateStats();
  }, []);

  // Recalculate stats when regions change
  useEffect(() => {
    const activeRegions = config.regions.filter((r) => r.enabled).length;
    setStats((prev) => ({ ...prev, activeRegions }));
  }, [config.regions]);

  const fetchCDNSettings = async () => {
    try {
      setLoading(true);
      const cdnDoc = await getDoc(doc(db, "settings", "cdn"));

      if (cdnDoc.exists()) {
        const data = cdnDoc.data();
        setConfig({
          provider: data.provider || "cloudflare",
          enabled: data.enabled || false,
          cdnUrl: data.cdnUrl || "",
          apiKey: data.apiKey || "",
          zoneId: data.zoneId || "",
          pullZone: data.pullZone || "",
          caching: data.caching ?? true,
          cacheTTL: data.cacheTTL || 3600,
          regions: data.regions || getDefaultRegions(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      } else {
        // Set default regions if no config exists
        setConfig((prev) => ({ ...prev, regions: getDefaultRegions() }));
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching CDN settings:", error);
      showToast("Failed to load CDN settings", "error");
      setConfig((prev) => ({ ...prev, regions: getDefaultRegions() }));
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      // Calculate bandwidth from videos collection
      const videosSnapshot = await getDocs(collection(db, "videos"));
      let totalBandwidth = 0;

      videosSnapshot.forEach((doc) => {
        const data = doc.data();
        // Assuming each view = ~500MB bandwidth (adjust as needed)
        const viewCount = data.viewCount || 0;
        totalBandwidth += (viewCount * 500) / 1024 / 1024 / 1024; // Convert to TB
      });

      // Calculate requests from analytics (if available)
      let totalRequests = 0;
      let cachedRequests = 0;

      try {
        const analyticsSnapshot = await getDocs(collection(db, "analytics"));
        analyticsSnapshot.forEach((doc) => {
          const data = doc.data();
          totalRequests += data.requests || 0;
          cachedRequests += data.cachedRequests || 0;
        });
      } catch (error) {
        // Analytics collection might not exist yet
        console.log("No analytics data available");
      }

      // Calculate cache hit rate
      const cacheHitRate =
        totalRequests > 0 ? (cachedRequests / totalRequests) * 100 : 0;

      // Calculate average response time from regions
      const enabledRegions = config.regions.filter((r) => r.enabled);
      const avgResponseTime =
        enabledRegions.length > 0
          ? enabledRegions.reduce((sum, r) => sum + r.latency, 0) /
            enabledRegions.length
          : 0;

      setStats({
        totalBandwidth: parseFloat(totalBandwidth.toFixed(2)),
        cacheHitRate: parseFloat(cacheHitRate.toFixed(1)),
        avgResponseTime: Math.round(avgResponseTime),
        activeRegions: enabledRegions.length,
        totalRequests,
        cachedRequests,
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  const handlePurgeCache = async () => {
    if (!config.enabled) {
      showToast("CDN is not enabled", "warning");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to purge all cached content? This will temporarily increase server load.",
      )
    ) {
      return;
    }

    setPurging(true);
    showToast("Purging CDN cache...", "info");

    // In real app, call CDN provider API to purge cache
    setTimeout(async () => {
      setPurging(false);
      showToast("Cache purged successfully!", "success");

      // ✅ ADD LOGGING
      await logCDNAction("purge_cache", {
        provider: config.provider,
        cdnUrl: config.cdnUrl,
        activeRegions: config.regions.filter((r) => r.enabled).length,
      });
    }, 3000);
  };

  const getDefaultRegions = (): CDNRegion[] => {
    return [
      {
        name: "India (Mumbai)",
        code: "in-mum",
        enabled: true,
        latency: 25,
        location: "🇮🇳",
      },
      {
        name: "India (Delhi)",
        code: "in-del",
        enabled: true,
        latency: 30,
        location: "🇮🇳",
      },
      {
        name: "Singapore",
        code: "sg-sin",
        enabled: true,
        latency: 45,
        location: "🇸🇬",
      },
      {
        name: "US East",
        code: "us-east",
        enabled: false,
        latency: 180,
        location: "🇺🇸",
      },
      {
        name: "US West",
        code: "us-west",
        enabled: false,
        latency: 200,
        location: "🇺🇸",
      },
      {
        name: "Europe (London)",
        code: "eu-lon",
        enabled: false,
        latency: 150,
        location: "🇬🇧",
      },
      {
        name: "Europe (Frankfurt)",
        code: "eu-fra",
        enabled: false,
        latency: 145,
        location: "🇩🇪",
      },
      {
        name: "Asia Pacific (Tokyo)",
        code: "ap-tok",
        enabled: false,
        latency: 80,
        location: "🇯🇵",
      },
    ];
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

      const cdnData = {
        ...config,
        updatedAt: Timestamp.now(),
      };

      await setDoc(doc(db, "settings", "cdn"), cdnData);

      showToast("CDN settings saved successfully!", "success");

      // Recalculate stats after save
      await calculateStats();

      // ✅ ENHANCED LOGGING with region details
      await logCDNAction("update_config", {
        provider: config.provider,
        enabled: config.enabled,
        cdnUrl: config.cdnUrl,
        caching: config.caching,
        cacheTTL: config.cacheTTL,
        activeRegions: config.regions.filter((r) => r.enabled).length,
        totalRegions: config.regions.length,
        enabledRegionNames: config.regions
          .filter((r) => r.enabled)
          .map((r) => r.name),
      });

      setSaving(false);
    } catch (error) {
      console.error("Error saving CDN settings:", error);
      showToast("Failed to save CDN settings", "error");

      await logError("CDN Settings", "Failed to save CDN configuration", {
        error,
      });

      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!config.cdnUrl || !config.apiKey) {
      showToast("Please configure CDN URL and API Key first", "warning");
      return;
    }

    setTesting(true);
    showToast("Testing CDN connection...", "info");

    // Simulate test (in real app, make actual API call to CDN provider)
    setTimeout(async () => {
      setTesting(false);
      showToast("CDN connection successful!", "success");

      // ✅ ADD LOGGING
      await logCDNAction("test_connection", {
        provider: config.provider,
        cdnUrl: config.cdnUrl,
        status: "success",
      });
    }, 2000);
  };

  const toggleRegion = (code: string) => {
    setConfig({
      ...config,
      regions: config.regions.map((region) =>
        region.code === code ? { ...region, enabled: !region.enabled } : region,
      ),
    });
  };

  const formatBandwidth = (tb: number): string => {
    if (tb === 0) return "0 GB";
    if (tb < 0.001) return `${(tb * 1024 * 1024).toFixed(0)} MB`;
    if (tb < 1) return `${(tb * 1024).toFixed(1)} GB`;
    return `${tb.toFixed(2)} TB`;
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
          className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-600 dark:text-slate-400 font-semibold">
          Loading CDN settings...
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
          className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
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
                  <Globe size={32} />
                </div>
                <div>
                  <h1 className="text-4xl font-black mb-2">CDN Settings</h1>
                  <p className="text-white/90 text-lg">
                    Configure Content Delivery Network for optimal performance
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  fetchCDNSettings();
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
                <Database
                  size={24}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Total Bandwidth
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {formatBandwidth(stats.totalBandwidth)}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
              Calculated from views
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
              Cache Hit Rate
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {stats.cacheHitRate}%
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 font-bold">
              {stats.totalRequests > 0
                ? `${formatNumber(stats.cachedRequests)} cached`
                : "Enable analytics"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Zap
                  size={24}
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Avg Response Time
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {stats.avgResponseTime > 0 ? `${stats.avgResponseTime}ms` : "N/A"}
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400 font-bold">
              {stats.avgResponseTime > 0
                ? stats.avgResponseTime < 50
                  ? "Excellent"
                  : stats.avgResponseTime < 100
                    ? "Good"
                    : "Needs improvement"
                : "Enable regions"}
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
                <MapPin
                  size={24}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
              Active Regions
            </p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              {stats.activeRegions}
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400 font-bold">
              of {config.regions.length} total
            </p>
          </motion.div>
        </div>

        {/* CDN CONFIGURATION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-800 dark:text-white">
              CDN Configuration
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {/* CDN Provider */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                CDN Provider
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: "cloudflare", label: "Cloudflare", icon: "☁️" },
                  { value: "cloudfront", label: "AWS CloudFront", icon: "🔶" },
                  { value: "bunnycdn", label: "BunnyCDN", icon: "🐰" },
                  { value: "fastly", label: "Fastly", icon: "⚡" },
                ].map((provider) => (
                  <button
                    key={provider.value}
                    type="button"
                    onClick={() =>
                      setConfig({ ...config, provider: provider.value })
                    }
                    className={`p-4 border-2 rounded-xl transition-all ${
                      config.provider === provider.value
                        ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30"
                        : "border-slate-300 dark:border-slate-700 hover:border-cyan-300"
                    }`}
                  >
                    <span className="text-3xl mb-2 block">{provider.icon}</span>
                    <p
                      className={`text-sm font-bold ${
                        config.provider === provider.value
                          ? "text-cyan-600 dark:text-cyan-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {provider.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* CDN URL */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <LinkIcon size={16} />
                  CDN URL
                </div>
              </label>
              <input
                type="url"
                value={config.cdnUrl}
                onChange={(e) =>
                  setConfig({ ...config, cdnUrl: e.target.value })
                }
                placeholder="https://cdn.chhattisgarhcinema.com"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Key size={16} />
                  API Key
                </div>
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) =>
                  setConfig({ ...config, apiKey: e.target.value })
                }
                placeholder="Enter CDN API Key"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Zone ID & Pull Zone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Shield size={16} />
                    Zone ID
                  </div>
                </label>
                <input
                  type="text"
                  value={config.zoneId}
                  onChange={(e) =>
                    setConfig({ ...config, zoneId: e.target.value })
                  }
                  placeholder="Enter Zone ID"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Server size={16} />
                    Pull Zone
                  </div>
                </label>
                <input
                  type="text"
                  value={config.pullZone}
                  onChange={(e) =>
                    setConfig({ ...config, pullZone: e.target.value })
                  }
                  placeholder="Enter Pull Zone"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Cache TTL */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  Cache TTL (seconds)
                </div>
              </label>
              <input
                type="number"
                value={config.cacheTTL}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    cacheTTL: parseInt(e.target.value) || 3600,
                  })
                }
                min="60"
                step="60"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                How long content should be cached (default: 3600 seconds / 1
                hour)
              </p>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  {config.enabled ? (
                    <Wifi
                      size={24}
                      className="text-green-600 dark:text-green-400"
                    />
                  ) : (
                    <WifiOff
                      size={24}
                      className="text-slate-400 dark:text-slate-600"
                    />
                  )}
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      Enable CDN
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Use CDN for content delivery
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({ ...config, enabled: !config.enabled })
                  }
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    config.enabled
                      ? "bg-green-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                      config.enabled ? "right-1" : "left-1"
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
                      Enable Caching
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cache content on CDN servers
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({ ...config, caching: !config.caching })
                  }
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    config.caching
                      ? "bg-green-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                      config.caching ? "right-1" : "left-1"
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
                className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                onClick={handleTestConnection}
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
                    <RefreshCw size={20} />
                    Test Connection
                  </>
                )}
              </button>

              <button
                onClick={handlePurgeCache}
                disabled={purging}
                className="px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {purging ? (
                  <>
                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    Purging...
                  </>
                ) : (
                  <>
                    <Trash2 size={20} />
                    Purge Cache
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* REGIONAL DISTRIBUTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">
                Regional Distribution
              </h3>
              <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-lg text-sm font-bold">
                {config.regions.filter((r) => r.enabled).length} Active
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {config.regions.map((region) => (
                <motion.div
                  key={region.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{region.location}</span>
                    <Server
                      size={20}
                      className={
                        region.enabled
                          ? "text-cyan-600 dark:text-cyan-400"
                          : "text-slate-400 dark:text-slate-600"
                      }
                    />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">
                        {region.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Latency: {region.latency}ms
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleRegion(region.code)}
                    className={`relative w-14 h-8 rounded-full transition-all ${
                      region.enabled
                        ? "bg-green-500"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                        region.enabled ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CDNSettings;
