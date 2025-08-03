import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InlineLoader } from "../components/ui/Loading";
import SummaryApi from "../api/SummaryApi";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await SummaryApi.register(form);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-wheat">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-600 text-sm">
            Registration successful! Redirecting to login...
          </div>
        )}
        <input
          className="w-full mb-4 px-4 py-2 border rounded-lg bg-wheat text-black"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          className="w-full mb-4 px-4 py-2 border rounded-lg bg-wheat text-black"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="w-full mb-4 px-4 py-2 border rounded-lg bg-wheat text-black"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          className="w-full mb-4 px-4 py-2 border rounded-lg bg-wheat text-black"
          name="password2"
          type="password"
          placeholder="Confirm Password"
          value={form.password2}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="w-full bg-orange-500 text-white font-semibold py-2 rounded-lg shadow hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading && <InlineLoader size="small" color="white" />}
          {loading ? "Registering..." : "Register"}
        </button>

        {/* Add login link */}
        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Sign in here
          </button>
        </div>
      </form>
    </div>
  );
}
