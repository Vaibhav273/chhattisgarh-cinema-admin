import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
    type User as FirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { type User } from '../types/user';
import { type UserRole } from '../types/roles';

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
    const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
        try {
            console.log('Fetching user data for:', firebaseUser.uid);

            // Get ID token with custom claims
            const idTokenResult = await firebaseUser.getIdTokenResult();
            console.log('Custom claims:', idTokenResult.claims);

            // Get user document from Firestore
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                console.error('User document not found in Firestore');
                return null;
            }

            const firestoreData = userDoc.data();
            console.log('Firestore user data:', firestoreData);

            // ✅ PROPERLY COMBINE ALL DATA
            const userData: User = {
                // Core identity
                uid: firebaseUser.uid,
                email: firebaseUser.email || firestoreData.email || '',
                displayName: firebaseUser.displayName || firestoreData.displayName || '',
                phoneNumber: firebaseUser.phoneNumber || firestoreData.phoneNumber || null,
                photoURL: firebaseUser.photoURL || firestoreData.photoURL || null,

                // Role & permissions
                role: (idTokenResult.claims.role as UserRole) || firestoreData.role || 'viewer',

                // Subscription info
                currentPlanId: firestoreData.currentPlanId || 'free',
                isPremium: firestoreData.isPremium || false,
                subscription: firestoreData.subscription || undefined,

                // Preferences
                preferences: firestoreData.preferences || {
                    language: 'en',
                    contentTypes: [],
                    autoPlay: true,
                    notificationsEnabled: true,
                },

                // Optional fields
                devices: firestoreData.devices || [],
                maxDevices: firestoreData.maxDevices || 1,
                currentDeviceCount: firestoreData.currentDeviceCount || 0,
                profiles: firestoreData.profiles || [],
                maxProfiles: firestoreData.maxProfiles || 1,
                currentProfileId: firestoreData.currentProfileId || undefined,

                // Stats
                stats: firestoreData.stats || {
                    totalWatchTime: 0,
                    totalViews: 0,
                    totalLikes: 0,
                    totalComments: 0,
                    favoriteGenres: [],
                    favoriteLanguages: [],
                },

                // Security & status
                status: firestoreData.status || 'active',
                emailVerified: firebaseUser.emailVerified || false,
                phoneVerified: firestoreData.phoneVerified || false,
                twoFactorEnabled: firestoreData.twoFactorEnabled || false,

                // Timestamps
                createdAt: firestoreData.createdAt,
                updatedAt: firestoreData.updatedAt,
                lastLogin: firestoreData.lastLogin,
                lastActive: firestoreData.lastActive,

                // Creator profile (if exists)
                creatorProfile: firestoreData.creatorProfile || undefined,

                // Moderation (if exists)
                moderation: firestoreData.moderation || undefined,
            };

            return userData;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // 🔐 SIGN IN
    // ═══════════════════════════════════════════════════════════════
    const signIn = async (email: string, password: string) => {
        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userData = await fetchUserData(userCredential.user);

            if (!userData) {
                throw new Error('Failed to fetch user data');
            }

            setUser(userData);
            setFirebaseUser(userCredential.user);
        } catch (error: any) {
            console.error('Sign in error:', error);
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
            console.error('Sign out error:', error);
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
        console.log('Setting up auth state listener...');

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('Auth state changed:', firebaseUser?.uid);

            if (firebaseUser) {
                setFirebaseUser(firebaseUser);
                const userData = await fetchUserData(firebaseUser);

                if (userData) {
                    console.log('User data loaded:', userData);
                    setUser(userData);
                } else {
                    console.error('Failed to load user data');
                    setUser(null);
                }
            } else {
                console.log('No user signed in');
                setUser(null);
                setFirebaseUser(null);
            }

            setLoading(false);
        });

        return () => {
            console.log('Cleaning up auth state listener');
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

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// ═══════════════════════════════════════════════════════════════
// 🪝 USE AUTH HOOK
// ═══════════════════════════════════════════════════════════════
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
