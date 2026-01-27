// ═══════════════════════════════════════════════════════════════════════════════
// 🎟️ EVENT BOOKINGS MANAGEMENT - FIXED COLLECTION NAME
// Path: src/pages/admin/EventBookingsManagement.tsx
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Ticket,
    Eye,
    Download,
    RefreshCw,
    Search,
    Calendar,
    User,
    Mail,
    Phone,
    MapPin,
    Clock,
    DollarSign,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronDown,
    X,
    FileText,
    CreditCard,
    Users,
} from "lucide-react";
import {
    collection,
    query,
    getDocs,
    orderBy,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type { Booking } from "../../types";

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
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    totalTickets: number;
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
// 👁️ VIEW BOOKING MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface ViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
}

const ViewModal: React.FC<ViewModalProps> = ({ isOpen, onClose, booking }) => {
    if (!isOpen || !booking) return null;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
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
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 text-white sticky top-0 z-10 rounded-t-3xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                                    <Ticket size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black">Booking Details</h3>
                                    <p className="text-white/80 text-sm">#{booking.bookingReference}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-xl transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Customer Info */}
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <User size={20} className="text-teal-500" />
                                Customer Information
                            </h4>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                                        <User size={18} className="text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
                                        <p className="font-bold text-slate-800 dark:text-white">
                                            {booking.userName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                        <Mail size={18} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                                            {booking.userEmail}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <Phone size={18} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                                            {booking.userPhone}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Event Info */}
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Calendar size={20} className="text-orange-500" />
                                Event Information
                            </h4>
                            <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl space-y-3">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                        Event Name
                                    </p>
                                    <p className="text-xl font-black text-slate-800 dark:text-white">
                                        {booking.eventTitle}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar size={16} className="text-slate-400" />
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Date</p>
                                        </div>
                                        <p className="font-bold text-slate-800 dark:text-white">
                                            {formatDate(booking.eventDate)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock size={16} className="text-slate-400" />
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Time</p>
                                        </div>
                                        <p className="font-bold text-slate-800 dark:text-white">
                                            {booking.eventTime}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MapPin size={16} className="text-slate-400" />
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Venue</p>
                                    </div>
                                    <p className="font-bold text-slate-800 dark:text-white">
                                        {booking.venue}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tickets */}
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Ticket size={20} className="text-purple-500" />
                                Ticket Details ({booking.totalTickets} Tickets)
                            </h4>
                            <div className="space-y-3">
                                {booking.tickets.map((ticket, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-800"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                                    <Ticket size={20} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 dark:text-white text-lg">
                                                        {ticket.tierName}
                                                    </p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {ticket.quantity} × ₹{ticket.pricePerTicket.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                                                    ₹{ticket.totalPrice.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <CreditCard size={20} className="text-green-500" />
                                Payment Summary
                            </h4>
                            <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl space-y-3 border-2 border-green-200 dark:border-green-800">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                    <span className="font-bold text-slate-800 dark:text-white text-lg">
                                        ₹{booking.totalAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">Convenience Fee</span>
                                    <span className="font-bold text-slate-800 dark:text-white text-lg">
                                        ₹{booking.convenienceFee.toLocaleString()}
                                    </span>
                                </div>
                                {booking.discount && booking.discount > 0 && (
                                    <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                                        <span className="font-semibold">Discount Applied</span>
                                        <span className="font-bold text-lg">
                                            -₹{booking.discount.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                <div className="pt-3 border-t-2 border-green-300 dark:border-green-700 flex justify-between items-center">
                                    <span className="text-xl font-black text-slate-800 dark:text-white">
                                        Total Amount
                                    </span>
                                    <span className="text-3xl font-black bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                                        ₹{booking.finalAmount.toLocaleString()}
                                    </span>
                                </div>

                                <div className="pt-4 mt-4 border-t border-green-200 dark:border-green-800 grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                            Payment Method
                                        </p>
                                        <p className="font-bold text-slate-700 dark:text-slate-300 capitalize">
                                            {booking.paymentMethod.type}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                            Payment Status
                                        </p>
                                        <span
                                            className={`px-3 py-1 rounded-lg text-sm font-bold inline-block ${booking.paymentStatus === "completed"
                                                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                                : booking.paymentStatus === "pending"
                                                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                                                    : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                                }`}
                                        >
                                            {booking.paymentStatus.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {booking.transactionId && (
                                    <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-xl">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                            Transaction ID
                                        </p>
                                        <code className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg block">
                                            {booking.transactionId}
                                        </code>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Booking Status */}
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-blue-500" />
                                Booking Status
                            </h4>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-4">
                                <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-700 rounded-xl">
                                    <span className="text-slate-600 dark:text-slate-400 font-semibold">
                                        Status
                                    </span>
                                    <span
                                        className={`px-4 py-2 rounded-xl text-sm font-black ${booking.bookingStatus === "confirmed"
                                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                            : booking.bookingStatus === "pending"
                                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                                                : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                            }`}
                                    >
                                        {booking.bookingStatus.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-700 rounded-xl">
                                    <span className="text-slate-600 dark:text-slate-400 font-semibold">
                                        Booked On
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-white">
                                        {formatDate(booking.bookingDate)}
                                    </span>
                                </div>
                                {booking.specialRequests && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-semibold">
                                            Special Requests
                                        </p>
                                        <p className="text-slate-700 dark:text-slate-300">
                                            {booking.specialRequests}
                                        </p>
                                    </div>
                                )}
                                {booking.cancellationReason && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                        <p className="text-sm text-red-600 dark:text-red-400 mb-2 font-bold">
                                            Cancellation Reason
                                        </p>
                                        <p className="text-red-700 dark:text-red-300">
                                            {booking.cancellationReason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between sticky bottom-0 border-t border-slate-200 dark:border-slate-700 rounded-b-3xl">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2"
                        >
                            <Download size={20} />
                            Download Ticket
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                        >
                            Close
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

const EventBookingsManagement: React.FC = () => {

    // States
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        totalTickets: 0,
    });

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");

    // View Modal
    const [viewModal, setViewModal] = useState({
        isOpen: false,
        booking: null as Booking | null,
    });

    // Toast
    const [toast, setToast] = useState({
        isVisible: false,
        message: "",
        type: "success" as "success" | "error" | "info" | "warning",
    });

    // Fetch bookings
    useEffect(() => {
        fetchBookings();
    }, []);

    // Apply filters
    useEffect(() => {
        applyFilters();
    }, [searchQuery, filterStatus, filterPaymentStatus, bookings]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            console.log("Fetching bookings from 'bookings' collection...");

            // ✅ FIXED: Changed from "eventBookings" to "bookings"
            const bookingsQuery = query(
                collection(db, "bookings"),
                orderBy("bookingDate", "desc")
            );
            const bookingsSnapshot = await getDocs(bookingsQuery);

            const fetchedBookings: Booking[] = [];
            let totalRevenue = 0;
            let totalTickets = 0;
            let confirmedCount = 0;
            let pendingCount = 0;
            let cancelledCount = 0;

            bookingsSnapshot.forEach((doc) => {
                const bookingData = { ...doc.data(), id: doc.id } as Booking;
                fetchedBookings.push(bookingData);

                // Calculate stats
                if (bookingData.paymentStatus === "completed") {
                    totalRevenue += bookingData.finalAmount;
                }
                totalTickets += bookingData.totalTickets;

                if (bookingData.bookingStatus === "confirmed") confirmedCount++;
                else if (bookingData.bookingStatus === "pending") pendingCount++;
                else if (bookingData.bookingStatus === "cancelled") cancelledCount++;
            });

            const stats: Stats = {
                totalBookings: fetchedBookings.length,
                confirmedBookings: confirmedCount,
                pendingBookings: pendingCount,
                cancelledBookings: cancelledCount,
                totalRevenue,
                totalTickets,
            };

            console.log(`✅ Fetched ${fetchedBookings.length} bookings`);
            setBookings(fetchedBookings);
            setStats(stats);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            showToast("Failed to load bookings", "error");
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...bookings];

        // Filter by booking status
        if (filterStatus !== "all") {
            filtered = filtered.filter((booking) => booking.bookingStatus === filterStatus);
        }

        // Filter by payment status
        if (filterPaymentStatus !== "all") {
            filtered = filtered.filter(
                (booking) => booking.paymentStatus === filterPaymentStatus
            );
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (booking) =>
                    booking.bookingReference.toLowerCase().includes(query) ||
                    booking.userName.toLowerCase().includes(query) ||
                    booking.userEmail.toLowerCase().includes(query) ||
                    booking.userPhone.includes(query) ||
                    booking.eventTitle.toLowerCase().includes(query)
            );
        }

        setFilteredBookings(filtered);
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

    const getBookingStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
            case "pending":
                return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
            case "cancelled":
                return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
            case "attended":
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
            default:
                return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
            case "pending":
                return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
            case "failed":
                return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
            case "refunded":
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
            default:
                return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const handleExportReport = () => {
        showToast("Exporting report...", "info");
        // Export logic here
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full mb-4"
                />
                <p className="text-slate-600 dark:text-slate-400 font-semibold">
                    Loading bookings...
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

            {/* View Modal */}
            <ViewModal
                isOpen={viewModal.isOpen}
                onClose={() => setViewModal({ isOpen: false, booking: null })}
                booking={viewModal.booking}
            />

            <div className="space-y-6 w-full">
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
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
                                    <Ticket size={32} />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black mb-2">Event Bookings</h1>
                                    <p className="text-white/90 text-lg">
                                        Manage all event ticket bookings
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={fetchBookings}
                                    className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                                >
                                    <RefreshCw size={20} />
                                    Refresh
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleExportReport}
                                    className="px-8 py-3 bg-white text-teal-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                    <Download size={20} />
                                    Export Report
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
                                    Total Bookings
                                </p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                                    {stats.totalBookings}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                                <Ticket size={24} className="text-teal-600 dark:text-teal-400" />
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
                                    Confirmed
                                </p>
                                <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-2">
                                    {stats.confirmedBookings}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
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
                                    Total Revenue
                                </p>
                                <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
                                    ₹{(stats.totalRevenue / 1000).toFixed(1)}K
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <DollarSign size={24} className="text-blue-600 dark:text-blue-400" />
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
                                    Total Tickets
                                </p>
                                <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">
                                    {stats.totalTickets}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <Users size={24} className="text-purple-600 dark:text-purple-400" />
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
                                    placeholder="Search by booking ref, name, email, phone, event..."
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Booking Status Filter */}
                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="appearance-none px-6 py-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white font-semibold cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="attended">Attended</option>
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                size={20}
                            />
                        </div>

                        {/* Payment Status Filter */}
                        <div className="relative">
                            <select
                                value={filterPaymentStatus}
                                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                                className="appearance-none px-6 py-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white font-semibold cursor-pointer"
                            >
                                <option value="all">All Payments</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                size={20}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* BOOKINGS TABLE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-16">
                            <AlertCircle
                                size={64}
                                className="text-slate-300 dark:text-slate-700 mx-auto mb-4"
                            />
                            <p className="text-xl font-bold text-slate-500 dark:text-slate-400">
                                No bookings found
                            </p>
                            <p className="text-slate-400 dark:text-slate-500 mt-2">
                                Try adjusting your filters
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Booking ID
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Event
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Tickets
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Payment
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Booking Date
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {filteredBookings.map((booking, index) => (
                                        <motion.tr
                                            key={booking.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg font-mono text-slate-700 dark:text-slate-300">
                                                    {booking.bookingReference}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white">
                                                        {booking.userName}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {booking.userEmail}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white">
                                                        {booking.eventTitle}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {formatDate(booking.eventDate)} • {booking.eventTime}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Ticket size={16} className="text-slate-400" />
                                                    <span className="font-bold text-slate-800 dark:text-white">
                                                        {booking.totalTickets}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-800 dark:text-white">
                                                    ₹{booking.finalAmount.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getPaymentStatusColor(
                                                        booking.paymentStatus
                                                    )}`}
                                                >
                                                    {booking.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getBookingStatusColor(
                                                        booking.bookingStatus
                                                    )}`}
                                                >
                                                    {booking.bookingStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {formatDate(booking.bookingDate)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() =>
                                                            setViewModal({ isOpen: true, booking: booking })
                                                        }
                                                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => showToast("Downloading ticket...", "info")}
                                                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-all"
                                                        title="Download Ticket"
                                                    >
                                                        <Download size={18} />
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

export default EventBookingsManagement;
