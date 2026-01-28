// ═══════════════════════════════════════════════════════════════
// ✏️ ADD/EDIT USER - ENHANCED WITH SUBSCRIPTION MANAGEMENT
// ═══════════════════════════════════════════════════════════════

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
  Calendar,
  Plus,
  Minus,
  Gift,
  Send,
  History,
  Zap,
} from "lucide-react";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
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
// 📝 LOCAL TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════
type FormUserStatus = "active" | "banned" | "suspended";
type FormSubscriptionStatus = "active" | "inactive" | "cancelled" | "expired";

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
  subscriptionEndDate: Date | null;
  maxDevices: number;
  maxProfiles: number;
  rewardPoints: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  kycVerified: boolean;
  twoFactorEnabled: boolean;
}

// ✅ NEW: Activity Log Entry
interface ActivityLogEntry {
  action: string;
  timestamp: any;
  performedBy: string;
  details: string;
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

  // ✅ NEW: Activity Log State
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [showActivityLog, setShowActivityLog] = useState(false);

  // ✅ NEW: Subscription Management State
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [extendMonths, setExtendMonths] = useState(1);

  // Toast State
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
  });

  // Form Data
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
    subscriptionEndDate: null,
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
    { id: "free", name: "Free", price: 0, duration: 0 },
    { id: "basic", name: "Basic", price: 199, duration: 1 },
    { id: "standard", name: "Standard", price: 499, duration: 3 },
    { id: "premium", name: "Premium", price: 999, duration: 12 },
  ];

  useEffect(() => {
    if (isEditMode && userId) {
      fetchUserData();
      fetchActivityLog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const toSafeDate = (value: any): Date | null => {
    if (!value) return null;

    // If it's a Firestore Timestamp
    if (value.toDate && typeof value.toDate === 'function') {
      return value.toDate();
    }

    // If it's a string
    if (typeof value === 'string') {
      return new Date(value);
    }

    // If it's already a Date
    if (value instanceof Date) {
      return value;
    }

    return null;
  };
  // ═══════════════════════════════════════════════════════════════
  // 📥 FETCH USER DATA
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
        password: "",
        role: safeRole,
        status: safeStatus,
        isPremium: userData.isPremium || false,
        currentPlanId: userData.currentPlanId || "free",
        subscriptionStatus: safeSubscriptionStatus,
        subscriptionEndDate: toSafeDate(userData.subscriptionEndDate),
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
  // ✅ NEW: FETCH ACTIVITY LOG
  // ═══════════════════════════════════════════════════════════════
  const fetchActivityLog = async () => {
    try {
      const activityQuery = query(
        collection(db, "users", userId!, "activityLog"),
        orderBy("timestamp", "desc"),
        limit(20)
      );
      const activitySnapshot = await getDocs(activityQuery);
      const activities = activitySnapshot.docs.map((doc) => doc.data()) as ActivityLogEntry[];
      setActivityLog(activities);
    } catch (error) {
      console.error("Error fetching activity log:", error);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ✅ FORM VALIDATION
  // ═══════════════════════════════════════════════════════════════
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = "Display name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (
      formData.phoneNumber &&
      !/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = "Invalid phone number format";
    }

    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.maxDevices < 1 || formData.maxDevices > 10) {
      newErrors.maxDevices = "Max devices must be between 1 and 10";
    }

    if (formData.maxProfiles < 1 || formData.maxProfiles > 10) {
      newErrors.maxProfiles = "Max profiles must be between 1 and 10";
    }

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

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      const newUserId = userCredential.user.uid;
      console.log("✅ Firebase Auth user created:", newUserId);

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
        subscriptionEndDate: formData.subscriptionEndDate
          ? Timestamp.fromDate(formData.subscriptionEndDate)
          : null,
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

      // ✅ NEW: Log activity
      await addDoc(collection(db, "users", newUserId, "activityLog"), {
        action: "User Created",
        timestamp: serverTimestamp(),
        performedBy: "Admin",
        details: "User account created by admin",
      });

      console.log("✅ All user data initialized");

      showToast("User created successfully!", "success");
      setLoading(false);

      setTimeout(() => {
        navigate(`/admin/users/all`);
      }, 1500);
    } catch (error: any) {
      console.error("❌ Error creating user:", error);

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
        subscriptionEndDate: formData.subscriptionEndDate
          ? Timestamp.fromDate(formData.subscriptionEndDate)
          : null,
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

      // Update userDevices
      const devicesRef = doc(db, "userDevices", userId!);
      await updateDoc(devicesRef, {
        maxDevices: formData.maxDevices,
        updatedAt: serverTimestamp(),
      }).catch(() => {
        setDoc(devicesRef, {
          devices: [],
          maxDevices: formData.maxDevices,
          updatedAt: serverTimestamp(),
        });
      });

      // ✅ NEW: Log activity
      await addDoc(collection(db, "users", userId!, "activityLog"), {
        action: "User Updated",
        timestamp: serverTimestamp(),
        performedBy: "Admin",
        details: "User account updated by admin",
      });

      showToast("User updated successfully!", "success");
      setLoading(false);

      setTimeout(() => {
        navigate(`/admin/users/all`);
      }, 1500);
    } catch (error: any) {
      console.error("❌ Error updating user:", error);
      throw error;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ✅ NEW: EXTEND SUBSCRIPTION
  // ═══════════════════════════════════════════════════════════════
  const handleExtendSubscription = async () => {
    try {
      const newEndDate = new Date(formData.subscriptionEndDate || new Date());
      newEndDate.setMonth(newEndDate.getMonth() + extendMonths);

      const userRef = doc(db, "users", userId!);
      await updateDoc(userRef, {
        subscriptionEndDate: Timestamp.fromDate(newEndDate),
        subscriptionStatus: "active",
        isPremium: true,
        updatedAt: serverTimestamp(),
      });

      // Log activity
      await addDoc(collection(db, "users", userId!, "activityLog"), {
        action: "Subscription Extended",
        timestamp: serverTimestamp(),
        performedBy: "Admin",
        details: `Subscription extended by ${extendMonths} month(s)`,
      });

      setFormData({
        ...formData,
        subscriptionEndDate: newEndDate,
        subscriptionStatus: "active",
        isPremium: true,
      });

      showToast(`Subscription extended by ${extendMonths} month(s)!`, "success");
      setShowSubscriptionModal(false);
      fetchActivityLog();
    } catch (error) {
      console.error("Error extending subscription:", error);
      showToast("Failed to extend subscription", "error");
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ✅ NEW: GRANT FREE TRIAL
  // ═══════════════════════════════════════════════════════════════
  const handleGrantFreeTrial = async () => {
    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial

      const userRef = doc(db, "users", userId!);
      await updateDoc(userRef, {
        subscriptionEndDate: Timestamp.fromDate(trialEndDate),
        subscriptionStatus: "active",
        isPremium: true,
        currentPlanId: "trial",
        updatedAt: serverTimestamp(),
      });

      // Log activity
      await addDoc(collection(db, "users", userId!, "activityLog"), {
        action: "Free Trial Granted",
        timestamp: serverTimestamp(),
        performedBy: "Admin",
        details: "7-day free trial granted by admin",
      });

      setFormData({
        ...formData,
        subscriptionEndDate: trialEndDate,
        subscriptionStatus: "active",
        isPremium: true,
        currentPlanId: "trial",
      });

      showToast("7-day free trial granted!", "success");
      fetchActivityLog();
    } catch (error) {
      console.error("Error granting free trial:", error);
      showToast("Failed to grant free trial", "error");
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ✅ NEW: ADD REWARD POINTS
  // ═══════════════════════════════════════════════════════════════
  const handleAddRewardPoints = async (points: number) => {
    try {
      const newPoints = formData.rewardPoints + points;

      const userRef = doc(db, "users", userId!);
      await updateDoc(userRef, {
        rewardPoints: newPoints,
        updatedAt: serverTimestamp(),
      });

      // Log activity
      await addDoc(collection(db, "users", userId!, "activityLog"), {
        action: "Reward Points Added",
        timestamp: serverTimestamp(),
        performedBy: "Admin",
        details: `${points} reward points added by admin`,
      });

      setFormData({ ...formData, rewardPoints: newPoints });
      showToast(`${points} reward points added!`, "success");
      fetchActivityLog();
    } catch (error) {
      console.error("Error adding reward points:", error);
      showToast("Failed to add reward points", "error");
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🔑 SEND PASSWORD RESET EMAIL
  // ═══════════════════════════════════════════════════════════════
  const handleResetPassword = async () => {
    if (!formData.email) {
      showToast("Email is required to reset password", "error");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, formData.email);
      showToast("Password reset email sent successfully!", "success");

      // Log activity
      if (isEditMode) {
        await addDoc(collection(db, "users", userId!, "activityLog"), {
          action: "Password Reset Sent",
          timestamp: serverTimestamp(),
          performedBy: "Admin",
          details: "Password reset email sent by admin",
        });
        fetchActivityLog();
      }
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
    } else if (type === "date") {
      setFormData((prev) => ({ ...prev, [name]: value ? new Date(value) : null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const getRoleDescription = (role: UserRole): string => {
    const roleKey = role as keyof typeof ROLE_CONFIGS;
    return ROLE_CONFIGS[roleKey]?.description || "User role";
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatActivityTimestamp = (timestamp: any): string => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

      {/* ✅ NEW: Subscription Extension Modal */}
      {showSubscriptionModal && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSubscriptionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
                <h3 className="text-2xl font-black">Extend Subscription</h3>
                <p className="text-white/90 mt-1">Add more months to subscription</p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Current End Date
                  </label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-slate-800 dark:text-white font-bold">
                      {formatDate(formData.subscriptionEndDate)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Extend by (months)
                  </label>
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setExtendMonths(Math.max(1, extendMonths - 1))}
                      className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center"
                    >
                      <Minus size={20} />
                    </motion.button>
                    <input
                      type="number"
                      value={extendMonths}
                      onChange={(e) => setExtendMonths(parseInt(e.target.value) || 1)}
                      min="1"
                      max="12"
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold text-xl text-slate-800 dark:text-white"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setExtendMonths(Math.min(12, extendMonths + 1))}
                      className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center"
                    >
                      <Plus size={20} />
                    </motion.button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[1, 3, 6, 12].map((months) => (
                      <button
                        key={months}
                        onClick={() => setExtendMonths(months)}
                        className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${extendMonths === months
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                      >
                        {months}M
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    New end date will be: <strong>{formatDate(new Date(new Date(formData.subscriptionEndDate || new Date()).setMonth(new Date(formData.subscriptionEndDate || new Date()).getMonth() + extendMonths)))}</strong>
                  </p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSubscriptionModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExtendSubscription}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold"
                >
                  Extend
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

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
                  {/* ✅ NEW: Activity Log Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowActivityLog(!showActivityLog)}
                    className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl font-bold flex items-center gap-2"
                  >
                    <History size={20} />
                    Activity
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ✅ NEW: ACTIVITY LOG (Edit Mode Only) */}
        {isEditMode && showActivityLog && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6"
          >
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <History size={20} className="text-purple-500" />
              Activity Log
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activityLog.length > 0 ? (
                activityLog.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-start gap-3"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 dark:text-white">{log.action}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{log.details}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {formatActivityTimestamp(log.timestamp)} • by {log.performedBy}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No activity log found
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ✅ NEW: QUICK ACTIONS (Edit Mode Only) */}
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap size={20} />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSubscriptionModal(true)}
                className="px-4 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center justify-center gap-2"
              >
                <Calendar size={18} />
                Extend Sub
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGrantFreeTrial}
                className="px-4 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center justify-center gap-2"
              >
                <Gift size={18} />
                Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddRewardPoints(100)}
                className="px-4 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                +100 Points
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetPassword}
                className="px-4 py-3 bg-white/20 backdrop-blur-xl rounded-xl font-bold hover:bg-white/30 transition-all flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Reset Pass
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isEditMode ? 0.2 : 0.1 }}
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
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.displayName
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
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.email
                      ? "border-red-500"
                      : "border-slate-200 dark:border-slate-700"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white ${isEditMode ? "opacity-50 cursor-not-allowed" : ""
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
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.phoneNumber
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
                      className={`w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 border ${errors.password
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
                        {plan.name} {plan.price > 0 && `- ₹${plan.price}`}
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

                {/* ✅ NEW: Subscription End Date */}
                {formData.isPremium && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Subscription End Date
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="date"
                        name="subscriptionEndDate"
                        value={formData.subscriptionEndDate ? new Date(formData.subscriptionEndDate).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                      />
                      {isEditMode && (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowSubscriptionModal(true)}
                          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold flex items-center gap-2"
                        >
                          <Plus size={18} />
                          Extend
                        </motion.button>
                      )}
                    </div>
                    {formData.subscriptionEndDate && (
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Expires: {formatDate(formData.subscriptionEndDate)}
                      </p>
                    )}
                  </div>
                )}
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
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.maxDevices
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
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.maxProfiles
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
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="rewardPoints"
                      value={formData.rewardPoints}
                      onChange={handleInputChange}
                      min="0"
                      className={`flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.rewardPoints
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white`}
                    />
                    {isEditMode && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddRewardPoints(50)}
                        className="px-3 py-3 bg-green-500 text-white rounded-xl"
                        title="Add 50 points"
                      >
                        <Plus size={20} />
                      </motion.button>
                    )}
                  </div>
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
                      Enable 2FA for this account
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* SUBMIT BUTTONS */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/admin/users/all")}
                disabled={loading}
                className="px-8 py-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save size={24} />
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
