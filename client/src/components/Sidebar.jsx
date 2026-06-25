import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Search,
  Map,
  MessageSquare,
  FileCheck,
  Share2,
  Trophy,
  TrendingUp,
  Flame,
  BookOpen
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore();

  const mainNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Discover', path: '/discover', icon: Search },
    { name: 'AI Roadmaps', path: '/roadmaps', icon: Map },
    { name: 'Chats', path: '/chats', icon: MessageSquare },
  ];

  const communityNav = [
    { name: 'Quizzes', path: '/quizzes', icon: FileCheck },
    { name: 'Knowledge Graph', path: '/graph', icon: Share2 },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      <aside className={`fixed md:sticky top-16 bottom-0 left-0 z-40 w-64 bg-[#0B0F19] border-r border-white/[0.06] flex flex-col justify-between py-5 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0 h-[calc(100vh-64px)]' : '-translate-x-full md:block'
      }`}>
        <div className="px-3 space-y-6 overflow-y-auto flex-1">
          {/* Main Section */}
          <div className="space-y-1">
            <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Main
            </p>
            <nav className="space-y-0.5">
              {mainNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-indigo-500/[0.08] text-indigo-300 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                      }
                    `}
                  >
                    <Icon size={18} className={undefined} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Community Section */}
          <div className="space-y-1">
            <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Community
            </p>
            <nav className="space-y-0.5">
              {communityNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-indigo-500/[0.08] text-indigo-300 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                      }
                    `}
                  >
                    <Icon size={18} className={undefined} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User stats widget */}
        {user && (
          <div className="mx-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-10 h-10 rounded-xl border border-white/10 object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-lg shadow-indigo-500/30">
                  {user.level || 1}
                </div>
              </div>
              <div className="min-w-0">
                <h4 className="font-display font-semibold text-sm truncate text-slate-200">{user.name}</h4>
                <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
              </div>
            </div>

            {/* XP Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Level Progress</span>
                <span>{user.xp || 0} / {(user.level || 1) * 100}</span>
              </div>
              <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((user.xp || 0) / ((user.level || 1) * 100)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Streak & Hours */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 px-2.5 py-2 bg-white/[0.03] rounded-lg">
                <Flame size={15} className="text-orange-400" />
                <span className="text-xs font-semibold text-slate-300">{user.streak || 0}d</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-2 bg-white/[0.03] rounded-lg">
                <BookOpen size={15} className="text-indigo-400" />
                <span className="text-xs font-semibold text-slate-300">{(user.hoursLearned + user.hoursTaught).toFixed(1)}h</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
