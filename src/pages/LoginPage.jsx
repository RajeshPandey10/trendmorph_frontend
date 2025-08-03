import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { InlineLoader } from "../components/ui/Loading";
import GoogleLoginButton from "../components/auth/GoogleLoginButton";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(form);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-wheat px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Welcome Back
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full px-4 py-2 border rounded-lg bg-wheat text-black"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            className="w-full px-4 py-2 border rounded-lg bg-wheat text-black"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-orange-500 text-white font-semibold py-2 rounded-lg shadow hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && <InlineLoader size="small" color="white" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <GoogleLoginButton />

        {/* Add register link */}
        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}
