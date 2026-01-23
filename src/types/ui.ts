// ═══════════════════════════════════════════════════════════════
// 🎨 UI & COMPONENT TYPES
// ═══════════════════════════════════════════════════════════════

import type { SortType } from './common';
import React from 'react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📄 CONTENT PAGE CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ContentPageConfig {
    contentType: 'movies' | 'webseries' | 'shortfilm' | 'mylist';
    firestoreCollection: string;
    title: string;
    titleHindi: string;
    description: string;
    descriptionHindi: string;
    icon?: React.ReactNode;
    routePrefix: string;
    genres: Array<{ value: string; label: string }>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 SEARCH FILTER BAR PROPS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SearchFilterBarProps {
    config: ContentPageConfig;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    sortBy: SortType;
    setSortBy: (s: SortType) => void;
    filter: string;
    setFilter: (f: string) => void;
    showFilters: boolean;
    setShowFilters: (s: boolean) => void;
    filteredCount: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 GENRE BUTTON PROPS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface GenreButtonProps {
    value: string;
    label: string;
    filter: string;
    setFilter: (f: string) => void;
    icon: React.ReactNode;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💳 SUBSCRIPTION MODAL PROPS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SubscriptionModalProps {
    show: boolean;
    onClose: () => void;
    navigate: (path: string) => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 PRICING PLAN (for UI display)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PricingPlan {
    id: string;
    name: string;
    nameHindi: string;
    icon: React.ReactNode;
    priceMonthly: number;
    priceYearly: number;
    popular?: boolean;
    features: string[];
    featuresHindi: string[];
    color: string;
    gradient: string;
    badge?: string;
    maxProfiles: number;
    maxDevices: number;
    maxScreens: number;
    videoQuality: string[];
    maxDownloadDevices: number;
    maxDownloadsPerDevice: number;
    order: number;
}
