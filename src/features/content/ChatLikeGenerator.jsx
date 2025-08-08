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
    <div className="flex flex-col h-full max-w-6xl mx-auto page-transition">
      {/* Minimal Selection Interface - No Heavy Boxes */}
      <div className="mb-8">
        {/* Clean Selection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              🎯 Content Niche
            </label>
            <select
              value={selectedNiche || ""}
              onChange={(e) => setNiche(e.target.value || null)}
              className="w-full px-4 py-3 bg-transparent border border-border/30 rounded-xl text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-300"
            >
              <option value="" className="bg-background text-foreground">
                Choose your niche...
              </option>
              {NICHES.map((niche) => (
                <option
                  key={niche}
                  value={niche}
                  className="bg-background text-foreground"
                >
                  {niche}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              📱 Target Platform
            </label>
            <select
              value={selectedPlatform || ""}
              onChange={(e) => setPlatform(e.target.value || null)}
              className="w-full px-4 py-3 bg-transparent border border-border/30 rounded-xl text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-300"
            >
              <option value="" className="bg-background text-foreground">
                Choose platform...
              </option>
              {PLATFORMS.map((platform) => (
                <option
                  key={platform}
                  value={platform}
                  className="bg-background text-foreground"
                >
                  {platform}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span>🚀</span>
              Platform-optimized content generation
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Error Display */}
      {error && (
        <div className="mb-6 p-4 glass-effect border border-destructive/20 rounded-xl text-destructive modern-shadow">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Chat Interface */}
      <div className="flex-1 glass-effect rounded-2xl modern-shadow-lg overflow-hidden">
        <div className="h-[500px] sm:h-[600px] flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-ring/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-ring flex items-center justify-center">
                  <span className="text-xs text-primary-foreground font-bold">
                    AI
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    AI Assistant
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedNiche
                      ? `Ready for ${selectedNiche}`
                      : "Waiting for niche selection"}
                    {selectedPlatform && ` • ${selectedPlatform} optimized`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background/50 to-background/80">
            {loadingMessages ? (
              <div className="flex items-center justify-center py-8">
                <div className="glass-effect rounded-xl p-6 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-muted-foreground">Loading messages...</p>
                </div>
              </div>
            ) : currentChat?.messages?.length > 0 ? (
              currentChat.messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-4 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-primary to-ring text-primary-foreground modern-shadow"
                        : "glass-effect modern-shadow"
                    } ${
                      message.type === "image"
                        ? "border-l-4 border-primary"
                        : ""
                    }`}
                  >
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {renderMessageContent(message.content)}
                    </div>
                    {message.role === "assistant" && message.content && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <CopyButton text={message.content} />
                        <DownloadButton content={message.content} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="glass-effect rounded-2xl p-8 text-center max-w-md">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    Start Your Conversation
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Ask me to generate hashtags, captions, or upload an image
                    for analysis
                  </p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>
                      💡 Try: "Generate hashtags for my{" "}
                      {selectedNiche || "content"} post"
                    </p>
                    <p>
                      ✍️ Try: "Create captions for{" "}
                      {selectedNiche || "my content"}"
                    </p>
                    <p>📷 Upload an image for automatic caption generation</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* Modern Input Interface */}
      <div className="mt-6">
        {/* Enhanced Image Upload Section */}
        {showImageUpload && (
          <div className="mb-6 glass-effect rounded-2xl p-6 modern-shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-primary/20 to-ring/20">
                  <span className="text-xl">📷</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Image Caption Generator
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload an image to generate AI-powered captions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImageUpload(false)}
                className="p-2 rounded-xl glass-effect hover:modern-shadow transition-all duration-300 text-muted-foreground hover:text-foreground"
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
              <p className="text-sm text-destructive mt-3 flex items-center gap-2">
                <span>⚠️</span>
                Please select a niche before uploading an image
              </p>
            )}
          </div>
        )}

        {/* Professional Input Bar */}
        <div className="glass-effect rounded-2xl p-4 modern-shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                placeholder={
                  selectedNiche
                    ? `Ask about ${selectedNiche} content...`
                    : "Please select a niche first..."
                }
                className="w-full px-6 py-4 bg-transparent border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 pr-12"
                disabled={
                  !selectedNiche || loading || loadingMessages || imageLoading
                }
              />
              {loading && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {/* Enhanced Image Upload Button */}
              <button
                onClick={() => setShowImageUpload(!showImageUpload)}
                disabled={
                  !selectedNiche || loading || loadingMessages || imageLoading
                }
                className="px-4 py-4 glass-effect rounded-xl hover:modern-shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center modern-button"
                title="Upload image for caption generation"
              >
                <span className="text-xl">📷</span>
              </button>

              {/* Enhanced Send Button */}
              <button
                onClick={handleSend}
                disabled={
                  !selectedNiche ||
                  !input.trim() ||
                  loading ||
                  loadingMessages ||
                  imageLoading
                }
                className="px-8 py-4 bg-gradient-to-r from-primary to-ring text-primary-foreground rounded-xl font-semibold modern-shadow hover:modern-shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 modern-button flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Send
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Usage Hints */}
          {!currentChat?.messages?.length && selectedNiche && (
            <div className="mt-4 pt-4 border-t border-border/20">
              <p className="text-xs text-muted-foreground mb-2">
                💡 Quick suggestions:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    setInput(`Generate hashtags for my ${selectedNiche} post`)
                  }
                  className="text-xs px-3 py-1 glass-effect rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  📝 Generate hashtags
                </button>
                <button
                  onClick={() =>
                    setInput(`Create captions for ${selectedNiche} content`)
                  }
                  className="text-xs px-3 py-1 glass-effect rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  ✍️ Create captions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
