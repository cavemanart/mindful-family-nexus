
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
  // Initialize with defaultTheme, no browser access
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  // Only run once when component mounts
  useEffect(() => {
    setMounted(true)
    
    // Only access localStorage after mounting
    if (typeof window !== "undefined") {
      try {
        const storedTheme = window.localStorage.getItem(storageKey) as Theme
        if (storedTheme && (storedTheme === "dark" || storedTheme === "light" || storedTheme === "system")) {
          setTheme(storedTheme)
        }
      } catch (error) {
        console.warn("Could not access localStorage:", error)
      }
    }
  }, [storageKey])

  // Apply theme to DOM when theme or mounted state changes
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return

    try {
      const root = window.document.documentElement
      root.classList.remove("light", "dark")

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        root.classList.add(systemTheme)
      } else {
        root.classList.add(theme)
      }
    } catch (error) {
      console.warn("Could not apply theme:", error)
    }
  }, [theme, mounted])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme)
      
      // Save to localStorage after state update
      if (mounted && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(storageKey, newTheme)
        } catch (error) {
          console.warn("Could not save theme to localStorage:", error)
        }
      }
    },
  }

  // Always render the provider, but with initial state until mounted
  return (
    <ThemeProviderContext.Provider {...props} value={mounted ? value : initialState}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
