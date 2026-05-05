import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeftRight,
  Download,
  FileJson2,
  FileText,
  Loader2,
  MessageSquareMore,
  PieChartIcon,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Youtube,
} from "lucide-react"
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { useLocation, useNavigate } from "react-router-dom"

import { apiFetch } from "../utils/api"

type CommentItem = {
  text: string
  likeCount: number
  publishedAt?: string | null
}

type SentimentBreakdown = {
  total_comments: number
  positive_count: number
  negative_count: number
  neutral_count: number
  positive_percentage: number
  negative_percentage: number
  neutral_percentage: number
  average_sentiment_score: number
  csat_score: number
}

type VideoMeta = {
  title: string
  video_id: string
  url: string
  channel_title?: string | null
  published_at?: string | null
  comment_count: number
}

type VideoResult = {
  stats: VideoMeta
  sentiment_breakdown: SentimentBreakdown
  keywords: {
    top_keywords: string[]
    cleaned_keywords: string[]
  }
  most_liked_comment: CommentItem
  most_criticized_comment: CommentItem
  user_requests: CommentItem[]
  categorized_comments: {
    positive_comments: CommentItem[]
    negative_comments: CommentItem[]
    neutral_comments: CommentItem[]
  }
}

type ComparisonResponse = {
  video1: VideoResult
  video2: VideoResult
  comparison: {
    winner: string
    positivity_gap: number
    insights: string[]
    ai_summary: string
    top_keywords_video1: string[]
    top_keywords_video2: string[]
    shared_keywords: string[]
    distinct_keywords: {
      video1: string[]
      video2: string[]
    }
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

type SentimentKey = "positive_comments" | "negative_comments" | "neutral_comments"

const SENTIMENT_COLORS = {
  positive_comments: "#22c55e",
  neutral_comments: "#f59e0b",
  negative_comments: "#ef4444",
}

const SENTIMENT_LABELS: Record<SentimentKey, string> = {
  positive_comments: "Positive",
  negative_comments: "Negative",
  neutral_comments: "Neutral",
}

const truncate = (value: string, length = 180) =>
  value.length > length ? `${value.slice(0, length).trim()}...` : value

const formatDate = (value?: string | null) => {
  if (!value) return "Unknown"
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
  const [activeModal, setActiveModal] = useState<{
    open: boolean
    title: string
    comments: CommentItem[]
  }>({
    open: false,
    title: "",
    comments: [],
  })

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
      const response = await apiFetch("/youtube/compare", {
        method: "POST",
        body: JSON.stringify({
          video1_url: video1Url.trim(),
          video2_url: video2Url.trim(),
          max_comments: 300,
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
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
      downloadTextFile(`youtube-comparison-${Date.now()}.json`, JSON.stringify(result, null, 2))
      return
    }

    const rows = [
      ["metric", "video1", "video2", "comparison"].join(","),
      [
        "title",
        `"${result.video1.stats.title.replaceAll('"', '""')}"`,
        `"${result.video2.stats.title.replaceAll('"', '""')}"`,
        `"Winner: ${result.comparison.winner.replaceAll('"', '""')}"`,
      ].join(","),
      [
        "positive_percentage",
        result.video1.sentiment_breakdown.positive_percentage,
        result.video2.sentiment_breakdown.positive_percentage,
        result.comparison.positivity_gap,
      ].join(","),
      [
        "negative_percentage",
        result.video1.sentiment_breakdown.negative_percentage,
        result.video2.sentiment_breakdown.negative_percentage,
        "",
      ].join(","),
      [
        "csat_score",
        result.video1.sentiment_breakdown.csat_score,
        result.video2.sentiment_breakdown.csat_score,
        "",
      ].join(","),
      [
        "most_liked_comment",
        `"${result.video1.most_liked_comment.text.replaceAll('"', '""')}"`,
        `"${result.video2.most_liked_comment.text.replaceAll('"', '""')}"`,
        "",
      ].join(","),
    ]

    downloadTextFile(`youtube-comparison-${Date.now()}.csv`, rows.join("\n"), "text/csv")
  }

  const exportPdf = async () => {
    if (!result) return

    setExportingPdf(true)
    try {
      const response = await apiFetch("/youtube/compare-report-pdf", {
        method: "POST",
        body: JSON.stringify(result),
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

  const pieData = (stats: SentimentBreakdown) => [
    { name: "Positive", key: "positive_comments", value: stats.positive_percentage },
    { name: "Neutral", key: "neutral_comments", value: stats.neutral_percentage },
    { name: "Negative", key: "negative_comments", value: stats.negative_percentage },
  ]

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

    const left = result.comparison.top_keywords_video1
    const right = result.comparison.top_keywords_video2
    const shared = result.comparison.shared_keywords

    return {
      left,
      right,
      shared,
      uniqueLeft: result.comparison.distinct_keywords.video1,
      uniqueRight: result.comparison.distinct_keywords.video2,
    }
  }, [result])

  const openCommentModal = (title: string, comments: CommentItem[]) => {
    setActiveModal({
      open: true,
      title,
      comments,
    })
  }

  const closeCommentModal = () => {
    setActiveModal({
      open: false,
      title: "",
      comments: [],
    })
  }

  const renderChart = (video: VideoResult, title: string) => {
    const data = pieData(video.sentiment_breakdown)

    return (
      <div className="mt-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-cyan-300/80">INTERACTIVE SENTIMENT</p>
            <h4 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h4>
          </div>
          <PieChartIcon className="h-5 w-5 text-cyan-400" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="h-[260px] rounded-3xl border border-white/10 bg-white/40 p-3 dark:bg-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={3}>
                  {data.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={SENTIMENT_COLORS[entry.key as SentimentKey]}
                      onClick={() =>
                        openCommentModal(
                          `${video.stats.title} - ${entry.name}`,
                          video.categorized_comments[entry.key as SentimentKey],
                        )
                      }
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {(Object.keys(SENTIMENT_LABELS) as SentimentKey[]).map((key) => {
              const comments = video.categorized_comments[key]
              const count = comments.length
              const label = SENTIMENT_LABELS[key]
              const percent = video.sentiment_breakdown[`${key.replace("_comments", "")}_percentage` as keyof SentimentBreakdown] as number

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => openCommentModal(`${video.stats.title} - ${label}`, comments)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/50 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-white/70 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{count} comments</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: SENTIMENT_COLORS[key] }}>{percent.toFixed(1)}%</p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Open list</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderVideoCard = (payload: VideoResult, highlighted: boolean) => (
    <motion.div
      key={payload.stats.video_id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`relative overflow-hidden rounded-[28px] border p-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)] ${
        highlighted
          ? "border-cyan-400/30 bg-[linear-gradient(135deg,rgba(8,15,29,0.98),rgba(14,26,43,0.94))] text-white"
          : "border-white/30 bg-white/85 text-slate-900 shadow-[0_18px_60px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-[#0f172a] dark:text-white"
      }`}
    >
      {highlighted && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_34%)]" />
      )}

      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-cyan-300/80">
              {highlighted ? "WINNING VIDEO" : "VIDEO ANALYSIS"}
            </p>
            <h3 className="mt-2 text-2xl font-bold leading-tight">{payload.stats.title}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              {payload.sentiment_breakdown.total_comments} comments analyzed
            </p>
          </div>

          <div className={`rounded-full px-3 py-1 text-xs font-semibold ${highlighted ? "bg-cyan-400 text-slate-950" : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"}`}>
            CSAT {payload.sentiment_breakdown.csat_score.toFixed(0)}%
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Positive", value: `${payload.sentiment_breakdown.positive_percentage.toFixed(1)}%` },
            { label: "Negative", value: `${payload.sentiment_breakdown.negative_percentage.toFixed(1)}%` },
            { label: "Neutral", value: `${payload.sentiment_breakdown.neutral_percentage.toFixed(1)}%` },
            { label: "Avg Sentiment", value: payload.sentiment_breakdown.average_sentiment_score.toFixed(3) },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl border px-4 py-3 ${
                highlighted
                  ? "border-white/10 bg-white/5"
                  : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"
              }`}
            >
              <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">{item.label.toUpperCase()}</p>
              <p className="mt-2 text-xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/50 p-4 dark:bg-white/5">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">MOST LIKED COMMENT</p>
            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{truncate(payload.most_liked_comment.text, 220)}</p>
            <p className="mt-2 text-xs text-slate-400">{payload.most_liked_comment.likeCount} likes</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/50 p-4 dark:bg-white/5">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">MOST CRITICIZED COMMENT</p>
            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{truncate(payload.most_criticized_comment.text, 220)}</p>
            <p className="mt-2 text-xs text-slate-400">{payload.most_criticized_comment.likeCount} likes</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/50 p-4 dark:bg-white/5">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">USERS ARE REQUESTING</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(payload.user_requests.length > 0 ? payload.user_requests : [{ text: "No request-style comments surfaced", likeCount: 0 }]).map((item) => (
              <span
                key={`${item.text}-${item.likeCount}`}
                className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200"
              >
                {truncate(item.text, 42)}
              </span>
            ))}
          </div>
        </div>

        {renderChart(payload, "Sentiment Breakdown")}
      </div>
    </motion.div>
  )

  const chartCallout = result ? (
    <div className="rounded-3xl border border-white/10 bg-white/70 p-4 dark:bg-white/5">
      <div className="flex items-center gap-2 text-cyan-300">
        <TrendingUp className="h-4 w-4" />
        <p className="text-xs font-semibold tracking-[0.22em]">COMMENT EXPLORATION</p>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Click a pie slice or a sentiment chip to open the matching comment list.
      </p>
    </div>
  ) : null

  return (
    <div className="min-h-screen p-4 text-slate-900 lg:p-8 dark:text-white">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-cyan-300">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-[0.24em]">AI VIDEO COMPARISON</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">
            Compare audience sentiment across two YouTube videos.
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-300">
            Paste two URLs, analyze comments, and explore what viewers praise, criticize, and request most often.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/app/dashboard")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white dark:bg-white/5 dark:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Dashboard
          </button>
          {result && (
            <>
              <button
                onClick={() => exportCurrentComparison("json")}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-cyan-50 dark:bg-white/5 dark:text-white"
              >
                <FileJson2 className="h-4 w-4" />
                Export JSON
              </button>
              <button
                onClick={() => exportCurrentComparison("csv")}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-cyan-50 dark:bg-white/5 dark:text-white"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={exportPdf}
                disabled={exportingPdf}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/5 dark:text-white"
              >
                <FileText className="h-4 w-4" />
                {exportingPdf ? "Exporting PDF..." : "Export PDF"}
              </button>
              <button
                onClick={resetComparison}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                <RotateCcw className="h-4 w-4" />
                Compare Another
              </button>
            </>
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
            <label className="mb-2 block text-[11px] font-semibold tracking-[0.2em] text-white/55">YOUTUBE URL 1</label>
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
              <ArrowLeftRight className="h-5 w-5" />
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <label className="mb-2 block text-[11px] font-semibold tracking-[0.2em] text-white/55">YOUTUBE URL 2</label>
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
            Fetches 200-500 comments per video using the YouTube Data API, categorizes sentiment, and caches the comparison in MongoDB.
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
                <div key={index} className="overflow-hidden rounded-[24px] border border-white/10 bg-white/10 p-5">
                  <div className="h-4 w-28 animate-pulse rounded-full bg-white/15" />
                  <div className="mt-4 h-8 w-2/3 animate-pulse rounded-2xl bg-white/15" />
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((tile) => (
                      <div key={tile} className="h-20 animate-pulse rounded-2xl bg-white/10" />
                    ))}
                  </div>
                  <div className="mt-5 h-24 animate-pulse rounded-2xl bg-white/10" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mt-8 space-y-8">
          <section className="overflow-hidden rounded-[28px] border border-cyan-400/25 bg-[linear-gradient(135deg,rgba(8,15,29,0.98),rgba(15,23,42,0.9))] p-6 shadow-[0_24px_90px_rgba(2,6,23,0.35)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold tracking-[0.24em] text-cyan-300/75">TOP SUMMARY</p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  {winnerIsVideo1 ? result.video1.stats.title : winnerIsVideo2 ? result.video2.stats.title : "Tie"}{" "}
                  {winnerIsVideo1 || winnerIsVideo2 ? "is leading" : "is tied"}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {result.comparison.ai_summary}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400">POSITIVITY GAP</p>
                <p className="mt-1 text-3xl font-black text-cyan-300">{result.comparison.positivity_gap.toFixed(1)}%</p>
                <p className="mt-1 text-xs text-slate-400">{result.cached ? "Loaded from cache" : "Freshly analyzed"}</p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400">CONCISE INSIGHT</p>
              <p className="mt-2 text-base leading-7 text-white/90">{result.comparison.insights.join(" ")}</p>
            </div>
          </section>

          {chartCallout}

          <div className="grid gap-6 xl:grid-cols-2">
            {renderVideoCard(result.video1, winnerIsVideo1)}
            {renderVideoCard(result.video2, winnerIsVideo2)}
          </div>

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
            <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] p-5 shadow-[0_16px_50px_rgba(15,23,42,0.14)] dark:bg-[#111827]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-cyan-300">KEYWORDS</p>
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
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Shared</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(keywordComparison.shared.length > 0 ? keywordComparison.shared : ["No overlap"]).map((keyword) => (
                      <span key={keyword} className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300">
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
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400">DISTINCT TO VIDEO 1</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {keywordComparison.uniqueLeft[0]
                      ? `This video is leaning on ${keywordComparison.uniqueLeft.slice(0, 3).join(", ")} in audience discussion.`
                      : "Its keyword set overlaps heavily with the other video, which suggests a similar audience reaction."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/50 p-4 dark:bg-white/5">
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400">DISTINCT TO VIDEO 2</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {keywordComparison.uniqueRight[0]
                      ? `This video is leaning on ${keywordComparison.uniqueRight.slice(0, 3).join(", ")} in audience discussion.`
                      : "Its keyword set overlaps heavily with the other video, which suggests a similar audience reaction."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#111827] p-5 text-white shadow-[0_16px_50px_rgba(15,23,42,0.14)]">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquareMore className="h-5 w-5 text-cyan-300" />
                <h3 className="text-lg font-bold">Recent History</h3>
              </div>

              {historyLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="h-20 animate-pulse rounded-2xl bg-white/5" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-slate-400">Saved comparisons will appear here after each analysis.</p>
              ) : (
                <div className="space-y-3">
                  {history.slice(0, 5).map((entry, index) => (
                    <div
                      key={`${entry.created_at}-${index}`}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/30 hover:bg-white/10"
                    >
                      <button onClick={() => loadHistoryItem(entry)} className="block w-full text-left">
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/75">{formatDate(entry.created_at)}</p>
                        <p className="mt-2 text-sm font-semibold">{entry.response.video1.stats.title}</p>
                        <p className="text-sm text-slate-300">vs {entry.response.video2.stats.title}</p>
                        <p className="mt-2 text-xs text-slate-400">Winner: {entry.response.comparison.winner}</p>
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
              <p className="text-[11px] font-semibold tracking-[0.2em] text-cyan-300">INSIGHTS</p>
              <h3 className="text-lg font-bold">Key Takeaways</h3>
            </div>

            <ul className="space-y-3">
              {[...result.comparison.insights, `A total of ${result.video1.sentiment_breakdown.total_comments + result.video2.sentiment_breakdown.total_comments} comments were analyzed across both videos.`].map((insight, index) => (
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

      <AnimatePresence>
        {activeModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
            onClick={closeCommentModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-white p-5 shadow-[0_30px_120px_rgba(2,6,23,0.45)] dark:bg-[#0f172a]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-white/10">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.24em] text-cyan-300">COMMENT MODAL</p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{activeModal.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{activeModal.comments.length} comments</p>
                </div>
                <button
                  onClick={closeCommentModal}
                  className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 max-h-[58vh] space-y-3 overflow-y-auto pr-1">
                {activeModal.comments.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                    No comments found for this sentiment bucket.
                  </p>
                ) : (
                  activeModal.comments.map((comment, index) => (
                    <div key={`${comment.text}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <p className="text-sm leading-6 text-slate-800 dark:text-slate-200">{comment.text}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{formatDate(comment.publishedAt)}</span>
                        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                          {comment.likeCount} likes
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VideoComparison
