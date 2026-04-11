import { useEffect, useState } from "react"
import { motion } from "framer-motion"

function History() {

  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = async () => {

    try {

      const res = await fetch("http://localhost:8002/feedback-history")
      const data = await res.json()

      setHistory(data.history || [])

    } catch (err) {

      console.error("History error:", err)
      setHistory([])

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {

    fetchHistory()

    // 🔥 AUTO REFRESH EVERY 5 SECONDS
    const interval = setInterval(fetchHistory, 5000)

    return () => clearInterval(interval)

  }, [])

  return (

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 text-white min-h-screen bg-[#0b0b0f]"
    >

      <h1 className="text-3xl font-bold mb-6">
        Feedback History
      </h1>

      {/* Loading */}

      {loading && (
        <p className="text-gray-400">Loading feedback...</p>
      )}

      {/* Empty */}

      {!loading && history.length === 0 && (
        <p className="text-gray-400">
          No feedback found. Start analyzing feedback.
        </p>
      )}

      {/* Table */}

      {history.length > 0 && (

        <div className="overflow-x-auto">

          <table className="w-full border border-[#1f1f2e] rounded-xl overflow-hidden">

            <thead className="bg-[#12121a]">

              <tr>
                <th className="p-3 text-left">Feedback</th>
                <th className="p-3">Sentiment</th>
                <th className="p-3">Type</th>
                <th className="p-3">Industry</th>
                <th className="p-3">Time</th>
              </tr>

            </thead>

            <tbody>

              {history.map((item, i) => (

                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-t border-[#1f1f2e] hover:bg-[#12121a]"
                >

                  <td className="p-3 text-left max-w-xs">
                    {item.feedback}
                  </td>

                  <td className={`p-3 font-semibold ${
                    item.sentiment === "Positive"
                      ? "text-green-400"
                      : item.sentiment === "Negative"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}>
                    {item.sentiment}
                  </td>

                  <td className="p-3 text-purple-400">
                    {item.feedback_type}
                  </td>

                  <td className="p-3">
                    {item.top_industries?.[0]?.industry || "-"}
                  </td>

                  <td className="p-3 text-gray-400 text-sm">
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