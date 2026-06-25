import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { Bell, Coins, LogOut, User as UserIcon, Menu, Search, ChevronDown, Sparkles } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuthStore();
  const { notifications, unreadNotificationsCount, fetchNotifications, markNotificationsAsRead } = useChatStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleNotificationsClick = async () => {
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false);
    if (!showNotifications && unreadNotificationsCount > 0) {
      await markNotificationsAsRead();
    }
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
    setShowNotifications(false);
  };

  const formatTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return then.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 md:px-6">
      {/* Gradient bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="flex items-center justify-between h-16">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 -ml-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all duration-200"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2.5 group cursor-pointer select-none">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow duration-300">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white flex items-center">
              Skill
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent ml-0.5">
                Swap
              </span>
            </span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className={`relative w-full flex items-center rounded-xl border transition-all duration-300 ${
            searchFocused
              ? 'border-indigo-500/40 bg-[#0B0F19]/90 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
              : 'border-white/[0.06] bg-white/[0.03] hover:border-white/[0.1] hover:bg-white/[0.05]'
          }`}>
            <Search size={16} className={`absolute left-3.5 transition-colors duration-200 ${
              searchFocused ? 'text-indigo-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-transparent pl-10 pr-20 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="absolute right-3 hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-white/[0.05] border border-white/[0.06] rounded-md select-none pointer-events-none">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Credits */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/[0.06] border border-amber-500/15 text-amber-300/80 text-sm font-medium select-none hover:bg-amber-500/[0.1] hover:border-amber-500/25 transition-all duration-200 cursor-default">
            <Coins size={14} className="text-amber-400/70" />
            <span>{user?.credits ?? 0}</span>
          </div>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={handleNotificationsClick}
              className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                showNotifications
                  ? 'bg-white/[0.06] text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Bell size={18} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-[#070B14]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0D1117]/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-dropdown">
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <span className="font-display font-semibold text-sm text-slate-100">Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="text-[11px] text-indigo-400 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      {unreadNotificationsCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto p-2 space-y-0.5">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center mb-3">
                        <Bell size={18} className="text-slate-600" />
                      </div>
                      <p className="text-xs text-slate-500">All caught up — no notifications yet.</p>
                    </div>
                  ) : (
                    notifications.map((n, idx) => (
                      <div
                        key={n._id || idx}
                        className={`px-3 py-3 rounded-xl text-xs transition-all duration-150 cursor-pointer ${
                          n.read
                            ? 'hover:bg-white/[0.03] text-slate-400'
                            : 'bg-indigo-500/[0.04] hover:bg-indigo-500/[0.08] text-slate-200'
                        }`}
                      >
                        <div className="font-medium text-slate-200 flex items-start justify-between gap-2">
                          <span className="leading-snug">{n.title}</span>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap mt-0.5 shrink-0">
                            {formatTime(n.createdAt)}
                          </span>
                        </div>
                        <p className="leading-relaxed text-slate-500 mt-1">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/[0.06] mx-1 hidden sm:block" />

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={handleProfileClick}
              className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-all duration-200 ${
                showProfileMenu
                  ? 'bg-white/[0.06]'
                  : 'hover:bg-white/[0.04]'
              }`}
            >
              <img
                src={user?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=cover&w=150&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/10"
              />
              <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 hidden sm:block ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-[#0D1117]/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-dropdown">
                {/* User Info Card */}
                <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center gap-3">
                  <img
                    src={user?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=cover&w=150&q=80'}
                    alt={user?.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/10"
                  />
                  <div className="min-w-0">
                    <div className="font-display font-semibold text-sm text-slate-100 truncate">{user?.name}</div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</div>
                    <div className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider mt-1">
                      {user?.role || 'Member'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2">
                  <button
                    onClick={() => { logout(); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/[0.06] transition-all duration-200"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
