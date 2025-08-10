import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useNicheStore = create(
  persist(
    (set, get) => ({
      selectedNiche: null,
      selectedPlatform: "all",

      setNiche: (niche) => {
        console.log(`🎯 Setting niche to: ${niche}`);
        set({ selectedNiche: niche });
      },

      setPlatform: (platform) => {
        console.log(`📺 Setting platform to: ${platform}`);
        set({ selectedPlatform: platform });
      },

      clearStore: () => {
        console.log("🗑️ Clearing niche store");
        set({ selectedNiche: null, selectedPlatform: "all" });
      },

      // Get current state
      getCurrentState: () => {
        const state = get();
        return {
          selectedNiche: state.selectedNiche,
          selectedPlatform: state.selectedPlatform,
        };
      },
    }),
    {
      name: "niche-store", // unique name for localStorage
      // Only persist if user is logged in (we'll handle this in auth)
      getStorage: () => {
        // Check if user is logged in before persisting
        const authStore = JSON.parse(
          localStorage.getItem("auth-store") || "{}"
        );
        return authStore.state?.user ? localStorage : sessionStorage;
      },
    }
  )
);
