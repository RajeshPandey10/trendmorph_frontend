import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export default function DebugPage() {
  const [backendHealth, setBackendHealth] = useState(null);
  const [oauthTest, setOauthTest] = useState(null);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Test backend health
    fetch("https://trendmorph-ai-backend.onrender.com/health")
      .then((res) => res.json())
      .then((data) => setBackendHealth(data))
      .catch((err) => setBackendHealth({ error: err.message }));

    // Test OAuth endpoint
    fetch("https://trendmorph-ai-backend.onrender.com/api/auth/google", {
      method: "GET",
      redirect: "manual", // Don't follow redirects
    })
      .then((res) => {
        setOauthTest({
          status: res.status,
          statusText: res.statusText,
          type: res.type,
          redirected: res.redirected,
          url: res.url,
        });
      })
      .catch((err) => setOauthTest({ error: err.message }));
  }, []);

  const testOAuth = () => {
    window.open(
      "https://trendmorph-ai-backend.onrender.com/api/auth/google",
      "_blank"
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Debug Information</h1>

      {/* Auth Status */}
      <div className="bg-card p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Authentication Status</h2>
        <div className="space-y-2">
          <p>
            <strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
          </p>
          <p>
            <strong>User:</strong>{" "}
            {user ? JSON.stringify(user, null, 2) : "None"}
          </p>
          <p>
            <strong>Token:</strong>{" "}
            {localStorage.getItem("access_token") ? "Present" : "None"}
          </p>
        </div>
      </div>

      {/* Backend Health */}
      <div className="bg-card p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Backend Health</h2>
        <pre className="bg-muted p-3 rounded text-sm overflow-auto">
          {backendHealth
            ? JSON.stringify(backendHealth, null, 2)
            : "Loading..."}
        </pre>
      </div>

      {/* OAuth Test */}
      <div className="bg-card p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">OAuth Endpoint Test</h2>
        <pre className="bg-muted p-3 rounded text-sm overflow-auto mb-3">
          {oauthTest ? JSON.stringify(oauthTest, null, 2) : "Loading..."}
        </pre>
        <button
          onClick={testOAuth}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
        >
          Test OAuth (New Window)
        </button>
      </div>

      {/* Environment Info */}
      <div className="bg-card p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Environment Info</h2>
        <div className="space-y-2">
          <p>
            <strong>Frontend URL:</strong> {window.location.origin}
          </p>
          <p>
            <strong>API Base URL:</strong>{" "}
            {import.meta.env.VITE_API_BASE_URL || "Not set"}
          </p>
          <p>
            <strong>Mode:</strong> {import.meta.env.MODE}
          </p>
          <p>
            <strong>Dev:</strong> {import.meta.env.DEV ? "Yes" : "No"}
          </p>
        </div>
      </div>

      {/* Manual OAuth Test */}
      <div className="bg-card p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Manual Tests</h2>
        <div className="space-y-3">
          <div>
            <a
              href="https://trendmorph-ai-backend.onrender.com/api/auth/google"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test OAuth Direct Link
            </a>
          </div>
          <div>
            <a
              href="https://trendmorph-ai-backend.onrender.com/health"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test Backend Health
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
