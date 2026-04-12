import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

function CommandPalette() {

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  const commands = [
    { name: "Dashboard", path: "/app/dashboard" },
    { name: "Analytics", path: "/app/analytics" },
    { name: "History", path: "/app/history" },
    { name: "Reports", path: "/app/reports" },
    { name: "Settings", path: "/app/settings" }
  ]

  // 🔥 OPEN WITH CTRL + K
  useEffect(() => {

    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(prev => !prev)
      }

      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)

  }, [])

  const filtered = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (path: string) => {
    navigate(path)
    setOpen(false)
    setQuery("")
  }

  if (!open) return null

  return (

    <div className="fixed inset-0 bg-black/50 z-[100] flex items-start justify-center pt-32">

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111] w-[500px] rounded-xl shadow-xl border border-white/10 overflow-hidden"
      >

        {/* INPUT */}
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full p-4 bg-transparent outline-none text-white border-b border-white/10"
        />

        {/* RESULTS */}
        <div className="max-h-60 overflow-y-auto">

          {filtered.length === 0 && (
            <p className="p-4 text-gray-400">No results found</p>
          )}

          {filtered.map((cmd, i) => (

            <div
              key={i}
              onClick={() => handleSelect(cmd.path)}
              className="p-4 cursor-pointer hover:bg-white/10 transition text-white"
            >
              {cmd.name}
            </div>

          ))}

        </div>

      </motion.div>

    </div>

  )
}

export default CommandPalette