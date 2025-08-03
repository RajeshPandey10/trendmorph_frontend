import { create } from "zustand";

export const useNicheStore = create((set) => ({
  selectedNiche: null,
  setNiche: (niche) => set({ selectedNiche: niche }),
}));
