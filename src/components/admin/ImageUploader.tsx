import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, getStorage } from "firebase/storage";
import { storage } from "../../config/firebase";
import { getCDNSettings, buildCDNUrl } from "../../services/settingsService";
import type { CDNSettings } from "../../services/settingsService";
import { logImageUpload, logImageDelete } from "../../utils/logger"; // 🔥 ADD THIS


type UploadStatus = "idle" | "uploading" | "completed" | "error";


interface ImageUploaderProps {
  onUploadComplete: (urls: { url: string; cdnUrl: string }[]) => void;
  onImageDelete?: (url: string) => void;
  onUploadStart?: () => void;
  onUploadProgress?: (fileName: string, progress: number) => void;
  currentUrl?: string;
  existingImageUrl?: string;
  maxSize?: number;
  multiple?: boolean;
  acceptedFormats?: string[];
  folder?: string;
  aspectRatio?: string;
  
  // 🔥 NEW: Optional logging metadata
  logMetadata?: {
    module: string;      // "Movies", "Events", "WebSeries", etc.
    imageType: string;   // "thumbnail", "poster", "banner", etc.
    context?: any;       // Any additional context
  };
}


export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  onImageDelete,
  onUploadStart,
  onUploadProgress,
  currentUrl,
  existingImageUrl,
  maxSize = 5,
  acceptedFormats = ["jpg", "jpeg", "png", "webp"],
  folder = "images",
  aspectRatio,
  multiple,
  logMetadata, // 🔥 NEW
}) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(
    existingImageUrl || currentUrl || "",
  );
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [uploadingFiles, setUploadingFiles] = useState<
    Map<string, { file: File; progress: number; status: UploadStatus }>
  >(new Map());

  const [cdnSettings, setCDNSettings] = useState<CDNSettings | null>(null);
  const [loadingCDN, setLoadingCDN] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTaskRef = useRef<any>(null);

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
      console.log("✅ Loaded CDN settings:", settings);
    } catch (error) {
      console.error("❌ Error loading CDN settings:", error);
    } finally {
      setLoadingCDN(false);
    }
  };

  const validateFile = (file: File): string | null => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      return `Invalid format. Accepted: ${acceptedFormats.join(", ")}`;
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
    setError("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    uploadFile(file);
  };

  // ✅ Upload single file for multiple uploads
  const uploadSingleFile = async (
    file: File,
  ): Promise<{ url: string; cdnUrl: string }> => {
    return new Promise((resolve, reject) => {
      try {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileName = `${timestamp}_${randomString}_${file.name}`;
        const storageRef = ref(storage, `${folder}/${fileName}`);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            );

            setUploadingFiles((prev) => {
              const newMap = new Map(prev);
              newMap.set(file.name, {
                file,
                progress,
                status: "uploading",
              });
              return newMap;
            });

            if (onUploadProgress) {
              onUploadProgress(file.name, progress);
            }

            console.log(`Upload progress for ${file.name}: ${progress}%`);
          },
          (error) => {
            console.error(`Upload error for ${file.name}:`, error);

            setUploadingFiles((prev) => {
              const newMap = new Map(prev);
              newMap.set(file.name, {
                file,
                progress: 0,
                status: "error",
              });
              return newMap;
            });

            reject(error);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);

            let cdnUrl = url;
            if (cdnSettings && cdnSettings.enabled) {
              cdnUrl = buildCDNUrl(url, cdnSettings);
            }

            setUploadingFiles((prev) => {
              const newMap = new Map(prev);
              newMap.set(file.name, {
                file,
                progress: 100,
                status: "completed",
              });
              return newMap;
            });

            // 🔥 AUTO-LOG IF METADATA PROVIDED
            if (logMetadata) {
              console.log("📸 Logging image upload:", {
                module: logMetadata.module,
                imageType: logMetadata.imageType,
                context: logMetadata.context,
              });

              logImageUpload(
                url,
                cdnUrl,
                logMetadata.module,
                logMetadata.imageType,
                logMetadata.context || {}
              );
            }

            console.log(`✅ Upload complete for ${file.name}`);
            resolve({ url, cdnUrl });
          },
        );
      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error);
        reject(error);
      }
    });
  };

  // ✅ Single file upload
  const uploadFile = async (file: File) => {
    try {
      setUploadStatus("uploading");
      setUploadProgress(0);
      onUploadStart?.();

      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);

      uploadTaskRef.current = uploadBytesResumable(storageRef, file);

      uploadTaskRef.current.on(
        "state_changed",
        (snapshot: any) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error: any) => {
          console.error("Upload error:", error);
          setError("Upload failed. Please try again.");
          setUploadStatus("error");
        },
        async () => {
          const url = await getDownloadURL(uploadTaskRef.current.snapshot.ref);

          let cdnUrl = url;
          if (cdnSettings && cdnSettings.enabled) {
            cdnUrl = buildCDNUrl(url, cdnSettings);
            console.log("✅ CDN URL generated:", cdnUrl);
          }

          setUploadStatus("completed");

          // 🔥 AUTO-LOG IF METADATA PROVIDED
          if (logMetadata) {
            console.log("📸 Logging image upload:", {
              module: logMetadata.module,
              imageType: logMetadata.imageType,
              context: logMetadata.context,
            });

            logImageUpload(
              url,
              cdnUrl,
              logMetadata.module,
              logMetadata.imageType,
              logMetadata.context || {}
            );
          }

          onUploadComplete([{ url, cdnUrl }]);
        },
      );
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed");
      setUploadStatus("error");
    }
  };

  const cancelUpload = () => {
    if (uploadTaskRef.current) {
      uploadTaskRef.current.cancel();
      setUploadStatus("idle");
      setUploadProgress(0);
      setSelectedFile(null);
      setPreviewUrl("");
    }
  };

  const removeImage = async () => {
    try {
      if (previewUrl && previewUrl.includes('firebasestorage')) {
        const confirmed = window.confirm("Delete this image from storage?");
        if (!confirmed) return;

        console.log("🗑️ Deleting image from storage:", previewUrl);

        const storage = getStorage();
        const decodedUrl = decodeURIComponent(previewUrl);
        const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);

        if (pathMatch && pathMatch[1]) {
          const filePath = pathMatch[1];
          const imageRef = ref(storage, filePath);

          try {
            await deleteObject(imageRef);
            console.log("✅ Image deleted from Firebase Storage");

            // 🔥 AUTO-LOG DELETE IF METADATA PROVIDED
            if (logMetadata) {
              console.log("🗑️ Logging image delete:", {
                module: logMetadata.module,
                imageType: logMetadata.imageType,
              });

              logImageDelete(
                previewUrl,
                logMetadata.module,
                logMetadata.imageType,
                logMetadata.context || {}
              );
            }
          } catch (storageError: any) {
            if (storageError.code === 'storage/object-not-found') {
              console.warn("⚠️ Image already deleted from storage");
            } else {
              throw storageError;
            }
          }
        }

        if (onImageDelete) {
          onImageDelete(previewUrl);
        }
      }

      setSelectedFile(null);
      setPreviewUrl("");
      setUploadStatus("idle");
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      console.log("✅ Image removed from UI");
    } catch (error) {
      console.error("❌ Error deleting image:", error);
      alert("Failed to delete image. Please try again.");
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

    const files = e.dataTransfer.files;
    if (!files) return;

    if (multiple) {
      handleMultipleFiles(Array.from(files));
    } else {
      const file = files[0];
      if (file) handleFileSelect(file);
    }
  };

  const handleMultipleFiles = async (files: File[]) => {
    setError("");
    onUploadStart?.();

    const uploadPromises = files.map(async (file) => {
      const validationError = validateFile(file);
      if (validationError) {
        console.error(`Validation error for ${file.name}:`, validationError);
        return null;
      }

      try {
        return await uploadSingleFile(file);
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((r) => r !== null) as {
      url: string;
      cdnUrl: string;
    }[];

    if (successfulUploads.length > 0) {
      onUploadComplete(successfulUploads);

      setTimeout(() => {
        setUploadingFiles(new Map());
      }, 2000);
    } else {
      setError("All uploads failed. Please try again.");
    }
  };

  if (loadingCDN) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center">
        <Loader2
          className="animate-spin text-purple-500 mx-auto mb-3"
          size={32}
        />
        <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
          Loading settings...
        </p>
      </div>
    );
  }

  // ✅ NEW: Show uploading files progress (for multiple)
  if (multiple && uploadingFiles.size > 0) {
    return (
      <div className="space-y-3">
        {Array.from(uploadingFiles.entries()).map(([fileName, data]) => (
          <motion.div
            key={fileName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    data.status === "uploading"
                      ? "bg-blue-500/10"
                      : data.status === "completed"
                        ? "bg-green-500/10"
                        : "bg-red-500/10"
                  }`}
                >
                  {data.status === "uploading" && (
                    <Loader2 className="text-blue-500 animate-spin" size={20} />
                  )}
                  {data.status === "completed" && (
                    <CheckCircle2 className="text-green-500" size={20} />
                  )}
                  {data.status === "error" && (
                    <AlertCircle className="text-red-500" size={20} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {fileName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(data.file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>

              <span className="text-sm font-bold text-purple-600 dark:text-purple-400 ml-2">
                {data.progress}%
              </span>
            </div>

            {data.status === "uploading" && (
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.progress}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                />
              </div>
            )}
          </motion.div>
        ))}
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

          {uploadStatus === "uploading" && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <Loader2
                  className="animate-spin text-white mx-auto mb-3"
                  size={40}
                />
                <p className="text-white font-bold text-lg">
                  {uploadProgress}%
                </p>
                <p className="text-white/80 text-sm">Uploading...</p>
              </div>
            </div>
          )}

          {uploadStatus === "completed" && (
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

          {uploadStatus === "completed" && cdnSettings?.enabled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-4 left-4"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500 rounded-lg shadow-lg">
                <Globe size={14} className="text-white" />
                <span className="text-xs font-bold text-white">
                  CDN Enabled
                </span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  uploadStatus === "uploading"
                    ? "bg-blue-500/10"
                    : uploadStatus === "completed"
                      ? "bg-green-500/10"
                      : "bg-red-500/10"
                }`}
              >
                {uploadStatus === "uploading" && (
                  <Loader2 className="text-blue-500 animate-spin" size={20} />
                )}
                {uploadStatus === "completed" && (
                  <CheckCircle2 className="text-green-500" size={20} />
                )}
                {uploadStatus === "error" && (
                  <AlertCircle className="text-red-500" size={20} />
                )}
              </div>

              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                  {uploadStatus === "completed" && cdnSettings?.enabled && (
                    <span className="ml-2">• via {cdnSettings.provider}</span>
                  )}
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={
                uploadStatus === "uploading" ? cancelUpload : removeImage
              }
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
            >
              <X size={20} />
            </motion.button>
          </div>

          {uploadStatus === "uploading" && (
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
        accept={acceptedFormats.map((f) => `.${f}`).join(",")}
        multiple={multiple}
        onChange={(e) => {
          const files = e.target.files;
          if (!files) return;

          if (multiple) {
            handleMultipleFiles(Array.from(files));
          } else {
            const file = files[0];
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
          ${
            isDragging
              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-105"
              : "border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 hover:border-purple-400 dark:hover:border-purple-500"
          }
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10" />

        <div className="relative z-10">
          <motion.div
            animate={
              isDragging ? { scale: 1.2, rotate: -5 } : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <ImageIcon size={32} className="text-white" />
            </div>
          </motion.div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {isDragging
              ? "Drop your image here"
              : multiple
                ? "Upload Images"
                : "Upload Image"}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Click to browse or drag and drop
            {multiple && " (Multiple files supported)"}
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <ImageIcon size={14} className="text-purple-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {acceptedFormats.join(", ").toUpperCase()}
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

          {cdnSettings && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                  cdnSettings.enabled
                    ? "bg-cyan-50 dark:bg-cyan-900/20"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                <Globe
                  size={14}
                  className={
                    cdnSettings.enabled
                      ? "text-cyan-600 dark:text-cyan-400"
                      : "text-slate-400"
                  }
                />
                <span
                  className={`text-xs font-semibold ${
                    cdnSettings.enabled
                      ? "text-cyan-600 dark:text-cyan-400"
                      : "text-slate-500"
                  }`}
                >
                  CDN:{" "}
                  {cdnSettings.enabled ? `${cdnSettings.provider}` : "Disabled"}
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
