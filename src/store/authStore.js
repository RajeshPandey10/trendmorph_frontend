import { create } from "zustand";
import SummaryApi from "../api/SummaryApi";

export const useAuthStore = create((set, get) => ({
  user: null,
  access: localStorage.getItem("access_token"),
  refresh: localStorage.getItem("refresh_token"),
  isAuthenticated: !!localStorage.getItem("access_token"), // Check if token exists
  loading: false,
  error: null,

  // Initialize auth state
  initializeAuth: async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        // Verify token and get user profile
        await get().fetchProfile();
        set({ isAuthenticated: true });
      } catch (error) {
        // Token invalid, clear auth
        get().clearAuth();
      }
    }
  },

  // Clear authentication
  clearAuth: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({
      user: null,
      access: null,
      refresh: null,
      isAuthenticated: false,
      error: null,
    });
  },

  login: async (form) => {
    set({ loading: true, error: null });
    try {
      const res = await SummaryApi.login(form);
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      set({
        access: res.data.access_token,
        refresh: res.data.refresh_token,
        isAuthenticated: true,
      });
      await get().fetchProfile();
      return true;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please try again.";
      set({ error: errorMessage });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Google login method
  googleLogin: async () => {
    set({ loading: true, error: null });
    try {
      // Use backend OAuth route
      SummaryApi.initiateGoogleLogin();
      return true;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Google login failed. Please try again.";
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  // Handle OAuth callback
  handleOAuthCallback: async (code, state) => {
    set({ loading: true, error: null });
    try {
      const res = await SummaryApi.handleGoogleCallback(code, state);
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      set({
        access: res.data.access_token,
        refresh: res.data.refresh_token,
        isAuthenticated: true,
      });
      await get().fetchProfile();
      return true;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "OAuth callback failed. Please try again.";
      set({ error: errorMessage });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await SummaryApi.logout({
        refresh: localStorage.getItem("refresh_token"),
      });
    } catch {}
    get().clearAuth();
  },

  fetchProfile: async () => {
    try {
      const res = await SummaryApi.profile();
      set({ user: res.data });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // If profile fetch fails due to invalid token, clear auth
      if (error.response?.status === 401) {
        get().clearAuth();
      }
      set({ user: null });
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        get().clearAuth();
        return null;
      }

      const res = await SummaryApi.refresh({
        refresh: refreshToken,
      });

      localStorage.setItem("access_token", res.data.access_token);
      set({ access: res.data.access_token, isAuthenticated: true });

      // Fetch updated user profile after refresh
      await get().fetchProfile();
      return res.data.access_token;
    } catch (error) {
      console.error("Token refresh failed:", error);
      get().clearAuth();
      return null;
    }
  },
}));
