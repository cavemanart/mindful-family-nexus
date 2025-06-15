
import React, { createContext, useContext, useEffect, useState } from "react"

console.log('[theme-provider] ThemeProvider module loaded. React hooks available:', !!useState && !!useEffect);

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

function ThemeProviderFallback({ children }: { children: React.ReactNode }) {
  // Fallback rendering when React hooks are unavailable
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">App Initializing...</h2>
        <p className="text-gray-500 mb-4">Please wait while we load the application.</p>
      </div>
      {children}
    </div>
  )
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  // Defensive: Check if React hooks are available
  const hooksAvailable =
    typeof useState === 'function' && typeof useEffect === 'function' && React !== undefined;

  if (!hooksAvailable) {
    console.warn("[theme-provider] Hooks not available, rendering fallback.");
    return <ThemeProviderFallback>{children}</ThemeProviderFallback>;
  }

  const [theme, setTheme] = useState<Theme>(() => {
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

  useEffect(() => {
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
  }, [theme]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(storageKey, theme);
      }
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
    }
  }, [theme, storageKey]);

  const value = {
    theme,
    setTheme,
  };

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
