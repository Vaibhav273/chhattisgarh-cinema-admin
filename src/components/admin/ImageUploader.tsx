// src/components/admin/ImageUploader.tsx
import React, { useState, useRef, useEffect } from 'react'; // ✅ ADD useEffect
import { X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle, Globe } from 'lucide-react'; // ✅ ADD Globe
import { motion } from 'framer-motion';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
// ✅ ADD: Import CDN settings service
import { getCDNSettings, buildCDNUrl } from '../../services/settingsService';
import type { CDNSettings } from '../../services/settingsService';

type UploadStatus = 'idle' | 'uploading' | 'completed' | 'error';

interface ImageUploaderProps {
    onUploadComplete: (url: string, cdnUrl?: string) => void;
    onUploadStart?: () => void;
    currentUrl?: string;
    existingImageUrl?: string;
    maxSize?: number;
    multiple?: boolean;
    acceptedFormats?: string[];
    folder?: string;
    aspectRatio?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    onUploadComplete,
    onUploadStart,
    currentUrl,
    existingImageUrl,
    maxSize = 5,
    acceptedFormats = ['jpg', 'jpeg', 'png', 'webp'],
    folder = 'images',
    aspectRatio,
    multiple
}) => {
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState(existingImageUrl || currentUrl || '');
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // ✅ ADD: CDN settings state
    const [cdnSettings, setCDNSettings] = useState<CDNSettings | null>(null);
    const [loadingCDN, setLoadingCDN] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadTaskRef = useRef<any>(null);

    // ✅ ADD: Load CDN settings on mount
    useEffect(() => {
        loadCDNSettings();
    }, []);

    useEffect(() => {
        if (existingImageUrl && !selectedFile) {
            setPreviewUrl(existingImageUrl);
        }
    }, [existingImageUrl, selectedFile]);

    const loadCDNSettings = async () => {
        try {
            setLoadingCDN(true);
            const settings = await getCDNSettings();
            setCDNSettings(settings);
            console.log('✅ Loaded CDN settings:', settings);
        } catch (error) {
            console.error('❌ Error loading CDN settings:', error);
        } finally {
            setLoadingCDN(false);
        }
    };

    const validateFile = (file: File): string | null => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
            return `Invalid format. Accepted: ${acceptedFormats.join(', ')}`;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
            return `File too large. Max size: ${maxSize}MB`;
        }

        return null;
    };

    const handleFileSelect = (file: File) => {
        const validationError = validateFile(file);

        if (validationError) {
            setError(validationError);
            return;
        }

        setSelectedFile(file);
        setError('');

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        try {
            setUploadStatus('uploading');
            setUploadProgress(0);
            onUploadStart?.();

            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name}`;
            const storageRef = ref(storage, `${folder}/${fileName}`);

            uploadTaskRef.current = uploadBytesResumable(storageRef, file);

            uploadTaskRef.current.on(
                'state_changed',
                (snapshot: any) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(Math.round(progress));
                },
                (error: any) => {
                    console.error('Upload error:', error);
                    setError('Upload failed. Please try again.');
                    setUploadStatus('error');
                },
                async () => {
                    const url = await getDownloadURL(uploadTaskRef.current.snapshot.ref);

                    // ✅ ADD: Build CDN URL if enabled
                    let cdnUrl = url;
                    if (cdnSettings && cdnSettings.enabled) {
                        cdnUrl = buildCDNUrl(url, cdnSettings);
                        console.log('✅ CDN URL generated:', cdnUrl);
                    }

                    setUploadStatus('completed');
                    onUploadComplete(url, cdnUrl); // ✅ MODIFIED: Pass both URLs
                }
            );
        } catch (err) {
            console.error('Upload error:', err);
            setError('Upload failed');
            setUploadStatus('error');
        }
    };

    const cancelUpload = () => {
        if (uploadTaskRef.current) {
            uploadTaskRef.current.cancel();
            setUploadStatus('idle');
            setUploadProgress(0);
            setSelectedFile(null);
            setPreviewUrl('');
        }
    };

    const removeImage = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        setUploadStatus('idle');
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    // ✅ ADD: Show loading state while CDN settings load
    if (loadingCDN) {
        return (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center">
                <Loader2 className="animate-spin text-purple-500 mx-auto mb-3" size={32} />
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                    Loading settings...
                </p>
            </div>
        );
    }

    if (previewUrl && selectedFile) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg"
            >
                <div className="relative">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                    />

                    {uploadStatus === 'uploading' && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="animate-spin text-white mx-auto mb-3" size={40} />
                                <p className="text-white font-bold text-lg">{uploadProgress}%</p>
                                <p className="text-white/80 text-sm">Uploading...</p>
                            </div>
                        </div>
                    )}

                    {uploadStatus === 'completed' && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-4 right-4"
                        >
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="text-white" size={24} />
                            </div>
                        </motion.div>
                    )}

                    {/* ✅ ADD: CDN indicator badge */}
                    {uploadStatus === 'completed' && cdnSettings?.enabled && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="absolute bottom-4 left-4"
                        >
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500 rounded-lg shadow-lg">
                                <Globe size={14} className="text-white" />
                                <span className="text-xs font-bold text-white">CDN Enabled</span>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${uploadStatus === 'uploading' ? 'bg-blue-500/10' :
                                uploadStatus === 'completed' ? 'bg-green-500/10' :
                                    'bg-red-500/10'
                                }`}>
                                {uploadStatus === 'uploading' && <Loader2 className="text-blue-500 animate-spin" size={20} />}
                                {uploadStatus === 'completed' && <CheckCircle2 className="text-green-500" size={20} />}
                                {uploadStatus === 'error' && <AlertCircle className="text-red-500" size={20} />}
                            </div>

                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-xs">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                    {/* ✅ ADD: CDN provider info */}
                                    {uploadStatus === 'completed' && cdnSettings?.enabled && (
                                        <span className="ml-2">• via {cdnSettings.provider}</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={uploadStatus === 'uploading' ? cancelUpload : removeImage}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                        >
                            <X size={20} />
                        </motion.button>
                    </div>

                    {uploadStatus === 'uploading' && (
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden mt-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full"
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    )}

                    {error && (
                        <p className="text-xs text-red-500 mt-3 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {error}
                        </p>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats.map(f => `.${f}`).join(',')}
                multiple={multiple}  // ✅ ADD THIS
                onChange={(e) => {
                    if (multiple) {
                        // Handle multiple files
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => handleFileSelect(file));
                    } else {
                        // Handle single file
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                    }
                }}
                className="hidden"
            />

            <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative border-3 border-dashed rounded-2xl p-10 text-center cursor-pointer
          transition-all duration-300 overflow-hidden
          ${isDragging
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-105'
                        : 'border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 hover:border-purple-400 dark:hover:border-purple-500'
                    }
        `}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10" />

                <div className="relative z-10">
                    <motion.div
                        animate={isDragging ? { scale: 1.2, rotate: -5 } : { scale: 1, rotate: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-4"
                    >
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                            <ImageIcon size={32} className="text-white" />
                        </div>
                    </motion.div>

                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                        {isDragging ? 'Drop your image here' : 'Upload Image'}
                    </h3>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        Click to browse or drag and drop
                    </p>

                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                            <ImageIcon size={14} className="text-purple-500" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {acceptedFormats.join(', ').toUpperCase()}
                            </span>
                        </div>

                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Max: {maxSize}MB
                        </span>

                        {aspectRatio && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Ratio: {aspectRatio}
                            </span>
                        )}
                    </div>

                    {/* ✅ ADD: CDN status indicator */}
                    {cdnSettings && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${cdnSettings.enabled
                                ? 'bg-cyan-50 dark:bg-cyan-900/20'
                                : 'bg-slate-100 dark:bg-slate-800'
                                }`}>
                                <Globe size={14} className={cdnSettings.enabled ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'} />
                                <span className={`text-xs font-semibold ${cdnSettings.enabled
                                    ? 'text-cyan-600 dark:text-cyan-400'
                                    : 'text-slate-500'
                                    }`}>
                                    CDN: {cdnSettings.enabled ? `${cdnSettings.provider}` : 'Disabled'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg"
                >
                    <AlertCircle size={16} />
                    {error}
                </motion.p>
            )}
        </div>
    );
};
