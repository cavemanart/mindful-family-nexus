
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
  // Check if React hooks are available before using them
  if (!React || !React.useState) {
    console.warn('React hooks not available, using fallback rendering');
    return (
      <div className="opacity-0" style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  const [theme, setTheme] = useState<Theme>(() => {
    // Safe initialization
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(storageKey);
        if (stored && (stored === "dark" || stored === "light" || stored === "system")) {
          return stored as Theme;
        }
      }
    } catch (error) {
      console.warn("Failed to read theme from localStorage:", error);
    }
    return defaultTheme;
  });

  const [mounted, setMounted] = useState(false);

  // Safe initialization effect
  useEffect(() => {
    try {
      console.log('🎨 Theme provider mounting');
      setMounted(true);
      console.log('✅ Theme provider mounted successfully');
    } catch (error) {
      console.warn("Failed to mount theme provider:", error);
      setMounted(true); // Still set mounted to prevent infinite loading
    }
  }, []);

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
    setTheme: (newTheme: Theme) => {
      if (mounted) {
        setTheme(newTheme);
      }
    },
  };

  // Show loading state while not mounted
  if (!mounted) {
    return (
      <div className="opacity-0" style={{ visibility: 'hidden' }}>
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
