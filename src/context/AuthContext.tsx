import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { type User } from "../types/user";
import { type UserRole } from "../types/roles";

// ═══════════════════════════════════════════════════════════════
// 🎯 AUTH CONTEXT TYPE
// ═══════════════════════════════════════════════════════════════
interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════
// 🎯 AUTH PROVIDER
// ═══════════════════════════════════════════════════════════════
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ═══════════════════════════════════════════════════════════════
  // 🔄 FETCH USER DATA FROM FIRESTORE
  // ═══════════════════════════════════════════════════════════════
  const fetchUserData = async (
    firebaseUser: FirebaseUser,
  ): Promise<User | null> => {
    try {
      console.log("Fetching user data for:", firebaseUser.uid);

      // Get ID token with custom claims
      const idTokenResult = await firebaseUser.getIdTokenResult();
      console.log("Custom claims:", idTokenResult.claims);

      // ✅ CHECK 1: Try admins collection first (for admin users)
      const adminDocRef = doc(db, "admins", firebaseUser.uid);
      const adminDoc = await getDoc(adminDocRef);

      if (adminDoc.exists()) {
        console.log("✅ Found in admins collection");
        const adminData = adminDoc.data();

        // ✅ Convert AdminUser to User format
        const userData: User = {
          // Core identity
          uid: firebaseUser.uid,
          email: firebaseUser.email || adminData.email || "",
          displayName: adminData.displayName || adminData.name || "",
          phoneNumber: adminData.phone || null,
          photoURL: adminData.photoURL || firebaseUser.photoURL || null,

          // Role from custom claims or document
          role:
            (idTokenResult.claims.role as UserRole) ||
            adminData.role ||
            "viewer",

          // Admin-specific fields mapped to User
          currentPlanId: "admin", // Admins don't have plans
          isPremium: true, // Admins have premium access

          // Preferences (default for admins)
          preferences: {
            language: "en",
            contentTypes: [],
            autoPlay: true,
            notificationsEnabled: true,
          },

          // Device/Profile limits (not applicable to admins)
          devices: [],
          maxDevices: 99,
          currentDeviceCount: 0,
          profiles: [],
          maxProfiles: 99,

          // Stats (default)
          stats: {
            totalWatchTime: 0,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            favoriteGenres: [],
            favoriteLanguages: [],
          },

          // Status
          status: adminData.status || "active",
          emailVerified: firebaseUser.emailVerified || true,
          phoneVerified: false,
          twoFactorEnabled: adminData.twoFactorEnabled || false,

          // Timestamps
          createdAt: adminData.createdAt,
          updatedAt: adminData.updatedAt,
          lastLogin: adminData.lastLogin,
          lastActive: adminData.lastActive,
        };

        console.log("✅ Admin user data loaded:", userData);
        return userData;
      }

      // ✅ CHECK 2: Try users collection (for regular users)
      console.log("Not in admins, checking users collection...");
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.error("User document not found in either collection");
        return null;
      }

      const firestoreData = userDoc.data();
      console.log("✅ Found in users collection");

      // Regular user data mapping
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || firestoreData.email || "",
        displayName:
          firebaseUser.displayName || firestoreData.displayName || "",
        phoneNumber:
          firebaseUser.phoneNumber || firestoreData.phoneNumber || null,
        photoURL: firebaseUser.photoURL || firestoreData.photoURL || null,

        role:
          (idTokenResult.claims.role as UserRole) ||
          firestoreData.role ||
          "viewer",

        currentPlanId: firestoreData.currentPlanId || "free",
        isPremium: firestoreData.isPremium || false,
        subscription: firestoreData.subscription || undefined,

        preferences: firestoreData.preferences || {
          language: "en",
          contentTypes: [],
          autoPlay: true,
          notificationsEnabled: true,
        },

        devices: firestoreData.devices || [],
        maxDevices: firestoreData.maxDevices || 1,
        currentDeviceCount: firestoreData.currentDeviceCount || 0,
        profiles: firestoreData.profiles || [],
        maxProfiles: firestoreData.maxProfiles || 1,
        currentProfileId: firestoreData.currentProfileId || undefined,

        stats: firestoreData.stats || {
          totalWatchTime: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          favoriteGenres: [],
          favoriteLanguages: [],
        },

        status: firestoreData.status || "active",
        emailVerified: firebaseUser.emailVerified || false,
        phoneVerified: firestoreData.phoneVerified || false,
        twoFactorEnabled: firestoreData.twoFactorEnabled || false,

        createdAt: firestoreData.createdAt,
        updatedAt: firestoreData.updatedAt,
        lastLogin: firestoreData.lastLogin,
        lastActive: firestoreData.lastActive,

        creatorProfile: firestoreData.creatorProfile || undefined,
        moderation: firestoreData.moderation || undefined,
      };

      console.log("✅ User data loaded:", userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🔐 SIGN IN
  // ═══════════════════════════════════════════════════════════════
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const userData = await fetchUserData(userCredential.user);

      if (!userData) {
        throw new Error("Failed to fetch user data");
      }

      setUser(userData);
      setFirebaseUser(userCredential.user);
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🚪 SIGN OUT
  // ═══════════════════════════════════════════════════════════════
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🔄 REFRESH USER DATA
  // ═══════════════════════════════════════════════════════════════
  const refreshUser = async () => {
    if (firebaseUser) {
      const userData = await fetchUserData(firebaseUser);
      if (userData) {
        setUser(userData);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 👂 AUTH STATE LISTENER
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    console.log("Setting up auth state listener...");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser?.uid);

      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        const userData = await fetchUserData(firebaseUser);

        if (userData) {
          console.log("User data loaded:", userData);
          setUser(userData);
        } else {
          console.error("Failed to load user data");
          setUser(null);
        }
      } else {
        console.log("No user signed in");
        setUser(null);
        setFirebaseUser(null);
      }

      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // 📦 PROVIDE CONTEXT
  // ═══════════════════════════════════════════════════════════════
  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ═══════════════════════════════════════════════════════════════
// 🪝 USE AUTH HOOK
// ═══════════════════════════════════════════════════════════════
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
