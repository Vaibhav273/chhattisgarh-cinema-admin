import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  Share2,
  Star,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Shield,
  Edit,
  Eye,
  TrendingUp,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../config/firebase";
import type { Event } from "../../types";

// ═══════════════════════════════════════════════════════════════
// 🎨 TOAST NOTIFICATION
// ═══════════════════════════════════════════════════════════════

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
    error: AlertCircle,
    info: Info,
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

// ═══════════════════════════════════════════════════════════════
// 📋 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  // States
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "overview" | "lineup" | "tickets" | "faq"
  >("overview");

  // Toast
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });

  // Fetch event data
  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const eventDoc = await getDoc(doc(db, "events", eventId!));

      if (!eventDoc.exists()) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const eventData = { id: eventDoc.id, ...eventDoc.data() } as Event;
      setEvent(eventData);

      // Increment admin views
      await updateDoc(doc(db, "events", eventId!), {
        views: increment(1),
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching event:", error);
      showToast("Failed to load event details", "error");
      setNotFound(true);
      setLoading(false);
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

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard!", "success");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Not found state
  if (notFound || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
          Event Not Found
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-center">
          The event you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/admin/events/all")}
          className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all"
        >
          Back to Events
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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden mb-6"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/admin/events/all")}
              className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back to Events
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-3 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-white/30 transition-all"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={() => navigate(`/admin/events/edit/${eventId}`)}
                className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Edit size={20} />
                Edit Event
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
              <Calendar size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black mb-2">Event Details</h1>
              <p className="text-white/90 text-lg">
                View complete information about this event
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
          <p className="text-4xl font-black text-slate-800 dark:text-white">
            {formatNumber(event.views || 0)}
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
              <Ticket
                size={24}
                className="text-green-600 dark:text-green-400"
              />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
            Bookings
          </p>
          <p className="text-4xl font-black text-slate-800 dark:text-white">
            {formatNumber(event.totalBookings || 0)}
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
              <Users
                size={24}
                className="text-orange-600 dark:text-orange-400"
              />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
            Seats Booked
          </p>
          <p className="text-4xl font-black text-slate-800 dark:text-white">
            {event.bookedSeats} / {event.totalSeats}
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
              <DollarSign
                size={24}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
            Revenue
          </p>
          <p className="text-4xl font-black text-slate-800 dark:text-white">
            {formatCurrency(event.revenue || 0)}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="relative aspect-video">
              <img
                src={
                  event.bannerImageCdnUrl ||
                  event.bannerImage ||
                  event.imageCdnUrl ||
                  event.image
                }
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-500/90 backdrop-blur-xl text-white text-sm font-bold rounded-lg">
                  {event.category.toUpperCase().replace("-", " ")}
                </span>
                {event.isFeatured && (
                  <span className="px-3 py-1 bg-yellow-500/90 backdrop-blur-xl text-white text-sm font-bold rounded-lg flex items-center gap-1">
                    <Star size={14} fill="currentColor" />
                    FEATURED
                  </span>
                )}
                {event.isTrending && (
                  <span className="px-3 py-1 bg-pink-500/90 backdrop-blur-xl text-white text-sm font-bold rounded-lg flex items-center gap-1">
                    <TrendingUp size={14} />
                    TRENDING
                  </span>
                )}
                <span
                  className={`px-3 py-1 backdrop-blur-xl text-white text-sm font-bold rounded-lg uppercase ${
                    event.status === "upcoming"
                      ? "bg-blue-500/90"
                      : event.status === "ongoing"
                        ? "bg-green-500/90"
                        : event.status === "completed"
                          ? "bg-slate-500/90"
                          : event.status === "cancelled"
                            ? "bg-red-500/90"
                            : "bg-orange-500/90"
                  }`}
                >
                  {event.status}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">
                {event.title}
              </h2>
              {event.titleHindi && (
                <p className="text-xl text-slate-600 dark:text-slate-400 font-semibold">
                  {event.titleHindi}
                </p>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Calendar
                    size={20}
                    className="text-purple-600 dark:text-purple-400"
                  />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Date
                    </p>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {formatDate(event.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Clock
                    size={20}
                    className="text-purple-600 dark:text-purple-400"
                  />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Time
                    </p>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {event.time}
                      {event.endTime && ` - ${event.endTime}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <MapPin
                    size={20}
                    className="text-purple-600 dark:text-purple-400"
                  />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Venue
                    </p>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {event.venue}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Users
                    size={20}
                    className="text-purple-600 dark:text-purple-400"
                  />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Capacity
                    </p>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {event.venueCapacity || event.totalSeats} people
                    </p>
                  </div>
                </div>
              </div>

              {event.rating && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                  <Star
                    size={20}
                    fill="currentColor"
                    className="text-yellow-500"
                  />
                  <span className="font-black text-slate-800 dark:text-white">
                    {event.rating}/5
                  </span>
                  {event.ratingCount && (
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      ({formatNumber(event.ratingCount)} ratings)
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="flex border-b border-slate-200 dark:border-slate-800">
              {["overview", "lineup", "tickets", "faq"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 px-6 py-4 font-bold capitalize transition-all ${
                    activeTab === tab
                      ? "bg-purple-500 text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3">
                      About This Event
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {event.description}
                    </p>
                    {event.descriptionHindi && (
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        {event.descriptionHindi}
                      </p>
                    )}
                  </div>

                  {/* Highlights */}
                  {event.highlights && event.highlights.length > 0 && (
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3">
                        Highlights
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {event.highlights.map((highlight, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
                          >
                            <Sparkles
                              size={18}
                              className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                              {highlight}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Venue Details */}
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3">
                      Venue
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin
                          size={20}
                          className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1"
                        />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">
                            {event.venue}
                          </p>
                          {event.venueAddress && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {event.venueAddress}, {event.city}, {event.state}
                              {event.pincode && ` - ${event.pincode}`}
                            </p>
                          )}
                        </div>
                      </div>

                      {event.venueMap && event.venueMap.googleMapsUrl && (
                        <a
                          href={event.venueMap.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                        >
                          <ExternalLink size={16} />
                          View on Google Maps
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Rules */}
                  {event.rules && event.rules.length > 0 && (
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                        <Shield size={20} />
                        Rules & Guidelines
                      </h3>
                      <ul className="space-y-2">
                        {event.rules.map((rule, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 text-slate-600 dark:text-slate-400"
                          >
                            <CheckCircle
                              size={16}
                              className="text-green-500 flex-shrink-0 mt-1"
                            />
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "lineup" && (
                <div className="space-y-6">
                  {/* Performers */}
                  {event.performers && event.performers.length > 0 && (
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">
                        Performers
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {event.performers.map((performer, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                          >
                            {performer.profileImage && (
                              <img
                                src={performer.profileImage}
                                alt={performer.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">
                                {performer.name}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                                {performer.type}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hosts */}
                  {event.hosts && event.hosts.length > 0 && (
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">
                        Hosts
                      </h3>
                      <div className="space-y-3">
                        {event.hosts.map((host, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                          >
                            {host.profileImage && (
                              <img
                                src={host.profileImage}
                                alt={host.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">
                                {host.name}
                              </p>
                              {host.role && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {host.role}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Speakers */}
                  {event.speakers && event.speakers.length > 0 && (
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">
                        Speakers
                      </h3>
                      <div className="space-y-4">
                        {event.speakers.map((speaker, index) => (
                          <div
                            key={index}
                            className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                          >
                            <div className="flex items-start gap-4">
                              {speaker.profileImage && (
                                <img
                                  src={speaker.profileImage}
                                  alt={speaker.name}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-bold text-slate-800 dark:text-white">
                                  {speaker.name}
                                </p>
                                {speaker.title && (
                                  <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold">
                                    {speaker.title}
                                  </p>
                                )}
                                {speaker.organization && (
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {speaker.organization}
                                  </p>
                                )}
                                {speaker.topic && (
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                    Topic:{" "}
                                    <span className="font-semibold">
                                      {speaker.topic}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "tickets" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">
                    Ticket Tiers
                  </h3>
                  {event.ticketTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="p-4 border-2 border-slate-200 dark:border-slate-800 rounded-xl"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-800 dark:text-white">
                              {tier.name}
                            </h4>
                            {tier.isRecommended && (
                              <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded">
                                RECOMMENDED
                              </span>
                            )}
                            {tier.isSoldOut && (
                              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                                SOLD OUT
                              </span>
                            )}
                          </div>
                          {tier.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {tier.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-purple-600 dark:text-purple-400">
                            {formatCurrency(tier.price)}
                          </p>
                          {tier.originalPrice && (
                            <p className="text-xs text-slate-500 line-through">
                              {formatCurrency(tier.originalPrice)}
                            </p>
                          )}
                        </div>
                      </div>

                      {tier.benefits && tier.benefits.length > 0 && (
                        <ul className="space-y-1 mb-3">
                          {tier.benefits.map((benefit, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2"
                            >
                              <CheckCircle
                                size={14}
                                className="text-green-500 flex-shrink-0 mt-0.5"
                              />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Available: {tier.available} / {tier.total}
                        </p>
                        <div className="flex-1 max-w-xs ml-4">
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500"
                              style={{
                                width: `${((tier.total - tier.available) / tier.total) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "faq" && (
                <div className="space-y-4">
                  {event.faq && event.faq.length > 0 ? (
                    event.faq.map((item, index) => (
                      <details
                        key={index}
                        className="group bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden"
                      >
                        <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-slate-800 dark:text-white">
                          {item.question}
                          <ChevronRight
                            className="group-open:rotate-90 transition-transform"
                            size={20}
                          />
                        </summary>
                        <div className="px-4 pb-4">
                          <p className="text-slate-600 dark:text-slate-400">
                            {item.answer}
                          </p>
                        </div>
                      </details>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Info
                        size={48}
                        className="text-slate-300 dark:text-slate-600 mx-auto mb-4"
                      />
                      <p className="text-slate-500 dark:text-slate-400 font-semibold">
                        No FAQs available for this event
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Gallery */}
          {event.galleryImages && event.galleryImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                  Event Gallery
                </h3>
              </div>
              <div className="p-6">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                  <img
                    src={event.galleryImages[currentImageIndex]}
                    alt={`Gallery ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {event.galleryImages.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev === 0
                              ? event.galleryImages!.length - 1
                              : prev - 1,
                          )
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-xl rounded-full text-white hover:bg-white/30 transition-all"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev === event.galleryImages!.length - 1
                              ? 0
                              : prev + 1,
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-xl rounded-full text-white hover:bg-white/30 transition-all"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {event.galleryImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index
                          ? "border-purple-500"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column - Additional Info */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Organizer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                  Organizer
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <p className="font-bold text-slate-800 dark:text-white text-lg">
                  {event.organizer}
                </p>
                {event.organizerContact && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    📞 {event.organizerContact}
                  </p>
                )}
                {event.organizerEmail && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    ✉️ {event.organizerEmail}
                  </p>
                )}
                {event.organizerWebsite && (
                  <a
                    href={event.organizerWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    <ExternalLink size={14} />
                    Visit Website
                  </a>
                )}
              </div>
            </motion.div>

            {/* Additional Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                  Event Details
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">
                    Language
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {event.language}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">
                    Age Rating
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {event.ageRating}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">
                    Duration
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {event.duration}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">
                    Type
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white capitalize">
                    {event.type}
                  </span>
                </div>
                {event.dresscode && (
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">
                      Dress Code
                    </span>
                    <span className="font-bold text-slate-800 dark:text-white">
                      {event.dresscode}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-slate-600 dark:text-slate-400">
                    Booking Status
                  </span>
                  <span
                    className={`font-bold ${event.isBookingOpen ? "text-green-600" : "text-red-600"}`}
                  >
                    {event.isBookingOpen ? "Open" : "Closed"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Amenities */}
            {event.amenities && event.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">
                    Amenities
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-2">
                    {event.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                      >
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Parking */}
            {event.parking && event.parking.available && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">
                    Parking
                  </h3>
                </div>
                <div className="p-6 space-y-2">
                  <p className="text-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Type:
                    </span>{" "}
                    <span className="text-slate-600 dark:text-slate-400 capitalize">
                      {event.parking.type}
                    </span>
                  </p>
                  {event.parking.capacity && (
                    <p className="text-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Capacity:
                      </span>{" "}
                      <span className="text-slate-600 dark:text-slate-400">
                        {event.parking.capacity} vehicles
                      </span>
                    </p>
                  )}
                  {event.parking.charges && (
                    <p className="text-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Charges:
                      </span>{" "}
                      <span className="text-slate-600 dark:text-slate-400">
                        {event.parking.charges}
                      </span>
                    </p>
                  )}
                  {event.parking.instructions && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      {event.parking.instructions}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
