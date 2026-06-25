import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const { user, isAuthenticated, checkAuth, loading } = useAuthStore();
  const { initSocket, disconnectSocket } = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const authUser = await checkAuth();
      if (!authUser) {
        navigate('/login');
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (user) {
      initSocket(user._id);
    }
    return () => {
      disconnectSocket();
    };
  }, [user]);

  if (loading && !user) {
    return (
      <div className="fixed inset-0 bg-[#070B14] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-display font-medium">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070B14]">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
