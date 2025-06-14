
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

  // Safe localStorage access with comprehensive error handling
  const getStoredTheme = (): Theme => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.warn('ThemeProvider: Window not available, using default theme');
        return defaultTheme;
      }

      // Check if localStorage is available
      if (!window.localStorage) {
        console.warn('ThemeProvider: localStorage not available, using default theme');
        return defaultTheme;
      }

      const stored = localStorage.getItem(storageKey);
      if (stored && ['dark', 'light', 'system'].includes(stored)) {
        return stored as Theme;
      }
    } catch (error) {
      console.warn('ThemeProvider: Failed to access localStorage for theme:', error);
    }
    return defaultTheme;
  };

  // Initialize theme state with safety checks
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      // Ensure React is properly initialized before using hooks
      if (typeof React === 'undefined') {
        console.error('ThemeProvider: React not properly initialized');
        return defaultTheme;
      }
      return getStoredTheme();
    } catch (error) {
      console.error('ThemeProvider: Error during theme initialization:', error);
      return defaultTheme;
    }
  });

  // Component mount guard - defer theme operations until fully mounted
  useEffect(() => {
    try {
      setIsMounted(true);
      // Re-check stored theme after mount to ensure consistency
      const storedTheme = getStoredTheme();
      if (storedTheme !== theme) {
        setThemeState(storedTheme);
      }
    } catch (error) {
      console.error('ThemeProvider: Error during mount:', error);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    try {
      const root = window.document.documentElement

      root.classList.remove("light", "dark")

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light"

        root.classList.add(systemTheme)
        return
      }

      root.classList.add(theme)
    } catch (error) {
      console.error('ThemeProvider: Error applying theme:', error);
    }
  }, [theme, isMounted])

  const setTheme = (newTheme: Theme) => {
    try {
      if (!isMounted) {
        console.warn('ThemeProvider: Attempting to set theme before component is mounted');
        return;
      }

      // Save to localStorage with error handling
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(storageKey, newTheme);
        } catch (error) {
          console.warn('ThemeProvider: Failed to save theme to localStorage:', error);
        }
      }
      
      setThemeState(newTheme);
    } catch (error) {
      console.error('ThemeProvider: Error setting theme:', error);
    }
  };

  const value = {
    theme,
    setTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  try {
    const context = useContext(ThemeProviderContext)

    if (context === undefined) {
      throw new Error("useTheme must be used within a ThemeProvider")
    }

    return context
  } catch (error) {
    console.error('ThemeProvider: Error in useTheme hook:', error);
    // Return a safe fallback
    return {
      theme: "system" as Theme,
      setTheme: () => console.warn('ThemeProvider: setTheme not available due to context error')
    };
  }
}
