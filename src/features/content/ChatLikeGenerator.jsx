import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNicheStore } from "../../store/nicheStore";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import CopyButton from "../../components/ui/CopyButton";
import DownloadButton from "../../components/ui/DownloadButton";
import ImageUpload from "../../components/ui/ImageUpload";
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
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
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
    if (!currentChatId && !historyItem) {
      const systemMessage = {
        role: "system",
        content: `You are generating content for ${
          selectedNiche ? `the niche: ${selectedNiche}` : "[not selected]"
        }${selectedPlatform ? ` on platform: ${selectedPlatform}` : ""}. ${
          selectedNiche
            ? `Try: "Generate hashtags for my ${selectedNiche} post", "Create captions for ${selectedNiche} content", or upload an image for caption generation`
            : "Please select a niche above to get started."
        }`,
      };

      // Create new session (temporarily without backend call)
      const tempSessionId = Date.now().toString();
      const chat = {
        id: tempSessionId,
        title: selectedNiche
          ? `${selectedNiche}${
              selectedPlatform ? ` - ${selectedPlatform}` : ""
            }`
          : "New Chat",
        messages: [systemMessage],
        createdAt: Date.now(),
        niche: selectedNiche,
        platform: selectedPlatform,
      };
      setChats([chat, ...chats]);
      setCurrentChatId(chat.id);

      // Try to create backend session (but don't fail if it doesn't work)
      // SummaryApi.createChatSession({
      //   title: chat.title,
      //   niche: selectedNiche,
      //   platform: selectedPlatform,
      //   messages: [systemMessage],
      // })
      //   .then((res) => {
      //     // Update with real session ID if backend works
      //     const realSessionId = res.data.id;
      //     updateChat(tempSessionId, { id: realSessionId });
      //     setCurrentChatId(realSessionId);
      //   })
      //   .catch((err) => {
      //     console.error("Failed to create chat session:", err);
      //     // Continue with temp ID
      //   });
    }
  }, [currentChatId, selectedNiche, selectedPlatform, historyItem]);

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

  // Handle image upload for caption generation
  const handleImageUpload = async (imageFile) => {
    setImageLoading(true);
    setError(null);

    try {
      // Add user message with image info
      const userMessage = {
        role: "user",
        content: `📷 Uploaded image: ${imageFile.name} (${(
          imageFile.size /
          1024 /
          1024
        ).toFixed(2)} MB)`,
        type: "image",
      };

      const newMessages = [...(currentChat.messages || []), userMessage];
      updateChat(currentChatId, { messages: newMessages });

      // Call image caption API
      const response = await SummaryApi.generateCaption(imageFile);

      // Format the response
      const { description, caption_hashtags } = response.data;
      const aiResponse = `🖼️ **Image Analysis Complete!**

**Description:** ${description}

**Generated Caption & Hashtags:** ${caption_hashtags}

You can now ask me to:
- Refine these hashtags for specific platforms
- Generate different caption styles
- Create variations for different audiences`;

      // Add AI response
      const assistantMessage = { role: "assistant", content: aiResponse };
      const updatedMessages = [...newMessages, assistantMessage];
      updateChat(currentChatId, { messages: updatedMessages });

      // Send messages to backend (optional - won't fail if backend is unavailable)
      if (
        currentChatId &&
        typeof currentChatId === "string" &&
        !currentChatId.startsWith("temp_")
      ) {
        try {
          await SummaryApi.createSessionMessage(currentChatId, userMessage);
          await SummaryApi.createSessionMessage(
            currentChatId,
            assistantMessage
          );
        } catch (err) {
          console.warn("Failed to save messages to backend:", err);
          // Continue without failing - messages are saved locally
        }
      }

      // Hide image upload and scroll to bottom
      setShowImageUpload(false);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Image caption generation failed:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to generate caption from image. Please try again.";
      setError(errorMessage);
    } finally {
      setImageLoading(false);
    }
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

      // Send message to backend (optional)
      try {
        if (
          currentChatId &&
          typeof currentChatId === "string" &&
          !currentChatId.startsWith("temp_")
        ) {
          await SummaryApi.createSessionMessage(currentChatId, {
            content: currentInput,
            role: "user",
          });
        }
      } catch (err) {
        console.warn("Failed to save user message to backend:", err);
        // Continue without failing
      }

      let aiResponse = "";
      if (currentInput.toLowerCase().includes("hashtag")) {
        try {
          const response = await SummaryApi.getHashtags({
            niche: selectedNiche,
            platform: selectedPlatform,
          });
          const hashtags = response.data?.hashtags || [];
          if (hashtags.length > 0) {
            aiResponse = `Here are some trending hashtags for ${selectedNiche}${
              selectedPlatform ? ` on ${selectedPlatform}` : ""
            }:\n${hashtags.join(" ")}`;
          } else {
            throw new Error("No hashtags returned");
          }
        } catch (err) {
          console.error("Hashtags failed:", err);
          aiResponse = `Here are some suggested hashtags for ${selectedNiche}${
            selectedPlatform ? ` on ${selectedPlatform}` : ""
          }:\n#${selectedNiche?.toLowerCase()} #trending #viral #content ${
            selectedPlatform ? `#${selectedPlatform.toLowerCase()}` : ""
          } #socialmedia #engagement #creative #inspiration #daily`;
        }
      } else if (currentInput.toLowerCase().includes("caption")) {
        aiResponse = `Here are some caption ideas for ${selectedNiche}${
          selectedPlatform ? ` on ${selectedPlatform}` : ""
        }:\n\n1. "${selectedNiche} vibes only ✨"\n2. "Creating magic in the ${selectedNiche} space"\n3. "Your daily dose of ${selectedNiche} inspiration"\n4. "Bringing you the best ${selectedNiche} content"\n5. "Join the ${selectedNiche} community!"`;
      } else {
        // Handle other types of messages
        aiResponse = `I understand you want to generate content for ${selectedNiche}${
          selectedPlatform ? ` on ${selectedPlatform}` : ""
        }. I can help you with:
        
• **Hashtags**: Ask "Generate hashtags for my ${selectedNiche} post"
• **Captions**: Ask "Create captions for ${selectedNiche} content"  
• **Image Analysis**: Upload an image using the 📷 button for automatic caption generation
        
What would you like to create?`;
      }

      // Add AI response to messages
      const assistantMessage = { role: "assistant", content: aiResponse };
      const updatedMessages = [...newMessages, assistantMessage];
      updateChat(currentChatId, { messages: updatedMessages });

      // Send AI response to backend (optional)
      try {
        if (
          currentChatId &&
          typeof currentChatId === "string" &&
          !currentChatId.startsWith("temp_")
        ) {
          await SummaryApi.createSessionMessage(currentChatId, {
            content: aiResponse,
            role: "assistant",
          });
        }
      } catch (err) {
        console.warn("Failed to save AI response to backend:", err);
        // Continue without failing
      }

      // Final scroll to bottom
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Failed to process message:", error);
      setError("Failed to send message. Please try again.");
      // Don't revert messages since they're working locally
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
              } p-4 rounded-lg shadow-sm ${
                message.type === "image" ? "border-l-4 border-blue-400" : ""
              }`}
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
        {/* Image Upload Section */}
        {showImageUpload && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">
                Upload Image for Caption Generation
              </h3>
              <button
                onClick={() => setShowImageUpload(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={imageLoading}
              >
                ✕
              </button>
            </div>
            <ImageUpload
              onImageUpload={handleImageUpload}
              loading={imageLoading}
              disabled={!selectedNiche}
            />
            {!selectedNiche && (
              <p className="text-sm text-red-500 mt-2">
                Please select a niche before uploading an image.
              </p>
            )}
          </div>
        )}

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
            disabled={
              !selectedNiche || loading || loadingMessages || imageLoading
            }
          />

          {/* Image Upload Toggle Button */}
          <button
            onClick={() => setShowImageUpload(!showImageUpload)}
            disabled={
              !selectedNiche || loading || loadingMessages || imageLoading
            }
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            title="Upload image for caption generation"
          >
            📷
          </button>

          <button
            onClick={handleSend}
            disabled={
              !selectedNiche ||
              !input.trim() ||
              loading ||
              loadingMessages ||
              imageLoading
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
