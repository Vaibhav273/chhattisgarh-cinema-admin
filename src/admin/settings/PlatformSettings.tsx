// ═══════════════════════════════════════════════════════════════════════════════
// ⚙️ PLATFORM SETTINGS - PRODUCTION READY
// Path: src/pages/admin/settings/PlatformSettings.tsx
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    Save,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Globe,
    Mail,
    Phone,
    Languages,
    Shield,
    Search,
    RefreshCw,
} from 'lucide-react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../types/roles';

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface GeneralSettings {
    platformName: string;
    supportEmail: string;
    contactPhone: string;
    defaultLanguage: string;
    enableRegistration: boolean;
    maintenanceMode: boolean;
    maintenanceMessage?: string;
}

interface SEOSettings {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogImage?: string;
    twitterCard?: string;
}

interface SecuritySettings {
    enableTwoFactor: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireStrongPassword: boolean;
}

interface Toast {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isVisible: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 TOAST COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const Toast: React.FC<Toast & { onClose: () => void }> = ({
    message,
    type,
    isVisible,
    onClose,
}) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
    };

    const icons = {
        success: CheckCircle,
        error: XCircle,
        info: AlertTriangle,
        warning: AlertTriangle,
    };

    const Icon = icons[type];

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
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
// ⚙️ MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const PlatformSettings: React.FC = () => {
    const { can } = usePermissions();

    // State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'security'>('general');

    // Settings
    const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
        platformName: 'Chhattisgarh Cinema',
        supportEmail: 'support@chhattisgarhcinema.com',
        contactPhone: '+91 1234567890',
        defaultLanguage: 'hi',
        enableRegistration: true,
        maintenanceMode: false,
        maintenanceMessage: 'We are currently performing maintenance. Please check back soon.',
    });

    const [seoSettings, setSeoSettings] = useState<SEOSettings>({
        metaTitle: 'Chhattisgarh Cinema - Stream Regional Content',
        metaDescription: 'Watch latest Chhattisgarhi movies, web series, and short films online.',
        metaKeywords: 'chhattisgarh, cinema, movies, web series',
        ogImage: '',
        twitterCard: 'summary_large_image',
    });

    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
        enableTwoFactor: false,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        requireStrongPassword: true,
    });

    // Toast
    const [toast, setToast] = useState<Toast>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);

            // Fetch general settings
            const generalDoc = await getDoc(doc(db, 'settings', 'general'));
            if (generalDoc.exists()) {
                setGeneralSettings({ ...generalSettings, ...generalDoc.data() });
            }

            // Fetch SEO settings
            const seoDoc = await getDoc(doc(db, 'settings', 'seo'));
            if (seoDoc.exists()) {
                setSeoSettings({ ...seoSettings, ...seoDoc.data() });
            }

            // Fetch security settings
            const securityDoc = await getDoc(doc(db, 'settings', 'security'));
            if (securityDoc.exists()) {
                setSecuritySettings({ ...securitySettings, ...securityDoc.data() });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            showToast('Failed to load settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: Toast['type']) => {
        setToast({ message, type, isVisible: true });
    };

    const handleSaveGeneral = async () => {
        if (!can(Permission.MANAGE_APP_SETTINGS)) {
            showToast('You do not have permission to update settings', 'error');
            return;
        }

        try {
            setSaving(true);
            await setDoc(doc(db, 'settings', 'general'), {
                ...generalSettings,
                updatedAt: Timestamp.now(),
            });
            showToast('General settings saved successfully', 'success');
        } catch (error) {
            console.error('Error saving general settings:', error);
            showToast('Failed to save general settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSEO = async () => {
        if (!can(Permission.MANAGE_APP_SETTINGS)) {
            showToast('You do not have permission to update settings', 'error');
            return;
        }

        try {
            setSaving(true);
            await setDoc(doc(db, 'settings', 'seo'), {
                ...seoSettings,
                updatedAt: Timestamp.now(),
            });
            showToast('SEO settings saved successfully', 'success');
        } catch (error) {
            console.error('Error saving SEO settings:', error);
            showToast('Failed to save SEO settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSecurity = async () => {
        if (!can(Permission.MANAGE_APP_SETTINGS)) {
            showToast('You do not have permission to update settings', 'error');
            return;
        }

        try {
            setSaving(true);
            await setDoc(doc(db, 'settings', 'security'), {
                ...securitySettings,
                updatedAt: Timestamp.now(),
            });
            showToast('Security settings saved successfully', 'success');
        } catch (error) {
            console.error('Error saving security settings:', error);
            showToast('Failed to save security settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-gray-700 border-t-transparent rounded-full mb-4"
                />
                <p className="text-slate-600 dark:text-slate-400 font-semibold">
                    Loading settings...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full">
            {/* Toast */}
            <Toast {...toast} onClose={() => setToast({ ...toast, isVisible: false })} />

            <div className="space-y-6 w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden w-full"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                    />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                                    <Settings size={36} />
                                    Platform Settings
                                </h1>
                                <p className="text-white/90 text-lg">Configure global platform settings</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={fetchSettings}
                                className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Refresh
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-2"
                >
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'general'
                                ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Globe size={20} />
                                General
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('seo')}
                            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'seo'
                                ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Search size={20} />
                                SEO
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'security'
                                ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Shield size={20} />
                                Security
                            </div>
                        </button>
                    </div>
                </motion.div>

                {/* General Settings */}
                {activeTab === 'general' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/30 rounded-xl flex items-center justify-center">
                                    <Globe size={20} className="text-gray-600 dark:text-gray-400" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                                    General Settings
                                </h2>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Platform Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Platform Name
                                </label>
                                <input
                                    type="text"
                                    value={generalSettings.platformName}
                                    onChange={(e) =>
                                        setGeneralSettings({ ...generalSettings, platformName: e.target.value })
                                    }
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white"
                                />
                            </div>

                            {/* Support Email */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} />
                                        Support Email
                                    </div>
                                </label>
                                <input
                                    type="email"
                                    value={generalSettings.supportEmail}
                                    onChange={(e) =>
                                        setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })
                                    }
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white"
                                />
                            </div>

                            {/* Contact Phone */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} />
                                        Contact Phone
                                    </div>
                                </label>
                                <input
                                    type="tel"
                                    value={generalSettings.contactPhone}
                                    onChange={(e) =>
                                        setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })
                                    }
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white"
                                />
                            </div>

                            {/* Default Language */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Languages size={16} />
                                        Default Language
                                    </div>
                                </label>
                                <select
                                    value={generalSettings.defaultLanguage}
                                    onChange={(e) =>
                                        setGeneralSettings({ ...generalSettings, defaultLanguage: e.target.value })
                                    }
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white"
                                >
                                    <option value="en">English</option>
                                    <option value="hi">Hindi</option>
                                    <option value="cg">Chhattisgarhi</option>
                                </select>
                            </div>

                            {/* Toggles */}
                            <div className="space-y-4">
                                {/* Enable Registration */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">
                                            Enable Registration
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Allow new users to register on the platform
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setGeneralSettings({
                                                ...generalSettings,
                                                enableRegistration: !generalSettings.enableRegistration,
                                            })
                                        }
                                        className={`relative w-14 h-8 rounded-full transition-all ${generalSettings.enableRegistration
                                            ? 'bg-green-500'
                                            : 'bg-slate-300 dark:bg-slate-600'
                                            }`}
                                    >
                                        <div
                                            className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${generalSettings.enableRegistration ? 'right-1' : 'left-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Maintenance Mode */}
                                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                                    <div>
                                        <p className="font-bold text-orange-700 dark:text-orange-400">
                                            Maintenance Mode
                                        </p>
                                        <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                                            Put the platform in maintenance mode
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setGeneralSettings({
                                                ...generalSettings,
                                                maintenanceMode: !generalSettings.maintenanceMode,
                                            })
                                        }
                                        className={`relative w-14 h-8 rounded-full transition-all ${generalSettings.maintenanceMode
                                            ? 'bg-orange-500'
                                            : 'bg-slate-300 dark:bg-slate-600'
                                            }`}
                                    >
                                        <div
                                            className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${generalSettings.maintenanceMode ? 'right-1' : 'left-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Maintenance Message */}
                            {generalSettings.maintenanceMode && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Maintenance Message
                                    </label>
                                    <textarea
                                        value={generalSettings.maintenanceMessage}
                                        onChange={(e) =>
                                            setGeneralSettings({
                                                ...generalSettings,
                                                maintenanceMessage: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-slate-800 dark:text-white resize-none"
                                    />
                                </div>
                            )}

                            {/* Save Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSaveGeneral}
                                disabled={saving}
                                className="w-full px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Save General Settings
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* SEO Settings */}
                {activeTab === 'seo' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                    <Search size={20} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                                        SEO Settings
                                    </h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Optimize your platform for search engines
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Meta Title */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Meta Title
                                </label>
                                <input
                                    type="text"
                                    value={seoSettings.metaTitle}
                                    onChange={(e) => setSeoSettings({ ...seoSettings, metaTitle: e.target.value })}
                                    maxLength={60}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                                />
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {seoSettings.metaTitle.length}/60 characters
                                </p>
                            </div>

                            {/* Meta Description */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Meta Description
                                </label>
                                <textarea
                                    value={seoSettings.metaDescription}
                                    onChange={(e) =>
                                        setSeoSettings({ ...seoSettings, metaDescription: e.target.value })
                                    }
                                    maxLength={160}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white resize-none"
                                />
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {seoSettings.metaDescription.length}/160 characters
                                </p>
                            </div>

                            {/* Meta Keywords */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Meta Keywords
                                </label>
                                <input
                                    type="text"
                                    value={seoSettings.metaKeywords}
                                    onChange={(e) =>
                                        setSeoSettings({ ...seoSettings, metaKeywords: e.target.value })
                                    }
                                    placeholder="keyword1, keyword2, keyword3"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                                />
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Separate keywords with commas
                                </p>
                            </div>

                            {/* OG Image */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Open Graph Image URL
                                </label>
                                <input
                                    type="url"
                                    value={seoSettings.ogImage}
                                    onChange={(e) => setSeoSettings({ ...seoSettings, ogImage: e.target.value })}
                                    placeholder="https://example.com/og-image.jpg"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                                />
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Recommended size: 1200x630px
                                </p>
                            </div>

                            {/* Twitter Card */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Twitter Card Type
                                </label>
                                <select
                                    value={seoSettings.twitterCard}
                                    onChange={(e) =>
                                        setSeoSettings({ ...seoSettings, twitterCard: e.target.value })
                                    }
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                                >
                                    <option value="summary">Summary</option>
                                    <option value="summary_large_image">Summary Large Image</option>
                                    <option value="app">App</option>
                                    <option value="player">Player</option>
                                </select>
                            </div>

                            {/* Save Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSaveSEO}
                                disabled={saving}
                                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Save SEO Settings
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                                    <Shield size={20} className="text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                                        Security Settings
                                    </h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Configure security and authentication settings
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Enable Two-Factor */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div>
                                    <p className="font-bold text-slate-700 dark:text-slate-300">
                                        Enable Two-Factor Authentication
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Require 2FA for admin users
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSecuritySettings({
                                            ...securitySettings,
                                            enableTwoFactor: !securitySettings.enableTwoFactor,
                                        })
                                    }
                                    className={`relative w-14 h-8 rounded-full transition-all ${securitySettings.enableTwoFactor
                                        ? 'bg-green-500'
                                        : 'bg-slate-300 dark:bg-slate-600'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${securitySettings.enableTwoFactor ? 'right-1' : 'left-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Session Timeout */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Session Timeout (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={securitySettings.sessionTimeout}
                                    onChange={(e) =>
                                        setSecuritySettings({
                                            ...securitySettings,
                                            sessionTimeout: parseInt(e.target.value) || 30,
                                        })
                                    }
                                    min="5"
                                    max="1440"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white"
                                />
                            </div>

                            {/* Max Login Attempts */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Max Login Attempts
                                </label>
                                <input
                                    type="number"
                                    value={securitySettings.maxLoginAttempts}
                                    onChange={(e) =>
                                        setSecuritySettings({
                                            ...securitySettings,
                                            maxLoginAttempts: parseInt(e.target.value) || 5,
                                        })
                                    }
                                    min="3"
                                    max="10"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white"
                                />
                            </div>

                            {/* Password Min Length */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Password Minimum Length
                                </label>
                                <input
                                    type="number"
                                    value={securitySettings.passwordMinLength}
                                    onChange={(e) =>
                                        setSecuritySettings({
                                            ...securitySettings,
                                            passwordMinLength: parseInt(e.target.value) || 8,
                                        })
                                    }
                                    min="6"
                                    max="32"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white"
                                />
                            </div>

                            {/* Require Strong Password */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div>
                                    <p className="font-bold text-slate-700 dark:text-slate-300">
                                        Require Strong Password
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Must include uppercase, lowercase, number, and special character
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSecuritySettings({
                                            ...securitySettings,
                                            requireStrongPassword: !securitySettings.requireStrongPassword,
                                        })
                                    }
                                    className={`relative w-14 h-8 rounded-full transition-all ${securitySettings.requireStrongPassword
                                        ? 'bg-green-500'
                                        : 'bg-slate-300 dark:bg-slate-600'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${securitySettings.requireStrongPassword ? 'right-1' : 'left-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Save Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSaveSecurity}
                                disabled={saving}
                                className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Save Security Settings
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default PlatformSettings;
