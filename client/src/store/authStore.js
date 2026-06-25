import { create } from 'zustand';
import axios from 'axios';

// Base API URL configuration
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
axios.defaults.withCredentials = true;

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      set({ user: res.data.user, isAuthenticated: true, loading: false });
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post('/api/auth/register', formData);
      set({ user: res.data.user, isAuthenticated: true, loading: false });
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await axios.post('/api/auth/logout');
      set({ user: null, isAuthenticated: false, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('Logout failed:', error.message);
    }
  },

  checkAuth: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get('/api/auth/me');
      set({ user: res.data.user, isAuthenticated: true, loading: false });
      return res.data.user;
    } catch (error) {
      set({ user: null, isAuthenticated: false, loading: false });
      return null;
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put('/api/users/profile', profileData);
      set({ user: res.data.user, loading: false });
      return res.data.user;
    } catch (error) {
      const msg = error.response?.data?.message || 'Profile update failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  }
}));
