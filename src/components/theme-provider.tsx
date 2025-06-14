
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
  // Add React hooks safety check before using useState
  if (!React.useState) {
    console.error('ThemeProvider: React hooks not available, falling back to basic render');
    return <div>{children}</div>;
  }

  const [isReactReady, setIsReactReady] = useState(false);
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

  // Initialize theme state with maximum safety
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      // Ensure React is properly initialized before using hooks
      if (!React.useState || !isReactReady) {
        console.warn('ThemeProvider: React not ready, using default theme');
        return defaultTheme;
      }
      return getStoredTheme();
    } catch (error) {
      console.error('ThemeProvider: Error during theme initialization:', error);
      return defaultTheme;
    }
  });

  // React readiness check - ensure hooks are available
  useEffect(() => {
    try {
      console.log('ThemeProvider: Checking React readiness');
      if (React.useState && React.useEffect && React.useContext) {
        setIsReactReady(true);
        console.log('ThemeProvider: React is ready');
      }
    } catch (error) {
      console.error('ThemeProvider: React readiness check failed:', error);
    }
  }, []);

  // Component mount guard - defer theme operations until fully mounted
  useEffect(() => {
    if (!isReactReady) return;
    
    try {
      setIsMounted(true);
      console.log('ThemeProvider: Component mounted, initializing theme');
      
      // Re-check stored theme after mount to ensure consistency
      const storedTheme = getStoredTheme();
      if (storedTheme !== theme) {
        setThemeState(storedTheme);
      }
    } catch (error) {
      console.error('ThemeProvider: Error during mount:', error);
    }
  }, [isReactReady]);

  // Apply theme to DOM
  useEffect(() => {
    if (!isMounted || !isReactReady) return;

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
      console.log('ThemeProvider: Applied theme:', theme);
    } catch (error) {
      console.error('ThemeProvider: Error applying theme:', error);
    }
  }, [theme, isMounted, isReactReady])

  const setTheme = (newTheme: Theme) => {
    try {
      if (!isMounted || !isReactReady) {
        console.warn('ThemeProvider: Attempting to set theme before component is ready');
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

  // Don't render children until React is ready
  if (!isReactReady) {
    return <div>{children}</div>;
  }

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
