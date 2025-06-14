
import React, { createContext, useContext, useEffect, useState } from "react"
import { useReactReadiness } from "./ReactReadinessProvider"

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
  const { isReady } = useReactReadiness();
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Only initialize theme after React is ready
  useEffect(() => {
    if (!isReady) return;

    try {
      console.log('🎨 Initializing theme provider');
      
      // Safe localStorage access
      let storedTheme = defaultTheme;
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(storageKey);
        if (stored && (stored === "dark" || stored === "light" || stored === "system")) {
          storedTheme = stored as Theme;
        }
      }
      
      setTheme(storedTheme);
      setMounted(true);
      console.log('✅ Theme provider initialized with theme:', storedTheme);
    } catch (error) {
      console.warn("Failed to initialize theme:", error);
      setTheme(defaultTheme);
      setMounted(true);
    }
  }, [isReady, defaultTheme, storageKey]);

  // Apply theme to DOM only after mounted and React is ready
  useEffect(() => {
    if (!mounted || !isReady) return;

    try {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
        return;
      }

      root.classList.add(theme);
      console.log('🎨 Applied theme to DOM:', theme);
    } catch (error) {
      console.warn("Failed to apply theme to DOM:", error);
    }
  }, [theme, mounted, isReady]);

  // Save theme to localStorage with error handling
  useEffect(() => {
    if (!mounted || !isReady) return;
    
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(storageKey, theme);
      }
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
    }
  }, [theme, storageKey, mounted, isReady]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      if (mounted && isReady) {
        setTheme(theme);
      }
    },
  };

  // Show loading state until React is ready and theme is mounted
  if (!isReady || !mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    console.warn("useTheme must be used within a ThemeProvider, using fallback");
    return {
      theme: "light" as Theme,
      setTheme: () => {
        console.warn("setTheme called outside of ThemeProvider context");
      }
    };
  }

  return context;
}
