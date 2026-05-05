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
import { readStoredDashboardState, readStoredFeedbackStream, saveStoredDashboardState } from "../utils/feedbackStorage"
import { getAuthCredits, getAuthRole, updateStoredCredits } from "../utils/auth"
import { calculateFeedbackStats, normalizeStatsItems } from "../utils/feedbackStats"

type CompareHistoryItem = {
  created_at: string
  response: {
    video1: { stats: { title: string; url: string } }
    video2: { stats: { title: string; url: string } }
    comparison: { winner: string; positivity_difference: number }
  }
  video_urls: string[]
}

const getStoredDashboardState = () => {
  try {
    const parsed = readStoredDashboardState()
    if (!parsed) {
      return {
        feedback: "",
        industryData: [],
        csat: 0,
        results: [],
      }
    }

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

const getStoredFeedbackHistory = () => {
  try {
    const parsed = readStoredFeedbackStream()
    return Array.isArray(parsed) ? normalizeStatsItems(parsed) : []
  } catch (error) {
    console.error("Unable to read saved dashboard feedback history:", error)
    return []
  }
}

const normalizeDashboardResults = (items: any[], source: "manual" | "csv", batchId?: string) =>
  normalizeStatsItems(items).map((item: any) => ({
    ...item,
    source,
    batchId: item.batchId || item.batch_id || batchId,
  }))

function Dashboard() {
  const navigate = useNavigate()
  const { addFeedback } = useFeedbackStream()
  const storedState = getStoredDashboardState()
  const [feedback, setFeedback] = useState(storedState.feedback)
  const [industryData, setIndustryData] = useState<any[]>(storedState.industryData)
  const [csat, setCsat] = useState(storedState.csat)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState("")
  const [compareHistory, setCompareHistory] = useState<CompareHistoryItem[]>([])
  const [compareHistoryLoading, setCompareHistoryLoading] = useState(false)
  const [historyStatsSource, setHistoryStatsSource] = useState<any[]>([])

  useEffect(() => {
    if (getAuthRole() === "free" && getAuthCredits() === 0) {
      setUpgradeMessage("You've used all 200 free credits. Upgrade to continue using the dashboard.")
    }
  }, [])

  useEffect(() => {
    saveStoredDashboardState({
      feedback,
      industryData,
      csat,
      results,
    })
  }, [feedback, industryData, csat, results])

  useEffect(() => {
    const loadCompareHistory = async () => {
      setCompareHistoryLoading(true)
      try {
        const res = await apiFetch("/youtube/compare-history")
        if (!res.ok) {
          setCompareHistory([])
          return
        }

        const data = await res.json()
        setCompareHistory(Array.isArray(data.history) ? data.history : [])
      } catch (error) {
        console.error("Unable to load compare history:", error)
        setCompareHistory([])
      } finally {
        setCompareHistoryLoading(false)
      }
    }

    loadCompareHistory()
  }, [])

  const loadDashboardHistory = async () => {
    try {
      const res = await apiFetch("/feedback-history")
      if (!res.ok) {
        setHistoryStatsSource(getStoredFeedbackHistory())
        return
      }

      const data = await res.json()
      const remoteHistory = normalizeStatsItems(Array.isArray(data.history) ? data.history : [])
      const localHistory = getStoredFeedbackHistory()
      setHistoryStatsSource(remoteHistory.length > 0 ? remoteHistory : localHistory)
    } catch (error) {
      console.error("Unable to load dashboard history stats:", error)
      setHistoryStatsSource(getStoredFeedbackHistory())
    }
  }

  useEffect(() => {
    loadDashboardHistory()

    const interval = setInterval(loadDashboardHistory, 5000)
    return () => clearInterval(interval)
  }, [])

  const feedbackList = useMemo(
    () => {
      if (results.length > 0) {
        return results.map((item) => item.feedback).filter(Boolean)
      }

      if (historyStatsSource.length > 0) {
        return historyStatsSource.map((item) => item.feedback || item.text).filter(Boolean)
      }

      return []
    },
    [results, historyStatsSource]
  )

  const stats = useMemo(() => {
    const sourceItems = historyStatsSource
    const calculated = calculateFeedbackStats(sourceItems)

    return {
      total: calculated.total,
      positive: calculated.positive,
      negative: calculated.negative,
      csat: calculated.csat || csat,
    }
  }, [results, historyStatsSource, csat])

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
      const resultList = normalizeDashboardResults(
        Array.isArray(data.results) ? data.results : [],
        "manual"
      )

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
      await loadDashboardHistory()
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
      const fallbackBatchId = String(Date.now())
      const resultList = normalizeDashboardResults(
        Array.isArray(data.results) ? data.results : [],
        "csv",
        fallbackBatchId
      )

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
      await loadDashboardHistory()
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
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-6 overflow-hidden rounded-[24px] border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(8,15,29,0.95),rgba(15,23,42,0.88))] p-5 text-white shadow-[0_24px_80px_rgba(2,6,23,0.32)]"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.28em] text-cyan-300/75">
              VIDEO COMPARISON STUDIO
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              Compare two YouTube videos with audience sentiment and keyword insights.
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Spot which video resonates more, what viewers praise, and where the criticism clusters.
            </p>
          </div>

          <button
            onClick={() => navigate("/app/compare")}
            className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Compare Videos
          </button>
        </div>
      </motion.div>

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
  data={industryData.filter(
    (item) =>
      item &&
      typeof item.value === "number" &&
      !isNaN(item.value)
  )}
/>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <LiveFeed stream={historyStatsSource} />
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

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mt-8 rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,29,0.96),rgba(15,23,42,0.88))] p-6 text-white shadow-[0_22px_70px_rgba(2,6,23,0.3)]"
      >
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] text-cyan-300/75">
              SAVED REPORTS
            </p>
            <h2 className="mt-2 text-2xl font-bold">Recent video comparisons</h2>
            <p className="mt-2 text-sm text-slate-300">
              Reopen a previous comparison from the dashboard and continue exploring the analysis.
            </p>
          </div>
          <button
            onClick={() => navigate("/app/compare")}
            className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Open Compare Studio
          </button>
        </div>

        {compareHistoryLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-36 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : compareHistory.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-300">
            No saved video comparisons yet. Run a comparison to populate this section.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {compareHistory.slice(0, 6).map((entry, index) => (
              <button
                key={`${entry.created_at}-${index}`}
                onClick={() =>
                  navigate("/app/compare", {
                    state: { historyEntry: entry }
                  })
                }
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/10"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/75">
                  {new Date(entry.created_at).toLocaleString()}
                </p>
                <h3 className="mt-2 text-lg font-semibold">
                  {entry.response.video1.stats.title}
                </h3>
                <p className="text-sm text-slate-300">
                  vs {entry.response.video2.stats.title}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>Winner: {entry.response.comparison.winner}</span>
                  <span>
                    {typeof entry.response?.comparison?.positivity_difference === "number"
                    ? entry.response.comparison.positivity_difference.toFixed(1)
                    : "0.0"}% gap
                </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Dashboard
