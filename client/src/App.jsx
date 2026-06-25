import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Roadmap from './pages/Roadmap';
import Chat from './pages/Chat';
import Quiz from './pages/Quiz';
import Graph from './pages/Graph';
import Leaderboard from './pages/Leaderboard';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard routes nested inside protected DashboardLayout */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="discover" element={<Discover />} />
          <Route path="roadmaps" element={<Roadmap />} />
          <Route path="chats" element={<Chat />} />
          <Route path="quizzes" element={<Quiz />} />
          <Route path="graph" element={<Graph />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Fallback redirects */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
