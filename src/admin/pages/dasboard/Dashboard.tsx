import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Film,
  DollarSign,
  ArrowUpRight,
  Star,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const stats = [
    {
      icon: Users,
      label: "Total Users",
      value: "12,459",
      change: "+12.5%",
      gradient: "from-blue-400 to-cyan-500",
      bg: "from-blue-50 to-cyan-50",
    },
    {
      icon: Film,
      label: "Content Library",
      value: "1,284",
      change: "+8.2%",
      gradient: "from-purple-400 to-pink-500",
      bg: "from-purple-50 to-pink-50",
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: "₹2.4L",
      change: "+23.1%",
      gradient: "from-orange-400 to-pink-500",
      bg: "from-orange-50 to-pink-50",
    },
    {
      icon: TrendingUp,
      label: "Active Subscriptions",
      value: "8,542",
      change: "+15.3%",
      gradient: "from-green-400 to-emerald-500",
      bg: "from-green-50 to-emerald-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative overflow-hidden bg-gradient-to-br ${stat.bg} rounded-3xl p-6 border border-white/50 shadow-xl shadow-slate-200/50`}
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <Icon size={24} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-600 rounded-full">
                  <ArrowUpRight size={14} strokeWidth={3} />
                  <span className="text-xs font-bold">{stat.change}</span>
                </div>
              </div>

              <h3 className="text-4xl font-black text-slate-800 mb-1">
                {stat.value}
              </h3>
              <p className="text-slate-600 text-sm font-semibold">
                {stat.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">
              Recent Activity
            </h3>
            <button className="text-orange-500 text-sm font-semibold hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "New user registered",
                time: "2 min ago",
                icon: Users,
                color: "blue",
              },
              {
                title: 'Movie "Mor Chhainha Bhuinya" uploaded',
                time: "15 min ago",
                icon: Film,
                color: "purple",
              },
              {
                title: "Payment of ₹299 received",
                time: "1 hour ago",
                icon: DollarSign,
                color: "green",
              },
            ].map((activity, i) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={i}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 bg-${activity.color}-100 rounded-xl flex items-center justify-center`}
                  >
                    <Icon size={20} className={`text-${activity.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-800 font-semibold text-sm">
                      {activity.title}
                    </p>
                    <p className="text-slate-500 text-xs">{activity.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-3xl p-6 text-white shadow-xl shadow-orange-400/30"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star size={20} fill="white" />
            <h3 className="text-lg font-bold">Top Rated</h3>
          </div>
          <h2 className="text-5xl font-black mb-2">4.8</h2>
          <p className="text-white/80 text-sm mb-4">Average User Rating</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>5 Stars</span>
              <span className="font-bold">68%</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: "68%" }}
              ></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
