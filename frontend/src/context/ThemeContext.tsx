import { createContext, useState, useContext, ReactNode } from "react";

// Define proper types for context
type ThemeContextType = {
  darkMode: boolean;
  toggleTheme: () => void;
};

// Create context with undefined default
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Props type for provider
type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <div className={darkMode ? "dark" : ""}>{children}</div>
    </ThemeContext.Provider>
  );
};

// Custom hook with safety check
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
