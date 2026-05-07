"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-1 items-center justify-center">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-lg transition-colors ${
          theme === "light"
            ? "bg-yellow-400/20 text-yellow-500"
            : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
        }`}
        title="Light Mode"
        aria-label="Light Mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-lg transition-colors ${
          theme === "dark"
            ? "bg-indigo-400/20 text-indigo-400"
            : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
        }`}
        title="Dark Mode"
        aria-label="Dark Mode"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-lg transition-colors ${
          theme === "system"
            ? "bg-blue-400/20 text-blue-400"
            : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
        }`}
        title="System Theme"
        aria-label="System Theme"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}
