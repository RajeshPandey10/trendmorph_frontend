import { useAuthStore } from "../store/authStore";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // Temporarily disable authentication protection
  return children;

  // const { isAuthenticated } = useAuthStore();
  // const location = useLocation();
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }
  // return children;
}
