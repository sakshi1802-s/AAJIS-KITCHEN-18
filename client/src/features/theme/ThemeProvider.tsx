import { useCallback, useMemo, useState, type ReactNode } from "react";
import { THEME_STORAGE_KEY, ThemeContext, type Theme, type ThemeContextValue } from "./themeContext";

/**
 * Light-first: a catering site is a light-mode product, so we never follow the
 * OS setting — dark is something the customer opts into and we remember.
 * The matching no-flash script in index.html applies the class before paint.
 */
function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    // private mode / blocked storage
    return "light";
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // not worth failing over
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark") }),
    [theme, setTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
