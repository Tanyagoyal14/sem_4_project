import { motion } from "framer-motion"
import { NavLink } from "react-router-dom"

type SidebarProps = {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
}

function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const menu = [
    { name: "Dashboard", path: "/app/dashboard", icon: "📊" },
    { name: "Analytics", path: "/app/analytics", icon: "📈" },
    { name: "History", path: "/app/history", icon: "🕘" },
    { name: "Reports", path: "/app/reports", icon: "📄" },
    { name: "Settings", path: "/app/settings", icon: "⚙️" }
  ]

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 256 }}
      className="fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b0b0f]"
    >
      <div className="flex-1">
        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Sentilytics
            </h1>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-900 dark:text-white"
          >
            ⇄
          </button>
        </div>

        <div className="flex flex-col gap-2 px-2">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                  isActive
                    ? "bg-purple-600/20 text-purple-700 dark:bg-purple-600/30 dark:text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                }`
              }
            >
              <span>{item.icon}</span>
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 p-4 dark:border-white/10">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white">
            A
          </div>
          {!collapsed && <span className="text-slate-900 dark:text-white">Profile</span>}
        </div>

        {!collapsed && (
          <button className="text-red-400 hover:text-red-300">
            Logout
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default Sidebar
