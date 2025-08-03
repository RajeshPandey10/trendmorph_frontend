import { create } from "zustand";
import SummaryApi from "../api/SummaryApi";

export const useAuthStore = create((set) => ({
  user: null,
  access: localStorage.getItem("access_token"),
  refresh: localStorage.getItem("refresh_token"),
  isAuthenticated: !!localStorage.getItem("access_token"),
  loading: false,
  error: null,

  login: async (form) => {
    set({ loading: true, error: null });
    try {
      const res = await SummaryApi.login(form);
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      set({
        access: res.data.access,
        refresh: res.data.refresh,
        isAuthenticated: true,
      });
      await useAuthStore.getState().fetchProfile();
      return true;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please try again.";
      set({ error: errorMessage });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Add Google login method
  googleLogin: async (access_token) => {
    set({ loading: true, error: null });
    try {
      const res = await SummaryApi.googleLogin({
        provider: "google",
        access_token,
      });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      set({
        access: res.data.access,
        refresh: res.data.refresh,
        isAuthenticated: true,
      });
      await useAuthStore.getState().fetchProfile();
      return true;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.error ||
        err?.message ||
        "Google login failed. Please try again.";
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
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, access: null, refresh: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    try {
      const res = await SummaryApi.profile();
      set({ user: res.data });
    } catch {
      set({ user: null });
    }
  },

  refreshToken: async () => {
    try {
      const res = await SummaryApi.refresh({
        refresh: localStorage.getItem("refresh_token"),
      });
      localStorage.setItem("access_token", res.data.access);
      set({ access: res.data.access, isAuthenticated: true });
      // Fetch updated user profile after refresh
      await useAuthStore.getState().fetchProfile();
      return res.data.access;
    } catch {
      set({ isAuthenticated: false });
      return null;
    }
  },
}));
