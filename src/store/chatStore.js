import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useChatStore = create(
  persist(
    (set) => ({
      chats: [], // [{id, title, messages: [{role, content}], createdAt, niche, platform}]
      currentChatId: null,
      selectedNiche: null,
      selectedPlatform: null,

      setChats: (chats) => set({ chats }),
      setCurrentChatId: (id) => set({ currentChatId: id }),
      setNiche: (niche) => set({ selectedNiche: niche }),
      setPlatform: (platform) => set({ selectedPlatform: platform }),

      addChat: (chat) =>
        set((state) => ({
          chats: [chat, ...state.chats],
          currentChatId: chat.id,
          selectedNiche: chat.niche || state.selectedNiche,
          selectedPlatform: chat.platform || state.selectedPlatform,
        })),

      updateChat: (id, updates) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...(updates.messages && { messages: updates.messages }),
                  ...(updates.niche && { niche: updates.niche }),
                  ...(updates.platform && { platform: updates.platform }),
                }
              : c
          ),
        })),

      deleteChat: (id) =>
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== id),
          currentChatId:
            state.currentChatId === id ? null : state.currentChatId,
        })),

      rehydrateFromHistory: (historyItem) =>
        set({
          currentChatId: historyItem.id,
          selectedNiche: historyItem.niche,
          selectedPlatform: historyItem.platform,
        }),

      // Reset store (except persisted chats)
      reset: () =>
        set({
          currentChatId: null,
          selectedNiche: null,
          selectedPlatform: null,
        }),
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId,
        selectedNiche: state.selectedNiche,
        selectedPlatform: state.selectedPlatform,
      }),
    }
  )
);
