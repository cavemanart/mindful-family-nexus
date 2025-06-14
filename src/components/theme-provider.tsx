
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
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Simple initialization without complex React readiness checks
  useEffect(() => {
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
  }, [defaultTheme, storageKey]);

  // Apply theme to DOM
  useEffect(() => {
    if (!mounted) return;

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
  }, [theme, mounted]);

  // Save theme to localStorage
  useEffect(() => {
    if (!mounted) return;
    
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(storageKey, theme);
      }
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
    }
  }, [theme, storageKey, mounted]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      if (mounted) {
        setTheme(theme);
      }
    },
  };

  // Simple loading state without complex visibility handling
  if (!mounted) {
    return (
      <div className="opacity-0">
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
