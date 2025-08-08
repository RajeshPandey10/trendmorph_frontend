import axios from "axios";

const backendDomain = import.meta.env.VITE_API_BASE_URL;

// Use production backend for OAuth only in production
const PRODUCTION_BACKEND = "https://trendmorph-ai-backend.onrender.com";

// Django Webscraping Backend
const WEBSCRAPING_BACKEND = "https://backend-webscraping-apis.onrender.com";

// Debug logging for environment
console.log("Frontend Environment Check:");
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("Backend Domain:", backendDomain);
console.log("Production Backend:", PRODUCTION_BACKEND);
console.log("Webscraping Backend:", WEBSCRAPING_BACKEND);
console.log("OAuth URL will be:", `${backendDomain}/api/auth/google`);

// Image Caption API Domain (Keep local)
const imageCaptionDomain =
  import.meta.env.VITE_IMAGE_CAPTION_API || "http://127.0.0.1:5000";

// Create axios instance with base configuration - use environment backend
const axiosInstance = axios.create({
  baseURL: backendDomain, // Use environment-specific backend
  withCredentials: true,
  timeout: 30000, // 30 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for Django webscraping API
const webscrapingInstance = axios.create({
  baseURL: WEBSCRAPING_BACKEND,
  timeout: 60000, // 60 second timeout for webscraping
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for image caption API
const imageCaptionInstance = axios.create({
  baseURL: imageCaptionDomain,
  timeout: 60000, // 60 second timeout for image processing
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// Add token to requests automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject({
        ...error,
        message:
          "Network error. Please check your connection and ensure the backend server is running.",
      });
    }

    // Handle 401 unauthorized errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${PRODUCTION_BACKEND}/api/auth/token/refresh/`,
            {
              refresh: refreshToken,
            }
          );

          const newToken = response.data.access;
          localStorage.setItem("access_token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");

          // Only redirect if we're not already on login page
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    }

    // Handle specific error statuses
    if (error.response?.status === 404) {
      console.warn("Endpoint not found:", originalRequest.url);
    } else if (error.response?.status >= 500) {
      console.error(
        "Server error:",
        error.response.status,
        error.response.statusText
      );
    }

    return Promise.reject(error);
  }
);

const SummaryApi = {
  // Health check
  healthCheck: () =>
    axiosInstance
      .get("/health")
      .catch(() => ({ data: { status: "Backend unavailable" } })),

  // User Authentication
  register: (data) => axiosInstance.post("/api/auth/register", data),
  login: (data) => axiosInstance.post("/api/auth/login", data),
  refresh: (data) => axiosInstance.post("/api/auth/token/refresh", data),
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return axiosInstance.post("/api/auth/logout");
  },
  profile: () => axiosInstance.get("/api/auth/profile"),

  // Google OAuth - Always use production backend for OAuth
  initiateGoogleLogin: () => {
    // Always use production backend for OAuth to avoid CORS issues
    const googleUrl = `${PRODUCTION_BACKEND}/api/auth/google`;
    console.log("Initiating Google Login to:", googleUrl);
    window.location.href = googleUrl;
  },

  // Handle Google OAuth callback (called by backend redirect)
  handleGoogleCallback: async (code, state) => {
    try {
      const response = await axiosInstance.post("/api/auth/google/callback", {
        code,
        state,
      });

      // Handle successful login
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem("refresh_token", response.data.refresh_token);
        }
      }

      return response;
    } catch (error) {
      console.error("Google auth error:", error.response || error);
      throw error;
    }
  },

  // Get current user session
  getSession: () => axiosInstance.get("/api/auth/session"),

  // Verify token
  verifyToken: (token) => axiosInstance.post("/api/auth/verify", { token }),

  // Trending Content - with webscraping fallback
  getTrendingPosts: async (params) => {
    try {
      return await axiosInstance.get("/api/trends/", { params });
    } catch (error) {
      console.warn(
        "Node.js trends failed, trying webscraping backend:",
        error.message
      );
      try {
        // Fallback to webscraping backend - use correct endpoints
        const platform = params?.platform || "youtube";
        switch (platform.toLowerCase()) {
          case "youtube":
            return await SummaryApi.getYoutubeTrending(
              params?.keyword,
              params?.category
            );
          case "reddit":
            return await SummaryApi.getRedditTrending(
              params?.keyword,
              params?.subreddit
            );
          case "pinterest":
            return await SummaryApi.getPinterestTrending(
              params?.topic,
              params?.hashtag
            );
          default:
            return await SummaryApi.getYoutubeTrending(
              params?.keyword,
              params?.category
            );
        }
      } catch (webscrapingError) {
        console.error("Both trends endpoints failed:", webscrapingError);
        throw error; // Throw original error
      }
    }
  },
  /**
   * Fetches niche information. Without platform, returns available platforms or posts.
   * With platform, returns platform-specific suggestions.
   */
  getNicheData: async (niche, platform) => {
    const url = `/api/trends/niche/${niche.toLowerCase()}/`;
    const opts = platform ? { params: { platform } } : {};
    try {
      return await axiosInstance.get(url, opts);
    } catch (error) {
      if (error.response?.status === 404) {
        // Fallback to general trends
        const response = await axiosInstance.get("/api/trends/", {
          params: { niche },
        });
        return { data: { posts: response.data } };
      }
      throw error;
    }
  },
  getHashtags: (params) =>
    axiosInstance.get("/api/trends/hashtags/", { params }),
  getCaptions: (params) =>
    axiosInstance.get("/api/trends/captions/", { params }),

  // Image Caption Generation
  generateCaption: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await imageCaptionInstance.post("/generate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response;
    } catch (error) {
      console.error("Image caption generation error:", error);
      throw error;
    }
  },

  // Check if image caption service is available
  checkImageCaptionService: async () => {
    try {
      const response = await imageCaptionInstance.get("/");
      return response;
    } catch (error) {
      console.error("Image caption service check failed:", error);
      return { data: { status: "Image caption service unavailable" } };
    }
  },

  // Chat Sessions (Protected routes)
  getChatSessions: () => axiosInstance.get("/api/chat/sessions"),

  getSessionMessages: (sessionId) =>
    axiosInstance.get(`/api/chat/sessions/${sessionId}/messages`),

  createChatSession: (data) =>
    axiosInstance.post("/api/chat/sessions", {
      title: data.title,
      niche: data.niche,
      platform: data.platform,
      messages: data.messages || [],
    }),

  // Post a message to a session - Updated to match backend format
  createSessionMessage: (sessionId, data) =>
    axiosInstance.post(`/api/chat/sessions/${sessionId}/messages`, {
      role: data.role,
      content: data.content,
    }),

  deleteChatSession: (sessionId) =>
    axiosInstance.delete(`/api/chat/sessions/${sessionId}`),

  // History endpoints (Protected routes)
  getHistory: (sessionId) =>
    axiosInstance.get("/api/history", {
      params: sessionId ? { session: sessionId } : undefined,
    }),

  deleteHistoryMessage: (messageId) =>
    axiosInstance.delete(`/api/history/${messageId}`),

  // Helper method to normalize message data from different endpoints
  normalizeMessages: (data) => {
    if (!data) return [];

    // Handle array response (direct messages array)
    if (Array.isArray(data)) {
      return data.map((msg) => ({
        id: msg._id || msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }));
    }

    // Handle paginated response
    if (data.results && Array.isArray(data.results)) {
      return data.results.map((msg) => ({
        id: msg._id || msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }));
    }

    // Handle messages wrapped in object
    if (data.messages && Array.isArray(data.messages)) {
      return data.messages.map((msg) => ({
        id: msg._id || msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }));
    }

    // Handle legacy format
    if (data.query && data.response) {
      return [
        { role: "user", content: data.query },
        { role: "assistant", content: data.response },
      ];
    }

    return [];
  },

  // Webscraping API methods
  // Health check for webscraping backend
  webscrapingHealthCheck: async () => {
    try {
      const response = await webscrapingInstance.get("/api/health/");
      return response;
    } catch (error) {
      console.error("Webscraping service check failed:", error);
      return { data: { status: "Webscraping service unavailable" } };
    }
  },

  // Get YouTube trending videos
  getYoutubeTrending: async (keyword = "", category = "") => {
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;

      const response = await webscrapingInstance.get("/api/youtube/", {
        params,
      });
      return response;
    } catch (error) {
      console.error("YouTube trending videos error:", error);
      throw error;
    }
  },

  // Get Reddit trending posts
  getRedditTrending: async (keyword = "", subreddit = "") => {
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (subreddit) params.subreddit = subreddit;

      const response = await webscrapingInstance.get("/api/reddit/", {
        params,
      });
      return response;
    } catch (error) {
      console.error("Reddit trending posts error:", error);
      throw error;
    }
  },

  // Get Pinterest trending pins
  getPinterestTrending: async (topic = "", hashtag = "") => {
    try {
      const params = {};
      if (topic) params.topic = topic;
      if (hashtag) params.hashtag = hashtag;

      const response = await webscrapingInstance.get("/api/pinterest/", {
        params,
      });
      return response;
    } catch (error) {
      console.error("Pinterest trending pins error:", error);
      throw error;
    }
  },

  // Scrape niche-specific content (updated to use available endpoints)
  scrapeNicheContent: async (niche, platform = "youtube") => {
    try {
      switch (platform.toLowerCase()) {
        case "youtube":
          return await SummaryApi.getYoutubeTrending(niche);
        case "reddit":
          return await SummaryApi.getRedditTrending(niche);
        case "pinterest":
          return await SummaryApi.getPinterestTrending(niche);
        default:
          return await SummaryApi.getYoutubeTrending(niche);
      }
    } catch (error) {
      console.error("Niche content scraping error:", error);
      throw error;
    }
  },

  // Keep alive function for Django backend
  keepWebscrapingAlive: async () => {
    try {
      const response = await webscrapingInstance.get("/api/health/");
      console.log("Django webscraping backend keep-alive successful");
      return response;
    } catch (error) {
      console.error("Django webscraping backend keep-alive failed:", error);
      return null;
    }
  },
};

export default SummaryApi;
