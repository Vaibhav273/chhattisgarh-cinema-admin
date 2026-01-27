// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 EVENTS MANAGEMENT - PRODUCTION READY (FINAL)
// Path: src/pages/admin/EventsManagement.tsx
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Plus,
    Edit,
    Trash2,
    Eye,
    Search,
    MapPin,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader,
    ChevronDown,

    DollarSign,
    Ticket,
    RefreshCw,
    Star,
    TrendingUp,
} from "lucide-react";
import {
    collection,
    query,
    getDocs,
    doc,
    deleteDoc,
    orderBy
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import type { Event } from "../../types";

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 INTERFACES & TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ToastProps {
    message: string;
    type: "success" | "error" | "info" | "warning";
    isVisible: boolean;
    onClose: () => void;
}

interface Stats {
    total: number;
    upcoming: number;
    ongoing: number;
    completed: number;
    totalBookings: number;
    totalRevenue: number;
    averageOccupancy: number;
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
// 🗑️ DELETE CONFIRMATION MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    eventTitle: string;
    loading: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    eventTitle,
    loading,
}) => {
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
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                Delete Event
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                This action cannot be undone
                            </p>
                        </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Are you sure you want to delete{" "}
                        <span className="font-bold text-slate-800 dark:text-white">
                            "{eventTitle}"
                        </span>
                        ?
                    </p>

                    <div className="flex gap-3">
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
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={20} />
                                    Delete
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const EventsManagement: React.FC = () => {
    const navigate = useNavigate();

    // States
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        upcoming: 0,
        ongoing: 0,
        completed: 0,
        totalBookings: 0,
        totalRevenue: 0,
        averageOccupancy: 0,
    });

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // Delete Modal
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        eventId: "",
        eventTitle: "",
        loading: false,
    });

    // Toast
    const [toast, setToast] = useState({
        isVisible: false,
        message: "",
        type: "success" as "success" | "error" | "info" | "warning",
    });

    // Fetch events
    useEffect(() => {
        fetchEvents();
    }, []);

    // Apply filters
    useEffect(() => {
        applyFilters();
    }, [searchQuery, filterCategory, filterStatus, events]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            console.log("Fetching events...");

            const eventsQuery = query(
                collection(db, "events"),
                orderBy("date", "desc")
            );
            const eventsSnapshot = await getDocs(eventsQuery);

            const fetchedEvents: Event[] = [];
            let totalBookings = 0;
            let totalRevenue = 0;
            let totalCapacity = 0;
            let totalBooked = 0;

            eventsSnapshot.forEach((doc) => {
                const eventData = { ...doc.data(), id: doc.id } as Event;
                fetchedEvents.push(eventData);

                // Calculate stats
                totalBookings += eventData.totalBookings || 0;
                totalRevenue += eventData.revenue || 0;
                totalCapacity += eventData.totalSeats || 0;
                totalBooked += eventData.bookedSeats || 0;
            });

            const stats: Stats = {
                total: fetchedEvents.length,
                upcoming: fetchedEvents.filter((e) => e.status === "upcoming").length,
                ongoing: fetchedEvents.filter((e) => e.status === "ongoing").length,
                completed: fetchedEvents.filter((e) => e.status === "completed").length,
                totalBookings,
                totalRevenue,
                averageOccupancy:
                    totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0,
            };

            console.log(`Fetched ${fetchedEvents.length} events`);
            setEvents(fetchedEvents);
            setStats(stats);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching events:", error);
            showToast("Failed to load events", "error");
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...events];

        // Filter by category
        if (filterCategory !== "all") {
            filtered = filtered.filter((event) => event.category === filterCategory);
        }

        // Filter by status
        if (filterStatus !== "all") {
            filtered = filtered.filter((event) => event.status === filterStatus);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (event) =>
                    event.title.toLowerCase().includes(query) ||
                    event.titleHindi?.toLowerCase().includes(query) ||
                    event.venue.toLowerCase().includes(query) ||
                    event.city.toLowerCase().includes(query) ||
                    event.organizer.toLowerCase().includes(query)
            );
        }

        setFilteredEvents(filtered);
    };

    const handleDelete = async () => {
        try {
            setDeleteModal({ ...deleteModal, loading: true });
            console.log("Deleting event:", deleteModal.eventId);

            await deleteDoc(doc(db, "events", deleteModal.eventId));

            showToast("Event deleted successfully!", "success");
            setDeleteModal({ isOpen: false, eventId: "", eventTitle: "", loading: false });
            fetchEvents();
        } catch (error) {
            console.error("Error deleting event:", error);
            showToast("Failed to delete event", "error");
            setDeleteModal({ ...deleteModal, loading: false });
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "upcoming":
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
            case "ongoing":
                return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
            case "completed":
                return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
            case "cancelled":
                return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
            case "postponed":
                return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
            default:
                return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            "film-festival": "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
            "film-premiere": "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
            "award-show": "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
            "concert": "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
            "cultural": "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
            "workshop": "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
            "screening": "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        };
        return colors[category] || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
    };

    const getCategoryLabel = (category: string) => {
        const labels: { [key: string]: string } = {
            "film-festival": "Film Festival",
            "film-premiere": "Film Premiere",
            "award-show": "Award Show",
            "concert": "Concert",
            "cultural": "Cultural",
            "dance": "Dance",
            "music": "Music",
            "theater": "Theater",
            "comedy": "Comedy",
            "workshop": "Workshop",
            "seminar": "Seminar",
            "conference": "Conference",
            "meetup": "Meetup",
            "screening": "Screening",
            "other": "Other",
        };
        return labels[category] || category;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getTicketPriceRange = (event: Event) => {
        if (event.ticketTiers && event.ticketTiers.length > 0) {
            const prices = event.ticketTiers.map((tier) => tier.price);
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
        }
        return event.price ? `₹${event.price.min} - ₹${event.price.max}` : "Free";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mb-4"
                />
                <p className="text-slate-600 dark:text-slate-400 font-semibold">
                    Loading events...
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

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() =>
                    setDeleteModal({ isOpen: false, eventId: "", eventTitle: "", loading: false })
                }
                onConfirm={handleDelete}
                eventTitle={deleteModal.eventTitle}
                loading={deleteModal.loading}
            />

            <div className="space-y-6 w-full">
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
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
                                    <Calendar size={32} />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black mb-2">Events Management</h1>
                                    <p className="text-white/90 text-lg">
                                        Manage all platform events and bookings
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={fetchEvents}
                                    className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                                >
                                    <RefreshCw size={20} />
                                    Refresh
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate("/admin/events/add")}
                                    className="px-8 py-3 bg-white text-orange-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                    <Plus size={20} />
                                    Create New Event
                                </motion.button>
                            </div>
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
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    Total Events
                                </p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                <Calendar size={24} className="text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    Upcoming Events
                                </p>
                                <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
                                    {stats.upcoming}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <Clock size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    Total Bookings
                                </p>
                                <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-2">
                                    {stats.totalBookings.toLocaleString()}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                <Ticket size={24} className="text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    Avg Occupancy
                                </p>
                                <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">
                                    {stats.averageOccupancy}%
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <TrendingUp size={24} className="text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* FILTERS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by title, venue, city, organizer..."
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="appearance-none px-6 py-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-white font-semibold cursor-pointer"
                            >
                                <option value="all">All Categories</option>
                                <option value="film-festival">Film Festival</option>
                                <option value="film-premiere">Film Premiere</option>
                                <option value="award-show">Award Show</option>
                                <option value="concert">Concert</option>
                                <option value="cultural">Cultural</option>
                                <option value="workshop">Workshop</option>
                                <option value="screening">Screening</option>
                                <option value="other">Other</option>
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                size={20}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="appearance-none px-6 py-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-white font-semibold cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="postponed">Postponed</option>
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                size={20}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* EVENTS LIST */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    {filteredEvents.length === 0 ? (
                        <div className="text-center py-16">
                            <AlertCircle
                                size={64}
                                className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
                            />
                            <p className="text-xl font-bold text-slate-500 dark:text-slate-400">
                                No events found
                            </p>
                            <p className="text-slate-400 dark:text-slate-500 mt-2">
                                Try adjusting your filters or create a new event
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Event
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Date & Venue
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Bookings
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {filteredEvents.map((event, index) => (
                                        <motion.tr
                                            key={event.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {event.image ? (
                                                        <div className="relative">
                                                            <img
                                                                src={event.image}
                                                                alt={event.title}
                                                                className="w-16 h-16 object-cover rounded-xl"
                                                            />
                                                            {event.isFeatured && (
                                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                                                    <Star size={12} className="text-white" fill="white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                                                            <Calendar size={24} className="text-white" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white">
                                                            {event.title}
                                                        </p>
                                                        {event.titleHindi && (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                                {event.titleHindi}
                                                            </p>
                                                        )}
                                                        {event.rating && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Star
                                                                    size={12}
                                                                    className="text-yellow-500"
                                                                    fill="#eab308"
                                                                />
                                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                    {event.rating} ({event.ratingCount})
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} className="text-slate-400" />
                                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                                            {formatDate(event.date)} at {event.time}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={14} className="text-slate-400" />
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                                            {event.venue}, {event.city}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-lg text-sm font-bold ${getCategoryColor(
                                                        event.category
                                                    )}`}
                                                >
                                                    {getCategoryLabel(event.category)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Users size={16} className="text-slate-400" />
                                                    <span className="font-bold text-slate-800 dark:text-white">
                                                        {event.bookedSeats}
                                                    </span>
                                                    <span className="text-slate-500 dark:text-slate-400">
                                                        / {event.totalSeats}
                                                    </span>
                                                </div>
                                                <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                                    <div
                                                        className="bg-gradient-to-r from-orange-500 to-amber-600 h-1.5 rounded-full"
                                                        style={{
                                                            width: `${(event.bookedSeats / event.totalSeats) * 100
                                                                }%`,
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <DollarSign size={14} className="text-slate-400" />
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                        {getTicketPriceRange(event)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-lg text-sm font-bold uppercase ${getStatusColor(
                                                        event.status
                                                    )}`}
                                                >
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => navigate(`/admin/events/view/${event.id}`)}
                                                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => navigate(`/admin/events/edit/${event.id}`)}
                                                        className="p-2 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-all"
                                                        title="Edit Event"
                                                    >
                                                        <Edit size={18} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() =>
                                                            setDeleteModal({
                                                                isOpen: true,
                                                                eventId: event.id,
                                                                eventTitle: event.title,
                                                                loading: false,
                                                            })
                                                        }
                                                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                                        title="Delete Event"
                                                    >
                                                        <Trash2 size={18} />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default EventsManagement;
