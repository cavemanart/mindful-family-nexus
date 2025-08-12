import * as React from "react";

console.log('[theme-provider] ThemeProvider module loaded. React namespace imported:', !!React);

export type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

function ThemeProviderFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">App Initializing...</h2>
        <p className="text-gray-500 mb-4">Please wait while we load the application.</p>
      </div>
      {children}
    </div>
  );
}

function getInitialTheme(storageKey: string, defaultTheme: Theme): Theme {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === "dark" || stored === "light" || stored === "system") {
        return stored as Theme;
      }
    }
  } catch (error) {
    console.warn("[theme-provider] Failed to read theme from localStorage:", error);
  }
  return defaultTheme;
}

function applyThemeToDOM(theme: Theme) {
  try {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    console.log("🎨 Applied theme to DOM:", theme);
  } catch (error) {
    console.warn("[theme-provider] Failed to apply theme to DOM:", error);
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  // Avoid React hooks entirely to prevent "dispatcher is null" edge cases
  if (typeof React === "undefined" || !React.createElement) {
    console.warn("[theme-provider] React not available, rendering fallback");
    return <ThemeProviderFallback>{children}</ThemeProviderFallback>;
  }

  const theme = getInitialTheme(storageKey, defaultTheme);

  // Apply theme immediately on render (no hooks)
  if (typeof window !== "undefined") {
    applyThemeToDOM(theme);
  }

  const setTheme = (next: Theme) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(storageKey, next);
      }
    } catch (error) {
      console.warn("[theme-provider] Failed to save theme to localStorage:", error);
    }
    if (typeof window !== "undefined") {
      applyThemeToDOM(next);
      // Optional: dispatch event for listeners, since we don't re-render here
      window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
    }
  };

  const value: ThemeProviderState = { theme, setTheme };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

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
};
