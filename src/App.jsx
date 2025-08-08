import { useEffect } from "react";
import AppRouter from "./router";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuthStore } from "./store/authStore";
import keepAliveService from "./services/keepAliveService";

export default function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize authentication on app load
    initializeAuth();

    // Start keep-alive service for all backends
    keepAliveService.startKeepAlive();

    // Cleanup on unmount
    return () => {
      keepAliveService.stopKeepAlive();
    };
  }, [initializeAuth]);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
