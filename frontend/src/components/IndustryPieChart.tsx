import { memo, useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip
} from "recharts"

const RechartsPie = Pie as any

export type DataType = {
  name: string
  value: number
}

type RawPredictionItem = DataType & {
  industry?: string
  confidence?: number
  icon?: string
}

type NormalizedDatum = DataType & {
  icon: string
  color: string
}

type IndustryPieChartProps = {
  data?: RawPredictionItem[]
  height?: number
  onSliceClick?: (entry: DataType, index: number) => void
  className?: string
  title?: string
  subtitle?: string
}

const PALETTE = ["#4FD1C5", "#22C55E", "#EC4899", "#3B82F6"]

const CATEGORY_ICONS: Array<{ match: RegExp; icon: string }> = [
  { match: /retail|shop|commerce|e-commerce/i, icon: "🛒" },
  { match: /tech|technology|software|it/i, icon: "💻" },
  { match: /logistics|warehouse|supply|delivery|distribution/i, icon: "📦" },
  { match: /bank|finance|payments|fintech/i, icon: "🏦" },
  { match: /health|medical|care/i, icon: "🩺" },
  { match: /education|school|learn/i, icon: "🎓" },
  { match: /food|restaurant|grocery/i, icon: "🍽️" },
  { match: /travel|tour|hospitality/i, icon: "✈️" },
  { match: /telecom|network|telecommunications/i, icon: "📡" }
]

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3)

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "")
  if (normalized.length !== 6) return null

  const num = Number.parseInt(normalized, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  }
}

const mix = (start: string, end: string, amount: number) => {
  const from = hexToRgb(start)
  const to = hexToRgb(end)

  if (!from || !to) return start

  const r = Math.round(from.r + (to.r - from.r) * amount)
  const g = Math.round(from.g + (to.g - from.g) * amount)
  const b = Math.round(from.b + (to.b - from.b) * amount)

  return `rgb(${r}, ${g}, ${b})`
}

const darken = (hex: string, amount = 0.28) => mix(hex, "#000000", clamp(amount, 0, 1))

const lighten = (hex: string, amount = 0.24) => mix(hex, "#ffffff", clamp(amount, 0, 1))

const getIcon = (name: string) => {
  const match = CATEGORY_ICONS.find((entry) => entry.match.test(name))
  return match?.icon ?? "📊"
}

const getValueLabel = (value: number) => {
  if (Math.abs(value) < 1) return value.toFixed(3)
  if (Math.abs(value) < 10) return value.toFixed(2)
  return value.toFixed(1)
}

const getRawValue = (item: RawPredictionItem) => {
  if (typeof item.value === "number") return item.value
  if (typeof item.confidence === "number") return item.confidence
  return 0
}

const normalizeData = (data?: RawPredictionItem[]) => {
  console.log("🚀 IndustryPieChart raw data:", data); // Enhanced debug

  if (!data || data.length === 0) {
    console.warn("⚠️ No data provided to IndustryPieChart - using fallback");
    return [
      { name: "E-commerce", value: 0.4, icon: "🛒" },
      { name: "Technology", value: 0.35, icon: "💻" },
      { name: "Customer Support", value: 0.25, icon: "📞" }
    ];
  }

  const normalized = (data ?? [])
    .map((item) => {
      const name = item.name || item.industry || "Unknown";
      const raw = getRawValue(item);
      console.log(`📈 Processing item: ${name}, raw value: ${raw} (${typeof raw})`);
      const safeValue = Number.isFinite(raw) && raw > 0 ? raw : 0.01; // Lower threshold

      return {
        name,
        value: safeValue,
        icon: item.icon || getIcon(name)
      }
    })
    .filter((item) => Number.isFinite(item.value) && item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Limit to 8 slices max

  console.log("✅ IndustryPieChart normalized data:", normalized); 
  console.log(`📊 Total slices: ${normalized.length}, Total value: ${normalized.reduce((sum, item) => sum + item.value, 0).toFixed(3)}`);
  return normalized.length > 0 ? normalized : [
    { name: "No Data", value: 1, icon: "📊" }
  ];
};

function IndustryPieChart({
  data,
  height = 360,
  onSliceClick,
  className = "",
  title = "INDUSTRY PREDICTION",
  subtitle = "Click a section to view analytics ->"
}: IndustryPieChartProps) {
  const normalizedTargetData = useMemo(() => normalizeData(data), [data])
  const colorMapRef = useRef<Map<string, string>>(new Map())
  const animationRef = useRef<number | null>(null)
  const displayDataRef = useRef<NormalizedDatum[]>([])
  const [displayData, setDisplayData] = useState<NormalizedDatum[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const total = useMemo(
    () => displayData.reduce((sum, item) => sum + item.value, 0),
    [displayData]
  )

  const outerRadius = 118
  const innerRadius = Math.round(outerRadius * 0.65)
  const centerY = height / 2
  const bottomCy = centerY + 5
  const topCy = centerY

  useEffect(() => {
    displayDataRef.current = displayData
  }, [displayData])

  useEffect(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current)
    }

    const previous = displayDataRef.current
    const previousMap = new Map(previous.map((item) => [item.name, item.value]))

    if (normalizedTargetData.length === 0) {
      setDisplayData([])
      return
    }

    const orderedNames = [
      ...normalizedTargetData.map((item) => item.name),
      ...previous.map((item) => item.name).filter((name) => !normalizedTargetData.some((item) => item.name === name))
    ]

    const targetMap = new Map(normalizedTargetData.map((item) => [item.name, item]))

    orderedNames.forEach((name, index) => {
      if (!colorMapRef.current.has(name)) {
        colorMapRef.current.set(name, PALETTE[index % PALETTE.length])
      }
    })

    const startData = orderedNames.map((name) => {
      const target = targetMap.get(name)
      const fallbackIcon = getIcon(name)
      return {
        name,
        value: previousMap.get(name) ?? 0,
        icon: target?.icon ?? fallbackIcon,
        color: colorMapRef.current.get(name) ?? PALETTE[0]
      }
    })

    const endData = orderedNames.map((name) => {
      const target = targetMap.get(name)
      return {
        name,
        value: target?.value ?? 0,
        icon: target?.icon ?? getIcon(name),
        color: colorMapRef.current.get(name) ?? PALETTE[0]
      }
    })

    setDisplayData(startData)

    const duration = 800
    const startTime = performance.now()

    const animate = (now: number) => {
      const progress = clamp((now - startTime) / duration, 0, 1)
      const eased = easeOutCubic(progress)

      setDisplayData(
        orderedNames.map((name, index) => {
          const start = startData[index]?.value ?? 0
          const end = endData[index]?.value ?? 0
          const target = targetMap.get(name)
          const value = start + (end - start) * eased

          return {
            name,
            value,
            icon: target?.icon ?? getIcon(name),
            color: colorMapRef.current.get(name) ?? PALETTE[index % PALETTE.length]
          }
        })
      )

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [normalizedTargetData])

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setActiveIndex(null)
  }, [normalizedTargetData])

  const renderLabelLine = (props: any) => {
    const { cx, cy, midAngle, outerRadius: pieOuterRadius, x, y, value } = props

    if (!value) {
      return <path d="M0 0" stroke="transparent" fill="none" />
    }

    const RADIAN = Math.PI / 180
    const startX = cx + Math.cos(-midAngle * RADIAN) * pieOuterRadius
    const startY = cy + Math.sin(-midAngle * RADIAN) * pieOuterRadius
    const controlX = cx + Math.cos(-midAngle * RADIAN) * (pieOuterRadius + 10)
    const controlY = cy + Math.sin(-midAngle * RADIAN) * (pieOuterRadius + 10)

    return (
      <path
        d={`M${startX},${startY} Q${controlX},${controlY} ${x},${y}`}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={1.2}
        fill="none"
      />
    )
  }

  const renderLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius: pieInnerRadius, outerRadius: pieOuterRadius, x, y, value, index } = props
    const datum = displayData[index]

    if (!datum || value <= 0) return null

    const percent = total > 0 ? (value / total) * 100 : 0
    if (percent < 2.4) return null

    const RADIAN = Math.PI / 180
    const radius = pieInnerRadius + (pieOuterRadius - pieInnerRadius) * 0.58
    const anchorX = cx + radius * Math.cos(-midAngle * RADIAN)
    const anchorY = cy + radius * Math.sin(-midAngle * RADIAN)
    const side = anchorX > cx ? "start" : "end"
    const textX = x ?? anchorX
    const textY = y ?? anchorY
    const accent = lighten(datum.color, 0.18)

    return (
      <g>
        <text
          x={textX}
          y={textY - 12}
          textAnchor={side}
          dominantBaseline="central"
          fill="#f8fafc"
          fontSize={12}
          fontWeight={700}
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.55))" }}
        >
          {`${datum.icon} ${datum.name}`}
        </text>
        <text
          x={textX}
          y={textY + 2}
          textAnchor={side}
          dominantBaseline="central"
          fill={accent}
          fontSize={11}
          fontWeight={700}
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))" }}
        >
          {getValueLabel(value)}
        </text>
        <text
          x={textX}
          y={textY + 16}
          textAnchor={side}
          dominantBaseline="central"
          fill="rgba(226,232,240,0.8)"
          fontSize={10}
          fontWeight={500}
        >
          {`${percent.toFixed(1)}% share`}
        </text>
      </g>
    )
  }

  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius: pieInnerRadius,
      outerRadius: pieOuterRadius,
      startAngle,
      endAngle,
      fill,
      payload
    } = props

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={pieInnerRadius - 2}
          outerRadius={pieOuterRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          fillOpacity={0.98}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={pieInnerRadius}
          outerRadius={pieOuterRadius + 14}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={payload?.color ?? fill}
          fillOpacity={0.18}
        />
      </g>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null

    const item = payload[0].payload as NormalizedDatum
    const percentage = total > 0 ? (item.value / total) * 100 : 0

    return (
      <div className="rounded-2xl border border-white/10 bg-[#08111a]/95 px-4 py-3 text-sm text-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="mb-2 flex items-center gap-2 text-base font-semibold">
          <span>{item.icon}</span>
          <span>{item.name}</span>
        </div>
        <div className="space-y-1 text-slate-300">
          <p>
            <span className="text-slate-500">Percentage:</span> {percentage.toFixed(1)}%
          </p>
          <p>
            <span className="text-slate-500">Raw value:</span> {getValueLabel(item.value)}
          </p>
        </div>
      </div>
    )
  }

  const resolvedClassName = [
    "relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] shadow-xl",
    className
  ]
    .filter(Boolean)
    .join(" ")

  // Show empty state if no data
  if (displayData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={resolvedClassName}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,209,197,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_28%)]" />

        <div className="relative z-10 mb-4">
          <h3 className="text-lg font-semibold tracking-[0.2em] text-white/95">{title}</h3>
          <p className="mt-1 text-sm text-slate-200/75">{subtitle}</p>
        </div>

        <div className="relative z-10 flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="mb-3 text-4xl opacity-50">📊</div>
            <p className="text-slate-300">Submit feedback to analyze industries</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={resolvedClassName}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,209,197,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_28%)]" />

      <div className="relative z-10 mb-4">
        <h3 className="text-lg font-semibold tracking-[0.2em] text-white/95">{title}</h3>
        <p className="mt-1 text-sm text-slate-200/75">{subtitle}</p>
      </div>

      <div className="h-[400px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Simplified - no complex defs/gradients temporarily */}
            <Pie
              data={displayData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={40}
              fill="#8884d8"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1}
              isAnimationActive={false} // Disable animation for stability
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {displayData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={PALETTE[index % PALETTE.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="relative z-10 mt-4 grid gap-3 sm:grid-cols-2">
        {displayData.map((item, index) => (
          <button
            key={`${item.name}-${index}`}
            type="button"
            onClick={() => onSliceClick?.({ name: item.name, value: item.value }, index)}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-slate-100/90 transition hover:bg-white/10"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </span>
            <span className="font-semibold text-white">{getValueLabel(item.value)}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

export default memo(IndustryPieChart)
