
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

// CSS-based fallback theme application
const applyCSSTheme = (theme: Theme) => {
  try {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  } catch (error) {
    console.error('CSS theme application failed:', error);
  }
};

// Fallback component for when React hooks aren't available
const FallbackThemeProvider = ({ children, defaultTheme = "light" }: ThemeProviderProps) => {
  console.warn('ThemeProvider: Using fallback mode due to React hooks unavailability');
  
  // Apply theme via CSS without hooks
  useEffect(() => {
    applyCSSTheme(defaultTheme);
  }, [defaultTheme]);
  
  return <div className={defaultTheme}>{children}</div>;
};

// Safe hook-based ThemeProvider
const SafeThemeProvider = ({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) => {
  // Use state hook safely
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
    applyCSSTheme(theme);
  }, [theme, isMounted]);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('ThemeProvider: Error setting theme:', error);
      setThemeState(newTheme);
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

// Main ThemeProvider with comprehensive safety checks
export function ThemeProvider(props: ThemeProviderProps) {
  // Check if React and hooks are available
  if (typeof React === 'undefined') {
    console.error('ThemeProvider: React not available, using CSS fallback');
    return <FallbackThemeProvider {...props} />;
  }

  if (typeof React.useState !== 'function' || typeof React.useEffect !== 'function') {
    console.error('ThemeProvider: React hooks not available, using CSS fallback');
    return <FallbackThemeProvider {...props} />;
  }

  // Test hook execution safety
  try {
    const testState = React.useState(true);
    if (!testState || typeof testState[1] !== 'function') {
      throw new Error('React hooks not functioning properly');
    }
    
    return <SafeThemeProvider {...props} />;
  } catch (error) {
    console.error('ThemeProvider: Hook execution failed, using CSS fallback:', error);
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
