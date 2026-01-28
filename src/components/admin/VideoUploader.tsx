// src/components/admin/VideoUploader.tsx
import React, { useState, useRef } from 'react';
import { Upload, X, FileVideo, Loader2, CheckCircle2, AlertCircle, Film } from 'lucide-react';
import { motion } from 'framer-motion';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';

type UploadStatus = 'idle' | 'uploading' | 'encoding' | 'completed' | 'error';

interface VideoUploaderProps {
    onUploadComplete: (url: string, encodedUrl?: string) => void;
    onUploadStart?: () => void;
    currentUrl?: string;
    maxSize?: number; // in MB
    acceptedFormats?: string[];
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
    onUploadComplete,
    onUploadStart,
    currentUrl,
    maxSize = 2000,
    acceptedFormats = ['mp4', 'mkv', 'webm', 'avi', 'mov'],
}) => {
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [videoUrl, setVideoUrl] = useState(currentUrl || '');
    const [encodingProgress, setEncodingProgress] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadTaskRef = useRef<any>(null);

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
        uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        try {
            setUploadStatus('uploading');
            setUploadProgress(0);
            onUploadStart?.();

            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name}`;
            const storageRef = ref(storage, `videos/uploads/${fileName}`);

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
                    setVideoUrl(url);

                    // Start encoding status
                    setUploadStatus('encoding');
                    setEncodingProgress(0);

                    // Simulate encoding progress
                    simulateEncodingProgress();

                    // Complete after simulation
                    setTimeout(() => {
                        setUploadStatus('completed');
                        onUploadComplete(url);
                    }, 3000);
                }
            );
        } catch (err) {
            console.error('Upload error:', err);
            setError('Upload failed');
            setUploadStatus('error');
        }
    };

    const simulateEncodingProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            setEncodingProgress(progress);
            if (progress >= 95) {
                clearInterval(interval);
            }
        }, 300);
    };

    const cancelUpload = () => {
        if (uploadTaskRef.current) {
            uploadTaskRef.current.cancel();
            setUploadStatus('idle');
            setUploadProgress(0);
            setSelectedFile(null);
        }
    };

    const removeVideo = () => {
        setSelectedFile(null);
        setVideoUrl('');
        setUploadStatus('idle');
        setUploadProgress(0);
        setEncodingProgress(0);
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

    if (uploadStatus !== 'idle' && selectedFile) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg"
            >
                <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                        {uploadStatus === 'uploading' && (
                            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                <Loader2 className="animate-spin text-blue-500" size={28} />
                            </div>
                        )}
                        {uploadStatus === 'encoding' && (
                            <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center">
                                <Film className="text-orange-500 animate-pulse" size={28} />
                            </div>
                        )}
                        {uploadStatus === 'completed' && (
                            <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center">
                                <CheckCircle2 className="text-green-500" size={28} />
                            </div>
                        )}
                        {uploadStatus === 'error' && (
                            <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center">
                                <AlertCircle className="text-red-500" size={28} />
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white truncate text-lg">
                                    {selectedFile.name}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            </div>

                            {(uploadStatus === 'uploading' || uploadStatus === 'completed') && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={uploadStatus === 'uploading' ? cancelUpload : removeVideo}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors ml-2"
                                >
                                    <X size={20} />
                                </motion.button>
                            )}
                        </div>

                        {/* Status Text */}
                        <div className="mb-3">
                            {uploadStatus === 'uploading' && (
                                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    Uploading... {uploadProgress}%
                                </p>
                            )}
                            {uploadStatus === 'encoding' && (
                                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                    Encoding video... {encodingProgress}%
                                </p>
                            )}
                            {uploadStatus === 'completed' && (
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    ✓ Video ready!
                                </p>
                            )}
                            {uploadStatus === 'error' && (
                                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                    Upload failed
                                </p>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {uploadStatus === 'uploading' && (
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full"
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        )}

                        {uploadStatus === 'encoding' && (
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${encodingProgress}%` }}
                                    className="h-full bg-gradient-to-r from-orange-500 to-yellow-600 rounded-full"
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        )}

                        {error && (
                            <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                                <AlertCircle size={14} />
                                {error}
                            </p>
                        )}
                    </div>
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
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
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
          relative border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 overflow-hidden
          ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                        : 'border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 hover:border-blue-400 dark:hover:border-blue-500'
                    }
        `}
            >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10" />

                <div className="relative z-10">
                    <motion.div
                        animate={isDragging ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-4"
                    >
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Upload size={40} className="text-white" />
                        </div>
                    </motion.div>

                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                        {isDragging ? 'Drop your video here' : 'Upload Video'}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Click to browse or drag and drop your video file
                    </p>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <FileVideo size={16} className="text-blue-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {acceptedFormats.join(', ').toUpperCase()}
                        </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                        Maximum size: {maxSize}MB
                    </p>
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
