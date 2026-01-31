import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Film,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getCountFromServer, doc, getDoc } from 'firebase/firestore';
import { message } from 'antd';
import { auth, db } from '../../config/firebase';
import { canAccessAdminPanel, type UserRole } from '../../types';
import { logLogin, logError } from '../../utils/activityLogger';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Stats
    const [moviesCount, setMoviesCount] = useState<number | null>(null);
    const [seriesCount, setSeriesCount] = useState<number | null>(null);
    const [shortFilmsCount, setShortFilmsCount] = useState<number | null>(null);

    // ═══════════════════════════════════════════════════════════════
    // 📊 LOAD COUNTS
    // ═══════════════════════════════════════════════════════════════
    useEffect(() => {
        const loadCounts = async () => {
            try {
                const [moviesSnap, seriesSnap, shortFilmsSnap] = await Promise.all([
                    getCountFromServer(collection(db, 'movies')),
                    getCountFromServer(collection(db, 'webseries')),
                    getCountFromServer(collection(db, 'shortfilms')),
                ]);

                setMoviesCount(moviesSnap.data().count);
                setSeriesCount(seriesSnap.data().count);
                setShortFilmsCount(shortFilmsSnap.data().count);
            } catch (err) {
                console.error('Error loading counts:', err);
            }
        };
        loadCounts();
    }, []);

    // ═══════════════════════════════════════════════════════════════
    // 🔐 CHECK ADMIN ACCESS
    // ═══════════════════════════════════════════════════════════════
    const checkAdminAccess = async (uid: string, userEmail: string) => {
        try {
            console.log('═══════════════════════════════════════════');
            console.log('🔐 CHECKING ADMIN ACCESS');
            console.log('═══════════════════════════════════════════');
            console.log('User ID:', uid);
            console.log('Email:', userEmail);

            // Check in admins collection
            const adminDocRef = doc(db, 'admins', uid);
            const adminDoc = await getDoc(adminDocRef);

            if (adminDoc.exists()) {
                const adminData = adminDoc.data();
                const userRole = adminData.role as UserRole;

                console.log('✅ Admin document found');
                console.log('Role:', userRole);

                // Check if role has admin panel access
                if (canAccessAdminPanel(userRole)) {
                    console.log('✅ Admin access granted!');
                    console.log('═══════════════════════════════════════════');

                    // ✅ LOG SUCCESSFUL LOGIN
                    await logLogin(userEmail, userRole, {
                        uid,
                        name: adminData.name || adminData.displayName,
                        loginMethod: 'email/password',
                        ipAddress: 'N/A', // You can add IP detection if needed
                    });

                    message.success(`Welcome ${adminData.name || adminData.displayName || userEmail}! 🎉`);
                    navigate('/admin/dashboard');
                    return true;
                } else {
                    console.log('❌ Role does not have admin access:', userRole);
                    console.log('═══════════════════════════════════════════');

                    // ❌ LOG ACCESS DENIED
                    await logError(
                        'Authentication',
                        'Access denied - Insufficient permissions',
                        {
                            email: userEmail,
                            uid,
                            role: userRole,
                            reason: 'Role does not have admin panel access',
                        }
                    );

                    setError('Access Denied: Your role does not have admin panel access.');
                    await auth.signOut();
                    return false;
                }
            } else {
                console.log('❌ Not found in admins collection');
                console.log('═══════════════════════════════════════════');

                // ❌ LOG UNAUTHORIZED ACCESS ATTEMPT
                await logError(
                    'Authentication',
                    'Unauthorized access attempt - Not in admins collection',
                    {
                        email: userEmail,
                        uid,
                        reason: 'User not found in admins collection',
                    }
                );

                setError('Access Denied: You are not an authorized Admin.');
                await auth.signOut();
                return false;
            }
        } catch (error: any) {
            console.error('❌ Error checking admin access:', error);
            console.log('═══════════════════════════════════════════');

            // ❌ LOG ERROR
            await logError(
                'Authentication',
                'Error verifying admin access',
                {
                    email: userEmail,
                    uid,
                    error: error.message,
                    stack: error.stack,
                }
            );

            setError('Error verifying admin access. Please try again.');
            await auth.signOut();
            return false;
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // 📝 LOGIN HANDLER
    // ═══════════════════════════════════════════════════════════════
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('═══════════════════════════════════════════');
        console.log('🚀 LOGIN ATTEMPT');
        console.log('═══════════════════════════════════════════');
        console.log('Email:', email);

        try {
            // Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log('✅ Firebase Auth successful');
            console.log('User ID:', user.uid);

            // Check admin access
            await checkAdminAccess(user.uid, user.email || email);
        } catch (error: any) {
            console.error('❌ Login error:', error);
            console.log('Error code:', error.code);
            console.log('═══════════════════════════════════════════');

            let errorMessage = '';

            // User-friendly error messages
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email address.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password. Please try again.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address format.';
            } else if (error.code === 'auth/user-disabled') {
                errorMessage = 'This account has been disabled. Contact support.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Please try again later.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = 'Invalid credentials. Please check your email and password.';
            } else {
                errorMessage = 'Login failed. Please check your credentials and try again.';
            }

            setError(errorMessage);

            // ❌ LOG FAILED LOGIN ATTEMPT
            await logError(
                'Authentication',
                `Login failed: ${errorMessage}`,
                {
                    email,
                    errorCode: error.code,
                    errorMessage: error.message,
                    attemptedAt: new Date().toISOString(),
                }
            );
        } finally {
            setLoading(false);
        }
    };

    const displayNumber = (value: number | null, fallback: string) => {
        return value !== null ? value.toString() : fallback;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex font-Poppins relative overflow-hidden">
            {/* LEFT SIDE */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-3">
                            CG Cinema
                        </h1>
                        <h2 className="text-3xl font-bold text-white mb-2">Admin Panel</h2>
                        <p className="text-slate-400 text-lg">Manage your cinema empire</p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 bg-red-900/20 border border-red-700/50 rounded-xl p-4 flex items-start gap-3"
                            >
                                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-red-300 text-sm">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-slate-300 font-semibold mb-2 text-sm">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white focus:border-amber-500 outline-none transition-all"
                                    placeholder="admin@chhattisgarhcinema.com"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-300 font-semibold mb-2 text-sm">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-12 py-4 text-white focus:border-amber-500 outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-900/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <LogIn size={20} />
                            )}
                            <span>{loading ? 'Signing in...' : 'Admin Login'}</span>
                        </motion.button>
                    </form>
                </motion.div>
            </div>

            {/* RIGHT SIDE */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574267432644-f770f8f5b7c5?w=1920&q=80')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 via-slate-900/80 to-orange-900/60" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 text-center">
                    <Film size={60} className="text-amber-400 mb-6" />
                    <h2 className="text-5xl font-black text-white mb-4">
                        Control Your <br /> <span className="text-amber-400">Cinema Empire</span>
                    </h2>
                    <div className="grid grid-cols-3 gap-8 mt-8">
                        <div className="text-center">
                            <p className="text-3xl font-black text-amber-400">{displayNumber(moviesCount, '200+')}</p>
                            <p className="text-slate-400">Movies</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-amber-400">{displayNumber(seriesCount, '50+')}</p>
                            <p className="text-slate-400">Series</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-amber-400">{displayNumber(shortFilmsCount, '100+')}</p>
                            <p className="text-slate-400">Short Films</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
