import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
    MapPin,
    Users,
    Ticket,
    Image as ImageIcon,
    Video,
    Plus,
    Loader,
    Save,
    ArrowLeft,
    Info,
    Clock,
    AlertCircle,
    CheckCircle,
    Trash2,
    Star,
} from "lucide-react";
import {
    collection,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type {
    Event,
    TicketTier,
    Host,
    Performer,
    Speaker,
    FAQ,
    Sponsor,
    MediaPartner,
    EventCategory,
    EventType,
} from "../../types";
import { ImageUploader } from "../../components/admin/ImageUploader";
import { VideoUploader } from "../../components/admin/VideoUploader";

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

interface ToastProps {
    message: string;
    type: "success" | "error" | "info" | "warning";
    isVisible: boolean;
    onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 TOAST COMPONENT
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

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const AddEditEvent: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);

    // States
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Toast
    const [toast, setToast] = useState({
        isVisible: false,
        message: "",
        type: "success" as "success" | "error" | "info" | "warning",
    });

    // Form Data
    const [formData, setFormData] = useState<Partial<Event>>({
        title: "",
        titleHindi: "",
        description: "",
        descriptionHindi: "",
        image: "",
        imageCdnUrl: "",
        bannerImage: "",
        bannerImageCdnUrl: "",
        galleryImages: [],
        galleryCdnUrls: [],
        date: "",
        endDate: "",
        time: "",
        endTime: "",
        duration: "",
        timezone: "Asia/Kolkata",
        venue: "",
        venueHindi: "",
        venueAddress: "",
        venueAddressHindi: "",
        city: "",
        cityHindi: "",
        state: "",
        stateHindi: "",
        pincode: "",
        venueCapacity: 0,
        category: "film-festival",
        type: "in-person",
        organizer: "",
        organizerHindi: "",
        organizerContact: "",
        organizerEmail: "",
        organizerWebsite: "",
        totalSeats: 0,
        bookedSeats: 0,
        availableSeats: 0,
        ticketTiers: [],
        bookingStartDate: "",
        bookingEndDate: "",
        isBookingOpen: true,
        minTicketsPerBooking: 1,
        maxTicketsPerBooking: 10,
        language: "Hindi",
        languageHindi: "हिंदी",
        ageRating: "U",
        dresscode: "",
        dresscodeHindi: "",
        rules: [],
        rulesHindi: [],
        amenities: [],
        amenitiesHindi: [],
        trailerUrl: "",
        trailerCdnUrl: "",
        trailerMetadata: undefined,
        promoVideoUrl: "",
        promoVideoCdnUrl: "",
        promoVideoMetadata: undefined,
        status: "upcoming",
        isFeatured: false,
        isTrending: false,
        isNew: true,
        tags: [],
        highlights: [],
        highlightsHindi: [],
        hosts: [],
        performers: [],
        speakers: [],
        faq: [],
        sponsors: [],
        mediaPartners: [],
        hasLiveStreaming: false,
        liveStreamUrl: "",
        liveStreamCdnUrl: "",
        liveStreamMetadata: undefined,
        hasVIPMeetGreet: false,
        hasPhotoBooth: false,
        hasFoodStalls: false,
        hasGiftBags: false,
    });

    // Load event data in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            fetchEvent();
        }
    }, [id, isEditMode]);

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const eventDoc = await getDoc(doc(db, "events", id!));
            if (eventDoc.exists()) {
                setFormData({ id: eventDoc.id, ...eventDoc.data() } as Event);
            } else {
                showToast("Event not found", "error");
                navigate("/admin/events/all");
            }
        } catch (error) {
            console.error("Error fetching event:", error);
            showToast("Failed to load event", "error");
        } finally {
            setLoading(false);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // 🖼️ CDN UPLOAD HANDLERS (USING UPLOADER COMPONENTS)
    // ═══════════════════════════════════════════════════════════════════════════════

    const handleMainImageUpload = (url: string, cdnUrl?: string) => {
        setFormData(prev => ({
            ...prev,
            image: url,
            imageCdnUrl: cdnUrl || url  // Fallback to url if cdnUrl is undefined
        }));
        showToast("Main image uploaded successfully!", "success");
    };

    const handleBannerImageUpload = (url: string, cdnUrl?: string) => {
        setFormData(prev => ({
            ...prev,
            bannerImage: url,
            bannerImageCdnUrl: cdnUrl || url
        }));
        showToast("Banner image uploaded successfully!", "success");
    };

    const handleGalleryImageUpload = (url: string, cdnUrl?: string) => {
        setFormData(prev => ({
            ...prev,
            galleryImages: [...(prev.galleryImages || []), url],
            galleryCdnUrls: [...(prev.galleryCdnUrls || []), cdnUrl || url]
        }));
        showToast("Gallery image added!", "success");
    };

    const removeGalleryImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            galleryImages: prev.galleryImages?.filter((_, i) => i !== index),
            galleryCdnUrls: prev.galleryCdnUrls?.filter((_, i) => i !== index),
        }));
    };

    // Video handlers - note the different parameter names: encodedUrl instead of cdnUrl
    const handleTrailerUpload = (url: string, encodedUrl?: string, metadata?: any) => {
        setFormData(prev => ({
            ...prev,
            trailerUrl: url,
            trailerCdnUrl: encodedUrl || url,
            trailerMetadata: metadata
        }));
        showToast("Trailer uploaded successfully!", "success");
    };

    const handlePromoVideoUpload = (url: string, encodedUrl?: string, metadata?: any) => {
        setFormData(prev => ({
            ...prev,
            promoVideoUrl: url,
            promoVideoCdnUrl: encodedUrl || url,
            promoVideoMetadata: metadata
        }));
        showToast("Promo video uploaded successfully!", "success");
    };

    const handleLiveStreamUpload = (url: string, encodedUrl?: string, metadata?: any) => {
        setFormData(prev => ({
            ...prev,
            liveStreamUrl: url,
            liveStreamCdnUrl: encodedUrl || url,
            liveStreamMetadata: metadata
        }));
        showToast("Livestream video uploaded successfully!", "success");
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // 👥 MANAGEMENT FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    const addTicketTier = () => {
        const newTier: TicketTier = {
            id: `tier-${Date.now()}`,
            name: "",
            nameHindi: "",
            price: 0,
            currency: "INR",
            available: 0,
            total: 0,
            benefits: [],
            benefitsHindi: [],
            isRecommended: false,
            isSoldOut: false,
            maxPerBooking: 10,
        };
        setFormData((prev) => ({
            ...prev,
            ticketTiers: [...(prev.ticketTiers || []), newTier],
        }));
    };

    const updateTicketTier = (index: number, updates: Partial<TicketTier>) => {
        setFormData((prev) => ({
            ...prev,
            ticketTiers: prev.ticketTiers?.map((tier, i) =>
                i === index ? { ...tier, ...updates } : tier
            ),
        }));
    };

    const removeTicketTier = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            ticketTiers: prev.ticketTiers?.filter((_, i) => i !== index),
        }));
    };

    const addHost = () => {
        const newHost: Host = {
            id: `host-${Date.now()}`,
            name: "",
            nameHindi: "",
            role: "",
            profileImage: "",
            bio: "",
            bioHindi: "",
        };
        setFormData((prev) => ({
            ...prev,
            hosts: [...(prev.hosts || []), newHost],
        }));
    };

    const updateHost = (index: number, updates: Partial<Host>) => {
        setFormData((prev) => ({
            ...prev,
            hosts: prev.hosts?.map((host, i) => (i === index ? { ...host, ...updates } : host)),
        }));
    };

    const removeHost = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            hosts: prev.hosts?.filter((_, i) => i !== index),
        }));
    };

    const addPerformer = () => {
        const newPerformer: Performer = {
            id: `performer-${Date.now()}`,
            name: "",
            nameHindi: "",
            type: "singer",
            profileImage: "",
            bio: "",
            bioHindi: "",
            performanceTime: "",
        };
        setFormData((prev) => ({
            ...prev,
            performers: [...(prev.performers || []), newPerformer],
        }));
    };

    const updatePerformer = (index: number, updates: Partial<Performer>) => {
        setFormData((prev) => ({
            ...prev,
            performers: prev.performers?.map((performer, i) =>
                i === index ? { ...performer, ...updates } : performer
            ),
        }));
    };

    const removePerformer = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            performers: prev.performers?.filter((_, i) => i !== index),
        }));
    };

    const addSpeaker = () => {
        const newSpeaker: Speaker = {
            id: `speaker-${Date.now()}`,
            name: "",
            nameHindi: "",
            title: "",
            titleHindi: "",
            organization: "",
            organizationHindi: "",
            profileImage: "",
            bio: "",
            bioHindi: "",
            topic: "",
            topicHindi: "",
            sessionTime: "",
        };
        setFormData((prev) => ({
            ...prev,
            speakers: [...(prev.speakers || []), newSpeaker],
        }));
    };

    const updateSpeaker = (index: number, updates: Partial<Speaker>) => {
        setFormData((prev) => ({
            ...prev,
            speakers: prev.speakers?.map((speaker, i) =>
                i === index ? { ...speaker, ...updates } : speaker
            ),
        }));
    };

    const removeSpeaker = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            speakers: prev.speakers?.filter((_, i) => i !== index),
        }));
    };

    const addFAQ = () => {
        const newFAQ: FAQ = {
            question: "",
            questionHindi: "",
            answer: "",
            answerHindi: "",
            category: "",
        };
        setFormData((prev) => ({
            ...prev,
            faq: [...(prev.faq || []), newFAQ],
        }));
    };

    const updateFAQ = (index: number, updates: Partial<FAQ>) => {
        setFormData((prev) => ({
            ...prev,
            faq: prev.faq?.map((faqItem, i) => (i === index ? { ...faqItem, ...updates } : faqItem)),
        }));
    };

    const removeFAQ = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            faq: prev.faq?.filter((_, i) => i !== index),
        }));
    };

    const addSponsor = () => {
        const newSponsor: Sponsor = {
            id: `sponsor-${Date.now()}`,
            name: "",
            nameHindi: "",
            logo: "",
            website: "",
            tier: "bronze",
            description: "",
            descriptionHindi: "",
        };
        setFormData((prev) => ({
            ...prev,
            sponsors: [...(prev.sponsors || []), newSponsor],
        }));
    };

    const updateSponsor = (index: number, updates: Partial<Sponsor>) => {
        setFormData((prev) => ({
            ...prev,
            sponsors: prev.sponsors?.map((sponsor, i) =>
                i === index ? { ...sponsor, ...updates } : sponsor
            ),
        }));
    };

    const removeSponsor = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            sponsors: prev.sponsors?.filter((_, i) => i !== index),
        }));
    };

    const addMediaPartner = () => {
        const newPartner: MediaPartner = {
            id: `partner-${Date.now()}`,
            name: "",
            logo: "",
            website: "",
            type: "digital",
        };
        setFormData((prev) => ({
            ...prev,
            mediaPartners: [...(prev.mediaPartners || []), newPartner],
        }));
    };

    const updateMediaPartner = (index: number, updates: Partial<MediaPartner>) => {
        setFormData((prev) => ({
            ...prev,
            mediaPartners: prev.mediaPartners?.map((partner, i) =>
                i === index ? { ...partner, ...updates } : partner
            ),
        }));
    };

    const removeMediaPartner = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            mediaPartners: prev.mediaPartners?.filter((_, i) => i !== index),
        }));
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // 💾 FORM SUBMISSION
    // ═══════════════════════════════════════════════════════════════════════════════

    const validateForm = (): boolean => {
        if (!formData.title || !formData.titleHindi) {
            showToast("Please enter event title in both languages", "error");
            return false;
        }

        if (!formData.date || !formData.time) {
            showToast("Please select event date and time", "error");
            return false;
        }

        if (!formData.venue || !formData.city) {
            showToast("Please enter venue details", "error");
            return false;
        }

        if (!formData.image) {
            showToast("Please upload event image", "error");
            return false;
        }

        if (!formData.ticketTiers || formData.ticketTiers.length === 0) {
            showToast("Please add at least one ticket tier", "error");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setSaving(true);

            const totalSeats = formData.ticketTiers?.reduce((sum, tier) => sum + tier.total, 0) || 0;
            const availableSeats = formData.ticketTiers?.reduce((sum, tier) => sum + tier.available, 0) || 0;

            const eventData = {
                ...formData,
                totalSeats,
                bookedSeats: totalSeats - availableSeats,
                availableSeats,
                updatedAt: serverTimestamp(),
            };

            if (isEditMode && id) {
                await updateDoc(doc(db, "events", id), eventData);
                showToast("Event updated successfully!", "success");
            } else {
                await addDoc(collection(db, "events"), {
                    ...eventData,
                    createdAt: serverTimestamp(),
                    views: 0,
                    sharesCount: 0,
                    interestedCount: 0,
                    totalBookings: 0,
                    revenue: 0,
                    rating: 0,
                    ratingCount: 0,
                });
                showToast("Event created successfully!", "success");
            }

            setTimeout(() => navigate("/admin/events/all"), 1500);
        } catch (error) {
            console.error("Error saving event:", error);
            showToast("Failed to save event", "error");
        } finally {
            setSaving(false);
        }
    };

    const showToast = (message: string, type: "success" | "error" | "info" | "warning") => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
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
                    Loading event...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-8">
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-8 text-white shadow-2xl"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => navigate("/admin/events/all")}
                                className="p-3 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-white/30 transition-all"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-4xl font-black mb-2">
                                    {isEditMode ? "Edit Event" : "Create New Event"}
                                </h1>
                                <p className="text-white/90 text-lg">
                                    {isEditMode ? "Update event details" : "Add a new event to the platform"}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 bg-white text-orange-600 rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader className="animate-spin" size={20} />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        {isEditMode ? "Update Event" : "Create Event"}
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* BASIC INFORMATION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Info size={24} className="text-orange-500" />
                        Basic Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title (English) */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Event Title (English) *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter event title"
                                required
                            />
                        </div>

                        {/* Title (Hindi) */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Event Title (Hindi) *
                            </label>
                            <input
                                type="text"
                                value={formData.titleHindi}
                                onChange={(e) => setFormData({ ...formData, titleHindi: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="इवेंट का शीर्षक दर्ज करें"
                                required
                            />
                        </div>

                        {/* Description (English) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Description (English) *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter event description"
                                required
                            />
                        </div>

                        {/* Description (Hindi) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Description (Hindi) *
                            </label>
                            <textarea
                                value={formData.descriptionHindi}
                                onChange={(e) => setFormData({ ...formData, descriptionHindi: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="इवेंट का विवरण दर्ज करें"
                                required
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Category *
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            >
                                <option value="film-festival">Film Festival</option>
                                <option value="film-premiere">Film Premiere</option>
                                <option value="award-show">Award Show</option>
                                <option value="concert">Concert</option>
                                <option value="cultural">Cultural</option>
                                <option value="dance">Dance</option>
                                <option value="music">Music</option>
                                <option value="theater">Theater</option>
                                <option value="comedy">Comedy</option>
                                <option value="workshop">Workshop</option>
                                <option value="seminar">Seminar</option>
                                <option value="conference">Conference</option>
                                <option value="meetup">Meetup</option>
                                <option value="screening">Screening</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Event Type */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Event Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            >
                                <option value="in-person">In-Person</option>
                                <option value="virtual">Virtual</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>

                        {/* Language */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Language *
                            </label>
                            <input
                                type="text"
                                value={formData.language}
                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Hindi, English"
                                required
                            />
                        </div>

                        {/* Age Rating */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Age Rating *
                            </label>
                            <select
                                value={formData.ageRating}
                                onChange={(e) => setFormData({ ...formData, ageRating: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            >
                                <option value="U">U (Universal)</option>
                                <option value="U/A 7+">U/A 7+</option>
                                <option value="U/A 13+">U/A 13+</option>
                                <option value="U/A 16+">U/A 16+</option>
                                <option value="A">A (Adults Only)</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Status *
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="postponed">Postponed</option>
                            </select>
                        </div>

                        {/* Checkboxes */}
                        <div className="md:col-span-2 flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Featured Event
                                </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isTrending}
                                    onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Trending
                                </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.hasLiveStreaming}
                                    onChange={(e) => setFormData({ ...formData, hasLiveStreaming: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Live Streaming Available
                                </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.hasVIPMeetGreet}
                                    onChange={(e) => setFormData({ ...formData, hasVIPMeetGreet: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    VIP Meet & Greet
                                </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.hasPhotoBooth}
                                    onChange={(e) => setFormData({ ...formData, hasPhotoBooth: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Photo Booth
                                </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.hasFoodStalls}
                                    onChange={(e) => setFormData({ ...formData, hasFoodStalls: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Food Stalls
                                </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.hasGiftBags}
                                    onChange={(e) => setFormData({ ...formData, hasGiftBags: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Gift Bags
                                </span>
                            </label>
                        </div>
                    </div>
                </motion.div>

                {/* MEDIA UPLOADS - CDN INTEGRATED */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <ImageIcon size={24} className="text-orange-500" />
                        Media & Assets
                    </h2>

                    <div className="space-y-6">
                        {/* Main Event Image */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Main Event Image * (Recommended: 1200x800px)
                            </label>
                            <ImageUploader
                                onUploadComplete={handleMainImageUpload}
                                existingImageUrl={formData.imageCdnUrl || formData.image}
                                folder="events/images"
                                maxSize={10}
                                acceptedFormats={['jpg', 'jpeg', 'png']}
                                aspectRatio="16:9"
                            />
                        </div>

                        {/* Banner Image */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Banner Image (Recommended: 1920x600px)
                            </label>
                            <ImageUploader
                                onUploadComplete={handleBannerImageUpload}
                                existingImageUrl={formData.bannerImageCdnUrl || formData.bannerImage}
                                folder="events/banners"
                                maxSize={15}
                                acceptedFormats={['jpg', 'jpeg', 'png']}
                                aspectRatio="3:1"
                            />
                        </div>

                        {/* Gallery Images */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Gallery Images (Multiple)
                            </label>

                            {/* Display existing gallery images */}
                            {formData.galleryCdnUrls && formData.galleryCdnUrls.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {formData.galleryCdnUrls.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={url || formData.galleryImages?.[index]}
                                                alt={`Gallery ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-xl border-2 border-slate-200 dark:border-slate-700"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <ImageUploader
                                onUploadComplete={handleGalleryImageUpload}
                                folder="events/gallery"
                                multiple
                                maxSize={5}
                                acceptedFormats={['jpg', 'jpeg', 'png', 'webp']}
                            />
                        </div>

                        {/* Trailer Video */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <Video className="inline mr-2" size={18} />
                                Trailer Video
                            </label>
                            <VideoUploader
                                onUploadComplete={handleTrailerUpload}
                                existingVideoUrl={formData.trailerCdnUrl || formData.trailerUrl}
                                folder="events/trailers"
                                maxSize={200}
                                acceptedFormats={['mp4', 'webm']}
                            />
                        </div>

                        {/* Promo Video */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <Video className="inline mr-2" size={18} />
                                Promo Video
                            </label>
                            <VideoUploader
                                onUploadComplete={handlePromoVideoUpload}
                                existingVideoUrl={formData.promoVideoCdnUrl || formData.promoVideoUrl}
                                folder="events/promos"
                                maxSize={100}
                                acceptedFormats={['mp4', 'webm']}
                            />
                        </div>

                        {/* Livestream Video (Conditional) */}
                        {formData.hasLiveStreaming && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    <Video className="inline mr-2" size={18} />
                                    Livestream Video
                                </label>
                                <VideoUploader
                                    onUploadComplete={handleLiveStreamUpload}
                                    existingVideoUrl={formData.liveStreamCdnUrl || formData.liveStreamUrl}
                                    folder="events/livestreams"
                                    maxSize={2000}                         
                                    acceptedFormats={['mp4']}
                                />
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* DATE & TIME SECTION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Clock size={24} className="text-orange-500" />
                        Date & Time
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {/* Start Time */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Start Time *
                            </label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>

                        {/* End Time */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                End Time
                            </label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Duration (e.g., "2 hours 30 minutes")
                            </label>
                            <input
                                type="text"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="2 hours 30 minutes"
                            />
                        </div>

                        {/* Timezone */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Timezone
                            </label>
                            <select
                                value={formData.timezone}
                                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                <option value="America/New_York">America/New_York (EST)</option>
                                <option value="Europe/London">Europe/London (GMT)</option>
                                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                            </select>
                        </div>
                    </div>
                </motion.div>
                {/* VENUE INFORMATION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <MapPin size={24} className="text-orange-500" />
                        Venue Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Venue Name (English) */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Venue Name (English) *
                            </label>
                            <input
                                type="text"
                                value={formData.venue}
                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter venue name"
                                required
                            />
                        </div>

                        {/* Venue Name (Hindi) */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Venue Name (Hindi) *
                            </label>
                            <input
                                type="text"
                                value={formData.venueHindi}
                                onChange={(e) => setFormData({ ...formData, venueHindi: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="स्थल का नाम दर्ज करें"
                                required
                            />
                        </div>

                        {/* Venue Address (English) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Venue Address (English) *
                            </label>
                            <textarea
                                value={formData.venueAddress}
                                onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter complete venue address"
                                required
                            />
                        </div>

                        {/* Venue Address (Hindi) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Venue Address (Hindi) *
                            </label>
                            <textarea
                                value={formData.venueAddressHindi}
                                onChange={(e) => setFormData({ ...formData, venueAddressHindi: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="पूरा स्थल पता दर्ज करें"
                                required
                            />
                        </div>

                        {/* City (English) */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                City (English) *
                            </label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter city"
                                required
                            />
                        </div>

                        {/* City (Hindi) */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                City (Hindi) *
                            </label>
                            <input
                                type="text"
                                value={formData.cityHindi}
                                onChange={(e) => setFormData({ ...formData, cityHindi: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="शहर दर्ज करें"
                                required
                            />
                        </div>

                        {/* State (English) */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                State (English) *
                            </label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter state"
                                required
                            />
                        </div>

                        {/* State (Hindi) */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                State (Hindi) *
                            </label>
                            <input
                                type="text"
                                value={formData.stateHindi}
                                onChange={(e) => setFormData({ ...formData, stateHindi: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="राज्य दर्ज करें"
                                required
                            />
                        </div>

                        {/* Pincode */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Pincode *
                            </label>
                            <input
                                type="text"
                                value={formData.pincode}
                                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter pincode"
                                required
                            />
                        </div>

                        {/* Venue Capacity */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Venue Capacity
                            </label>
                            <input
                                type="number"
                                value={formData.venueCapacity}
                                onChange={(e) => setFormData({ ...formData, venueCapacity: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Total capacity"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* ORGANIZER INFORMATION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Users size={24} className="text-orange-500" />
                        Organizer Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Organizer (English) */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Organizer Name (English) *
                            </label>
                            <input
                                type="text"
                                value={formData.organizer}
                                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter organizer name"
                                required
                            />
                        </div>

                        {/* Organizer (Hindi) */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Organizer Name (Hindi) *
                            </label>
                            <input
                                type="text"
                                value={formData.organizerHindi}
                                onChange={(e) => setFormData({ ...formData, organizerHindi: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="आयोजक का नाम दर्ज करें"
                                required
                            />
                        </div>

                        {/* Contact */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Contact Number *
                            </label>
                            <input
                                type="tel"
                                value={formData.organizerContact}
                                onChange={(e) => setFormData({ ...formData, organizerContact: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="+91 98765 43210"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                value={formData.organizerEmail}
                                onChange={(e) => setFormData({ ...formData, organizerEmail: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="organizer@example.com"
                                required
                            />
                        </div>

                        {/* Website */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Website (Optional)
                            </label>
                            <input
                                type="url"
                                value={formData.organizerWebsite}
                                onChange={(e) => setFormData({ ...formData, organizerWebsite: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="https://www.example.com"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* TICKET TIERS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <Ticket size={24} className="text-orange-500" />
                            Ticket Tiers *
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={addTicketTier}
                            className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600"
                        >
                            <Plus size={20} />
                            Add Tier
                        </motion.button>
                    </div>

                    <div className="space-y-4">
                        {formData.ticketTiers && formData.ticketTiers.length > 0 ? (
                            formData.ticketTiers.map((tier, index) => (
                                <div
                                    key={tier.id}
                                    className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                            Tier #{index + 1}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => removeTicketTier(index)}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Tier Name (English) */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Name (English) *
                                            </label>
                                            <input
                                                type="text"
                                                value={tier.name}
                                                onChange={(e) => updateTicketTier(index, { name: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="VIP, Gold, Silver"
                                                required
                                            />
                                        </div>

                                        {/* Tier Name (Hindi) */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Name (Hindi) *
                                            </label>
                                            <input
                                                type="text"
                                                value={tier.nameHindi}
                                                onChange={(e) => updateTicketTier(index, { nameHindi: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="वीआईपी, गोल्ड, सिल्वर"
                                                required
                                            />
                                        </div>

                                        {/* Price */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Price (INR) *
                                            </label>
                                            <input
                                                type="number"
                                                value={tier.price}
                                                onChange={(e) => updateTicketTier(index, { price: parseFloat(e.target.value) || 0 })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="500"
                                                required
                                            />
                                        </div>

                                        {/* Total Seats */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Total Seats *
                                            </label>
                                            <input
                                                type="number"
                                                value={tier.total}
                                                onChange={(e) => updateTicketTier(index, {
                                                    total: parseInt(e.target.value) || 0,
                                                    available: parseInt(e.target.value) || 0
                                                })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="100"
                                                required
                                            />
                                        </div>

                                        {/* Available Seats */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Available Seats
                                            </label>
                                            <input
                                                type="number"
                                                value={tier.available}
                                                onChange={(e) => updateTicketTier(index, { available: parseInt(e.target.value) || 0 })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="100"
                                            />
                                        </div>

                                        {/* Max Per Booking */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Max Per Booking
                                            </label>
                                            <input
                                                type="number"
                                                value={tier.maxPerBooking}
                                                onChange={(e) => updateTicketTier(index, { maxPerBooking: parseInt(e.target.value) || 10 })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="10"
                                            />
                                        </div>

                                        {/* Checkboxes */}
                                        <div className="md:col-span-3 flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={tier.isRecommended}
                                                    onChange={(e) => updateTicketTier(index, { isRecommended: e.target.checked })}
                                                    className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                                />
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    Recommended
                                                </span>
                                            </label>

                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={tier.isSoldOut}
                                                    onChange={(e) => updateTicketTier(index, { isSoldOut: e.target.checked })}
                                                    className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                                />
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    Sold Out
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <Ticket size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="font-semibold">No ticket tiers added yet</p>
                                <p className="text-sm">Click "Add Tier" to create ticket options</p>
                            </div>
                        )}
                    </div>
                </motion.div>
                {/* BOOKING SETTINGS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Ticket size={24} className="text-orange-500" />
                        Booking Settings
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Booking Start Date */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Booking Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.bookingStartDate}
                                onChange={(e) => setFormData({ ...formData, bookingStartDate: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {/* Booking End Date */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Booking End Date
                            </label>
                            <input
                                type="date"
                                value={formData.bookingEndDate}
                                onChange={(e) => setFormData({ ...formData, bookingEndDate: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {/* Min Tickets Per Booking */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Min Tickets Per Booking
                            </label>
                            <input
                                type="number"
                                value={formData.minTicketsPerBooking}
                                onChange={(e) => setFormData({ ...formData, minTicketsPerBooking: parseInt(e.target.value) || 1 })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="1"
                            />
                        </div>

                        {/* Max Tickets Per Booking */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Max Tickets Per Booking
                            </label>
                            <input
                                type="number"
                                value={formData.maxTicketsPerBooking}
                                onChange={(e) => setFormData({ ...formData, maxTicketsPerBooking: parseInt(e.target.value) || 10 })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="10"
                            />
                        </div>

                        {/* Is Booking Open */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isBookingOpen}
                                    onChange={(e) => setFormData({ ...formData, isBookingOpen: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Booking Open (Users can book tickets)
                                </span>
                            </label>
                        </div>
                    </div>
                </motion.div>

                {/* HOSTS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <Users size={24} className="text-orange-500" />
                            Hosts
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={addHost}
                            className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600"
                        >
                            <Plus size={20} />
                            Add Host
                        </motion.button>
                    </div>

                    <div className="space-y-4">
                        {formData.hosts && formData.hosts.length > 0 ? (
                            formData.hosts.map((host, index) => (
                                <div
                                    key={host.id}
                                    className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                            Host #{index + 1}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => removeHost(index)}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Name (English)
                                            </label>
                                            <input
                                                type="text"
                                                value={host.name}
                                                onChange={(e) => updateHost(index, { name: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="Host name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Name (Hindi)
                                            </label>
                                            <input
                                                type="text"
                                                value={host.nameHindi}
                                                onChange={(e) => updateHost(index, { nameHindi: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="मेजबान का नाम"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Role
                                            </label>
                                            <input
                                                type="text"
                                                value={host.role}
                                                onChange={(e) => updateHost(index, { role: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="Master of Ceremonies"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Profile Image URL
                                            </label>
                                            <input
                                                type="text"
                                                value={host.profileImage}
                                                onChange={(e) => updateHost(index, { profileImage: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="https://..."
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Bio (English)
                                            </label>
                                            <textarea
                                                value={host.bio}
                                                onChange={(e) => updateHost(index, { bio: e.target.value })}
                                                rows={2}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="Brief bio"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Bio (Hindi)
                                            </label>
                                            <textarea
                                                value={host.bioHindi}
                                                onChange={(e) => updateHost(index, { bioHindi: e.target.value })}
                                                rows={2}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="संक्षिप्त परिचय"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <Users size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="font-semibold">No hosts added yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* PERFORMERS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <Star size={24} className="text-orange-500" />
                            Performers
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={addPerformer}
                            className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600"
                        >
                            <Plus size={20} />
                            Add Performer
                        </motion.button>
                    </div>

                    <div className="space-y-4">
                        {formData.performers && formData.performers.length > 0 ? (
                            formData.performers.map((performer, index) => (
                                <div
                                    key={performer.id}
                                    className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                            Performer #{index + 1}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => removePerformer(index)}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Name (English)
                                            </label>
                                            <input
                                                type="text"
                                                value={performer.name}
                                                onChange={(e) => updatePerformer(index, { name: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="Performer name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Name (Hindi)
                                            </label>
                                            <input
                                                type="text"
                                                value={performer.nameHindi}
                                                onChange={(e) => updatePerformer(index, { nameHindi: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="कलाकार का नाम"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Type
                                            </label>
                                            <select
                                                value={performer.type}
                                                onChange={(e) => updatePerformer(index, { type: e.target.value as any })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                            >
                                                <option value="singer">Singer</option>
                                                <option value="dancer">Dancer</option>
                                                <option value="musician">Musician</option>
                                                <option value="actor">Actor</option>
                                                <option value="comedian">Comedian</option>
                                                <option value="band">Band</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Performance Time
                                            </label>
                                            <input
                                                type="text"
                                                value={performer.performanceTime}
                                                onChange={(e) => updatePerformer(index, { performanceTime: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="7:00 PM - 7:30 PM"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Profile Image URL
                                            </label>
                                            <input
                                                type="text"
                                                value={performer.profileImage}
                                                onChange={(e) => updatePerformer(index, { profileImage: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="https://..."
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Bio (English)
                                            </label>
                                            <textarea
                                                value={performer.bio}
                                                onChange={(e) => updatePerformer(index, { bio: e.target.value })}
                                                rows={2}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="Brief bio"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Bio (Hindi)
                                            </label>
                                            <textarea
                                                value={performer.bioHindi}
                                                onChange={(e) => updatePerformer(index, { bioHindi: e.target.value })}
                                                rows={2}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="संक्षिप्त परिचय"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <Star size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="font-semibold">No performers added yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* SPEAKERS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <Users size={24} className="text-orange-500" />
                            Speakers
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={addSpeaker}
                            className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600"
                        >
                            <Plus size={20} />
                            Add Speaker
                        </motion.button>
                    </div>

                    <div className="space-y-4">
                        {formData.speakers && formData.speakers.length > 0 ? (
                            formData.speakers.map((speaker, index) => (
                                <div
                                    key={speaker.id}
                                    className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                            Speaker #{index + 1}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => removeSpeaker(index)}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Name (English)
                                            </label>
                                            <input
                                                type="text"
                                                value={speaker.name}
                                                onChange={(e) => updateSpeaker(index, { name: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="Speaker name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Name (Hindi)
                                            </label>
                                            <input
                                                type="text"
                                                value={speaker.nameHindi}
                                                onChange={(e) => updateSpeaker(index, { nameHindi: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="वक्ता का नाम"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Title (English)
                                            </label>
                                            <input
                                                type="text"
                                                value={speaker.title}
                                                onChange={(e) => updateSpeaker(index, { title: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="Director, CEO, etc."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Title (Hindi)
                                            </label>
                                            <input
                                                type="text"
                                                value={speaker.titleHindi}
                                                onChange={(e) => updateSpeaker(index, { titleHindi: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="निदेशक, सीईओ, आदि"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Organization (English)
                                            </label>
                                            <input
                                                type="text"
                                                value={speaker.organization}
                                                onChange={(e) => updateSpeaker(index, { organization: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="Company name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Organization (Hindi)
                                            </label>
                                            <input
                                                type="text"
                                                value={speaker.organizationHindi}
                                                onChange={(e) => updateSpeaker(index, { organizationHindi: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="कंपनी का नाम"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Topic (English)
                                            </label>
                                            <input
                                                type="text"
                                                value={speaker.topic}
                                                onChange={(e) => updateSpeaker(index, { topic: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="Session topic"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Topic (Hindi)
                                            </label>
                                            <input
                                                type="text"
                                                value={speaker.topicHindi}
                                                onChange={(e) => updateSpeaker(index, { topicHindi: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="सत्र का विषय"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Session Time
                                            </label>
                                            <input
                                                type="text"
                                                value={speaker.sessionTime}
                                                onChange={(e) => updateSpeaker(index, { sessionTime: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="2:00 PM - 3:00 PM"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Profile Image URL
                                            </label>
                                            <input
                                                type="text"
                                                value={speaker.profileImage}
                                                onChange={(e) => updateSpeaker(index, { profileImage: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="https://..."
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Bio (English)
                                            </label>
                                            <textarea
                                                value={speaker.bio}
                                                onChange={(e) => updateSpeaker(index, { bio: e.target.value })}
                                                rows={2}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="Brief bio"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Bio (Hindi)
                                            </label>
                                            <textarea
                                                value={speaker.bioHindi}
                                                onChange={(e) => updateSpeaker(index, { bioHindi: e.target.value })}
                                                rows={2}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="संक्षिप्त परिचय"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <Users size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="font-semibold">No speakers added yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>
                {/* FAQ SECTION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <Info size={24} className="text-orange-500" />
                            FAQ (Frequently Asked Questions)
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={addFAQ}
                            className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600"
                        >
                            <Plus size={20} />
                            Add FAQ
                        </motion.button>
                    </div>

                    <div className="space-y-4">
                        {formData.faq && formData.faq.length > 0 ? (
                            formData.faq.map((faqItem, index) => (
                                <div
                                    key={index}
                                    className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                            FAQ #{index + 1}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => removeFAQ(index)}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Question (English)
                                            </label>
                                            <input
                                                type="text"
                                                value={faqItem.question}
                                                onChange={(e) => updateFAQ(index, { question: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="What is the refund policy?"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Question (Hindi)
                                            </label>
                                            <input
                                                type="text"
                                                value={faqItem.questionHindi}
                                                onChange={(e) => updateFAQ(index, { questionHindi: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="रिफंड नीति क्या है?"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Answer (English)
                                            </label>
                                            <textarea
                                                value={faqItem.answer}
                                                onChange={(e) => updateFAQ(index, { answer: e.target.value })}
                                                rows={3}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="Full refund available up to 48 hours before the event..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Answer (Hindi)
                                            </label>
                                            <textarea
                                                value={faqItem.answerHindi}
                                                onChange={(e) => updateFAQ(index, { answerHindi: e.target.value })}
                                                rows={3}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="कार्यक्रम से 48 घंटे पहले तक पूर्ण रिफंड उपलब्ध है..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Category (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={faqItem.category}
                                                onChange={(e) => updateFAQ(index, { category: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="Ticketing, Venue, Payment, etc."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <Info size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="font-semibold">No FAQs added yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* SPONSORS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <Star size={24} className="text-orange-500" />
                            Sponsors
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={addSponsor}
                            className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600"
                        >
                            <Plus size={20} />
                            Add Sponsor
                        </motion.button>
                    </div>

                    <div className="space-y-4">
                        {formData.sponsors && formData.sponsors.length > 0 ? (
                            formData.sponsors.map((sponsor, index) => (
                                <div
                                    key={sponsor.id}
                                    className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                            Sponsor #{index + 1}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => removeSponsor(index)}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Name (English)
                                            </label>
                                            <input
                                                type="text"
                                                value={sponsor.name}
                                                onChange={(e) => updateSponsor(index, { name: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="Sponsor name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Name (Hindi)
                                            </label>
                                            <input
                                                type="text"
                                                value={sponsor.nameHindi}
                                                onChange={(e) => updateSponsor(index, { nameHindi: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="प्रायोजक का नाम"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Logo URL
                                            </label>
                                            <input
                                                type="text"
                                                value={sponsor.logo}
                                                onChange={(e) => updateSponsor(index, { logo: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="https://..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Website
                                            </label>
                                            <input
                                                type="text"
                                                value={sponsor.website}
                                                onChange={(e) => updateSponsor(index, { website: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="https://www.sponsor.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Tier
                                            </label>
                                            <select
                                                value={sponsor.tier}
                                                onChange={(e) => updateSponsor(index, { tier: e.target.value as any })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                            >
                                                <option value="platinum">Platinum</option>
                                                <option value="gold">Gold</option>
                                                <option value="silver">Silver</option>
                                                <option value="bronze">Bronze</option>
                                            </select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Description (English)
                                            </label>
                                            <textarea
                                                value={sponsor.description}
                                                onChange={(e) => updateSponsor(index, { description: e.target.value })}
                                                rows={2}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="Brief description"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Description (Hindi)
                                            </label>
                                            <textarea
                                                value={sponsor.descriptionHindi}
                                                onChange={(e) => updateSponsor(index, { descriptionHindi: e.target.value })}
                                                rows={2}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="संक्षिप्त विवरण"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <Star size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="font-semibold">No sponsors added yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* MEDIA PARTNERS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <Video size={24} className="text-orange-500" />
                            Media Partners
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={addMediaPartner}
                            className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600"
                        >
                            <Plus size={20} />
                            Add Partner
                        </motion.button>
                    </div>

                    <div className="space-y-4">
                        {formData.mediaPartners && formData.mediaPartners.length > 0 ? (
                            formData.mediaPartners.map((partner, index) => (
                                <div
                                    key={partner.id}
                                    className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                            Partner #{index + 1}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => removeMediaPartner(index)}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                value={partner.name}
                                                onChange={(e) => updateMediaPartner(index, { name: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="Media partner name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Type
                                            </label>
                                            <select
                                                value={partner.type}
                                                onChange={(e) => updateMediaPartner(index, { type: e.target.value as any })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                            >
                                                <option value="digital">Digital</option>
                                                <option value="print">Print</option>
                                                <option value="broadcast">Broadcast</option>
                                                <option value="radio">Radio</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Logo URL
                                            </label>
                                            <input
                                                type="text"
                                                value={partner.logo}
                                                onChange={(e) => updateMediaPartner(index, { logo: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="https://..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Website
                                            </label>
                                            <input
                                                type="text"
                                                value={partner.website}
                                                onChange={(e) => updateMediaPartner(index, { website: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                placeholder="https://www.partner.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <Video size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="font-semibold">No media partners added yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* SUBMIT BUTTON (BOTTOM) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className="flex justify-end gap-4"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => navigate("/admin/events/all")}
                        className="px-8 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                    >
                        Cancel
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader className="animate-spin" size={20} />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                {isEditMode ? "Update Event" : "Create Event"}
                            </>
                        )}
                    </motion.button>
                </motion.div>
            </form>
        </div>
    );
};

export default AddEditEvent;