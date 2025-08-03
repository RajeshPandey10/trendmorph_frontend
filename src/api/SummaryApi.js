import axios from "axios";

const backendDomain =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Validate Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
  console.error(
    "Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file"
  );
}

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: backendDomain,
  withCredentials: true,
  timeout: 30000, // 30 second timeout
  headers: {
    "Content-Type": "application/json",
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
            `${backendDomain}/api/users/token/refresh/`,
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
      .get("/api/health/")
      .catch(() => ({ data: { status: "Backend unavailable" } })),

  // User Authentication
  register: (data) => axiosInstance.post("/api/users/register/", data),
  login: (data) => axiosInstance.post("/api/users/login/", data),
  refresh: (data) => axiosInstance.post("/api/users/token/refresh/", data),
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return axiosInstance.post("/api/users/logout/");
  },
  profile: () => axiosInstance.get("/api/users/profile/"),

  // Google OAuth with Django social auth endpoints
  initiateGoogleLogin: () => {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error(
        "Google Client ID is not configured. Please check your environment variables."
      );
    }

    // Use the correct Django social auth endpoint
    const redirectUri = `${backendDomain}/auth/social/google/login/callback/`;

    // Log configuration for debugging
    console.log("OAuth Configuration:", {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri,
      backendDomain,
    });

    // Build OAuth URL with required parameters
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "email profile",
      access_type: "offline",
      prompt: "consent",
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    console.log("Redirecting to:", googleAuthUrl);
    window.location.href = googleAuthUrl;
  },

  // Handle Google OAuth callback
  handleGoogleCallback: async (code) => {
    if (!code) {
      throw new Error("Authorization code is required");
    }

    try {
      // Exchange code for tokens using Django social auth endpoint
      const response = await axiosInstance.post(
        "/auth/social/google/login/callback/",
        {
          code,
          state: localStorage.getItem("oauth_state"),
        }
      );

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

  // Trending Content
  getTrendingPosts: (params) => axiosInstance.get("/api/trends/", { params }),
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

  // Chat Sessions
  getChatSessions: () => axiosInstance.get("/api/trends/chat/sessions/"),

  getSessionMessages: (sessionId) =>
    axiosInstance.get(`/api/trends/chat/sessions/${sessionId}/messages/`),

  createChatSession: (data) =>
    axiosInstance.post("/api/trends/chat/sessions/", {
      title: data.title,
      niche: data.niche,
      platform: data.platform,
      messages: data.messages?.map((msg) => ({
        query: msg.role === "user" ? msg.content : "",
        response: msg.role === "assistant" ? msg.content : "",
        role: msg.role,
      })),
    }),

  // Post a message to a session - Updated to match backend format
  createSessionMessage: (sessionId, data) =>
    axiosInstance.post(`/api/trends/chat/sessions/${sessionId}/messages/`, {
      query: data.role === "user" ? data.content : "",
      response: data.role === "assistant" ? data.content : "",
      role: data.role,
    }),

  deleteChatSession: (sessionId) =>
    axiosInstance.delete(`/api/trends/chat/sessions/${sessionId}/`),

  // Legacy History endpoints with message format handling
  getHistory: (sessionId) =>
    axiosInstance.get("/api/trends/history/", {
      params: sessionId ? { session: sessionId } : undefined,
    }),

  deleteHistoryMessage: (messageId) =>
    axiosInstance.delete(`/api/trends/history/${messageId}/`),

  // Helper method to normalize message data from different endpoints
  normalizeMessages: (data) => {
    if (!data) return [];

    // Handle array response
    if (Array.isArray(data)) {
      return data.map((msg) => ({
        role: msg.role || (msg.query ? "user" : "assistant"),
        content: msg.content || msg.query || msg.response || "",
      }));
    }

    // Handle paginated response
    if (data.results && Array.isArray(data.results)) {
      return data.results.map((msg) => ({
        role: msg.role || (msg.query ? "user" : "assistant"),
        content: msg.content || msg.query || msg.response || "",
      }));
    }

    // Handle messages wrapped in object
    if (data.messages && Array.isArray(data.messages)) {
      return data.messages.map((msg) => ({
        role: msg.role || (msg.query ? "user" : "assistant"),
        content: msg.content || msg.query || msg.response || "",
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
};

export default SummaryApi;
