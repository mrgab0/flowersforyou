"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
        <Sun size={16} />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-[#FF97A4] dark:hover:text-[#FF97A4] transition-all hover:scale-105 active:scale-95 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center"
      title={isDark ? "Cambiar a Modo Claro ☀️" : "Cambiar a Modo Oscuro 🌙"}
      aria-label="Alternar tema claro/oscuro"
    >
      {isDark ? (
        <Sun size={16} className="text-amber-400 animate-in spin-in-90 duration-300" />
      ) : (
        <Moon size={16} className="text-slate-700 animate-in spin-in-90 duration-300" />
      )}
    </button>
  );
}
