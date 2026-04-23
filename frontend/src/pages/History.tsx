import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { apiFetch } from "../utils/api"

function History() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = async () => {
    try {
      const res = await apiFetch("/feedback-history")
      const data = await res.json()
      setHistory(data.history || [])
    } catch (error) {
      console.error("History error:", error)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
    const interval = setInterval(fetchHistory, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen p-8 text-slate-900 dark:text-white"
    >
      <h1 className="mb-6 text-3xl font-bold">Feedback History</h1>

      {loading && <p className="text-slate-500 dark:text-gray-400">Loading feedback...</p>}

      {!loading && history.length === 0 && (
        <p className="text-slate-500 dark:text-gray-400">
          No feedback found. Start analyzing feedback.
        </p>
      )}

      {history.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#1f1f2e] dark:bg-[#0f0f16]">
          <table className="w-full overflow-hidden rounded-xl">
            <thead className="bg-slate-100 dark:bg-[#12121a]">
              <tr>
                <th className="p-3 text-left">Feedback</th>
                <th className="p-3">Sentiment</th>
                <th className="p-3">Type</th>
                <th className="p-3">Industry</th>
                <th className="p-3">Time</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-slate-200 hover:bg-slate-50 dark:border-[#1f1f2e] dark:hover:bg-[#12121a]"
                >
                  <td className="max-w-xs p-3 text-left">{item.feedback}</td>
                  <td
                    className={`p-3 font-semibold ${
                      item.sentiment === "Positive"
                        ? "text-green-400"
                        : item.sentiment === "Negative"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {item.sentiment}
                  </td>
                  <td className="p-3 text-purple-400">{item.feedback_type}</td>
                  <td className="p-3">{item.top_industries?.[0]?.industry || "-"}</td>
                  <td className="p-3 text-sm text-slate-500 dark:text-gray-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}

export default History
