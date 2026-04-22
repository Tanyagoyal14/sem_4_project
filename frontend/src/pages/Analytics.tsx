import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useLocation } from "react-router-dom"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

function Analytics() {
  const location = useLocation()
  const selectedIndustry = location.state?.selectedIndustry

  const [history, setHistory] = useState<any[]>([])
  const [csat, setCsat] = useState(0)
  const colors = ["#22c55e", "#eab308", "#ef4444", "#3b82f6"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8002/feedback-history")
        const data = await res.json()

        if (!data || !data.history) {
          setHistory([])
          return
        }

        let filtered = data.history

        if (selectedIndustry) {
          filtered = filtered.filter((item: any) => item.industry === selectedIndustry)
        }

        setHistory(filtered)

        const positive = filtered.filter((item: any) => item.sentiment === "Positive").length
        const total = filtered.length
        setCsat(total > 0 ? Math.round((positive / total) * 100) : 0)
      } catch (error) {
        console.error("Analytics error:", error)
        setHistory([])
      }
    }

    fetchData()
  }, [selectedIndustry])

  const sentimentCounts: Record<string, number> = {
    Positive: 0,
    Neutral: 0,
    Negative: 0
  }

  const complaintCounts: Record<string, number> = {
    Complaint: 0,
    Suggestion: 0,
    Praise: 0,
    Question: 0
  }

  history.forEach((item: any) => {
    if (sentimentCounts[item.sentiment] !== undefined) {
      sentimentCounts[item.sentiment]++
    }

    if (complaintCounts[item.type] !== undefined) {
      complaintCounts[item.type]++
    }
  })

  const sentimentData = Object.keys(sentimentCounts).map((key) => ({
    name: key,
    value: sentimentCounts[key]
  }))

  const complaintData = Object.keys(complaintCounts).map((key) => ({
    name: key,
    value: complaintCounts[key]
  }))

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-8 text-slate-900 dark:text-white"
    >
      <h1 className="mb-6 text-3xl font-bold">Analytics Dashboard</h1>

      {selectedIndustry && (
        <div className="mb-6 rounded-xl border border-purple-500 bg-white p-4 shadow-sm dark:bg-[#12121a]">
          <p className="text-sm text-purple-400">FILTERED VIEW</p>
          <p className="text-xl font-bold">{selectedIndustry}</p>
        </div>
      )}

      <div className="mb-8 grid grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40">
          <h2 className="text-slate-500 dark:text-gray-400">Total Feedback</h2>
          <p className="text-3xl font-bold">{history.length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40">
          <h2 className="text-slate-500 dark:text-gray-400">CSAT Score</h2>
          <p className="text-3xl font-bold text-green-400">{csat}%</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40">
          <h2 className="text-slate-500 dark:text-gray-400">Positive Feedback</h2>
          <p className="text-3xl font-bold text-green-400">{sentimentCounts.Positive}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40"
        >
          <h2 className="mb-4 text-xl">Sentiment Distribution</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {sentimentData.map((_, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40"
        >
          <h2 className="mb-4 text-xl">Feedback Type Distribution</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={complaintData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {complaintData.map((_, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {history.length === 0 && (
        <div className="mt-10 text-slate-500 dark:text-gray-400">
          No feedback data found for this category.
        </div>
      )}
    </motion.div>
  )
}

export default Analytics
