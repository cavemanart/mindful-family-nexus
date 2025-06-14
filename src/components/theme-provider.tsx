
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

// Create a fallback component for when React hooks aren't available
const FallbackThemeProvider = ({ children }: { children: React.ReactNode }) => {
  console.warn('ThemeProvider: Using fallback mode due to React hooks unavailability');
  return <div className="light">{children}</div>;
};

// Main ThemeProvider component with proper hook usage
const MainThemeProvider = ({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      setIsMounted(true);
      
      // Safe localStorage access after mount
      const stored = localStorage.getItem(storageKey);
      if (stored && ['dark', 'light', 'system'].includes(stored)) {
        setThemeState(stored as Theme);
      }
    } catch (error) {
      console.warn('ThemeProvider: Failed to access localStorage:', error);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isMounted) return;

    try {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches ? "dark" : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    } catch (error) {
      console.error('ThemeProvider: Error applying theme:', error);
    }
  }, [theme, isMounted]);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('ThemeProvider: Error setting theme:', error);
      setThemeState(newTheme); // Still update state even if localStorage fails
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
};

// Export the main ThemeProvider with safety checks
export function ThemeProvider(props: ThemeProviderProps) {
  // Check if React and hooks are available before attempting to use them
  if (typeof React === 'undefined' || typeof React.useState !== 'function') {
    console.error('ThemeProvider: React hooks not available, using fallback');
    return <FallbackThemeProvider {...props} />;
  }

  // Additional safety check for the current React context
  try {
    return <MainThemeProvider {...props} />;
  } catch (error) {
    console.error('ThemeProvider: Error in main provider, using fallback:', error);
    return <FallbackThemeProvider {...props} />;
  }
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    console.warn("useTheme called outside of ThemeProvider, returning default values");
    return {
      theme: "light" as Theme,
      setTheme: () => {},
    };
  }

  return context;
};
