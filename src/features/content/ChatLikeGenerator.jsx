import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNicheStore } from "../../store/nicheStore";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import CopyButton from "../../components/ui/CopyButton";
import DownloadButton from "../../components/ui/DownloadButton";
import SummaryApi from "../../api/SummaryApi";

const NICHES = [
  "Entertainment",
  "News",
  "Music",
  "Fashion",
  "Memes",
  "Business",
  "Sports",
  "Tech",
];

const PLATFORMS = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Twitter",
  "LinkedIn",
  "Facebook",
];

export default function ChatLikeGenerator() {
  const {
    chats,
    currentChatId,
    selectedNiche,
    selectedPlatform,
    setNiche,
    setPlatform,
    setChats,
    addChat,
    updateChat,
    setCurrentChatId,
  } = useChatStore();
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const historyItem = location.state?.historyItem;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  // Load messages for a session
  const loadSessionMessages = async (sessionId) => {
    setLoadingMessages(true);
    setError(null);
    try {
      const response = await SummaryApi.getSessionMessages(sessionId);
      const messages = SummaryApi.normalizeMessages(response.data);

      // Update chat in store with messages
      updateChat(sessionId, { messages });
    } catch (err) {
      console.error("Failed to load session messages:", err);
      setError("Failed to load chat messages. Please try again.");

      // Try legacy endpoint as fallback
      try {
        const legacyResponse = await SummaryApi.getHistory(sessionId);
        const messages = SummaryApi.normalizeMessages(legacyResponse.data);
        updateChat(sessionId, { messages });
        setError(null);
      } catch (legacyErr) {
        console.error("Failed to load legacy messages:", legacyErr);
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  // Handle history item on mount
  useEffect(() => {
    if (historyItem) {
      const { id, niche, platform } = historyItem;

      // Set niche and platform
      setNiche(niche);
      setPlatform(platform);

      // Set current chat and load messages
      setCurrentChatId(id);
      loadSessionMessages(id);
    }
  }, [historyItem]);

  // Create new chat session if needed
  useEffect(() => {
    if (!currentChatId && isAuthenticated && !historyItem) {
      const systemMessage = {
        role: "system",
        content: `You are generating content for ${
          selectedNiche ? `the niche: ${selectedNiche}` : "[not selected]"
        }${selectedPlatform ? ` on platform: ${selectedPlatform}` : ""}. ${
          selectedNiche
            ? `Try: "Generate hashtags for my ${selectedNiche} post" or "Create captions for ${selectedNiche} content"`
            : "Please select a niche above to get started."
        }`,
      };

      // Create new session
      SummaryApi.createChatSession({
        title: selectedNiche
          ? `${selectedNiche}${
              selectedPlatform ? ` - ${selectedPlatform}` : ""
            }`
          : "New Chat",
        niche: selectedNiche,
        platform: selectedPlatform,
        messages: [systemMessage],
      })
        .then((res) => {
          const session = res.data;
          const chat = {
            id: session.id,
            title: session.title,
            messages: [systemMessage],
            createdAt: new Date(session.created_at).getTime(),
            niche: selectedNiche,
            platform: selectedPlatform,
          };
          setChats([chat, ...chats]);
          setCurrentChatId(chat.id);
        })
        .catch((err) => {
          console.error("Failed to create chat session:", err);
          setError("Failed to start new chat. Please try again.");
        });
    }
  }, [
    currentChatId,
    selectedNiche,
    selectedPlatform,
    isAuthenticated,
    historyItem,
  ]);

  const currentChat = chats.find((c) => c.id === currentChatId);

  // Render message content safely
  const renderMessageContent = (content) => {
    if (!content) return null;
    return content.split("\n").map((line, i) => (
      <p key={i} className="mb-2">
        {line}
      </p>
    ));
  };

  const handleSend = async () => {
    if (!input.trim() || !currentChat || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    setLoading(true);
    const currentInput = input.trim();
    setInput(""); // Clear input immediately for better UX

    try {
      // First, update UI with user message
      const newMessages = [...(currentChat.messages || []), userMessage];
      updateChat(currentChatId, { messages: newMessages });

      // Scroll to bottom
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

      // Send message to backend
      const messageResponse = await SummaryApi.createSessionMessage(
        currentChatId,
        {
          content: currentInput,
          role: "user",
        }
      );

      let aiResponse = "";
      if (currentInput.toLowerCase().includes("hashtag")) {
        try {
          const response = await SummaryApi.getAIHashtags({
            niche: selectedNiche,
            platform: selectedPlatform,
            prompt: currentInput,
          });
          const hashtags =
            response.data?.hashtags || response.data?.data?.hashtags || [];
          if (hashtags.length > 0) {
            aiResponse = `Here are some trending hashtags for ${selectedNiche}${
              selectedPlatform ? ` on ${selectedPlatform}` : ""
            }:\n${hashtags.join(" ")}`;
          } else {
            throw new Error("No hashtags returned");
          }
        } catch (err) {
          console.error("AI hashtags failed, using fallback:", err);
          try {
            const fallbackResponse = await SummaryApi.getHashtags({
              niche: selectedNiche,
              platform: selectedPlatform,
            });
            const hashtags = fallbackResponse.data?.hashtags || [];
            aiResponse = `Here are some popular hashtags for ${selectedNiche}${
              selectedPlatform ? ` on ${selectedPlatform}` : ""
            }:\n${hashtags.join(" ")}`;
          } catch (fallbackErr) {
            console.error("Hashtag fallback failed:", fallbackErr);
            aiResponse =
              "Sorry, I couldn't generate hashtags at the moment. Please try again.";
          }
        }
      } else {
        // Handle other types of messages
        aiResponse =
          "I understand you want to generate content. Please specify if you'd like hashtags, captions, or other content types.";
      }

      // Add AI response to messages
      const assistantMessage = { role: "assistant", content: aiResponse };
      const updatedMessages = [...newMessages, assistantMessage];
      updateChat(currentChatId, { messages: updatedMessages });

      // Send AI response to backend
      await SummaryApi.createSessionMessage(currentChatId, {
        content: aiResponse,
        role: "assistant",
      });

      // Final scroll to bottom
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Failed to process message:", error);
      setError("Failed to send message. Please try again.");
      // Revert the message list if needed
      loadSessionMessages(currentChatId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header with Niche & Platform Selection */}
      <div className="mb-6 space-y-4">
        <h1 className="text-2xl font-bold mb-4">
          Generate Content & Thumbnails
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Niche for Content Generation:
            </label>
            <select
              value={selectedNiche || ""}
              onChange={(e) => setNiche(e.target.value || null)}
              className="w-full px-3 py-2 border rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Choose a niche...</option>
              {NICHES.map((niche) => (
                <option key={niche} value={niche}>
                  {niche}
                </option>
              ))}
            </select>
            {!selectedNiche && (
              <p className="text-sm text-gray-500">
                Please select a niche to start generating content.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Platform:
            </label>
            <select
              value={selectedPlatform || ""}
              onChange={(e) => setPlatform(e.target.value || null)}
              className="w-full px-3 py-2 border rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Choose a platform...</option>
              {PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-[300px] bg-gray-50 p-4 rounded-lg">
        {loadingMessages ? (
          <div className="text-center py-4">Loading messages...</div>
        ) : (
          currentChat?.messages?.map((message, index) => (
            <div
              key={index}
              className={`${
                message.role === "user" ? "bg-blue-50" : "bg-white"
              } p-4 rounded-lg shadow-sm`}
            >
              <p className="text-sm font-medium mb-2 text-gray-600">
                {message.role === "user" ? "You" : "Assistant"}:
              </p>
              <div className="prose max-w-none">
                {renderMessageContent(message.content)}
              </div>
              {message.role === "assistant" && message.content && (
                <div className="mt-3 flex gap-2">
                  <CopyButton text={message.content} />
                  <DownloadButton content={message.content} />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-auto border-t pt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={
              selectedNiche
                ? `Ask about ${selectedNiche} content...`
                : "Please select a niche first..."
            }
            className="flex-1 px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            disabled={!selectedNiche || loading || loadingMessages}
          />
          <button
            onClick={handleSend}
            disabled={
              !selectedNiche || !input.trim() || loading || loadingMessages
            }
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
