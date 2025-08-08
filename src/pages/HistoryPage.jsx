import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { ComponentLoader } from "../components/ui/Loading";
import { useNavigate } from "react-router-dom";
import SummaryApi from "../api/SummaryApi";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuthStore();
  const { setCurrentChatId, deleteChat, setNiche, setPlatform } =
    useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch chat sessions from backend - use the new format
        const sessionsRes = await SummaryApi.getChatSessions();
        console.log("Sessions response:", sessionsRes.data);

        // The backend now returns sessions directly in data array
        const sessions = Array.isArray(sessionsRes.data.data)
          ? sessionsRes.data.data
          : [];

        if (sessions.length === 0) {
          setHistory([]);
          return;
        }

        // Enrich sessions with messages
        const enriched = await Promise.all(
          sessions.map(async (session) => {
            try {
              const msgRes = await SummaryApi.getSessionMessages(session.id);
              const messages = SummaryApi.normalizeMessages(
                msgRes.data.data || msgRes.data
              );
              const firstUserMsg = messages.find((m) => m.role === "user");
              const lastMsg = messages[messages.length - 1];

              return {
                id: session.id,
                title:
                  session.title ||
                  firstUserMsg?.content ||
                  `Chat ${session.id}`,
                preview: lastMsg?.content || "No messages",
                created_at: session.created_at,
                messages,
                niche: session.niche,
                platform: session.platform,
                messageCount: session.messageCount || messages.length,
              };
            } catch (err) {
              console.error(
                `Failed to fetch messages for session ${session.id}:`,
                err
              );
              // Return session without messages if message fetch fails
              return {
                id: session.id,
                title: session.title || `Chat ${session.id}`,
                preview: "No messages available",
                created_at: session.created_at,
                messages: [],
                niche: session.niche,
                platform: session.platform,
                messageCount: session.messageCount || 0,
              };
            }
          })
        );

        setHistory(
          enriched
            .filter(Boolean)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        );
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setError("Failed to load chat history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isAuthenticated]);

  const handleDelete = async (id) => {
    try {
      await SummaryApi.deleteChatSession(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      deleteChat(id);
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  const handleChatClick = (chat) => {
    setCurrentChatId(chat.id);
    setNiche(chat.niche);
    setPlatform(chat.platform);
    navigate("/generate", { state: { historyItem: chat, fromHistory: true } });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] page-transition">
        <div className="glass-effect p-12 rounded-2xl modern-shadow-lg glow-border text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-primary/20 to-ring/20 flex items-center justify-center modern-shadow">
              <span className="text-4xl">🔐</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-ring bg-clip-text text-transparent">
            Login Required
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Please log in to view your chat history and continue your
            conversations.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="modern-button px-8 py-4 bg-gradient-to-r from-primary to-ring text-primary-foreground rounded-xl font-semibold modern-shadow hover:modern-shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <ComponentLoader message="Loading your chat history..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] page-transition">
        <div className="glass-effect p-12 rounded-2xl modern-shadow-lg text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-destructive/20 to-destructive/10 flex items-center justify-center modern-shadow">
              <span className="text-4xl">⚠️</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-destructive">Error</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="modern-button px-8 py-4 bg-gradient-to-r from-primary to-ring text-primary-foreground rounded-xl font-semibold modern-shadow hover:modern-shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-transition">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <div className="glass-effect rounded-2xl p-8 modern-shadow-lg glow-border">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-ring/20 modern-shadow">
              <span className="text-4xl">💬</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-ring bg-clip-text text-transparent mb-4">
            Chat History
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            View and continue your previous AI conversations
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16">
          <div className="glass-effect rounded-2xl p-12 modern-shadow-lg max-w-lg mx-auto">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-primary/20 to-ring/20 flex items-center justify-center modern-shadow float-element">
                <span className="text-6xl">�</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-ring bg-clip-text text-transparent">
              No Chats Yet
            </h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Start your first AI conversation to see your history here
            </p>
            <button
              onClick={() => navigate("/generate")}
              className="modern-button px-8 py-4 bg-gradient-to-r from-primary to-ring text-primary-foreground rounded-xl font-semibold modern-shadow hover:modern-shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Start New Chat
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {history.map((chat, index) => (
            <div
              key={chat.id}
              className="glass-effect rounded-2xl modern-shadow hover:modern-shadow-lg transition-all duration-300 overflow-hidden modern-button glow-border float-element"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <button
                onClick={() => handleChatClick(chat)}
                className="w-full text-left p-8"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground truncate pr-4 group-hover:text-primary transition-colors">
                    {chat.title}
                  </h3>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                      {new Date(chat.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  {chat.niche && (
                    <span className="px-3 py-2 bg-gradient-to-r from-primary/20 to-primary/10 text-primary rounded-xl text-sm font-medium modern-shadow">
                      🎯 {chat.niche}
                    </span>
                  )}
                  {chat.platform && (
                    <span className="px-3 py-2 bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium modern-shadow">
                      📱 {chat.platform}
                    </span>
                  )}
                  <span className="px-3 py-2 bg-gradient-to-r from-muted/50 to-muted/30 text-muted-foreground rounded-xl text-sm font-medium modern-shadow">
                    💬 {chat.messageCount} messages
                  </span>
                </div>

                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed bg-muted/20 rounded-lg p-3">
                  {chat.preview}
                </p>
              </button>

              <div className="px-8 py-4 border-t border-border/50 flex justify-between items-center bg-muted/10">
                <button
                  onClick={() => handleChatClick(chat)}
                  className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <span>➤</span>
                  Continue Chat
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(chat.id);
                  }}
                  className="text-destructive hover:text-destructive/80 text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <span>🗑️</span>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
