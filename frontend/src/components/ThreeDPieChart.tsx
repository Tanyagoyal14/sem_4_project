import { useMemo, useState } from "react"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

type ThreeDPieChartProps = {
  data: any[]
  dataKey: string
  nameKey: string
  colors: string[]
  height?: number
  outerRadius?: number
  innerRadius?: number
  cx?: string | number
  cy?: string | number
  onSliceClick?: (entry: any, index: number) => void
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const darken = (hex: string, amount = 0.28) => {
  const value = hex.replace("#", "")
  if (value.length !== 6) return hex

  const num = parseInt(value, 16)
  const r = Math.max(0, Math.floor(((num >> 16) & 255) * (1 - amount)))
  const g = Math.max(0, Math.floor(((num >> 8) & 255) * (1 - amount)))
  const b = Math.max(0, Math.floor((num & 255) * (1 - amount)))

  return `rgb(${r}, ${g}, ${b})`
}

const lighten = (hex: string, amount = 0.22) => {
  const value = hex.replace("#", "")
  if (value.length !== 6) return hex

  const num = parseInt(value, 16)
  const r = Math.floor(((num >> 16) & 255) + (255 - ((num >> 16) & 255)) * amount)
  const g = Math.floor(((num >> 8) & 255) + (255 - ((num >> 8) & 255)) * amount)
  const b = Math.floor((num & 255) + (255 - (num & 255)) * amount)

  return `rgb(${r}, ${g}, ${b})`
}

function ThreeDPieChart({
  data,
  dataKey,
  nameKey,
  colors,
  height = 300,
  outerRadius = 110,
  innerRadius,
  cx = "50%",
  cy = "50%",
  onSliceClick
}: ThreeDPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const total = useMemo(
    () => data.reduce((sum, item) => sum + Number(item?.[dataKey] || 0), 0),
    [data, dataKey]
  )

  const resolvedInnerRadius = innerRadius ?? clamp(outerRadius - 40, 24, outerRadius - 10)

  const handleEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const handleLeave = () => {
    setActiveIndex(null)
  }

  const renderPercentLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value } = props
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.58
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    const percent = total > 0 ? (Number(value) / total) * 100 : 0

    if (percent < 3) return null

    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        style={{
          filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.55))"
        }}
      >
        {`${percent.toFixed(0)}%`}
      </text>
    )
  }

  const gradientStops = (color: string) => ({
    top: lighten(color, 0.28),
    mid: color,
    bottom: darken(color, 0.34)
  })

  return (
    <div
      style={{
        transform: "perspective(800px) rotateX(25deg)",
        transformStyle: "preserve-3d",
        filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.5))"
      }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <defs>
            <filter id="pieGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.45" />
            </filter>

            {colors.map((color, index) => {
              const stops = gradientStops(color)
              return (
                <linearGradient
                  key={`gradient-${color}-${index}`}
                  id={`pie-gradient-${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={stops.top} stopOpacity={1} />
                  <stop offset="48%" stopColor={stops.mid} stopOpacity={1} />
                  <stop offset="100%" stopColor={stops.bottom} stopOpacity={1} />
                </linearGradient>
              )
            })}
          </defs>

          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx={cx}
            cy={Number(String(cy).replace("%", "")) + 10}
            innerRadius={resolvedInnerRadius}
            outerRadius={outerRadius}
            startAngle={210}
            endAngle={-30}
            stroke="none"
            fill="#000000"
            isAnimationActive={false}
          >
            {data.map((_, index) => (
              <Cell
                key={`base-${index}`}
                fill={darken(colors[index % colors.length], 0.58)}
                opacity={0.95}
              />
            ))}
          </Pie>

          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx={cx}
            cy={cy}
            innerRadius={resolvedInnerRadius}
            outerRadius={outerRadius}
            startAngle={210}
            endAngle={-30}
            stroke="#ffffff"
            strokeOpacity={0.18}
            strokeWidth={2}
            filter="url(#pieGlow)"
            label={renderPercentLabel}
            labelLine={false}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onClick={(entry: any, index: number) => onSliceClick?.(entry, index)}
          >
            {data.map((_, index) => {
              const isActive = activeIndex === index
              return (
                <Cell
                  key={`face-${index}`}
                  fill={`url(#pie-gradient-${index})`}
                  stroke={isActive ? "#ffffff" : "rgba(255,255,255,0.14)"}
                  strokeWidth={isActive ? 3 : 1.2}
                  style={{
                    cursor: onSliceClick ? "pointer" : "default",
                    filter: isActive
                      ? "drop-shadow(0px 0px 14px rgba(255,255,255,0.28))"
                      : "none",
                    transition: "filter 180ms ease, stroke-width 180ms ease, opacity 180ms ease"
                  }}
                />
              )
            })}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ThreeDPieChart
