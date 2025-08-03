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

        // Fetch chat sessions
        const sessionsRes = await SummaryApi.getChatSessions();
        let sessions = sessionsRes.data.results || sessionsRes.data || [];

        // Enrich sessions with messages and metadata
        const enriched = await Promise.all(
          sessions.map(async (session) => {
            try {
              const msgRes = await SummaryApi.getSessionMessages(session.id);
              const messages = SummaryApi.normalizeMessages(msgRes.data);
              const firstUserMsg = messages.find((m) => m.role === "user");
              const lastMsg = messages[messages.length - 1];

              return {
                id: session.id,
                title:
                  session.title ||
                  firstUserMsg?.content ||
                  `Chat ${session.id}`,
                preview: lastMsg?.content || "No messages",
                created_at: session.created_at || session.createdAt,
                messages,
                niche: session.niche,
                platform: session.platform,
                messageCount: messages.length,
              };
            } catch (err) {
              console.error(
                `Failed to fetch messages for session ${session.id}:`,
                err
              );
              return null;
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
    navigate("/generate", { state: { historyItem: chat } });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in to view your chat history.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Login
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Chat History</h1>
        <p className="text-gray-600">
          View and continue your previous conversations
        </p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">No Chats Yet</h3>
          <p className="text-gray-600 mb-6">
            Start a new chat to see your history here
          </p>
          <button
            onClick={() => navigate("/generate")}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Start New Chat
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((chat) => (
            <div
              key={chat.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <button
                onClick={() => handleChatClick(chat)}
                className="w-full text-left p-6"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {chat.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(chat.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {chat.niche && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-md text-sm">
                      {chat.niche}
                    </span>
                  )}
                  {chat.platform && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                      {chat.platform}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-sm">
                    {chat.messageCount} messages
                  </span>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2">
                  {chat.preview}
                </p>
              </button>

              <div className="px-6 py-3 border-t flex justify-between items-center">
                <button
                  onClick={() => handleChatClick(chat)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Continue Chat
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(chat.id);
                  }}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
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
