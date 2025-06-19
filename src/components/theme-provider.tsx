
import React from "react";

console.log('[theme-provider] ThemeProvider module loaded. React namespace imported:', !!React);

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
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

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  // Check if React hooks are available BEFORE calling them
  const hooksAvailable =
    typeof React === "object" &&
    React !== null &&
    typeof React.useState === "function" &&
    typeof React.useEffect === "function";

  if (!hooksAvailable) {
    console.warn("[theme-provider] Hooks or React not available during initialization");
    return <ThemeProviderFallback>{children}</ThemeProviderFallback>;
  }

  // Now it's safe to call hooks
  const [theme, setTheme] = React.useState<Theme>(() => {
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
  });

  React.useEffect(() => {
    try {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
        return;
      }

      root.classList.add(theme);
      console.log("🎨 Applied theme to DOM:", theme);
    } catch (error) {
      console.warn("[theme-provider] Failed to apply theme to DOM:", error);
    }
  }, [theme]);

  React.useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(storageKey, theme);
      }
    } catch (error) {
      console.warn("[theme-provider] Failed to save theme to localStorage:", error);
    }
  }, [theme, storageKey]);

  const value: ThemeProviderState = React.useMemo(() => ({
    theme,
    setTheme,
  }), [theme]);

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
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
