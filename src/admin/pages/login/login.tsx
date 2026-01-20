import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Film,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword
} from 'firebase/auth';
import {
  collection, getCountFromServer, doc, getDoc
} from 'firebase/firestore';
import { auth, db } from '../../../config/firebase'; // Path check कर लेना
import { message } from 'antd';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Right side stats states
  const [moviesCount, setMoviesCount] = useState<number | null>(null);
  const [seriesCount, setSeriesCount] = useState<number | null>(null);

  // Load Firestore counts (Original logic)
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const moviesSnap = await getCountFromServer(collection(db, 'movies'));
        setMoviesCount(moviesSnap.data().count);
        const seriesSnap = await getCountFromServer(collection(db, 'webseries'));
        setSeriesCount(seriesSnap.data().count);
      } catch (err) {
        console.error('Error loading counts', err);
      }
    };
    loadCounts();
  }, []);

  // --- ADMIN CHECK LOGIC ---
  const checkAdminAccess = async (uid: string) => {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    if (adminDoc.exists()) {
      message.success('Admin Access Granted');
      navigate('/admin'); // Admin Dashboard पर भेजें
      return true;
    } else {
      setError('Access Denied: You are not an authorized Admin.');
      await auth.signOut();
      return false;
    }
  };

  // Your Original Email Login Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await checkAdminAccess(cred.user.uid);
    } catch (error: any) {
      setError('Invalid credentials or network error.');
    } finally {
      setLoading(false);
    }
  };

  const displayNumber = (value: number | null, fallback: string) => {
    return value !== null ? value.toString() : fallback;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex font-Poppins relative overflow-hidden">
      {/* LEFT SIDE - YOUR ORIGINAL UI */}
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
              <motion.div className="mb-6 bg-red-900/20 border border-red-700/50 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-400" />
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
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white focus:border-amber-500 outline-none transition-all"
                  placeholder="admin@email.com" required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2 text-sm">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-12 py-4 text-white focus:border-amber-500 outline-none transition-all"
                  placeholder="••••••••" required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-900/30 flex items-center justify-center gap-3"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <LogIn size={20} />}
              <span>Admin Login</span>
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* RIGHT SIDE - YOUR ORIGINAL VISUALS */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574267432644-f770f8f5b7c5?w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 via-slate-900/80 to-orange-900/60" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 text-center">
          <Film size={60} className="text-amber-400 mb-6" />
          <h2 className="text-5xl font-black text-white mb-4">Control Your <br /> <span className="text-amber-400">Cinema Empire</span></h2>
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="text-center">
              <p className="text-3xl font-black text-amber-400">{displayNumber(moviesCount, '200+')}</p>
              <p className="text-slate-400">Movies</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-amber-400">{displayNumber(seriesCount, '50+')}</p>
              <p className="text-slate-400">Series</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
