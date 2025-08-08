import { create } from "zustand";
import { persist } from "zustand/middleware";
import SummaryApi from "../api/SummaryApi";

export const useChatStore = create(
  persist(
    (set, get) => ({
      chats: [], // [{id, title, messages: [{role, content}], createdAt, niche, platform}]
      currentChatId: null,
      selectedNiche: null,
      selectedPlatform: null,

      // Synchronize with backend
      syncWithBackend: async () => {
        try {
          const response = await SummaryApi.getChatSessions();
          if (response.data && Array.isArray(response.data.data)) {
            set({ chats: response.data.data });
          }
        } catch (error) {
          console.error("Failed to sync chats with backend:", error);
        }
      },

      setChats: (chats) => set({ chats }),
      setCurrentChatId: (id) => set({ currentChatId: id }),
      setNiche: (niche) => set({ selectedNiche: niche }),
      setPlatform: (platform) => set({ selectedPlatform: platform }),

      addChat: async (chat) => {
        try {
          // Create chat in backend first
          const response = await SummaryApi.createChatSession({
            title: chat.title,
            niche: chat.niche,
            platform: chat.platform,
            messages: chat.messages,
          });

          // If successful, update local state with backend data
          if (response.data && response.data.data) {
            const newChat = {
              ...chat,
              id: response.data.data.id,
              createdAt: response.data.data.created_at,
            };

            set((state) => ({
              chats: [newChat, ...state.chats],
              currentChatId: newChat.id,
              selectedNiche: newChat.niche || state.selectedNiche,
              selectedPlatform: newChat.platform || state.selectedPlatform,
            }));

            return newChat;
          } else {
            // Fallback to local only
            set((state) => ({
              chats: [chat, ...state.chats],
              currentChatId: chat.id,
              selectedNiche: chat.niche || state.selectedNiche,
              selectedPlatform: chat.platform || state.selectedPlatform,
            }));

            return chat;
          }
        } catch (error) {
          console.error("Failed to add chat to backend:", error);

          // Fallback to local only on error
          set((state) => ({
            chats: [chat, ...state.chats],
            currentChatId: chat.id,
            selectedNiche: chat.niche || state.selectedNiche,
            selectedPlatform: chat.platform || state.selectedPlatform,
          }));

          return chat;
        }
      },

      updateChat: async (id, updates) => {
        try {
          // If we're updating messages, sync with backend
          if (updates.messages) {
            const lastMessage = updates.messages[updates.messages.length - 1];
            if (lastMessage) {
              await SummaryApi.createSessionMessage(id, lastMessage);
            }
          }
        } catch (error) {
          console.error("Failed to update chat in backend:", error);
        }

        // Update local state
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
        }));
      },

      deleteChat: async (id) => {
        try {
          // Delete from backend first
          await SummaryApi.deleteChatSession(id);
        } catch (error) {
          console.error("Failed to delete chat from backend:", error);
        }

        // Update local state
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== id),
          currentChatId:
            state.currentChatId === id ? null : state.currentChatId,
        }));
      },

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
