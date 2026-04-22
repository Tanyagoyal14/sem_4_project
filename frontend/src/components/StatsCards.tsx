import { useMemo } from "react"
import CountUp from "react-countup"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis
} from "recharts"

type StatsCardsProps = {
  total?: number
  positive?: number
  negative?: number
  csat?: number
  totalFeedback?: number
  positiveCount?: number
  negativeCount?: number
  csatScore?: number
  totalChange?: number
  positiveChange?: number
  negativeChange?: number
  csatChange?: number
  csatTrend?: number[]
}

type CardConfig = {
  title: string
  value: number
  suffix?: string
  change?: number
  subtitle?: string
  icon: string
  accent: string
  helper?: string
  sparkline?: boolean
  percentage?: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const formatChange = (value: number) => {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

function StatsCards(props: StatsCardsProps) {
  const total = props.totalFeedback ?? props.total ?? 0
  const positive = props.positiveCount ?? props.positive ?? 0
  const negative = props.negativeCount ?? props.negative ?? 0
  const csat = props.csatScore ?? props.csat ?? 0

  const positiveRate = total > 0 ? Math.round((positive / total) * 100) : 0
  const negativeRate = total > 0 ? Math.round((negative / total) * 100) : 0

  const sparklineData = useMemo(() => {
    const base = clamp(csat, 0, 100)

    if (props.csatTrend?.length) {
      return props.csatTrend.map((value, index) => ({
        index,
        value: clamp(value, 0, 100)
      }))
    }

    return [0.94, 0.97, 1, 1.02, 1.04, 1.03].map((multiplier, index) => ({
      index,
      value: clamp(base * multiplier, 0, 100)
    }))
  }, [csat, props.csatTrend])

  const cards: CardConfig[] = [
    {
      title: "Total Feedback",
      value: total,
      change: props.totalChange ?? 0,
      subtitle: "Based on recent feedback",
      icon: "📈",
      accent: "from-emerald-400/30 via-cyan-400/15 to-transparent",
      helper: "Latest volume",
      percentage: undefined
    },
    {
      title: "Positive",
      value: positive,
      suffix: "",
      icon: "😊",
      accent: "from-emerald-400/35 via-emerald-300/10 to-transparent",
      helper: "Share of total",
      percentage: positiveRate
    },
    {
      title: "Negative",
      value: negative,
      suffix: "",
      icon: "😡",
      accent: "from-rose-500/30 via-red-400/10 to-transparent",
      helper: "Share of total",
      percentage: negativeRate
    },
    {
      title: "CSAT Score",
      value: csat,
      suffix: "%",
      change: props.csatChange ?? 0,
      icon: "⭐",
      accent: "from-sky-400/25 via-cyan-400/10 to-transparent",
      helper: "Customer satisfaction trend",
      sparkline: true
    }
  ]

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const positiveChange = (card.change ?? 0) >= 0
        const changeColor = positiveChange ? "text-emerald-300" : "text-rose-300"
        const changeBg = positiveChange ? "bg-emerald-500/10" : "bg-rose-500/10"
        const changeValue = card.change ?? 0

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-[20px] border border-white/10 bg-[#0b1720]/70 p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition will-change-transform"
          >
            <motion.div
              aria-hidden="true"
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              className={`pointer-events-none absolute -inset-[2px] rounded-[22px] bg-[conic-gradient(from_180deg,rgba(79,209,197,0.0),rgba(79,209,197,0.48),rgba(34,197,94,0.35),rgba(59,130,246,0.42),rgba(236,72,153,0.38),rgba(79,209,197,0.0))] opacity-40 blur-[10px] transition duration-300 group-hover:opacity-80`}
            />
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} opacity-55`} />
            <div className="pointer-events-none absolute inset-[1px] rounded-[19px] border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]" />
            <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(79,209,197,0.14),transparent_30%)]" />

            <div className="relative z-10 flex min-h-[150px] flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.22em] text-white/55">
                    {card.title.toUpperCase()}
                  </p>

                  <div className="mt-2 flex items-end gap-2">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                      <CountUp
                        start={0}
                        end={card.value}
                        duration={1.1}
                        preserveValue
                        separator=","
                        decimals={Number.isInteger(card.value) ? 0 : 1}
                      >
                        {({ countUpRef }) => <span ref={countUpRef} />}
                      </CountUp>
                      {card.suffix}
                    </h2>

                    {typeof card.percentage === "number" && (
                      <span className="mb-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                        {card.percentage}%
                      </span>
                    )}
                  </div>

                  {card.subtitle && (
                    <p className="mt-2 text-sm text-slate-200/70">
                      {card.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-3xl opacity-85 drop-shadow-[0_6px_16px_rgba(0,0,0,0.35)]">
                    {card.icon}
                  </span>

                  {typeof card.change === "number" && (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${changeBg} ${changeColor}`}>
                      {formatChange(changeValue)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                    {card.helper}
                  </p>
                  {typeof card.percentage === "number" && (
                    <p className="text-sm font-semibold text-white/85">
                      {card.percentage}% of total
                    </p>
                  )}
                  {card.title === "Total Feedback" && (
                    <p className="text-sm font-semibold text-white/85">
                      {card.change && card.change !== 0
                        ? "Momentum is moving"
                        : "Live aggregated volume"}
                    </p>
                  )}
                </div>

                {card.sparkline && (
                  <div className="h-12 w-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineData}>
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                          cursor={false}
                          contentStyle={{
                            display: "none"
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#86efac"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default StatsCards
