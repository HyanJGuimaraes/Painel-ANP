import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

// Simple theme toggler that works with Tailwind's `dark` class strategy.
// It reads/saves the choice in localStorage and updates the <html> element.

const THEME_KEY = "anp-dashboard-theme";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
    // default: follow system preference, falling back to dark (current design)
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80"
      aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="ml-2 sr-only">Alternar tema</span>
    </button>
  );
}
