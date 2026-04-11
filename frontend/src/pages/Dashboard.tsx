import { useState } from "react"
import { motion } from "framer-motion"

import Topbar from "../components/Topbar"
import StatsCards from "../components/StatsCards"
import IndustryPieChart from "../components/IndustryPieChart"
import LiveFeed from "../components/LiveFeed"
import AIInsights from "../components/AIInsights"

import useFeedbackStream from "../hooks/useFeedbackStream"

function Dashboard() {

  const { stream, addFeedback } = useFeedbackStream()

  const [feedback, setFeedback] = useState("")
  const [industryData, setIndustryData] = useState<any[]>([])
  const [csat, setCsat] = useState(0)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // =============================
  // TEXT INPUT ANALYSIS (EXISTING)
  // =============================
  const analyze = async () => {

    if (!feedback.trim()) return

    setLoading(true)

    try {

      const feedbackList = feedback
        .split("\n")
        .map(f => f.trim())
        .filter(f => f !== "")

      let bodyData = {}

      if (feedbackList.length === 1) {
        bodyData = { feedback: feedbackList[0] }
      } else {
        bodyData = { feedbacks: feedbackList }
      }

      const res = await fetch("http://localhost:8002/analyze-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      })

      if (!res.ok) {
        console.error("Backend error:", await res.text())
        return
      }

      const data = await res.json()
      const resultList = data.results || []

      setResults(resultList)

      if (resultList.length > 0) {
        setIndustryData(resultList[0].top_industries || [])
        setCsat(resultList[0].csat_score)
      }

      resultList.forEach((r:any) => {
        addFeedback(r.feedback, r.sentiment)
      })

      setFeedback("")

    } catch (err) {
      console.error("Error:", err)
    }

    setLoading(false)
  }

  // =============================
  // CSV UPLOAD (NEW 🚀)
  // =============================
  const handleCSVUpload = async (e: any) => {

    const file = e.target.files[0]
    if (!file) return

    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {

      const res = await fetch("http://localhost:8002/upload-csv", {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        console.error("CSV upload failed:", await res.text())
        return
      }

      const data = await res.json()
      const resultList = data.results || []

      setResults(resultList)

      if (resultList.length > 0) {
        setIndustryData(resultList[0].top_industries || [])
        setCsat(resultList[0].csat_score)
      }

      resultList.forEach((r:any) => {
        addFeedback(r.feedback, r.sentiment)
      })

    } catch (err) {
      console.error("CSV Error:", err)
    }

    setLoading(false)
  }

  return (

    <div className="p-8 text-gray-200 min-h-screen bg-[#0b0b0f]">

      <Topbar />

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <StatsCards csat={csat} />
      </motion.div>

      {/* Feedback Input */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6 mt-8"
      >

        <textarea
          className="w-full p-4 rounded-xl bg-black border border-[#1f1f2e]"
          placeholder={`Enter feedback (single or multiple lines)

Example:
Delivery was late
App crashed
Payment failed`}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />

        <button
          onClick={analyze}
          disabled={loading}
          className={`mt-4 px-6 py-2 rounded-xl text-white transition ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {loading ? "Analyzing..." : "Analyze Feedback"}
        </button>

        {/* CSV Upload */}
        <div className="mt-6">
          <label className="block text-sm mb-2 text-gray-400">
            Upload CSV File
          </label>

          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="block w-full text-sm text-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:bg-purple-600 file:text-white
              hover:file:bg-purple-700"
          />

          <p className="text-xs text-gray-500 mt-2">
            CSV must contain a column named <b>feedback</b>
          </p>
        </div>

      </motion.div>

      {/* RESULTS */}
      <div className="mt-6 space-y-4">

        {results.map((r, i) => (

          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-5"
          >

            <p className="text-gray-300 mb-3">
              {r.feedback}
            </p>

            <div className="grid md:grid-cols-3 gap-4 text-sm">

              <p>
                Sentiment:
                <span className="ml-2 text-purple-400 font-semibold">
                  {r.sentiment}
                </span>
              </p>

              <p>
                Type:
                <span className="ml-2 text-purple-400 font-semibold">
                  {r.feedback_type}
                </span>
              </p>

              <p>
                CSAT:
                <span className="ml-2 text-purple-400 font-semibold">
                  {r.csat_score}%
                </span>
              </p>

            </div>

          </motion.div>

        ))}

      </div>

      {/* Charts + Live Feed */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8">

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <IndustryPieChart data={industryData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <LiveFeed stream={stream} />
        </motion.div>

      </div>

      {/* AI Recommendations */}
      {results.length > 0 && (

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6 mt-8"
        >

          <h2 className="text-lg font-semibold mb-4">
            AI Recommendations
          </h2>

          {results[0].recommendations?.map((r:any, i:number) => (

            <div key={i} className="mb-3">

              <p className="text-purple-400 font-semibold">
                {r.industry}
              </p>

              <p className="text-gray-300">
                {r.recommendation}
              </p>

            </div>

          ))}

        </motion.div>

      )}

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, x: -80 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-8"
      >
        <AIInsights />
      </motion.div>

    </div>
  )
}

export default Dashboard