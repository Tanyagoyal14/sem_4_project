import { Moon, Sun } from "lucide-react"
import { useTheme } from "../context/ThemeContext"

function ThemeToggle() {
  const { darkMode, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg bg-gray-200 p-2 dark:bg-gray-700"
    >
      {darkMode ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}

export default ThemeToggle
