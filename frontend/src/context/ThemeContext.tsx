import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

type Theme = "light" | "dark"

type ThemeContextType = {
  theme: Theme
  darkMode: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

type ThemeProviderProps = {
  children: ReactNode
}

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark"
  const savedTheme = localStorage.getItem("theme")
  return savedTheme === "light" ? "light" : "dark"
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    localStorage.setItem("theme", theme)
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.body.classList.toggle("dark", theme === "dark")
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) => currentTheme === "dark" ? "light" : "dark")
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        darkMode: theme === "dark",
        setTheme,
        toggleTheme
      }}
    >
      <div className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
