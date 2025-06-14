
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
  const [theme, setTheme] = useState<Theme>(() => {
    // Safe localStorage access during initialization
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(storageKey)
        if (stored && (stored === "dark" || stored === "light" || stored === "system")) {
          return stored as Theme
        }
      }
    } catch (error) {
      console.warn("Failed to read theme from localStorage:", error)
    }
    return defaultTheme
  })

  const [mounted, setMounted] = useState(false)

  // Mark component as mounted after React is ready
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only run DOM manipulation after component is mounted
    if (!mounted) return

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
      console.warn("Failed to apply theme to DOM:", error)
    }
  }, [theme, mounted])

  // Save theme to localStorage with error handling
  useEffect(() => {
    if (!mounted) return
    
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(storageKey, theme)
      }
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error)
    }
  }, [theme, storageKey, mounted])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme)
    },
  }

  // Don't render children until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    )
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    // Provide safe fallback instead of throwing
    console.warn("useTheme must be used within a ThemeProvider, using fallback")
    return {
      theme: "light" as Theme,
      setTheme: () => {
        console.warn("setTheme called outside of ThemeProvider context")
      }
    }
  }

  return context
}
