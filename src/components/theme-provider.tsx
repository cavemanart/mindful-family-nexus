
import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Safe localStorage access
  const getStoredTheme = (): Theme => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return defaultTheme;
      }
      const stored = localStorage.getItem(storageKey);
      if (stored && ['dark', 'light', 'system'].includes(stored)) {
        return stored as Theme;
      }
    } catch (error) {
      console.warn('ThemeProvider: Failed to access localStorage:', error);
    }
    return defaultTheme;
  };

  // Initialize theme state
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme;
    }
    return getStoredTheme();
  });

  // Component mount guard
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    if (!isMounted) return;

    try {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches ? "dark" : "light";
        root.classList.add(systemTheme);
        return;
      }

      root.classList.add(theme);
    } catch (error) {
      console.error('ThemeProvider: Error applying theme:', error);
    }
  }, [theme, isMounted]);

  const setTheme = (newTheme: Theme) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(storageKey, newTheme);
      }
      setThemeState(newTheme);
    } catch (error) {
      console.error('ThemeProvider: Error setting theme:', error);
    }
  };

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
