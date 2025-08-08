import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Sidebar from "../components/ui/Sidebar";
import Logo from "../components/ui/Logo";
import ThemeToggle from "../components/ui/ThemeToggle";
import { Button } from "../components/ui/Button";
import { Menu, User, LogOut, LogIn } from "lucide-react";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen md:ml-0">
        <header className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between py-4 px-4 md:px-8">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="h-9 w-9 md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* Logo and title */}
            <div className="flex items-center gap-2">
              <Logo size="sm" animated={true} />
              <h1 className="text-lg font-bold tracking-tight">TrendMorphAI</h1>
            </div>

            {/* Right side - Theme toggle and user actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {/* User authentication status - only show on desktop */}
              <div className="hidden md:flex items-center gap-2">
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{user?.username || "User"}</span>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button asChild variant="ghost" size="sm" className="gap-1">
                    <Link to="/login">
                      <LogIn className="w-4 h-4" />
                      Login
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 md:px-8 py-6 w-full max-w-7xl">
          <Outlet />
        </main>

        <footer className="bg-card border-t border-border py-4 text-center text-xs text-muted-foreground md:hidden">
          <div className="container mx-auto px-4">
            &copy; {new Date().getFullYear()} TrendMorphAI. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
