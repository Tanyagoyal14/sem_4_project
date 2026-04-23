import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

import Topbar from "../components/Topbar"
import StatsCards from "../components/StatsCards"
import IndustryPieChart from "../components/IndustryPieChart"
import LiveFeed from "../components/LiveFeed"
import AIInsights from "../components/AIInsights"
import useFeedbackStream from "../hooks/useFeedbackStream"
import { apiFetch } from "../utils/api"
import { getAuthCredits, getAuthRole, updateStoredCredits } from "../utils/auth"

const DASHBOARD_STORAGE_KEY = "dashboard_page_state"

const getStoredDashboardState = () => {
  try {
    const saved = localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (!saved) {
      return {
        feedback: "",
        industryData: [],
        csat: 0,
        results: [],
      }
    }

    const parsed = JSON.parse(saved)

    return {
      feedback: typeof parsed.feedback === "string" ? parsed.feedback : "",
      industryData: Array.isArray(parsed.industryData) ? parsed.industryData : [],
      csat: typeof parsed.csat === "number" ? parsed.csat : 0,
      results: Array.isArray(parsed.results) ? parsed.results : [],
    }
  } catch (error) {
    console.error("Unable to read saved dashboard state:", error)
    return {
      feedback: "",
      industryData: [],
      csat: 0,
      results: [],
    }
  }
}

function Dashboard() {
  const navigate = useNavigate()
  const { stream, addFeedback } = useFeedbackStream()
  const storedState = getStoredDashboardState()

  const [feedback, setFeedback] = useState(storedState.feedback)
  const [industryData, setIndustryData] = useState<any[]>(storedState.industryData)
  const [csat, setCsat] = useState(storedState.csat)
  const [results, setResults] = useState<any[]>(storedState.results)
  const [loading, setLoading] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState("")

  useEffect(() => {
    if (getAuthRole() === "free" && getAuthCredits() === 0) {
      setUpgradeMessage("You've used all 200 free credits. Upgrade to continue using the dashboard.")
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      DASHBOARD_STORAGE_KEY,
      JSON.stringify({
        feedback,
        industryData,
        csat,
        results,
      })
    )
  }, [feedback, industryData, csat, results])

  const feedbackList = useMemo(
    () => stream.map((item) => item.feedback || item.text).filter(Boolean),
    [stream]
  )

  const stats = useMemo(() => {
    const total = stream.length
    const positive = stream.filter(
      (item) => String(item.sentiment || "").toLowerCase() === "positive"
    ).length
    const negative = stream.filter(
      (item) => String(item.sentiment || "").toLowerCase() === "negative"
    ).length
    const averageCsat = results.length > 0
      ? Math.round(
          results.reduce((sum, item) => sum + Number(item.csat_score || 0), 0) / results.length
        )
      : csat

    return { total, positive, negative, csat: averageCsat }
  }, [stream, results, csat])

  const analyze = async () => {
    if (!feedback.trim()) return

    setLoading(true)

    try {
      const feedbackLines = feedback
        .split("\n")
        .map((item: string) => item.trim())
        .filter(Boolean)

      const bodyData = feedbackLines.length === 1
        ? { feedback: feedbackLines[0] }
        : { feedbacks: feedbackLines }

      const res = await apiFetch("/analyze-feedback", {
        method: "POST",
        body: JSON.stringify(bodyData)
      })

      if (!res.ok) {
        if (res.status === 402) {
          setUpgradeMessage("You've used all 200 free credits. Upgrade to continue using the dashboard.")
        }
        console.error("Backend error:", await res.text())
        return
      }

      const data = await res.json()
      const resultList = data.results || []

      if (typeof data.credits_remaining === "number") {
        updateStoredCredits(data.credits_remaining)
        if (data.credits_remaining <= 0) {
          setUpgradeMessage("You've used all 200 free credits. Upgrade to continue using the dashboard.")
        } else {
          setUpgradeMessage("")
        }
      }

      setResults(resultList)

      if (resultList.length > 0) {
        setIndustryData(resultList[0].top_industries || [])
        setCsat(resultList[0].csat_score)
      }

      resultList.forEach((item: any) => {
        addFeedback(item.feedback, item.sentiment)
      })

      setFeedback("")
    } catch (error) {
      console.error("Error:", error)
    }

    setLoading(false)
  }

  const handleCSVUpload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await apiFetch("/upload-csv", {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        if (res.status === 402) {
          setUpgradeMessage("You've used all 200 free credits. Upgrade to continue using the dashboard.")
        }
        console.error("CSV upload failed:", await res.text())
        return
      }

      const data = await res.json()
      const resultList = data.results || []

      if (typeof data.credits_remaining === "number") {
        updateStoredCredits(data.credits_remaining)
        if (data.credits_remaining <= 0) {
          setUpgradeMessage("You've used all 200 free credits. Upgrade to continue using the dashboard.")
        } else {
          setUpgradeMessage("")
        }
      }

      setResults(resultList)

      if (resultList.length > 0) {
        setIndustryData(resultList[0].top_industries || [])
        setCsat(resultList[0].csat_score)
      }

      resultList.forEach((item: any) => {
        addFeedback(item.feedback, item.sentiment)
      })
    } catch (error) {
      console.error("CSV Error:", error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8 text-slate-900 transition-colors dark:bg-[#0b0b0f] dark:text-gray-200">
      <Topbar />

      {upgradeMessage && (
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <div className="flex items-center justify-between gap-4">
            <span>{upgradeMessage}</span>
            <button
              onClick={() => alert("Upgrade flow coming soon")}
              className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-amber-300"
            >
              Upgrade to continue using the dashboard
            </button>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <StatsCards
          total={stats.total}
          positive={stats.positive}
          negative={stats.negative}
          csat={stats.csat}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1f1f2e] dark:bg-[#12121a]"
      >
        <textarea
          className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 outline-none transition focus:border-purple-500 dark:border-[#1f1f2e] dark:bg-black dark:text-white"
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
          className={`mt-4 rounded-xl px-6 py-2 text-white transition ${
            loading
              ? "cursor-not-allowed bg-gray-600"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {loading ? "Analyzing..." : "Analyze Feedback"}
        </button>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between gap-4">
            <label className="block text-sm text-slate-500 dark:text-gray-400">
              Upload CSV File
            </label>

            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              Uses credits
            </span>
          </div>

          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="block w-full text-sm text-slate-600 dark:text-gray-300
              file:mr-4 file:rounded-lg file:border-0
              file:bg-purple-600 file:px-4 file:py-2
              file:text-white hover:file:bg-purple-700"
          />

          <p className="mt-2 text-xs text-slate-500 dark:text-gray-500">
            CSV must contain a column named <b>feedback</b>. Each row uses 1 credit.
          </p>
        </div>
      </motion.div>

      <div className="mt-6 space-y-4">
        {results.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1f1f2e] dark:bg-[#12121a]"
          >
            <p className="mb-3 text-slate-700 dark:text-gray-300">{item.feedback}</p>

            <div className="grid gap-4 text-sm md:grid-cols-3">
              <p>
                Sentiment:
                <span className="ml-2 font-semibold text-purple-400">{item.sentiment}</span>
              </p>

              <p>
                Type:
                <span className="ml-2 font-semibold text-purple-400">{item.feedback_type}</span>
              </p>

              <p>
                CSAT:
                <span className="ml-2 font-semibold text-purple-400">{item.csat_score}%</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <IndustryPieChart
            data={industryData}
            onSliceClick={(entry) => {
              navigate("/app/analytics", {
                state: { selectedIndustry: entry.name }
              })
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <LiveFeed stream={stream} />
        </motion.div>
      </div>

      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1f1f2e] dark:bg-[#12121a]"
        >
          <h2 className="mb-4 text-lg font-semibold">AI Recommendations</h2>

          {results[0].recommendations?.map((item: any, index: number) => (
            <div key={index} className="mb-3">
              <p className="font-semibold text-purple-400">{item.industry}</p>
              <p className="text-slate-700 dark:text-gray-300">{item.recommendation}</p>
            </div>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, x: -80 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-8"
      >
        <AIInsights feedbackList={feedbackList} />
      </motion.div>
    </div>
  )
}

export default Dashboard
