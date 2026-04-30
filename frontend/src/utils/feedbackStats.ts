import { readStoredDashboardState } from "./feedbackStorage"

export type FeedbackStatsItem = {
  feedback?: string
  text?: string
  sentiment?: string
  csat_score?: number
  feedback_type?: string
  top_industries?: Array<{ industry?: string; name?: string; confidence?: number }>
}

export const normalizeSentiment = (value?: string) => {
  const normalized = String(value || "").trim().toLowerCase()

  if (normalized === "positive") return "Positive"
  if (normalized === "negative") return "Negative"
  if (normalized === "neutral") return "Neutral"

  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : "Neutral"
}

export const normalizeStatsItems = (items: any[]): FeedbackStatsItem[] =>
  items.map((item) => ({
    ...item,
    sentiment: normalizeSentiment(item?.sentiment),
  }))

export const getStoredDashboardResults = (): FeedbackStatsItem[] => {
  const state = readStoredDashboardState()
  return Array.isArray(state?.results) ? normalizeStatsItems(state.results) : []
}

export const calculateFeedbackStats = (items: any[]) => {
  const normalizedItems = normalizeStatsItems(Array.isArray(items) ? items : [])
  const total = normalizedItems.length
  const positive = normalizedItems.filter((item) => item.sentiment === "Positive").length
  const negative = normalizedItems.filter((item) => item.sentiment === "Negative").length
  const neutral = normalizedItems.filter((item) => item.sentiment === "Neutral").length

  const csat = total > 0
    ? Math.round(
        normalizedItems.reduce((sum, item) => {
          if (typeof item.csat_score === "number") {
            return sum + item.csat_score
          }

          if (item.sentiment === "Positive") return sum + 100
          if (item.sentiment === "Neutral") return sum + 50
          return sum + 30
        }, 0) / total
      )
    : 0

  return {
    total,
    positive,
    negative,
    neutral,
    csat,
    items: normalizedItems,
  }
}
