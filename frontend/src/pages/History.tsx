import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"

import { apiFetch } from "../utils/api"
import { readStoredDashboardState, readStoredFeedbackStream } from "../utils/feedbackStorage"
import { normalizeSentiment } from "../utils/feedbackStats"

type SentimentFilter = "All" | "Positive" | "Negative" | "Neutral"

type HistoryEntry = {
  feedback: string
  sentiment: string
  source: "manual" | "csv"
  batchId?: string
  createdAt?: string
  feedbackType?: string
  topIndustries?: Array<{ industry?: string; name?: string }>
}

type CsvBatch = {
  batchId: string
  title: string
  createdAt?: string
  items: HistoryEntry[]
}

const FILTERS: SentimentFilter[] = ["All", "Positive", "Negative", "Neutral"]

const normalizeEntry = (item: any, fallbackBatchId?: string): HistoryEntry => ({
  feedback: String(item?.feedback || item?.text || ""),
  sentiment: normalizeSentiment(item?.sentiment),
  source: item?.source || item?.source_type || (item?.batchId || item?.batch_id ? "csv" : "manual"),
  batchId: item?.batchId || item?.batch_id || fallbackBatchId,
  createdAt: item?.createdAt || item?.created_at || item?.timestamp,
  feedbackType: item?.feedbackType || item?.feedback_type,
  topIndustries: item?.topIndustries || item?.top_industries || [],
})

const getStoredHistoryFallback = (): HistoryEntry[] => {
  try {
    const dashboardState = readStoredDashboardState()
    const dashboardResults = Array.isArray(dashboardState?.results) ? dashboardState.results : []
    if (dashboardResults.length > 0) {
      return dashboardResults.map((item: any) => normalizeEntry(item))
    }

    const stream = readStoredFeedbackStream()
    return Array.isArray(stream) ? stream.map((item: any) => normalizeEntry(item)) : []
  } catch (error) {
    console.error("Unable to read saved history fallback:", error)
    return []
  }
}

const applySentimentFilter = (items: HistoryEntry[], filter: SentimentFilter) =>
  filter === "All" ? items : items.filter((item) => item.sentiment === filter)

const getBatchCounts = (items: HistoryEntry[]) => ({
  positive: items.filter((item) => item.sentiment === "Positive").length,
  negative: items.filter((item) => item.sentiment === "Negative").length,
  neutral: items.filter((item) => item.sentiment === "Neutral").length,
})

function History() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [manualFilter, setManualFilter] = useState<SentimentFilter>("All")
  const [batchFilters, setBatchFilters] = useState<Record<string, SentimentFilter>>({})

  const fetchHistory = async () => {
    try {
      const res = await apiFetch("/feedback-history")
      const data = await res.json()
      const remoteHistory = Array.isArray(data.history)
        ? data.history.map((item: any) => normalizeEntry(item))
        : []

      setHistory(remoteHistory.length > 0 ? remoteHistory : getStoredHistoryFallback())
    } catch (error) {
      console.error("History error:", error)
      setHistory(getStoredHistoryFallback())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
    const interval = setInterval(fetchHistory, 5000)
    return () => clearInterval(interval)
  }, [])

  const manualItems = useMemo(
    () => history.filter((item) => item.source !== "csv"),
    [history]
  )

  const csvBatches = useMemo<CsvBatch[]>(() => {
    const grouped = new Map<string, CsvBatch>()

    history
      .filter((item) => item.source === "csv")
      .forEach((item, index) => {
        const batchId = item.batchId || `csv-${index}`

        if (!grouped.has(batchId)) {
          grouped.set(batchId, {
            batchId,
            title: `CSV Upload ${batchId}`,
            createdAt: item.createdAt,
            items: [],
          })
        }

        grouped.get(batchId)?.items.push(item)
      })

    return Array.from(grouped.values()).sort((a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )
  }, [history])

  const visibleManualItems = useMemo(
    () => applySentimentFilter(manualItems, manualFilter),
    [manualItems, manualFilter]
  )

  const renderFilterChips = (
    activeFilter: SentimentFilter,
    onChange: (filter: SentimentFilter) => void
  ) => (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onChange(filter)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            activeFilter === filter
              ? "bg-cyan-400 text-slate-950"
              : "bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-200"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  )

  const renderRows = (items: HistoryEntry[]) => (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#1f1f2e]">
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
          {items.map((item, index) => (
            <motion.tr
              key={`${item.feedback}-${item.createdAt || index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="border-t border-slate-200 hover:bg-slate-50 dark:border-[#1f1f2e] dark:hover:bg-[#12121a]"
            >
              <td className="max-w-xl p-3 text-left">{item.feedback}</td>
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
              <td className="p-3 text-purple-400">{item.feedbackType || "-"}</td>
              <td className="p-3">{item.topIndustries?.[0]?.industry || item.topIndustries?.[0]?.name || "-"}</td>
              <td className="p-3 text-sm text-slate-500 dark:text-gray-400">
                {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )

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
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1f1f2e] dark:bg-[#0f0f16]">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">Manual Feedback</h2>
                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                    {manualItems.length} entries
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                  All individually submitted feedback entries.
                </p>
              </div>

              {renderFilterChips(manualFilter, setManualFilter)}
            </div>

            {visibleManualItems.length > 0 ? (
              renderRows(visibleManualItems)
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                No {manualFilter.toLowerCase()} manual feedback found.
              </div>
            )}
          </section>

          {csvBatches.map((batch) => {
            const activeFilter = batchFilters[batch.batchId] || "All"
            const visibleItems = applySentimentFilter(batch.items, activeFilter)
            const counts = getBatchCounts(batch.items)

            return (
              <section
                key={batch.batchId}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1f1f2e] dark:bg-[#0f0f16]"
              >
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold">{batch.title}</h2>
                      <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                        {batch.items.length} comments
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                      {batch.createdAt ? new Date(batch.createdAt).toLocaleString() : "-"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-300">
                        Positive: {counts.positive}
                      </span>
                      <span className="rounded-full bg-rose-500/10 px-3 py-1 font-semibold text-rose-300">
                        Negative: {counts.negative}
                      </span>
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 font-semibold text-amber-300">
                        Neutral: {counts.neutral}
                      </span>
                    </div>
                  </div>

                  {renderFilterChips(activeFilter, (filter) =>
                    setBatchFilters((prev) => ({ ...prev, [batch.batchId]: filter }))
                  )}
                </div>

                {visibleItems.length > 0 ? (
                  renderRows(visibleItems)
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                    No {activeFilter.toLowerCase()} comments found in this CSV batch.
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

export default History
