import { motion } from "framer-motion"
import { Flag, MessageCircle, ThumbsUp } from "lucide-react"

type LiveFeedItem = {
  feedback?: string
  text?: string
  sentiment?: string
  timestamp?: string
  likes?: number
  comments?: number
  category?: string
  issue?: string
  action?: string
}

type LiveFeedProps = {
  stream: LiveFeedItem[]
}

const sentimentMeta = (sentiment?: string) => {
  const value = String(sentiment || "").toLowerCase()

  if (value === "positive") {
    return {
      label: "Positive",
      tone: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
      emoji: "😊"
    }
  }

  if (value === "negative") {
    return {
      label: "Negative",
      tone: "bg-rose-500/15 text-rose-300 border-rose-400/20",
      emoji: "😡"
    }
  }

  return {
    label: "Neutral",
    tone: "bg-amber-500/15 text-amber-200 border-amber-300/20",
    emoji: "😐"
  }
}

const inferIssue = (message: string, sentiment?: string) => {
  const text = message.toLowerCase()
  const rules = [
    { test: /delivery|shipping|late|delay/, issue: "Delivery delay", action: "Re-check fulfillment timing and shipping updates." },
    { test: /payment|checkout|billing|invoice/, issue: "Payment flow", action: "Audit checkout friction and payment errors." },
    { test: /crash|bug|error|broken|freeze/, issue: "App stability", action: "Prioritize a fix and monitor error logs." },
    { test: /support|help|agent|response/, issue: "Support response", action: "Shorten response times and add escalation paths." },
    { test: /quality|damaged|defect|missing/, issue: "Product quality", action: "Review quality checks before dispatch." },
    { test: /slow|lag|performance|load/, issue: "Performance", action: "Optimize response times and loading speed." }
  ]

  const matched = rules.find((rule) => rule.test.test(text))
  if (matched) return matched

  if (String(sentiment || "").toLowerCase() === "positive") {
    return {
      issue: "Customer delight",
      action: "Reinforce what is working and scale the pattern."
    }
  }

  if (String(sentiment || "").toLowerCase() === "negative") {
    return {
      issue: "Negative sentiment",
      action: "Investigate the main friction and follow up quickly."
    }
  }

  return {
    issue: "General feedback",
    action: "Monitor for patterns across the live stream."
  }
}

const timeAgo = (timestamp?: string, index?: number) => {
  if (timestamp) return timestamp
  if (index === 0) return "Just now"
  if (typeof index === "number") return `${Math.min(index + 1, 9)}m ago`
  return "Just now"
}

const initials = (message: string) =>
  message
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("") || "U"

function LiveFeed({ stream }: LiveFeedProps) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-[#08121a]/70 p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-[1px] rounded-[15px] border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent shadow-[0_0_0_1px_rgba(168,85,247,0.08),0_0_30px_rgba(59,130,246,0.12)]" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-white/55">
              <motion.span
                className="h-2 w-2 rounded-full bg-rose-400"
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.15, 0.9] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
              LIVE FEED
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
            Feedback Stream
          </h2>
          <p className="mt-1 text-sm text-slate-300/70">
            Real-time user feedback
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
          {stream.map((item: LiveFeedItem, index: number) => {
            const message = item.feedback || item.text || "New feedback received"
            const meta = sentimentMeta(item.sentiment)
            const issue = inferIssue(message, item.sentiment)
            const latest = index === 0
            const likes = item.likes ?? Math.max(1, Math.min(99, message.length % 17 + 3))
            const comments = item.comments ?? Math.max(0, Math.min(24, message.length % 9))
            const avatar = initials(message)

            return (
              <motion.div
                key={`${message}-${index}`}
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                whileHover={{ scale: 1.01 }}
                className={`group relative overflow-hidden rounded-2xl border p-[1px] transition ${
                  latest
                    ? "shadow-[0_0_0_1px_rgba(168,85,247,0.18),0_0_24px_rgba(59,130,246,0.18)]"
                    : "shadow-none"
                }`}
              >
                <div className="rounded-2xl border border-white/10 bg-[#0b1720]/80 p-4 backdrop-blur-xl transition duration-300 group-hover:bg-[#0e1a25]/90 group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.32)]">
                  {latest && (
                    <motion.div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-2xl bg-cyan-400/5"
                      animate={{ opacity: [0.25, 0.55, 0.25] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-cyan-400/20 via-indigo-400/15 to-emerald-400/15 text-sm font-bold text-white shadow-[0_0_18px_rgba(59,130,246,0.18)]">
                      {avatar}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium leading-6 text-white/95">
                        {message}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.tone}`}
                        >
                          <span>{meta.emoji}</span>
                          <span>{meta.label}</span>
                        </span>

                        <span className="text-xs text-slate-300/65">
                          {timeAgo(item.timestamp, index)}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 rounded-xl border border-white/8 bg-white/[0.03] p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300/55">
                          Detected Issue: <span className="text-slate-100/90">{item.issue || issue.issue}</span>
                        </p>
                        <p className="text-sm text-slate-300/75">
                          <span className="font-semibold text-slate-100/85">Suggested Action:</span>{" "}
                          {item.action || issue.action}
                        </p>
                      </div>
                    </div>

                    <div className="hidden self-stretch border-l border-white/10 pl-4 sm:flex">
                      <div className="flex min-w-[72px] flex-col items-end justify-between gap-3 text-xs text-slate-300/70">
                        <div className="flex items-center gap-1.5">
                          <ThumbsUp size={14} className="text-emerald-300" />
                          <span>{likes}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle size={14} className="text-sky-300" />
                          <span>{comments}</span>
                        </div>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-rose-300 transition hover:text-rose-200"
                          aria-label="Flag feedback"
                        >
                          <Flag size={14} />
                          <span>Flag</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/8 pt-3 sm:hidden">
                    <div className="flex items-center gap-4 text-xs text-slate-300/70">
                      <span className="flex items-center gap-1.5">
                        <ThumbsUp size={14} className="text-emerald-300" />
                        {likes}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle size={14} className="text-sky-300" />
                        {comments}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-xs text-rose-300 transition hover:text-rose-200"
                      aria-label="Flag feedback"
                    >
                      <Flag size={14} />
                      Flag
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {stream.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-300/70">
            No live feedback yet. New entries will appear here in real time.
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveFeed
