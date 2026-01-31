import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  Phone,
  Camera,
  Save,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Upload,
  X,
} from "lucide-react";
import { doc, updateDoc, getDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth, db, storage } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { logProfileAction, logError } from "../../utils/activityLogger";

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Toast {
  message: string;
  type: "success" | "error" | "info" | "warning";
  isVisible: boolean;
}

interface ProfileData {
  displayName: string;
  email: string;
  phoneNumber: string;
  photoURL: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
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
// 👤 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Data
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: "",
    email: "",
    phoneNumber: "",
    photoURL: "",
  });

  // Password Data
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  // Toast
  const [toast, setToast] = useState<Toast>({
    message: "",
    type: "info",
    isVisible: false,
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfileData({
          displayName: data.displayName || user.displayName || "",
          email: user.email || "",
          phoneNumber: data.phoneNumber || "",
          photoURL: data.photoURL || user.photoURL || "",
        });
        setPhotoPreview(data.photoURL || user.photoURL || "");
      } else {
        setProfileData({
          displayName: user.displayName || "",
          email: user.email || "",
          phoneNumber: "",
          photoURL: user.photoURL || "",
        });
        setPhotoPreview(user.photoURL || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      showToast("Failed to load profile data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: Toast["type"]) => {
    setToast({ message, type, isVisible: true });
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        showToast("Image size should be less than 2MB", "error");
        return;
      }

      // Validate type
      if (!file.type.startsWith("image/")) {
        showToast("Please select a valid image file", "error");
        return;
      }

      setPhotoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(profileData.photoURL);
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const storageRef = ref(
      storage,
      `profilePhotos/${user?.uid}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`,
    );
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  const handleSaveProfile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      setSaving(true);

      let photoURL = profileData.photoURL;

      // Upload new photo if selected
      if (photoFile) {
        setUploadingPhoto(true);
        photoURL = await uploadPhoto(photoFile);
        setUploadingPhoto(false);
      }

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: profileData.displayName,
        photoURL: photoURL,
      });

      // Update Firestore user document
      await updateDoc(doc(db, "users", currentUser.uid), {
        displayName: profileData.displayName,
        phoneNumber: profileData.phoneNumber,
        photoURL: photoURL,
        updatedAt: Timestamp.now(),
      });

      // Update admin document if exists
      const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));
      if (adminDoc.exists()) {
        await updateDoc(doc(db, "admins", currentUser.uid), {
          displayName: profileData.displayName,
          photoURL: photoURL,
          updatedAt: Timestamp.now(),
        });
      }

      setProfileData({ ...profileData, photoURL });
      setPhotoFile(null);
      showToast("Profile updated successfully", "success");

      // ✅ ADD LOGGING
      await logProfileAction("update_profile", {
        displayName: profileData.displayName,
        phoneNumber: profileData.phoneNumber,
        photoChanged: !!photoFile,
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      showToast(error.message || "Failed to update profile", "error");

      // ✅ ADD ERROR LOGGING
      await logError("Profile Settings", "Failed to update profile", {
        error,
        userId: currentUser.uid,
      });
    } finally {
      setSaving(false);
      setUploadingPhoto(false);
    }
  };

  const handleChangePassword = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      showToast("User not authenticated", "error");
      return;
    }

    // Validation
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      showToast("Please fill in all password fields", "warning");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      showToast(
        "New password must be different from current password",
        "error",
      );
      return;
    }

    try {
      setSaving(true);

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword,
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordData.newPassword);

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showToast("Password changed successfully", "success");

      // ✅ ADD LOGGING
      await logProfileAction("change_password", {
        email: currentUser.email,
      });
    } catch (error: any) {
      console.error("Error changing password:", error);

      if (error.code === "auth/wrong-password") {
        showToast("Current password is incorrect", "error");
      } else if (error.code === "auth/weak-password") {
        showToast("Password is too weak", "error");
      } else {
        showToast(error.message || "Failed to change password", "error");
      }

      // ✅ ADD ERROR LOGGING
      await logError("Profile Settings", "Failed to change password", {
        error,
        userId: currentUser.uid,
        errorCode: error.code,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-600 dark:text-slate-400 font-semibold">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      {/* Toast */}
      <Toast
        {...toast}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      <div className="space-y-6 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden w-full"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <UserIcon size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-black mb-2">Profile Settings</h1>
                <p className="text-white/90 text-lg">
                  Manage your account settings
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">
              Profile Information
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-900/30"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-blue-100 dark:ring-blue-900/30">
                    {profileData.displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-all shadow-lg">
                  <Camera size={16} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all cursor-pointer inline-flex items-center gap-2">
                  <Upload size={20} />
                  Change Avatar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
                {photoFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                      <CheckCircle size={16} />
                      New photo selected
                    </p>
                    <button
                      onClick={handleRemovePhoto}
                      className="text-red-600 hover:text-red-700 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  JPG, PNG or GIF. Max size 2MB
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <UserIcon size={16} />
                  Full Name
                </div>
              </label>
              <input
                type="text"
                value={profileData.displayName}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    displayName: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
              />
            </div>

            {/* Email (Disabled) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </div>
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Email cannot be changed
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  Phone Number
                </div>
              </label>
              <input
                type="tel"
                value={profileData.phoneNumber}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    phoneNumber: e.target.value,
                  })
                }
                placeholder="+91 1234567890"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
              />
            </div>

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveProfile}
              disabled={saving || uploadingPhoto}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploadingPhoto ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading Photo...
                </>
              ) : saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <Lock size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                  Change Password
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Update your account password
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                Password Requirements:
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-500 space-y-1">
                <li>• At least 6 characters long</li>
                <li>• Different from your current password</li>
                <li>• Use a strong, unique password</li>
              </ul>
            </div>

            {/* Update Password Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleChangePassword}
              disabled={saving}
              className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Update Password
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSettings;
