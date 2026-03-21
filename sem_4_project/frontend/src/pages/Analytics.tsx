import { useEffect, useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { useLocation } from "react-router-dom"
import { motion } from "framer-motion"

function Analytics() {

  const location = useLocation()
  const selectedIndustry = location.state?.selectedIndustry

  const [history, setHistory] = useState<any[]>([])
  const [csat, setCsat] = useState(0)

  const COLORS = ["#22c55e", "#eab308", "#ef4444", "#3b82f6"]

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

        // 🔥 FILTER BY INDUSTRY (IMPORTANT)
        if (selectedIndustry) {
          filtered = filtered.filter(
            (f:any) => f.industry === selectedIndustry
          )
        }

        setHistory(filtered)

        const positive = filtered.filter(
          (f:any) => f.sentiment === "Positive"
        ).length

        const total = filtered.length

        if (total > 0) {
          setCsat(Math.round((positive / total) * 100))
        }

      } catch(err) {

        console.error("Analytics error:", err)
        setHistory([])

      }

    }

    fetchData()

  }, [selectedIndustry])


  // --------------------------
  // Counts
  // --------------------------

  const sentimentCounts:any = {
    Positive: 0,
    Neutral: 0,
    Negative: 0
  }

  const complaintCounts:any = {
    Complaint: 0,
    Suggestion: 0,
    Praise: 0,
    Question: 0
  }

  history.forEach((f:any) => {

    if (sentimentCounts[f.sentiment] !== undefined) {
      sentimentCounts[f.sentiment]++
    }

    if (complaintCounts[f.type] !== undefined) {
      complaintCounts[f.type]++
    }

  })


  const sentimentData = Object.keys(sentimentCounts).map(key => ({
    name: key,
    value: sentimentCounts[key]
  }))

  const complaintData = Object.keys(complaintCounts).map(key => ({
    name: key,
    value: complaintCounts[key]
  }))


  return (

    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 text-white min-h-screen bg-[#0b0b0f]"
    >

      <h1 className="text-3xl font-bold mb-6">
        Analytics Dashboard
      </h1>


      {/* 🔥 Selected Industry Banner */}

      {selectedIndustry && (

        <div className="bg-[#12121a] border border-purple-500 rounded-xl p-4 mb-6">

          <p className="text-purple-400 text-sm">
            FILTERED VIEW
          </p>

          <p className="text-xl font-bold">
            {selectedIndustry}
          </p>

        </div>

      )}


      {/* Stats */}

      <div className="grid grid-cols-3 gap-6 mb-8">

        <div className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-white/10">
          <h2 className="text-gray-400">Total Feedback</h2>
          <p className="text-3xl font-bold">{history.length}</p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-white/10">
          <h2 className="text-gray-400">CSAT Score</h2>
          <p className="text-3xl font-bold text-green-400">
            {csat}%
          </p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-white/10">
          <h2 className="text-gray-400">Positive Feedback</h2>
          <p className="text-3xl font-bold text-green-400">
            {sentimentCounts.Positive}
          </p>
        </div>

      </div>


      {/* Charts */}

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Sentiment Chart */}

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-white/10"
        >

          <h2 className="text-xl mb-4">
            Sentiment Distribution
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={sentimentData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >

                {sentimentData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}

              </Pie>

              <Tooltip />
              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </motion.div>


        {/* Feedback Type Chart */}

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-white/10"
        >

          <h2 className="text-xl mb-4">
            Feedback Type Distribution
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={complaintData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >

                {complaintData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}

              </Pie>

              <Tooltip />
              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </motion.div>

      </div>


      {/* Empty State */}

      {history.length === 0 && (

        <div className="mt-10 text-gray-400">
          No feedback data found for this category.
        </div>

      )}

    </motion.div>
  )
}

export default Analytics