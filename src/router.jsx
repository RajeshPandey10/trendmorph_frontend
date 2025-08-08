import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { PageLoader } from "./components/ui/Loading";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load components
const HomePage = lazy(() => import("./pages/HomePage"));
const GeneratePage = lazy(() => import("./pages/GeneratePage"));
const VideosPage = lazy(() => import("./pages/VideosPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DebugPage = lazy(() => import("./pages/DebugPage"));
const MainLayout = lazy(() => import("./layouts/MainLayout"));

// Error component for router errors
const RouterErrorElement = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-wheat px-4">
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
      <div className="mb-4">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-4">
          The page you're looking for doesn't exist or encountered an error.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => (window.location.href = "/")}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition"
        >
          Go Home
        </button>
      </div>
    </div>
  </div>
);

// Wrapper component with Suspense and Error Boundary
const LazyWrapper = ({ children, fallback = <PageLoader /> }) => (
  <ErrorBoundary>
    <Suspense fallback={fallback}>{children}</Suspense>
  </ErrorBoundary>
);

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <LazyWrapper>
        <LoginPage />
      </LazyWrapper>
    ),
    errorElement: <RouterErrorElement />,
  },
  {
    path: "/register",
    element: (
      <LazyWrapper>
        <RegisterPage />
      </LazyWrapper>
    ),
    errorElement: <RouterErrorElement />,
  },
  {
    path: "/",
    element: (
      <LazyWrapper>
        <MainLayout />
      </LazyWrapper>
    ),
    errorElement: <RouterErrorElement />,
    children: [
      {
        path: "",
        element: (
          <LazyWrapper>
            <HomePage />
          </LazyWrapper>
        ),
      },
      {
        path: "generate",
        element: (
          <LazyWrapper>
            <ProtectedRoute>
              <GeneratePage />
            </ProtectedRoute>
          </LazyWrapper>
        ),
      },
      {
        path: "history",
        element: (
          <LazyWrapper>
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          </LazyWrapper>
        ),
      },
      {
        path: "videos",
        element: (
          <LazyWrapper>
            <VideosPage />
          </LazyWrapper>
        ),
      },
      {
        path: "debug",
        element: (
          <LazyWrapper>
            <DebugPage />
          </LazyWrapper>
        ),
      },
      {
        path: "debug",
        element: (
          <LazyWrapper>
            <DebugPage />
          </LazyWrapper>
        ),
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
