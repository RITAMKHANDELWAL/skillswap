import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import {
  Video,
  Calendar,
  BookOpen,
  Flame,
  Star,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [resAnalytics, resSessions, resRoadmaps] = await Promise.all([
        axios.get('/api/analytics/dashboard'),
        axios.get('/api/sessions'),
        axios.get('/api/roadmaps')
      ]);
      setAnalytics(resAnalytics.data.analytics);
      setSessions(resSessions.data.sessions);
      setRoadmaps(resRoadmaps.data.roadmaps);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard analytics:', error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCompleteSession = async (sessionId, notes) => {
    try {
      await axios.put(`/api/sessions/${sessionId}`, {
        status: 'completed',
        sessionNotes: notes || 'Exchanged key programming principles and worked on code reviews.'
      });
      fetchDashboardData();
    } catch (error) {
      alert('Error updating session status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled session?')) return;
    try {
      await axios.put(`/api/sessions/${sessionId}`, {
        status: 'cancelled'
      });
      fetchDashboardData();
    } catch (error) {
      alert('Error cancelling session');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-500">Retrieving statistics...</span>
      </div>
    );
  }

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600/[0.08] via-purple-600/[0.05] to-transparent border border-white/[0.06] p-6 md:p-8 rounded-2xl">
        {/* Decorative mesh gradient blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/[0.08] rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-500/[0.06] rounded-full blur-[60px] pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Online
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-white">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-sm text-slate-400 max-w-lg">
              Manage your skill sharing network, track milestones, and continue your learning journey.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              to="/discover"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            >
              Find Mentors
              <ArrowUpRight size={15} className="mt-0.5" />
            </Link>
            <Link
              to="/roadmaps"
              className="px-5 py-2.5 bg-white/[0.04] hover:bg-white/[0.07] text-sm font-semibold rounded-xl border border-white/[0.08] hover:border-white/[0.12] transition-all duration-200 text-slate-200"
            >
              AI Roadmap
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Teaching Level', value: `Lvl ${analytics?.level || 1}`, icon: Star, color: 'text-yellow-400 bg-yellow-500/[0.06] border-yellow-500/[0.08]' },
          { label: 'Credits Balance', value: analytics?.credits || 0, icon: BookOpen, color: 'text-indigo-400 bg-indigo-500/[0.06] border-indigo-500/[0.08]' },
          { label: 'Streak Score', value: `${analytics?.streak || 0} Days`, icon: Flame, color: 'text-orange-400 bg-orange-500/[0.06] border-orange-500/[0.08]' },
          { label: 'Verified Badges', value: analytics?.badgesCount || 0, icon: CheckCircle, color: 'text-purple-400 bg-purple-500/[0.06] border-purple-500/[0.08]' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="card-solid p-4 rounded-xl flex items-center justify-between group hover:border-white/[0.1] transition-all duration-200"
            >
              <div className="space-y-1.5">
                <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
                <h3 className="font-display font-bold text-lg md:text-xl text-white">{stat.value}</h3>
              </div>
              <div className={`p-2.5 rounded-xl border ${stat.color} transition-transform duration-200 group-hover:scale-105`}>
                <Icon size={20} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scheduled Sessions Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2.5">
              <Calendar size={18} className="text-indigo-400" />
              <span>Mentorship Timeline</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.06]">
              {upcomingSessions.length} Scheduled
            </span>
          </div>

          <div className="space-y-3">
            {upcomingSessions.length === 0 ? (
              <div className="card-solid p-8 text-center rounded-xl space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto">
                  <Calendar size={22} className="text-slate-600" />
                </div>
                <div className="text-slate-400 text-sm">No scheduled sessions at this time.</div>
                <Link to="/discover" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition-colors">Find a mentor to book one</Link>
              </div>
            ) : (
              upcomingSessions.map((session) => {
                const isMentor = session.mentor._id === user._id;
                const partner = isMentor ? session.learner : session.mentor;
                return (
                  <div key={session._id} className="card-solid p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/[0.1] transition-all duration-200 group">
                    <div className="flex items-start gap-3">
                      <img
                        src={partner.profilePicture}
                        alt={partner.name}
                        className="w-10 h-10 rounded-xl border border-white/[0.06] object-cover mt-0.5"
                      />
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-slate-200">{partner.name}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider ${
                            isMentor
                              ? 'bg-purple-500/[0.08] text-purple-400 border border-purple-500/[0.12]'
                              : 'bg-indigo-500/[0.08] text-indigo-400 border border-indigo-500/[0.12]'
                          }`}>
                            {isMentor ? 'Teaching' : 'Learning'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(session.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} &middot; {session.duration} min
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1 italic">"{partner.bio || 'P2P knowledge swap'}"</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-500/[0.08] hover:bg-indigo-500/[0.14] text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-500/[0.1] transition-all duration-200"
                      >
                        <Video size={13} /> Join
                      </a>

                      {isMentor && (
                        <button
                          onClick={() => {
                            const notes = prompt("Enter brief session summary notes for the student:");
                            if (notes !== null) {
                              handleCompleteSession(session._id, notes);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-500/[0.06] hover:bg-green-500/[0.12] text-green-400 rounded-lg text-xs font-semibold border border-green-500/[0.1] transition-all duration-200"
                        >
                          <CheckCircle size={13} /> Complete
                        </button>
                      )}

                      <button
                        onClick={() => handleCancelSession(session._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500/[0.06] hover:bg-red-500/[0.12] text-red-400 rounded-lg text-xs font-semibold border border-red-500/[0.1] transition-all duration-200"
                      >
                        <XCircle size={13} /> Cancel
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Active Learning Roadmaps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white">Active Roadmaps</h2>
            <Link to="/roadmaps" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition-colors">View All</Link>
          </div>

          <div className="space-y-3">
            {roadmaps.length === 0 ? (
              <div className="card-solid p-8 text-center rounded-xl space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto">
                  <BookOpen size={22} className="text-slate-600" />
                </div>
                <p className="text-slate-500 text-sm">No active learning roadmaps.</p>
                <Link to="/roadmaps" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition-colors">Create your first roadmap</Link>
              </div>
            ) : (
              roadmaps.slice(0, 3).map((roadmap) => (
                <div key={roadmap._id} className="card-solid p-4 rounded-xl space-y-3.5 hover:border-white/[0.1] transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm text-slate-200 line-clamp-1">{roadmap.title}</h4>
                      <p className="text-[10px] text-indigo-400 font-medium">Goal: {roadmap.targetGoal}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-300 tabular-nums">{roadmap.progress}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${roadmap.progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[11px] text-slate-500">
                      {roadmap.weeks?.length || 0} Week Plan
                    </span>
                    <Link
                      to={`/roadmaps?id=${roadmap._id}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-0.5 transition-colors"
                    >
                      Resume <Play size={10} className="fill-indigo-400 mt-0.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
