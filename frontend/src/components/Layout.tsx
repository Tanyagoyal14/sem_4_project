import { useState } from "react"
import { Outlet } from "react-router-dom"
import CommandPalette from "../components/CommandPalette"
import Sidebar from "../components/Sidebar"

function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className="w-full min-h-screen bg-slate-50 transition-all duration-300 dark:bg-[#0b0b0f]"
        style={{ marginLeft: collapsed ? "80px" : "256px" }}
      >
        <CommandPalette />

        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout
