import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const navItems = [
  { label: "Home", to: "/", icon: "🏠" },
  { label: "Generate", to: "/generate", icon: "✨", protected: true },
  { label: "History", to: "/history", icon: "📋", protected: true },
  { label: "Videos", to: "/videos", icon: "🎥" },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <aside
      className={`fixed z-40 top-0 left-0 h-screen w-64 bg-black text-white shadow-2xl border-r-0 transition-transform duration-200 transform flex flex-col ${
        open ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:sticky md:top-0`}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-black flex-shrink-0">
        <span className="text-2xl font-extrabold tracking-tight drop-shadow">
          TrendMorphAI
        </span>
        <button
          className="md:hidden text-white text-xl"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ✖️
        </button>
      </div>

      <nav className="flex flex-col gap-2 mt-8 px-4 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          // Hide protected items if not authenticated
          if (item.protected && !isAuthenticated) return null;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-lg transition-all duration-150 ${
                location.pathname === item.to
                  ? "bg-orange-500 text-white shadow-inner"
                  : "hover:bg-orange-400 hover:text-white/90"
              }`}
              onClick={onClose}
            >
              <span className="text-2xl">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-6 py-6 border-t border-white/10 flex-shrink-0">
        {isAuthenticated ? (
          <div className="space-y-3">
            <div className="text-sm text-white/70">
              Welcome, {user?.username || "User"}!
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              to="/login"
              className="block w-full bg-orange-500 text-white text-center px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
              onClick={onClose}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="block w-full border border-white/20 text-white text-center px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition"
              onClick={onClose}
            >
              Register
            </Link>
          </div>
        )}
        <div className="text-xs text-white/50 mt-4 hidden md:block">
          &copy; {new Date().getFullYear()} TrendMorphAI
        </div>
      </div>
    </aside>
  );
}
