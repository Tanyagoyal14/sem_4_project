import { NavLink } from "react-router-dom";

function Sidebar() {

  const base =
    "flex items-center gap-3 px-4 py-3 rounded-lg transition";

  return (

    <div className="w-64 min-h-screen bg-[#0f0f17] border-r border-[#1f1f2e] p-6 text-gray-200">

      <h2 className="text-2xl font-bold mb-8 text-purple-400">
        AI Insights
      </h2>

      <nav className="space-y-3">

        <NavLink
          to="/app/dashboard"
          className={({isActive}) =>
            `${base} ${
              isActive
                ? "bg-purple-600/20 text-white"
                : "text-gray-400 hover:bg-[#1a1a24]"
            }`
          }
        >
          📊 Dashboard
        </NavLink>

        <NavLink
          to="/app/analytics"
          className={({isActive}) =>
            `${base} ${
              isActive
                ? "bg-purple-600/20 text-white"
                : "text-gray-400 hover:bg-[#1a1a24]"
            }`
          }
        >
          📈 Analytics
        </NavLink>

        <NavLink
          to="/app/history"
          className={({isActive}) =>
            `${base} ${
              isActive
                ? "bg-purple-600/20 text-white"
                : "text-gray-400 hover:bg-[#1a1a24]"
            }`
          }
        >
          🕓 Feedback History
        </NavLink>

        <NavLink
          to="/app/reports"
          className={({isActive}) =>
            `${base} ${
              isActive
                ? "bg-purple-600/20 text-white"
                : "text-gray-400 hover:bg-[#1a1a24]"
            }`
          }
        >
          📄 Reports
        </NavLink>

        <NavLink
          to="/app/settings"
          className={({isActive}) =>
            `${base} ${
              isActive
                ? "bg-purple-600/20 text-white"
                : "text-gray-400 hover:bg-[#1a1a24]"
            }`
          }
        >
          ⚙ Settings
        </NavLink>

      </nav>

    </div>

  );

}

export default Sidebar;