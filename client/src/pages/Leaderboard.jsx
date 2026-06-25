import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Flame, Star, Award, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/api/analytics/leaderboard');
        setLeaderboard(res.data.leaderboard);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-500">Comparing scores...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-white flex items-center gap-2">
          <Trophy className="text-indigo-400" />
          <span>Ecosystem Leaderboard</span>
        </h1>
        <p className="text-sm text-slate-400">See top teachers, active students, and streak holders in the community.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category 1: Streaks */}
        <div className="space-y-4">
          <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Flame className="text-orange-500 animate-pulse" size={18} />
            <span>Streak Leaders</span>
          </h2>
          <div className="glass-panel rounded-2xl p-2.5 space-y-1.5 shadow-glass">
            {leaderboard?.streakLeaders?.map((user, idx) => (
              <div key={user._id} className="flex items-center justify-between p-3.5 bg-slate-900/35 hover:bg-slate-900/60 rounded-xl transition">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500 w-4">{idx + 1}</span>
                  <img src={user.profilePicture} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-800" />
                  <div>
                    <h4 className="font-semibold text-xs text-slate-200">{user.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Level {user.level || 1}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-orange-400">
                  <span>{user.streak || 0}d</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category 2: Top Mentors */}
        <div className="space-y-4">
          <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Star className="text-yellow-400" size={18} />
            <span>Top Instructors</span>
          </h2>
          <div className="glass-panel rounded-2xl p-2.5 space-y-1.5 shadow-glass">
            {leaderboard?.teachingLeaders?.map((user, idx) => (
              <div key={user._id} className="flex items-center justify-between p-3.5 bg-slate-900/35 hover:bg-slate-900/60 rounded-xl transition">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500 w-4">{idx + 1}</span>
                  <img src={user.profilePicture} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-800" />
                  <div>
                    <h4 className="font-semibold text-xs text-slate-200">{user.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{user.hoursTaught?.toFixed(1) || 0} Hours taught</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                  <span>{user.rating?.toFixed(1) || 5.0}⭐</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category 3: Badge Collectors */}
        <div className="space-y-4">
          <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Award className="text-purple-400" size={18} />
            <span>Badge Collectors</span>
          </h2>
          <div className="glass-panel rounded-2xl p-2.5 space-y-1.5 shadow-glass">
            {leaderboard?.badgeLeaders?.map((user, idx) => (
              <div key={user._id} className="flex items-center justify-between p-3.5 bg-slate-900/35 hover:bg-slate-900/60 rounded-xl transition">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500 w-4">{idx + 1}</span>
                  <img src={user.profilePicture} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-800" />
                  <div>
                    <h4 className="font-semibold text-xs text-slate-200">{user.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Level {user.level || 1}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-purple-400">
                  <span>{user.badges?.length || 0} Badges</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
