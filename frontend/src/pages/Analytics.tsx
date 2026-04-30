import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useLocation } from "react-router-dom"
import IndustryPieChart from "../components/IndustryPieChart"
import { apiFetch } from "../utils/api"
import { getFeedbackStreamStorageKey } from "../utils/feedbackStorage"

const getStoredFeedbackHistory = () => {
  try {
    const saved = localStorage.getItem(getFeedbackStreamStorageKey())
    if (!saved) return []

    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Unable to read saved analytics history:", error)
    return []
  }
}

const matchesSelectedIndustry = (item: any, selectedIndustry?: string) => {
  if (!selectedIndustry) return true

  return (
    item.industry === selectedIndustry ||
    item.feedback_type === selectedIndustry ||
    Array.isArray(item.top_industries) &&
      item.top_industries.some((entry: any) =>
        entry.industry === selectedIndustry || entry.name === selectedIndustry
      )
  )
}

const normalizeLocalHistory = (items: any[]) =>
  items.map((item) => ({
    ...item,
    sentiment:
      String(item.sentiment || "").charAt(0).toUpperCase() +
      String(item.sentiment || "").slice(1).toLowerCase(),
  }))

function Analytics() {
  const location = useLocation()
  const selectedIndustry = location.state?.selectedIndustry

  const [history, setHistory] = useState<any[]>([])
  const [csat, setCsat] = useState(0)
  const totalFeedback = history.length
  const positiveFeedback = history.filter((item: any) => item.sentiment === "Positive").length
  const negativeFeedback = history.filter((item: any) => item.sentiment === "Negative").length
  const neutralFeedback = history.filter((item: any) => item.sentiment === "Neutral").length
  const positiveShare = totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0
  const negativeShare = totalFeedback > 0 ? Math.round((negativeFeedback / totalFeedback) * 100) : 0

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch("/feedback-history")
        const data = await res.json()
        const remoteHistory = Array.isArray(data?.history) ? data.history : []
        const localHistory = normalizeLocalHistory(getStoredFeedbackHistory())
        const sourceHistory = remoteHistory.length > 0 ? remoteHistory : localHistory
        const filtered = sourceHistory.filter((item: any) =>
          matchesSelectedIndustry(item, selectedIndustry)
        )

        setHistory(filtered)

        const positive = filtered.filter((item: any) => item.sentiment === "Positive").length
        const total = filtered.length
        setCsat(total > 0 ? Math.round((positive / total) * 100) : 0)
      } catch (error) {
        console.error("Analytics error:", error)
        const fallbackHistory = normalizeLocalHistory(getStoredFeedbackHistory()).filter((item: any) =>
          matchesSelectedIndustry(item, selectedIndustry)
        )
        setHistory(fallbackHistory)
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

    const feedbackType = item.feedback_type || item.type

    if (complaintCounts[feedbackType] !== undefined) {
      complaintCounts[feedbackType]++
    }
  })

  const sentimentData = Object.keys(sentimentCounts).map((key) => ({
    name: key,
    value: sentimentCounts[key],
    icon: key === "Positive" ? "😊" : key === "Neutral" ? "😐" : "😞"
  }))

  const complaintData = Object.keys(complaintCounts).map((key) => ({
    name: key,
    value: complaintCounts[key],
    icon:
      key === "Complaint"
        ? "⚠️"
        : key === "Suggestion"
          ? "💡"
          : key === "Praise"
            ? "👏"
            : "❓"
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

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Feedback",
            value: totalFeedback,
            change: totalFeedback > 0 ? "+0.0%" : "0.0%",
            icon: "📈",
            accent: "from-emerald-400/30 via-cyan-400/15 to-transparent",
            subtitle: "Based on recent feedback",
            footer: "Latest volume"
          },
          {
            title: "Positive",
            value: positiveFeedback,
            change: `+${positiveShare}%`,
            icon: "😊",
            accent: "from-emerald-400/35 via-emerald-300/10 to-transparent",
            subtitle: `${positiveShare}% of total`,
            footer: "Good sentiment share"
          },
          {
            title: "Negative",
            value: negativeFeedback,
            change: negativeShare > 0 ? `-${negativeShare}%` : "0.0%",
            icon: "😡",
            accent: "from-rose-500/30 via-red-400/10 to-transparent",
            subtitle: `${negativeShare}% of total`,
            footer: "Needs attention"
          },
          {
            title: "CSAT Score",
            value: csat,
            change: `${csat >= 50 ? "+" : "-"}${Math.abs(csat - 50)}%`,
            icon: "⭐",
            accent: "from-sky-400/25 via-cyan-400/10 to-transparent",
            subtitle: "Customer satisfaction",
            footer: `${neutralFeedback} neutral items`
          }
        ].map((card) => (
          <div
            key={card.title}
            className="group relative overflow-hidden rounded-[20px] border border-white/10 bg-[#0b1720]/70 p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(0,0,0,0.5)]"
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} opacity-55`} />
            <div className="pointer-events-none absolute inset-[1px] rounded-[19px] border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />

            <div className="relative z-10 flex min-h-[146px] flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.22em] text-white/55">
                    {card.title.toUpperCase()}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-white">{card.value}</p>
                  <p className="mt-2 text-sm text-slate-300/75">{card.subtitle}</p>
                </div>
                <div className="text-3xl opacity-85">{card.icon}</div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    card.title === "Negative"
                      ? "bg-rose-500/10 text-rose-300"
                      : "bg-emerald-500/10 text-emerald-300"
                  }`}
                >
                  {card.change}
                </span>
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                  {card.footer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <IndustryPieChart
            data={sentimentData}
            height={320}
            title="SENTIMENT DISTRIBUTION"
            subtitle="Live breakdown of feedback polarity"
            className="h-full"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <IndustryPieChart
            data={complaintData}
            height={320}
            title="FEEDBACK TYPE DISTRIBUTION"
            subtitle="Complaint, suggestion, praise, and question mix"
            className="h-full"
          />
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
