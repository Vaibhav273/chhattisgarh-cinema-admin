// ═══════════════════════════════════════════════════════════════════════════════
// 🔌 API SETTINGS - PRODUCTION READY
// Path: src/pages/admin/APISettings.tsx
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Key,
    Plus,
    Copy,
    Trash2,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Settings,
    Webhook,
    Save,
} from 'lucide-react';
import {
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../types/roles';

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface APIKey {
    id: string;
    key: string;
    name: string;
    permissions: string[];
    active: boolean;
    createdAt: Timestamp;
    lastUsed?: Timestamp;
    usageCount: number;
}

interface APIConfig {
    baseUrl: string;
    version: string;
    rateLimit: number;
    cors: boolean;
    docs: boolean;
}

interface WebhookConfig {
    url: string;
    events: {
        userCreated: boolean;
        subscriptionUpdated: boolean;
        paymentSuccess: boolean;
        contentPublished: boolean;
    };
    secret: string;
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
        <AnimatePresence>
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
        </AnimatePresence>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔑 GENERATE API KEY MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface GenerateKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (name: string, permissions: string[]) => void;
}

const GenerateKeyModal: React.FC<GenerateKeyModalProps> = ({
    isOpen,
    onClose,
    onGenerate,
}) => {
    const [name, setName] = useState('');
    const [permissions, setPermissions] = useState<string[]>(['read']);

    const togglePermission = (perm: string) => {
        if (permissions.includes(perm)) {
            setPermissions(permissions.filter((p) => p !== perm));
        } else {
            setPermissions([...permissions, perm]);
        }
    };

    const handleGenerate = () => {
        if (!name.trim()) {
            alert('Please enter a key name');
            return;
        }
        onGenerate(name, permissions);
        setName('');
        setPermissions(['read']);
        onClose();
    };

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
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                                    <Key size={24} />
                                </div>
                                <h3 className="text-2xl font-black">Generate API Key</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-xl transition-all"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Key Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Production Key, Test Key, etc."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                            />
                        </div>

                        {/* Permissions */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                Permissions
                            </label>
                            <div className="space-y-3">
                                {['read', 'write', 'delete', 'admin'].map((perm) => (
                                    <label
                                        key={perm}
                                        className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={permissions.includes(perm)}
                                            onChange={() => togglePermission(perm)}
                                            className="w-5 h-5 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <span className="font-semibold text-slate-800 dark:text-white capitalize">
                                            {perm}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleGenerate}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                            <Key size={20} />
                            Generate
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔌 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const APISettings: React.FC = () => {
    const { can } = usePermissions();

    // State
    const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [toast, setToast] = useState<Toast>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    // API Config
    const [apiConfig, setApiConfig] = useState<APIConfig>({
        baseUrl: 'https://api.chhattisgarhcinema.com',
        version: 'v1',
        rateLimit: 100,
        cors: true,
        docs: true,
    });

    // Webhook Config
    const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
        url: '',
        events: {
            userCreated: true,
            subscriptionUpdated: true,
            paymentSuccess: false,
            contentPublished: false,
        },
        secret: '',
    });

    useEffect(() => {
        fetchAPIKeys();
        fetchConfigs();
    }, []);

    const fetchAPIKeys = async () => {
        try {
            setLoading(true);
            const snapshot = await getDocs(collection(db, 'apiKeys'));
            const keys = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as APIKey[];
            setApiKeys(keys);
        } catch (error) {
            console.error('Error fetching API keys:', error);
            showToast('Failed to load API keys', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchConfigs = async () => {
        try {
            const configDoc = await getDocs(collection(db, 'settings'));
            configDoc.forEach((doc) => {
                if (doc.id === 'api') {
                    setApiConfig(doc.data() as APIConfig);
                } else if (doc.id === 'webhook') {
                    setWebhookConfig(doc.data() as WebhookConfig);
                }
            });
        } catch (error) {
            console.error('Error fetching configs:', error);
        }
    };

    const showToast = (message: string, type: Toast['type']) => {
        setToast({ message, type, isVisible: true });
    };

    const generateAPIKey = () => {
        return `sk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    const handleGenerateKey = async (name: string, permissions: string[]) => {
        if (!can(Permission.MANAGE_ADMINS)) {
            showToast('You do not have permission to generate API keys', 'error');
            return;
        }

        try {
            const newKey = {
                key: generateAPIKey(),
                name,
                permissions,
                active: true,
                createdAt: Timestamp.now(),
                usageCount: 0,
            };

            const docRef = doc(collection(db, 'apiKeys'));
            await setDoc(docRef, newKey);

            setApiKeys([...apiKeys, { id: docRef.id, ...newKey }]);
            showToast('API key generated successfully', 'success');
        } catch (error) {
            console.error('Error generating API key:', error);
            showToast('Failed to generate API key', 'error');
        }
    };

    const handleCopyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        showToast('API key copied to clipboard', 'success');
    };

    const handleRevokeKey = async (id: string) => {
        if (!can(Permission.MANAGE_ADMINS)) {
            showToast('You do not have permission to revoke API keys', 'error');
            return;
        }

        if (!window.confirm('Are you sure you want to revoke this API key?')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'apiKeys', id));
            setApiKeys(apiKeys.filter((k) => k.id !== id));
            showToast('API key revoked successfully', 'success');
        } catch (error) {
            console.error('Error revoking API key:', error);
            showToast('Failed to revoke API key', 'error');
        }
    };

    const toggleKeyVisibility = (id: string) => {
        const newVisible = new Set(visibleKeys);
        if (newVisible.has(id)) {
            newVisible.delete(id);
        } else {
            newVisible.add(id);
        }
        setVisibleKeys(newVisible);
    };

    const handleSaveAPIConfig = async () => {
        if (!can(Permission.MANAGE_ADMINS)) {
            showToast('You do not have permission to save API settings', 'error');
            return;
        }

        try {
            await setDoc(doc(db, 'settings', 'api'), apiConfig);
            showToast('API configuration saved successfully', 'success');
        } catch (error) {
            console.error('Error saving API config:', error);
            showToast('Failed to save API configuration', 'error');
        }
    };

    const handleSaveWebhook = async () => {
        if (!can(Permission.MANAGE_ADMINS)) {
            showToast('You do not have permission to save webhook settings', 'error');
            return;
        }

        try {
            await setDoc(doc(db, 'settings', 'webhook'), webhookConfig);
            showToast('Webhook configuration saved successfully', 'success');
        } catch (error) {
            console.error('Error saving webhook config:', error);
            showToast('Failed to save webhook configuration', 'error');
        }
    };

    const maskKey = (key: string) => {
        return key.slice(0, 8) + '••••••••' + key.slice(-4);
    };

    return (
        <div className="min-h-screen w-full">
            {/* Toast */}
            <Toast {...toast} onClose={() => setToast({ ...toast, isVisible: false })} />

            {/* Generate Key Modal */}
            <GenerateKeyModal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                onGenerate={handleGenerateKey}
            />

            <div className="space-y-6 w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden w-full"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                    />

                    <div className="relative z-10">
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                            <Key size={36} />
                            API Settings
                        </h1>
                        <p className="text-white/90 text-lg">Manage API keys and configurations</p>
                    </div>
                </motion.div>

                {/* API Configuration */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                            <Settings size={20} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                            API Configuration
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                API Base URL
                            </label>
                            <input
                                type="text"
                                value={apiConfig.baseUrl}
                                onChange={(e) => setApiConfig({ ...apiConfig, baseUrl: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    API Version
                                </label>
                                <input
                                    type="text"
                                    value={apiConfig.version}
                                    onChange={(e) =>
                                        setApiConfig({ ...apiConfig, version: e.target.value })
                                    }
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Rate Limit (requests/minute)
                                </label>
                                <input
                                    type="number"
                                    value={apiConfig.rateLimit}
                                    onChange={(e) =>
                                        setApiConfig({ ...apiConfig, rateLimit: parseInt(e.target.value) })
                                    }
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={apiConfig.cors}
                                    onChange={(e) =>
                                        setApiConfig({ ...apiConfig, cors: e.target.checked })
                                    }
                                    className="w-5 h-5 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                                />
                                <span className="font-semibold text-slate-800 dark:text-white">
                                    Enable CORS
                                </span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={apiConfig.docs}
                                    onChange={(e) =>
                                        setApiConfig({ ...apiConfig, docs: e.target.checked })
                                    }
                                    className="w-5 h-5 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                                />
                                <span className="font-semibold text-slate-800 dark:text-white">
                                    Enable API Documentation
                                </span>
                            </label>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSaveAPIConfig}
                            className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all flex items-center gap-2"
                        >
                            <Save size={20} />
                            Save Configuration
                        </motion.button>
                    </div>
                </motion.div>

                {/* API Keys */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                <Key size={20} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white">API Keys</h2>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsGenerateModalOpen(true)}
                            className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Generate New Key
                        </motion.button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
                            />
                        </div>
                    ) : apiKeys.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Key className="text-slate-300 dark:text-slate-600" size={64} />
                            <p className="text-xl font-bold text-slate-400 dark:text-slate-500 mt-4">
                                No API keys generated
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            API Key
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Permissions
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Usage
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {apiKeys.map((key) => (
                                        <tr
                                            key={key.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <code className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg font-mono text-sm">
                                                        {visibleKeys.has(key.id) ? key.key : maskKey(key.key)}
                                                    </code>
                                                    <button
                                                        onClick={() => toggleKeyVisibility(key.id)}
                                                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all"
                                                    >
                                                        {visibleKeys.has(key.id) ? (
                                                            <EyeOff size={16} className="text-slate-600 dark:text-slate-400" />
                                                        ) : (
                                                            <Eye size={16} className="text-slate-600 dark:text-slate-400" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-800 dark:text-white">
                                                    {key.name}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {key.permissions.map((perm) => (
                                                        <span
                                                            key={perm}
                                                            className="px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-xs font-bold uppercase"
                                                        >
                                                            {perm}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {key.usageCount} requests
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${key.active
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}
                                                >
                                                    {key.active ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleCopyKey(key.key)}
                                                        className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                                                        title="Copy"
                                                    >
                                                        <Copy size={18} />
                                                    </motion.button>

                                                    {can(Permission.MANAGE_ADMINS) && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleRevokeKey(key.id)}
                                                            className="p-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                                                            title="Revoke"
                                                        >
                                                            <Trash2 size={18} />
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

                {/* Webhook Configuration */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                            <Webhook size={20} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                            Webhook Configuration
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Webhook URL
                            </label>
                            <input
                                type="text"
                                value={webhookConfig.url}
                                onChange={(e) =>
                                    setWebhookConfig({ ...webhookConfig, url: e.target.value })
                                }
                                placeholder="https://your-domain.com/webhook"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                Events
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={webhookConfig.events.userCreated}
                                        onChange={(e) =>
                                            setWebhookConfig({
                                                ...webhookConfig,
                                                events: {
                                                    ...webhookConfig.events,
                                                    userCreated: e.target.checked,
                                                },
                                            })
                                        }
                                        className="w-5 h-5 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="font-semibold text-slate-800 dark:text-white">
                                        user.created
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={webhookConfig.events.subscriptionUpdated}
                                        onChange={(e) =>
                                            setWebhookConfig({
                                                ...webhookConfig,
                                                events: {
                                                    ...webhookConfig.events,
                                                    subscriptionUpdated: e.target.checked,
                                                },
                                            })
                                        }
                                        className="w-5 h-5 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="font-semibold text-slate-800 dark:text-white">
                                        subscription.updated
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={webhookConfig.events.paymentSuccess}
                                        onChange={(e) =>
                                            setWebhookConfig({
                                                ...webhookConfig,
                                                events: {
                                                    ...webhookConfig.events,
                                                    paymentSuccess: e.target.checked,
                                                },
                                            })
                                        }
                                        className="w-5 h-5 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="font-semibold text-slate-800 dark:text-white">
                                        payment.success
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={webhookConfig.events.contentPublished}
                                        onChange={(e) =>
                                            setWebhookConfig({
                                                ...webhookConfig,
                                                events: {
                                                    ...webhookConfig.events,
                                                    contentPublished: e.target.checked,
                                                },
                                            })
                                        }
                                        className="w-5 h-5 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="font-semibold text-slate-800 dark:text-white">
                                        content.published
                                    </span>
                                </label>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSaveWebhook}
                            className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all flex items-center gap-2"
                        >
                            <Save size={20} />
                            Save Webhook
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default APISettings;
