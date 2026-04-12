import CommandPalette from "../components/CommandPalette"
import Sidebar from "../components/Sidebar"
import { Outlet } from "react-router-dom"
import { useState } from "react"

function Layout() {

  const [collapsed, setCollapsed] = useState(false)

  return (

    <div className="flex">

      {/* 🔥 SIDEBAR */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* 🔥 MAIN CONTENT */}
      <div
        className="w-full min-h-screen bg-[#0b0b0f] transition-all duration-300"
        style={{
          marginLeft: collapsed ? "80px" : "256px"
        }}
      >

        {/* 🔥 COMMAND PALETTE (GLOBAL) */}
        <CommandPalette />

        {/* PAGE CONTENT */}
        <div className="p-6">
          <Outlet />
        </div>

      </div>

    </div>

  )
}

export default Layout