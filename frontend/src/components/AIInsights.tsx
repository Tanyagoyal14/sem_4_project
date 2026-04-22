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
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-slate-900 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-white">
      <h2 className="mb-4 text-xl font-semibold">AI Insights</h2>

      {!insights ? (
        <p className="text-slate-600 dark:text-slate-300">No insights available</p>
      ) : (
        <>
          <p className="mb-2 text-slate-700 dark:text-slate-100">
            Insight: <b>{insights.headline}</b>
          </p>

          <p className="text-slate-700 dark:text-slate-100">
            Frequent keywords: {insights.frequentKeywords.join(", ") || "None"}
          </p>
        </>
      )}
    </div>
  )
}

export default AIInsights
