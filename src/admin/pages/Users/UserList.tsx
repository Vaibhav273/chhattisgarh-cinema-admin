import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  UserCircle,
  Mail,
  Calendar,
  Shield,
  Crown,
} from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../config/firebase";
import type { User } from "../../types";

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as User[];

        console.log("📊 Users loaded:", data);
        setUsers(data);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Error fetching users:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";

    try {
      if (timestamp.toDate && typeof timestamp.toDate === "function") {
        return timestamp.toDate().toLocaleDateString("en-IN");
      }
      return new Date(timestamp).toLocaleDateString("en-IN");
    } catch (error) {
      return "N/A";
    }
  };

  const getPlanDisplay = (user: User) => {
    // Check isPremium flag
    if (user.isPremium) {
      return {
        name: user.currentPlanId?.toUpperCase() || "PREMIUM",
        isPremium: true,
        color: "gradient-to-r from-orange-500 to-pink-500",
      };
    }

    return {
      name: "FREE",
      isPremium: false,
      color: "slate-100",
    };
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Stats
  const premiumUsers = users.filter((u) => u.isPremium).length;
  const freeUsers = users.filter((u) => !u.isPremium).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-800">User Management</h1>
        <p className="text-slate-500 mt-1">
          Monitor and manage all registered users •
          <span className="text-green-600 font-semibold ml-1">
            Live Updates 🟢
          </span>
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400/50"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 px-6 py-3 bg-white/80 border border-slate-200 rounded-2xl hover:bg-slate-50"
        >
          <Filter size={20} />
          <span className="font-semibold">Filters</span>
        </motion.button>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">
                Plan
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">
                Joined
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-12 bg-slate-200 animate-pulse rounded-xl"></div>
                    </td>
                  </tr>
                ))
              : filteredUsers.map((user, index) => {
                  const plan = getPlanDisplay(user);

                  return (
                    <motion.tr
                      key={user.uid}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                              {user.displayName?.charAt(0) ||
                                user.email?.charAt(0) ||
                                "U"}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-800">
                                {user.displayName || "Unknown"}
                              </p>
                              {user.isPremium && (
                                <Crown
                                  size={14}
                                  className="text-orange-500"
                                  fill="currentColor"
                                />
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              {user.uid.slice(0, 12)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail size={16} />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            plan.isPremium
                              ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-400/30"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {plan.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar size={16} />
                          <span className="text-sm">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              user.isPremium ? "bg-green-500" : "bg-slate-400"
                            }`}
                          ></div>
                          <span
                            className={`text-sm font-semibold ${
                              user.isPremium
                                ? "text-green-700"
                                : "text-slate-600"
                            }`}
                          >
                            {user.isPremium ? "Premium" : "Free"}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
          </tbody>
        </table>

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserCircle size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No users found</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <UserCircle size={20} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-600">
              Total Users
            </span>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{users.length}</h3>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Crown size={20} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-600">
              Premium Users
            </span>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{premiumUsers}</h3>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-500 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-600">
              Free Users
            </span>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{freeUsers}</h3>
        </div>
      </div>
    </div>
  );
};

export default UserList;
