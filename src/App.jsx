import { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppRouter from "./router";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

import { useAuthStore } from "./store/authStore";

const clientId = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID;

export default function App() {
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  useEffect(() => {
    // On app load, fetch real user data if possible
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    if (access) {
      // If access token exists, fetch profile directly
      fetchProfile();
    } else if (refresh) {
      // If only refresh token exists, attempt to refresh access
      refreshToken();
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GoogleOAuthProvider clientId={clientId}>
          <AppRouter />
        </GoogleOAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
