import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"

function Sidebar({ collapsed, setCollapsed }: any) {

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
      className="fixed left-0 top-0 h-screen bg-[#0b0b0f] border-r border-white/10 flex flex-col z-50"
    >

      {/* 🔝 TOP */}
      <div className="flex-1">

        {/* HEADER */}
        <div className="flex items-center justify-between p-4">

          {!collapsed && (
            <h1 className="text-white font-bold text-lg">
              Sentilytics
            </h1>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white"
          >
            ⇄
          </button>

        </div>

        {/* MENU */}
        <div className="flex flex-col gap-2 px-2">

          {menu.map((item, i) => (

            <NavLink
              key={i}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all 
                ${isActive
                  ? "bg-purple-600/30 text-white"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`
              }
            >

              <span>{item.icon}</span>
              {!collapsed && <span>{item.name}</span>}

            </NavLink>

          ))}

        </div>

      </div>

      {/* 🔻 BOTTOM */}
      <div className="p-4 border-t border-white/10">

        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
            A
          </div>
          {!collapsed && <span className="text-white">Profile</span>}
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