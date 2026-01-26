// ═══════════════════════════════════════════════════════════════
// ✏️ ADD/EDIT USER - ADMIN PANEL - COMPLETE FINAL VERSION
// ═══════════════════════════════════════════════════════════════
// Path: src/pages/admin/users/AddEditUser.tsx

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  Shield,
  Crown,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Loader,
  Calendar,
} from "lucide-react";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../../config/firebase";
import type { User as UserType } from "../../types/user";
import { ROLE_CONFIGS, type UserRole } from "../../types/roles";

// ═══════════════════════════════════════════════════════════════
// 🎉 TOAST NOTIFICATION
// ═══════════════════════════════════════════════════════════════
interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
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

// ═══════════════════════════════════════════════════════════════
// 📝 LOCAL TYPE DEFINITIONS (Form-specific)
// ═══════════════════════════════════════════════════════════════
type FormUserStatus = "active" | "banned" | "suspended";
type FormSubscriptionStatus = "active" | "inactive" | "cancelled" | "expired";

// ═══════════════════════════════════════════════════════════════
// 📝 FORM DATA INTERFACE
// ═══════════════════════════════════════════════════════════════
interface FormData {
  displayName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
  status: FormUserStatus;
  isPremium: boolean;
  currentPlanId: string;
  subscriptionStatus: FormSubscriptionStatus;
  maxDevices: number;
  maxProfiles: number;
  rewardPoints: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  kycVerified: boolean;
  twoFactorEnabled: boolean;
}

// ═══════════════════════════════════════════════════════════════
// 🎯 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const AddEditUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const isEditMode = !!userId;

  // States
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(isEditMode);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Toast State
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });

  // Form Data with default values
  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "viewer",
    status: "active",
    isPremium: false,
    currentPlanId: "free",
    subscriptionStatus: "inactive",
    maxDevices: 3,
    maxProfiles: 5,
    rewardPoints: 0,
    emailVerified: false,
    phoneVerified: false,
    kycVerified: false,
    twoFactorEnabled: false,
  });

  // Available Plans
  const plans = [
    { id: "free", name: "Free" },
    { id: "basic", name: "Basic" },
    { id: "standard", name: "Standard" },
    { id: "premium", name: "Premium" },
  ];

  useEffect(() => {
    if (isEditMode && userId) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ═══════════════════════════════════════════════════════════════
  // 📥 FETCH USER DATA FOR EDIT MODE
  // ═══════════════════════════════════════════════════════════════
  const fetchUserData = async () => {
    try {
      setFetchingUser(true);
      console.log("📥 Fetching user data for:", userId);

      const userDoc = await getDoc(doc(db, "users", userId!));

      if (!userDoc.exists()) {
        showToast("User not found", "error");
        navigate("/admin/users/all");
        return;
      }

      const userData = userDoc.data() as UserType;
      console.log("✅ User data loaded:", userData);

      // Type-safe mapping with validation
      const safeRole: UserRole =
        userData.role &&
        [
          "super_admin",
          "admin",
          "moderator",
          "creator",
          "premium",
          "viewer",
        ].includes(userData.role)
          ? userData.role
          : "viewer";

      const safeStatus: FormUserStatus =
        userData.status &&
        ["active", "banned", "suspended"].includes(userData.status)
          ? (userData.status as FormUserStatus)
          : "active";

      const safeSubscriptionStatus: FormSubscriptionStatus =
        userData.subscriptionStatus &&
        ["active", "inactive", "cancelled", "expired"].includes(
          userData.subscriptionStatus,
        )
          ? (userData.subscriptionStatus as FormSubscriptionStatus)
          : "inactive";

      setFormData({
        displayName: userData.displayName || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        password: "", // Never fetch password
        role: safeRole,
        status: safeStatus,
        isPremium: userData.isPremium || false,
        currentPlanId: userData.currentPlanId || "free",
        subscriptionStatus: safeSubscriptionStatus,
        maxDevices: userData.maxDevices || 3,
        maxProfiles: userData.maxProfiles || 5,
        rewardPoints: userData.rewardPoints || 0,
        emailVerified: userData.emailVerified || false,
        phoneVerified: userData.phoneVerified || false,
        kycVerified: userData.kycVerified || false,
        twoFactorEnabled: userData.twoFactorEnabled || false,
      });

      setFetchingUser(false);
    } catch (error) {
      console.error("❌ Error fetching user:", error);
      showToast("Failed to load user data", "error");
      setFetchingUser(false);
      navigate("/admin/users/all");
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ✅ FORM VALIDATION
  // ═══════════════════════════════════════════════════════════════
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Display Name
    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = "Display name must be at least 2 characters";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone Number (optional but validate if provided)
    if (
      formData.phoneNumber &&
      !/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = "Invalid phone number format";
    }

    // Password (required only for new users)
    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Max Devices
    if (formData.maxDevices < 1 || formData.maxDevices > 10) {
      newErrors.maxDevices = "Max devices must be between 1 and 10";
    }

    // Max Profiles
    if (formData.maxProfiles < 1 || formData.maxProfiles > 10) {
      newErrors.maxProfiles = "Max profiles must be between 1 and 10";
    }

    // Reward Points
    if (formData.rewardPoints < 0) {
      newErrors.rewardPoints = "Reward points cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ═══════════════════════════════════════════════════════════════
  // 💾 HANDLE FORM SUBMIT
  // ═══════════════════════════════════════════════════════════════
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix all errors before submitting", "error");
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        await handleUpdateUser();
      } else {
        await handleCreateUser();
      }
    } catch (error: any) {
      console.error("❌ Error submitting form:", error);
      showToast(error.message || "Failed to save user", "error");
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🆕 CREATE NEW USER
  // ═══════════════════════════════════════════════════════════════
  const handleCreateUser = async () => {
    try {
      console.log("🆕 Creating new user...");

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      const newUserId = userCredential.user.uid;
      console.log("✅ Firebase Auth user created:", newUserId);

      // Create Firestore user document
      const userDocData = {
        uid: newUserId,
        displayName: formData.displayName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim() || null,
        photoURL: null,
        role: formData.role,
        currentPlanId: formData.currentPlanId,
        isPremium: formData.isPremium,
        subscriptionPlanId: formData.isPremium ? formData.currentPlanId : null,
        subscriptionStatus: formData.subscriptionStatus,
        subscriptionStartDate: formData.isPremium ? serverTimestamp() : null,
        subscriptionEndDate: null,
        subscription: null,
        preferences: {
          language: "en",
          contentTypes: [],
          autoPlay: true,
          notificationsEnabled: true,
        },
        devices: [],
        maxDevices: formData.maxDevices,
        currentDeviceCount: 0,
        profiles: [],
        maxProfiles: formData.maxProfiles,
        currentProfileId: null,
        creatorProfile: null,
        stats: {
          totalWatchTime: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalViews: 0,
          favoritesCount: 0,
          watchlistCount: 0,
        },
        status: formData.status,
        emailVerified: formData.emailVerified,
        phoneVerified: formData.phoneVerified,
        kycVerified: formData.kycVerified,
        twoFactorEnabled: formData.twoFactorEnabled,
        rewardPoints: formData.rewardPoints,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: null,
        lastActive: null,
        referralCode: null,
        referredBy: null,
        moderation: null,
      };

      await setDoc(doc(db, "users", newUserId), userDocData);
      console.log("✅ Firestore user document created");

      // Create default profile
      const profileRef = doc(collection(db, "users", newUserId, "profiles"));
      await setDoc(profileRef, {
        name: formData.displayName.trim(),
        type: "Standard",
        avatar: "",
        isKid: false,
        language: "en",
        isDefault: true,
        createdAt: serverTimestamp(),
      });

      // Initialize userDevices
      await setDoc(doc(db, "userDevices", newUserId), {
        devices: [],
        maxDevices: formData.maxDevices,
        updatedAt: serverTimestamp(),
      });

      // Initialize userStream
      await setDoc(doc(db, "userStream", newUserId), {
        streams: [],
        updatedAt: serverTimestamp(),
      });

      console.log("✅ All user data initialized");

      showToast("User created successfully!", "success");
      setLoading(false);

      // Navigate to user view after 1.5 seconds
      setTimeout(() => {
        navigate(`/admin/users/view/${newUserId}`);
      }, 1500);
    } catch (error: any) {
      console.error("❌ Error creating user:", error);

      // Handle specific errors
      if (error.code === "auth/email-already-in-use") {
        setErrors({ email: "Email already in use" });
        throw new Error("Email already in use");
      } else if (error.code === "auth/invalid-email") {
        setErrors({ email: "Invalid email address" });
        throw new Error("Invalid email address");
      } else if (error.code === "auth/weak-password") {
        setErrors({ password: "Password is too weak" });
        throw new Error("Password is too weak");
      }

      throw error;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ✏️ UPDATE EXISTING USER
  // ═══════════════════════════════════════════════════════════════
  const handleUpdateUser = async () => {
    try {
      console.log("✏️ Updating user:", userId);

      const userRef = doc(db, "users", userId!);

      const updateData: any = {
        displayName: formData.displayName.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
        role: formData.role,
        currentPlanId: formData.currentPlanId,
        isPremium: formData.isPremium,
        subscriptionStatus: formData.subscriptionStatus,
        maxDevices: formData.maxDevices,
        maxProfiles: formData.maxProfiles,
        status: formData.status,
        emailVerified: formData.emailVerified,
        phoneVerified: formData.phoneVerified,
        kycVerified: formData.kycVerified,
        twoFactorEnabled: formData.twoFactorEnabled,
        rewardPoints: formData.rewardPoints,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userRef, updateData);
      console.log("✅ User updated successfully");

      // Update userDevices maxDevices if changed
      const devicesRef = doc(db, "userDevices", userId!);
      await updateDoc(devicesRef, {
        maxDevices: formData.maxDevices,
        updatedAt: serverTimestamp(),
      }).catch(() => {
        // If document doesn't exist, create it
        setDoc(devicesRef, {
          devices: [],
          maxDevices: formData.maxDevices,
          updatedAt: serverTimestamp(),
        });
      });

      showToast("User updated successfully!", "success");
      setLoading(false);

      // Navigate to user view after 1.5 seconds
      setTimeout(() => {
        navigate(`/admin/users/view/${userId}`);
      }, 1500);
    } catch (error: any) {
      console.error("❌ Error updating user:", error);
      throw error;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🔑 SEND PASSWORD RESET EMAIL (Edit Mode Only)
  // ═══════════════════════════════════════════════════════════════
  const handleResetPassword = async () => {
    if (!formData.email) {
      showToast("Email is required to reset password", "error");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, formData.email);
      showToast("Password reset email sent successfully!", "success");
    } catch (error: any) {
      console.error("❌ Error sending reset email:", error);
      showToast("Failed to send password reset email", "error");
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🛠️ HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning",
  ) => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Get role description safely
  const getRoleDescription = (role: UserRole): string => {
    const roleKey = role as keyof typeof ROLE_CONFIGS;
    return ROLE_CONFIGS[roleKey]?.description || "User role";
  };

  // ═══════════════════════════════════════════════════════════════
  // 🎨 LOADING STATE
  // ═══════════════════════════════════════════════════════════════
  if (fetchingUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-600 dark:text-slate-400 font-semibold">
          Loading user data...
        </p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen w-full pb-8">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className="space-y-6 w-full">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate("/admin/users/all")}
                  className="p-3 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-white/30 transition-all"
                >
                  <ArrowLeft size={24} />
                </motion.button>
                <div>
                  <h1 className="text-4xl font-black mb-2">
                    {isEditMode ? "Edit User" : "Add New User"}
                  </h1>
                  <p className="text-white/90">
                    {isEditMode
                      ? "Update user information and permissions"
                      : "Create a new user account"}
                  </p>
                </div>
              </div>

              {isEditMode && (
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl font-bold">
                    ID: {userId?.slice(0, 8)}...
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* BASIC INFORMATION */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <User size={24} className="text-blue-500" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${
                      errors.displayName
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white`}
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.displayName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    disabled={isEditMode}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${
                      errors.email
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white ${
                      isEditMode ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+91 1234567890"
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${
                      errors.phoneNumber
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white`}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Password {!isEditMode && "*"}
                    {isEditMode && (
                      <span className="text-xs text-slate-500 ml-2">
                        (Leave empty to keep current)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={isEditMode ? "••••••••" : "Min 6 characters"}
                      className={`w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 border ${
                        errors.password
                          ? "border-red-500"
                          : "border-slate-200 dark:border-slate-700"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.password}
                    </p>
                  )}
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="mt-2 text-sm text-blue-500 hover:text-blue-600 font-semibold"
                    >
                      Send Password Reset Email
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ROLE & PERMISSIONS */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Shield size={24} className="text-purple-500" />
                Role & Permissions
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    User Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  >
                    {Object.entries(ROLE_CONFIGS).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.name} - {config.description}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {getRoleDescription(formData.role)}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Account Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  >
                    <option value="active">Active - Full Access</option>
                    <option value="suspended">
                      Suspended - Limited Access
                    </option>
                    <option value="banned">Banned - No Access</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SUBSCRIPTION & PREMIUM */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Crown size={24} className="text-yellow-500" />
                Subscription & Premium
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Is Premium */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                    <input
                      type="checkbox"
                      name="isPremium"
                      checked={formData.isPremium}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">
                        Premium Member
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Grant premium access and features
                      </p>
                    </div>
                  </label>
                </div>

                {/* Current Plan */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Current Plan
                  </label>
                  <select
                    name="currentPlanId"
                    value={formData.currentPlanId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subscription Status */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Subscription Status
                  </label>
                  <select
                    name="subscriptionStatus"
                    value={formData.subscriptionStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>

            {/* LIMITS & SETTINGS */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Calendar size={24} className="text-green-500" />
                Limits & Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Max Devices */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Max Devices *
                  </label>
                  <input
                    type="number"
                    name="maxDevices"
                    value={formData.maxDevices}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${
                      errors.maxDevices
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white`}
                  />
                  {errors.maxDevices && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.maxDevices}
                    </p>
                  )}
                </div>

                {/* Max Profiles */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Max Profiles *
                  </label>
                  <input
                    type="number"
                    name="maxProfiles"
                    value={formData.maxProfiles}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${
                      errors.maxProfiles
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white`}
                  />
                  {errors.maxProfiles && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.maxProfiles}
                    </p>
                  )}
                </div>

                {/* Reward Points */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Reward Points
                  </label>
                  <input
                    type="number"
                    name="rewardPoints"
                    value={formData.rewardPoints}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${
                      errors.rewardPoints
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white`}
                  />
                  {errors.rewardPoints && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.rewardPoints}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* VERIFICATION FLAGS */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <CheckCircle size={24} className="text-teal-500" />
                Verification & Security
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Verified */}
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                  <input
                    type="checkbox"
                    name="emailVerified"
                    checked={formData.emailVerified}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      Email Verified
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Mark email as verified
                    </p>
                  </div>
                </label>

                {/* Phone Verified */}
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                  <input
                    type="checkbox"
                    name="phoneVerified"
                    checked={formData.phoneVerified}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      Phone Verified
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Mark phone as verified
                    </p>
                  </div>
                </label>

                {/* KYC Verified */}
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                  <input
                    type="checkbox"
                    name="kycVerified"
                    checked={formData.kycVerified}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      KYC Verified
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Mark KYC as verified
                    </p>
                  </div>
                </label>

                {/* 2FA Enabled */}
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                  <input
                    type="checkbox"
                    name="twoFactorEnabled"
                    checked={formData.twoFactorEnabled}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Enable 2FA for this user
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* FORM ACTIONS */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/admin/users/all")}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {isEditMode ? "Update User" : "Create User"}
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddEditUser;
