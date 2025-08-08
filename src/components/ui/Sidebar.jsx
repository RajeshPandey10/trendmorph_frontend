import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../contexts/ThemeContext";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./Button";
import {
  Home,
  Sparkles,
  FileText,
  Video,
  LogOut,
  LogIn,
  UserPlus,
  Mic,
  ExternalLink,
} from "lucide-react";

const navItems = [
  { label: "Home", to: "/", icon: Home, protected: false },
  { label: "Generate", to: "/generate", icon: Sparkles, protected: true },
  { label: "History", to: "/history", icon: FileText, protected: true },
  { label: "Videos", to: "/videos", icon: Video, protected: false },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isDark } = useTheme();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <aside
      className={`fixed z-40 top-0 left-0 h-screen w-64 bg-card border-r border-border shadow-xl transition-transform duration-300 transform flex flex-col ${
        open ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:sticky md:top-0 md:bg-card/95 md:backdrop-blur md:supports-[backdrop-filter]:bg-card/60`}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <Logo size="md" animated={true} />
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            TrendMorphAI
          </span>
        </div>
        {/* <div className="flex items-center gap-2">
          <ThemeToggle className="md:flex hidden" />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✖️
          </Button>
        </div> */}
      </div>

      <nav className="flex flex-col gap-2 mt-6 px-4 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          // Hide protected items if not authenticated
          if (item.protected && !isAuthenticated) return null;

          // Hide dev items in production
          if (item.dev && import.meta.env.PROD) return null;

          const IconComponent = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 group ${
                location.pathname === item.to
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={onClose}
            >
              <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Voice AI Product Promotion */}
      <div className="px-4 py-4 border-t border-border/50">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/20 rounded-md">
              <Mic className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Voice AI Generator
              </h4>
              <p className="text-xs text-muted-foreground">
                Our premium product
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Generate professional content for Nepali businesses in seconds
          </p>
          <Button
            onClick={() => {
              window.open(
                "https://voice-ai-content-generator-frontend.vercel.app/",
                "_blank"
              );
              onClose();
            }}
            size="sm"
            className="w-full gap-2 text-xs"
          >
            <ExternalLink className="w-3 h-3" />
            Try Voice AI
          </Button>
        </div>
      </div>

      <div className="mt-auto px-4 py-6 border-t border-border flex-shrink-0 space-y-4">
        <div className="md:hidden flex justify-center">
          <ThemeToggle />
        </div>

        {isAuthenticated ? (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground px-2">
              Welcome,{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {user?.username || user?.email?.split("@")[0] || "User"}
              </span>
              !
            </div>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full justify-start gap-2"
              size="sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button asChild className="w-full justify-start gap-2" size="sm">
              <Link to="/login" onClick={onClose}>
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2"
              size="sm"
            >
              <Link to="/register" onClick={onClose}>
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center hidden md:block pt-2">
          &copy; {new Date().getFullYear()} TrendMorphAI
        </div>
      </div>
    </aside>
  );
}
