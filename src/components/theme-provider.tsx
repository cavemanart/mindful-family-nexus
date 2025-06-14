
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
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return (localStorage.getItem(storageKey) as Theme) || defaultTheme
      }
    } catch (error) {
      console.warn("Failed to access localStorage for theme:", error)
    }
    return defaultTheme
  })

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

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
  }, [theme, mounted])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem(storageKey, theme)
        }
      } catch (error) {
        console.warn("Failed to save theme to localStorage:", error)
      }
      setTheme(theme)
    },
  }

  // Show a minimal fallback until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className="min-h-screen bg-background text-foreground">{children}</div>
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
    console.error("useTheme must be used within a ThemeProvider")
    // Return a safe fallback
    return {
      theme: "light" as Theme,
      setTheme: () => {}
    }
  }

  return context
}
