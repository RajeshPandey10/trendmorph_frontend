import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { Button } from "./Button";

const ThemeToggle = ({ className = "", variant = "icon" }) => {
  const { theme, toggleTheme } = useTheme();

  if (variant === "bar") {
    return (
      <div
        className={`relative inline-flex items-center theme-toggle-bar rounded-full p-1 transition-all duration-300 ${className}`}
      >
        <button
          onClick={() => theme === "dark" && toggleTheme()}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
            theme === "light"
              ? "active bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sun className="w-4 h-4" />
          <span className="hidden sm:inline">Light</span>
        </button>
        <button
          onClick={() => theme === "light" && toggleTheme()}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
            theme === "dark"
              ? "active bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Moon className="w-4 h-4" />
          <span className="hidden sm:inline">Dark</span>
        </button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`relative h-9 w-9 rounded-full ${className}`}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <Sun
        className={`h-4 w-4 transition-all ${
          theme === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100"
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all ${
          theme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
        }`}
      />
    </Button>
  );
};

export default ThemeToggle;
