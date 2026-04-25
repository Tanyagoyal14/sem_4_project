import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Clock3,
  Loader2,
  RotateCcw,
  Sparkles,
  Youtube
} from "lucide-react"
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { useLocation, useNavigate } from "react-router-dom"

import { apiFetch } from "../utils/api"

type VideoStats = {
  title: string
  video_id: string
  url: string
  total_comments: number
  positive_count: number
  negative_count: number
  neutral_count: number
  positive_percentage: number
  negative_percentage: number
  neutral_percentage: number
  average_sentiment_score: number
  csat_score: number
  most_liked_comment: string
  most_liked_comment_likes: number
}

type VideoPayload = {
  stats: VideoStats
  keywords: string[]
  summary: string
}

type ComparisonResponse = {
  video1: VideoPayload
  video2: VideoPayload
  comparison: {
    winner: string
    positivity_difference: number
    key_insights: string[]
  }
  cached?: boolean
  history_saved?: boolean
}

type HistoryItem = {
  created_at: string
  response: ComparisonResponse
  video_urls: string[]
}

type CompareLocationState = {
  historyEntry?: HistoryItem
}

const SENTIMENT_COLORS = ["#22c55e", "#3b82f6", "#ef4444"]

const truncate = (value: string, length = 180) =>
  value.length > length ? `${value.slice(0, length).trim()}...` : value

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

const downloadTextFile = (filename: string, content: string, mimeType = "application/json") => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

const downloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function VideoComparison() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as CompareLocationState | null
  const [video1Url, setVideo1Url] = useState("")
  const [video2Url, setVideo2Url] = useState("")
  const [result, setResult] = useState<ComparisonResponse | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [error, setError] = useState("")

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await apiFetch("/youtube/compare-history")
      if (!res.ok) {
        const fallbackRes = await apiFetch("/youtube/history")
        if (!fallbackRes.ok) {
          setHistory([])
          return
        }

        const fallbackData = await fallbackRes.json()
        setHistory(Array.isArray(fallbackData.history) ? fallbackData.history : [])
        return
      }

      const data = await res.json()
      setHistory(Array.isArray(data.history) ? data.history : [])
    } catch (fetchError) {
      console.error("Unable to load comparison history:", fetchError)
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    const entry = locationState?.historyEntry
    if (!entry) return

    setResult(entry.response)
    setVideo1Url(entry.video_urls[0] || entry.response.video1.stats.url)
    setVideo2Url(entry.video_urls[1] || entry.response.video2.stats.url)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [locationState])

  const handleCompare = async () => {
    if (!video1Url.trim() || !video2Url.trim()) {
      setError("Please enter two YouTube URLs.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const requestBody = JSON.stringify({
        video1_url: video1Url.trim(),
        video2_url: video2Url.trim(),
        max_comments: 300
      })

      const endpointCandidates = [
        "/youtube/compare",
        "/youtube/compare-videos",
        "/youtube/youtube-compare",
      ]

      let payload: any = null
      let response: Response | null = null

      for (const endpoint of endpointCandidates) {
        response = await apiFetch(endpoint, {
          method: "POST",
          body: requestBody
        })

        payload = await response.json().catch(() => null)
        if (response.ok) {
          break
        }

        if (response.status !== 404 || payload?.detail !== "Not Found") {
          throw new Error(payload?.detail || "Comparison failed")
        }
      }

      if (!response || !response.ok) {
        throw new Error(payload?.detail || "Comparison failed")
      }

      setResult(payload as ComparisonResponse)
      await fetchHistory()
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (compareError) {
      setError(compareError instanceof Error ? compareError.message : "Comparison failed")
    } finally {
      setLoading(false)
    }
  }

  const resetComparison = () => {
    setResult(null)
    setError("")
  }

  const swapUrls = () => {
    setVideo1Url(video2Url)
    setVideo2Url(video1Url)
  }

  const loadHistoryItem = (entry: HistoryItem) => {
    setResult(entry.response)
    setVideo1Url(entry.video_urls[0] || entry.response.video1.stats.url)
    setVideo2Url(entry.video_urls[1] || entry.response.video2.stats.url)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const exportCurrentComparison = (format: "json" | "csv") => {
    if (!result) return

    if (format === "json") {
      downloadTextFile(
        `youtube-comparison-${Date.now()}.json`,
        JSON.stringify(result, null, 2)
      )
      return
    }

    const csvRows = [
      ["metric", "video1", "video2", "comparison"].join(","),
      [
        "title",
        `"${result.video1.stats.title}"`,
        `"${result.video2.stats.title}"`,
        `"Winner: ${result.comparison.winner}"`
      ].join(","),
      [
        "positive_percentage",
        result.video1.stats.positive_percentage,
        result.video2.stats.positive_percentage,
        result.comparison.positivity_difference
      ].join(","),
      [
        "negative_percentage",
        result.video1.stats.negative_percentage,
        result.video2.stats.negative_percentage,
        ""
      ].join(","),
      [
        "neutral_percentage",
        result.video1.stats.neutral_percentage,
        result.video2.stats.neutral_percentage,
        ""
      ].join(","),
      [
        "csat_score",
        result.video1.stats.csat_score,
        result.video2.stats.csat_score,
        ""
      ].join(","),
      [
        "most_liked_comment",
        `"${result.video1.stats.most_liked_comment.replaceAll('"', '""')}"`,
        `"${result.video2.stats.most_liked_comment.replaceAll('"', '""')}"`,
        ""
      ].join(",")
    ]

    downloadTextFile(
      `youtube-comparison-${Date.now()}.csv`,
      csvRows.join("\n"),
      "text/csv"
    )
  }

  const exportPdf = async () => {
    if (!result) return

    setExportingPdf(true)
    try {
      const response = await apiFetch("/youtube/compare-report-pdf", {
        method: "POST",
        body: JSON.stringify(result)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.detail || "PDF export failed")
      }

      const blob = await response.blob()
      downloadBlob(`youtube-comparison-report-${Date.now()}.pdf`, blob)
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "PDF export failed")
    } finally {
      setExportingPdf(false)
    }
  }

  const summaryWinner = result?.comparison.winner || ""
  const winnerIsVideo1 = result ? summaryWinner === result.video1.stats.title : false
  const winnerIsVideo2 = result ? summaryWinner === result.video2.stats.title : false

  const pieData = (stats: VideoStats) => [
    { name: "Positive", value: stats.positive_percentage },
    { name: "Neutral", value: stats.neutral_percentage },
    { name: "Negative", value: stats.negative_percentage }
  ]

  const positivityChartData = useMemo(() => {
    if (!result) return []

    return [
      {
        name: result.video1.stats.title,
        positive: result.video1.stats.positive_percentage
      },
      {
        name: result.video2.stats.title,
        positive: result.video2.stats.positive_percentage
      }
    ]
  }, [result])

  const keywordComparison = useMemo(() => {
    if (!result) {
      return {
        left: [] as string[],
        right: [] as string[],
        shared: [] as string[],
        uniqueLeft: [] as string[],
        uniqueRight: [] as string[],
      }
    }

    const left = result.video1.keywords
    const right = result.video2.keywords
    const shared = left.filter((keyword) => right.includes(keyword))

    return {
      left,
      right,
      shared,
      uniqueLeft: left.filter((keyword) => !shared.includes(keyword)),
      uniqueRight: right.filter((keyword) => !shared.includes(keyword)),
    }
  }, [result])

  const renderResultCard = (payload: VideoPayload, highlighted: boolean) => (
    <motion.div
      key={payload.stats.video_id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`relative overflow-hidden rounded-[24px] border p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] ${
        highlighted
          ? "border-cyan-400/30 bg-[linear-gradient(135deg,rgba(8,15,29,0.98),rgba(14,26,43,0.92))] text-white"
          : "border-white/10 bg-white/90 text-slate-900 dark:bg-[#111827] dark:text-white"
      }`}
    >
      {highlighted && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_36%)]" />
      )}

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-cyan-300/80">
            {highlighted ? "WINNING VIDEO" : "VIDEO ANALYSIS"}
          </p>
          <h3 className="mt-2 text-2xl font-bold leading-tight">
            {payload.stats.title}
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            {payload.stats.total_comments} comments analyzed
          </p>
        </div>

        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${highlighted ? "bg-cyan-400 text-slate-950" : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"}`}>
          CSAT {payload.stats.csat_score}%
        </div>
      </div>

      <div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-2">
        {[
          {
            label: "Positive",
            value: `${payload.stats.positive_percentage.toFixed(1)}%`
          },
          {
            label: "Negative",
            value: `${payload.stats.negative_percentage.toFixed(1)}%`
          },
          {
            label: "Neutral",
            value: `${payload.stats.neutral_percentage.toFixed(1)}%`
          },
          {
            label: "Avg Sentiment",
            value: payload.stats.average_sentiment_score.toFixed(3)
          }
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border px-4 py-3 ${
              highlighted
                ? "border-white/10 bg-white/5"
                : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"
            }`}
          >
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">
              {item.label.toUpperCase()}
            </p>
            <p className="mt-2 text-xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-5">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">
          MOST LIKED COMMENT
        </p>
        <p className="mt-2 rounded-2xl border border-dashed border-slate-300/70 bg-white/60 p-4 text-sm leading-6 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
          {truncate(payload.stats.most_liked_comment, 220)}
        </p>
      </div>

      <div className="relative z-10 mt-5">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">
          AI SUMMARY
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {payload.summary}
        </p>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen p-6 text-slate-900 dark:text-white lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-cyan-300">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-[0.24em]">
              AI VIDEO COMPARISON
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">
            Compare audience sentiment across two YouTube videos.
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-300">
            Paste two video URLs, analyze the comments, and get a side-by-side breakdown of what viewers love, what they dislike, and which video is winning the conversation.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/app/dashboard")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white dark:bg-white/5 dark:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
          {result && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => exportCurrentComparison("json")}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-cyan-50 dark:bg-white/5 dark:text-white"
              >
                Export JSON
              </button>
              <button
                onClick={() => exportCurrentComparison("csv")}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-cyan-50 dark:bg-white/5 dark:text-white"
              >
                Export CSV
              </button>
              <button
                onClick={exportPdf}
                disabled={exportingPdf}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/5 dark:text-white"
              >
                {exportingPdf ? "Exporting PDF..." : "Export PDF"}
              </button>
              <button
                onClick={resetComparison}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                <RotateCcw className="h-4 w-4" />
                Compare Another
              </button>
            </div>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,29,0.88),rgba(15,23,42,0.82))] p-5 shadow-[0_28px_100px_rgba(2,6,23,0.35)]"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <label className="mb-2 block text-[11px] font-semibold tracking-[0.2em] text-white/55">
              YOUTUBE URL 1
            </label>
            <input
              value={video1Url}
              onChange={(event) => setVideo1Url(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-2xl border border-white/10 bg-[#050816] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={swapUrls}
              className="rounded-full border border-white/10 bg-white/5 p-3 text-cyan-300 transition hover:bg-white/10"
              aria-label="Swap YouTube URLs"
            >
              <ArrowLeft className="h-5 w-5 rotate-90" />
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <label className="mb-2 block text-[11px] font-semibold tracking-[0.2em] text-white/55">
              YOUTUBE URL 2
            </label>
            <input
              value={video2Url}
              onChange={(event) => setVideo2Url(event.target.value)}
              placeholder="https://youtu.be/..."
              className="w-full rounded-2xl border border-white/10 bg-[#050816] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            Fetches 200-500 comments per video using the YouTube Data API and stores the comparison in history.
          </p>

          <button
            onClick={handleCompare}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-400/50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Youtube className="h-4 w-4" />}
            {loading ? "Analyzing & Comparing..." : "Analyze & Compare"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 space-y-6"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              {[0, 1].map((index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[24px] border border-white/10 bg-white/10 p-5"
                >
                  <div className="h-4 w-28 animate-pulse rounded-full bg-white/15" />
                  <div className="mt-4 h-8 w-2/3 animate-pulse rounded-2xl bg-white/15" />
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((tile) => (
                      <div
                        key={tile}
                        className="h-20 animate-pulse rounded-2xl bg-white/10"
                      />
                    ))}
                  </div>
                  <div className="mt-5 h-24 animate-pulse rounded-2xl bg-white/10" />
                </div>
              ))}
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/10 p-5">
              <div className="h-4 w-32 animate-pulse rounded-full bg-white/15" />
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {[0, 1].map((index) => (
                  <div key={index} className="h-24 animate-pulse rounded-2xl bg-white/10" />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mt-8 space-y-8"
        >
          <section className="overflow-hidden rounded-[28px] border border-cyan-400/25 bg-[linear-gradient(135deg,rgba(8,15,29,0.98),rgba(15,23,42,0.9))] p-6 shadow-[0_24px_90px_rgba(2,6,23,0.35)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold tracking-[0.24em] text-cyan-300/75">
                  TOP SUMMARY
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  {winnerIsVideo1
                    ? result.video1.stats.title
                    : winnerIsVideo2
                      ? result.video2.stats.title
                      : "Tie"}{" "}
                  {winnerIsVideo1 || winnerIsVideo2 ? "is leading" : "is tied"}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {result.comparison.key_insights[0]}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400">
                  POSITIVITY GAP
                </p>
                <p className="mt-1 text-3xl font-black text-cyan-300">
                  {result.comparison.positivity_difference.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {result.cached ? "Loaded from cache" : "Freshly analyzed"}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400">
                AI-DRIVEN INSIGHT
              </p>
              <p className="mt-2 text-base leading-7 text-white/90">
                {result.comparison.key_insights.join(" ")}
              </p>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            {renderResultCard(result.video1, winnerIsVideo1)}
            {renderResultCard(result.video2, winnerIsVideo2)}
          </div>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.14)] dark:bg-[#111827]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-cyan-300">
                    PIE CHART
                  </p>
                  <h3 className="text-lg font-bold">Video 1 Sentiment Distribution</h3>
                </div>
                <BarChart3 className="h-5 w-5 text-cyan-400" />
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData(result.video1.stats)}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                    >
                      {pieData(result.video1.stats).map((entry, index) => (
                        <Cell key={entry.name} fill={SENTIMENT_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.14)] dark:bg-[#111827]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-cyan-300">
                    PIE CHART
                  </p>
                  <h3 className="text-lg font-bold">Video 2 Sentiment Distribution</h3>
                </div>
                <BarChart3 className="h-5 w-5 text-cyan-400" />
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData(result.video2.stats)}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                    >
                      {pieData(result.video2.stats).map((entry, index) => (
                        <Cell key={entry.name} fill={SENTIMENT_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.14)] dark:bg-[#111827] xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-cyan-300">
                    POSITIVITY COMPARISON
                  </p>
                  <h3 className="text-lg font-bold">Positive Sentiment Overview</h3>
                </div>
                <BadgeCheck className="h-5 w-5 text-emerald-400" />
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={positivityChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="name" tick={{ fill: "currentColor", fontSize: 12 }} />
                    <YAxis unit="%" tick={{ fill: "currentColor", fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="positive" radius={[12, 12, 0, 0]} fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,250,252,0.9))] p-5 shadow-[0_16px_50px_rgba(15,23,42,0.14)] dark:bg-[#111827]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-cyan-300">
                    KEYWORDS
                  </p>
                  <h3 className="text-lg font-bold">Keyword Comparison</h3>
                </div>
                <Sparkles className="h-5 w-5 text-cyan-400" />
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
                    {result.video1.stats.title}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {keywordComparison.left.map((keyword) => (
                      <span
                        key={keyword}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          keywordComparison.shared.includes(keyword)
                            ? "bg-white/70 text-slate-900 dark:bg-white/10 dark:text-white"
                            : "bg-emerald-600/15 text-emerald-700 dark:text-emerald-200"
                        }`}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Shared
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(keywordComparison.shared.length > 0 ? keywordComparison.shared : ["No overlap"]).map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-rose-500/15 bg-rose-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500 dark:text-rose-300">
                    {result.video2.stats.title}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {keywordComparison.right.map((keyword) => (
                      <span
                        key={keyword}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          keywordComparison.shared.includes(keyword)
                            ? "bg-white/70 text-slate-900 dark:bg-white/10 dark:text-white"
                            : "bg-rose-600/15 text-rose-700 dark:text-rose-200"
                        }`}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/50 p-4 dark:bg-white/5">
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400">
                    DISTINCT TO VIDEO 1
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {keywordComparison.uniqueLeft[0]
                      ? `This video is leaning on ${keywordComparison.uniqueLeft.slice(0, 3).join(", ")} in audience discussion.`
                      : "Its keyword set overlaps heavily with the other video, which suggests a similar audience reaction."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/50 p-4 dark:bg-white/5">
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400">
                    DISTINCT TO VIDEO 2
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {keywordComparison.uniqueRight[0]
                      ? `This video is leaning on ${keywordComparison.uniqueRight.slice(0, 3).join(", ")} in audience discussion.`
                      : "Its keyword set overlaps heavily with the other video, which suggests a similar audience reaction."}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/50 p-4 dark:bg-white/5">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400">
                  SHARED THEMES
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {keywordComparison.shared.length > 0
                    ? keywordComparison.shared.slice(0, 4).join(", ")
                    : "No meaningful overlap surfaced in the top keywords."}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#111827] p-5 text-white shadow-[0_16px_50px_rgba(15,23,42,0.14)]">
              <div className="mb-4 flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-cyan-300" />
                <h3 className="text-lg font-bold">Recent History</h3>
              </div>

              {historyLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="h-20 animate-pulse rounded-2xl bg-white/5" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Saved comparisons will appear here after each analysis.
                </p>
              ) : (
                <div className="space-y-3">
                  {history.slice(0, 5).map((entry, index) => (
                    <div
                      key={`${entry.created_at}-${index}`}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/30 hover:bg-white/10"
                    >
                      <button
                        onClick={() => loadHistoryItem(entry)}
                        className="block w-full text-left"
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/75">
                          {formatDate(entry.created_at)}
                        </p>
                        <p className="mt-2 text-sm font-semibold">
                          {entry.response.video1.stats.title}
                        </p>
                        <p className="text-sm text-slate-300">vs {entry.response.video2.stats.title}</p>
                        <p className="mt-2 text-xs text-slate-400">
                          Winner: {entry.response.comparison.winner}
                        </p>
                        <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-cyan-200">
                          Reopen comparison
                        </p>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.14)] dark:bg-[#111827]">
            <div className="mb-4">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-cyan-300">
                INSIGHTS
              </p>
              <h3 className="text-lg font-bold">Key Takeaways</h3>
            </div>

            <ul className="space-y-3">
              {[...result.comparison.key_insights, `A total of ${result.video1.stats.total_comments + result.video2.stats.total_comments} comments were analyzed across both videos.`].map((insight, index) => (
                <li
                  key={index}
                  className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </section>
        </motion.div>
      )}
    </div>
  )
}

export default VideoComparison
