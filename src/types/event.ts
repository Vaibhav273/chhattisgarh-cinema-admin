// ═══════════════════════════════════════════════════════════════
// 🎭 EVENT & BOOKING TYPES
// ═══════════════════════════════════════════════════════════════

import type { BookingStatus, PaymentMethod, PaymentStatus, RefundStatus, SocialMedia } from './common';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎭 EVENT INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Event {
    id: string;
    title: string;
    titleHindi: string;
    description: string;
    descriptionHindi: string;
    image: string;
    imageCdnUrl: string;
    bannerImage?: string;
    bannerImageCdnUrl?: string;
    galleryImages?: string[];
    galleryCdnUrls?: string[];
    date: string;
    endDate?: string;
    time: string;
    endTime?: string;
    duration: string;
    timezone?: string;
    venue: string;
    venueHindi: string;
    venueAddress?: string;
    venueAddressHindi?: string;
    city: string;
    cityHindi?: string;
    state: string;
    stateHindi?: string;
    pincode?: string;
    venueMap?: VenueMap;
    venueCapacity?: number;
    category: EventCategory;
    type: EventType;
    organizer: string;
    organizerHindi?: string;
    organizerContact?: string;
    organizerEmail?: string;
    organizerWebsite?: string;
    hosts?: Host[];
    performers?: Performer[];
    speakers?: Speaker[];
    rating?: number;
    ratingCount?: number;
    totalSeats: number;
    bookedSeats: number;
    availableSeats: number;
    views?: number;
    sharesCount?: number;
    interestedCount?: number;
    ticketTiers: TicketTier[];

    // Backward compatibility
    price?: {
        min: number;
        max: number;
    };

    bookingStartDate?: string;
    bookingEndDate?: string;
    isBookingOpen: boolean;
    minTicketsPerBooking?: number;
    maxTicketsPerBooking?: number;
    language: string;
    languageHindi?: string;
    ageRating: string;
    dresscode?: string;
    dresscodeHindi?: string;
    rules?: string[];
    rulesHindi?: string[];
    amenities?: string[];
    amenitiesHindi?: string[];
    parking?: ParkingInfo;
    trailerUrl?: string;
    trailerCdnUrl: string;
    promoVideoUrl?: string;
    promoVideoCdnUrl: string;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'postponed';
    isFeatured?: boolean;
    isTrending?: boolean;
    isNew?: boolean;
    relatedEvents?: string[];
    relatedMovies?: string[];
    relatedSeries?: string[];
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    highlights?: string[];
    highlightsHindi?: string[];
    faq?: FAQ[];
    sponsors?: Sponsor[];
    mediaPartners?: MediaPartner[];
    totalBookings?: number;
    revenue?: number;
    hasLiveStreaming?: boolean;
    liveStreamUrl?: string;
    liveStreamCdnUrl?: string;
    hasVIPMeetGreet?: boolean;
    hasPhotoBooth?: boolean;
    hasFoodStalls?: boolean;
    hasGiftBags?: boolean;
    trailerMetadata?: VideoMetadata;
    promoVideoMetadata: VideoMetadata,
    liveStreamMetadata: VideoMetadata,
}


export interface VideoMetadata {
    originalUrl: string;
    fileName: string;
    fileSize: number;
    uploadedAt: Date;
    encodingSettings: {
        codec: string;
        container: string;
        resolutions: string[];
        maxBitrate: number;
        audioBitrate: number;
        audioCodec: string;
        adaptiveBitrate: boolean;
        generateThumbnails: boolean;
        thumbnailCount: number;
    };
    encodingStatus: 'pending' | 'skipped' | 'completed' | 'failed';
    qualitiesGenerated?: string[];
}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎟️ TICKET TIER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface TicketTier {
    id: string;
    name: string;
    nameHindi?: string;
    price: number;
    currency?: string;
    originalPrice?: number;
    discount?: number;
    available: number;
    total: number;
    benefits: string[];
    benefitsHindi?: string[];
    color?: string;
    icon?: string;
    description?: string;
    descriptionHindi?: string;
    isRecommended?: boolean;
    isSoldOut?: boolean;
    maxPerBooking?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📍 VENUE MAP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface VenueMap {
    latitude: number;
    longitude: number;
    mapUrl?: string;
    googleMapsUrl?: string;
    embeddedMapUrl?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🅿️ PARKING INFO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ParkingInfo {
    available: boolean;
    type?: 'free' | 'paid' | 'valet';
    capacity?: number;
    charges?: string;
    chargesHindi?: string;
    instructions?: string;
    instructionsHindi?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎤 HOST
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Host {
    id?: string;
    name: string;
    nameHindi?: string;
    role?: string;
    profileImage?: string;
    bio?: string;
    bioHindi?: string;
    socialMedia?: SocialMedia;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎭 PERFORMER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Performer {
    id?: string;
    name: string;
    nameHindi?: string;
    type: 'singer' | 'dancer' | 'actor' | 'musician' | 'comedian' | 'other';
    profileImage?: string;
    bio?: string;
    bioHindi?: string;
    performanceTime?: string;
    socialMedia?: SocialMedia;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎤 SPEAKER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Speaker {
    id?: string;
    name: string;
    nameHindi?: string;
    title?: string;
    titleHindi?: string;
    organization?: string;
    organizationHindi?: string;
    profileImage?: string;
    bio?: string;
    bioHindi?: string;
    topic?: string;
    topicHindi?: string;
    sessionTime?: string;
    socialMedia?: SocialMedia;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ❓ FAQ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface FAQ {
    question: string;
    questionHindi?: string;
    answer: string;
    answerHindi?: string;
    category?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🤝 SPONSOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Sponsor {
    id?: string;
    name: string;
    nameHindi?: string;
    logo: string;
    website?: string;
    tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner';
    description?: string;
    descriptionHindi?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📺 MEDIA PARTNER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface MediaPartner {
    id?: string;
    name: string;
    logo: string;
    website?: string;
    type: 'print' | 'digital' | 'tv' | 'radio' | 'social';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎫 BOOKING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Booking {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    eventId: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    venue: string;
    tickets: BookedTicket[];
    totalTickets: number;
    totalAmount: number;
    convenienceFee: number;
    discount?: number;
    finalAmount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentId?: string;
    transactionId?: string;
    bookingDate: string;
    bookingStatus: BookingStatus;
    qrCode?: string;
    bookingReference: string;
    specialRequests?: string;
    cancellationReason?: string;
    refundAmount?: number;
    refundStatus?: RefundStatus;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎟️ BOOKED TICKET
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface BookedTicket {
    tierId: string;
    tierName: string;
    quantity: number;
    pricePerTicket: number;
    totalPrice: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 ENUMS & TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type EventCategory =
    | 'film-festival'
    | 'film-premiere'
    | 'award-show'
    | 'concert'
    | 'cultural'
    | 'dance'
    | 'music'
    | 'theater'
    | 'comedy'
    | 'workshop'
    | 'seminar'
    | 'conference'
    | 'meetup'
    | 'screening'
    | 'other';

export type EventType = 'in-person' | 'virtual' | 'hybrid';
