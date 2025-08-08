import { useAuthStore } from "../store/authStore";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Loading from "./ui/Loading";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, initializeAuth } = useAuthStore();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await initializeAuth();
      setIsInitialized(true);
    };

    if (!isInitialized) {
      initialize();
    }
  }, [initializeAuth, isInitialized]);

  // Show loading while initializing or during auth operations
  if (!isInitialized || loading) {
    return <Loading />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
