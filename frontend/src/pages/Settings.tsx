import { useEffect, useState } from "react"
import { useTheme } from "../context/ThemeContext"

function Settings() {
  const { darkMode, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [autoAnalysis, setAutoAnalysis] = useState(false)
  const [language, setLanguage] = useState("English")

  useEffect(() => {
    const saved = localStorage.getItem("ai_dashboard_settings")
    if (!saved) return

    const settings = JSON.parse(saved)
    setNotifications(settings.notifications ?? true)
    setAutoAnalysis(settings.autoAnalysis ?? false)
    setLanguage(settings.language ?? "English")
  }, [])

  const saveSettings = () => {
    const settings = { darkMode, notifications, autoAnalysis, language }
    localStorage.setItem("ai_dashboard_settings", JSON.stringify(settings))
    alert("Settings saved successfully!")
  }

  return (
    <div className="min-h-screen p-8 text-slate-900 dark:text-white">
      <h1 className="mb-8 text-3xl font-bold">Settings</h1>

      <div className="space-y-6 rounded-xl border border-slate-200 bg-white/85 p-6 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Dark Mode</h2>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              Toggle dark theme for the dashboard
            </p>
          </div>

          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setTheme(darkMode ? "light" : "dark")}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Enable Notifications</h2>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              Receive alerts for important feedback
            </p>
          </div>

          <input
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Auto Analyze Feedback</h2>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              Automatically analyze new feedback
            </p>
          </div>

          <input
            type="checkbox"
            checked={autoAnalysis}
            onChange={() => setAutoAnalysis(!autoAnalysis)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Language</h2>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              Choose feedback language
            </p>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded border border-slate-300 bg-white p-2 text-slate-900 dark:border-white/10 dark:bg-black/60 dark:text-white"
          >
            <option>English</option>
            <option>Hinglish</option>
            <option>Hindi</option>
          </select>
        </div>

        <button
          onClick={saveSettings}
          className="rounded-xl bg-pink-500 px-6 py-2 text-white hover:bg-pink-600"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}

export default Settings
