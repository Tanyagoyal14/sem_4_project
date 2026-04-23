import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../assets/logo.png"
import { useTheme } from "../context/ThemeContext"
import { clearAuth, getAuthRole, getStoredUser } from "../utils/auth"

function Topbar() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [authUser, setAuthUser] = useState(getStoredUser())
  const role = getAuthRole()

  useEffect(() => {
    const syncUser = () => setAuthUser(getStoredUser())

    window.addEventListener("auth-change", syncUser)
    window.addEventListener("storage", syncUser)

    return () => {
      window.removeEventListener("auth-change", syncUser)
      window.removeEventListener("storage", syncUser)
    }
  }, [])

  const notifications = [
    "New negative feedback detected",
    "Complaint spike detected",
    "AI trend detected: Delivery delays"
  ]

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="Sentilytics Logo"
          className="h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]"
        />

        <div>
          <h1 className="text-xl font-bold tracking-wide text-slate-900 dark:text-white">
            Sentilytics
          </h1>

          <p className="text-xs text-emerald-500 dark:text-green-400">
            Live AI monitoring
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {typeof authUser?.credits === "number" && (
          <div
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              authUser.credits > 0
                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                : "border-amber-400/20 bg-amber-500/10 text-amber-300"
            }`}
          >
            {role === "premium" ? "Unlimited credits" : `${authUser.credits} credits left`}
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="rounded-full border border-slate-300 bg-white px-3 py-2 text-lg shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-xl text-slate-900 transition hover:text-pink-400 dark:text-white"
          >
            🔔
            <span className="absolute -right-2 -top-2 rounded-full bg-pink-500 px-1.5 py-0.5 text-xs text-white">
              {notifications.length}
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 z-50 mt-3 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-black">
              <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">
                Notifications
              </h3>

              {notifications.map((notification, index) => (
                <p
                  key={index}
                  className="mb-2 rounded p-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  {notification}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowAdmin(!showAdmin)}
            className="flex items-center gap-2 transition hover:text-pink-400"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 font-semibold text-white shadow-md">
              {authUser?.email?.[0]?.toUpperCase() || "A"}
            </div>

            <span className="text-slate-900 dark:text-white">
              {role === "premium" ? "Premium" : "Free"}
            </span>
          </button>

          {showAdmin && (
            <div className="absolute right-0 z-50 mt-3 w-40 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-black">
              <p
                className="mb-2 cursor-pointer text-slate-700 hover:text-pink-400 dark:text-white"
                onClick={() => navigate("/app/profile")}
              >
                Profile
              </p>

              <p
                className="mb-2 cursor-pointer text-slate-700 hover:text-pink-400 dark:text-white"
                onClick={() => navigate("/app/settings")}
              >
                Settings
              </p>

              <p
                className="cursor-pointer text-slate-700 hover:text-red-400 dark:text-white"
                onClick={() => {
              clearAuth()
                  navigate("/login")
                }}
              >
                Logout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Topbar
