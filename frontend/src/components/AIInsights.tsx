import { useEffect, useState } from "react"

type InsightSummary = {
  headline: string
  frequentKeywords: string[]
}

type AIInsightsProps = {
  feedbackList: string[]
}

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "for",
  "from", "had", "has", "have", "i", "if", "in", "is", "it", "its", "my",
  "of", "on", "or", "so", "that", "the", "their", "this", "to", "was",
  "were", "with", "you", "your"
])

const POSITIVE_WORDS = new Set([
  "amazing", "awesome", "best", "excellent", "fast", "good", "great", "happy",
  "love", "loved", "nice", "perfect", "smooth", "useful"
])

const NEGATIVE_WORDS = new Set([
  "bad", "broken", "complaint", "crash", "crashed", "damaged", "delay", "delayed",
  "issue", "late", "poor", "problem", "refund", "slow", "terrible", "worst"
])

function analyzeFeedback(feedbackList: string[]): InsightSummary | null {
  const cleanedFeedback = feedbackList
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  if (cleanedFeedback.length === 0) {
    return null
  }

  const keywordCounts: Record<string, number> = {}
  let positiveMatches = 0
  let negativeMatches = 0

  cleanedFeedback.forEach((entry) => {
    entry
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word) => {
        if (POSITIVE_WORDS.has(word)) positiveMatches++
        if (NEGATIVE_WORDS.has(word)) negativeMatches++

        if (word.length > 2 && !STOP_WORDS.has(word)) {
          keywordCounts[word] = (keywordCounts[word] || 0) + 1
        }
      })
  })

  const frequentKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word)

  const topKeyword = frequentKeywords[0]
  let headline = "No clear insight available yet."

  if (topKeyword) {
    if (positiveMatches > negativeMatches) {
      headline = `Positive feedback is centered around "${topKeyword}".`
    } else if (negativeMatches > positiveMatches) {
      headline = `Main complaint is related to "${topKeyword}".`
    } else {
      headline = `Customers are frequently discussing "${topKeyword}".`
    }
  }

  return {
    headline,
    frequentKeywords
  }
}

function AIInsights({ feedbackList }: AIInsightsProps) {
  const [insights, setInsights] = useState<InsightSummary | null>(null)

  useEffect(() => {
    setInsights(analyzeFeedback(feedbackList))
  }, [feedbackList])

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#0b1720]/70 p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,209,197,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-[1px] rounded-[19px] border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />

      <div className="relative z-10">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-white/55">
          AI INSIGHTS
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">Pattern Summary</h2>

        {!insights ? (
          <p className="mt-4 text-slate-300/75">No insights available</p>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-100">
              <span className="block text-xs uppercase tracking-[0.18em] text-white/45">
                Insight
              </span>
              <span className="mt-1 block font-medium">{insights.headline}</span>
            </p>

            <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-100">
              <span className="block text-xs uppercase tracking-[0.18em] text-white/45">
                Frequent Keywords
              </span>
              <span className="mt-1 block">
                {insights.frequentKeywords.join(", ") || "None"}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIInsights
