import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

const COLORS = ["#6366f1", "#ec4899", "#22c55e", "#f59e0b"]

function IndustryPieChart({ data }: any) {

  const navigate = useNavigate()

  if (!data || data.length === 0) return null

  return (

    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6 cursor-pointer"
    >

      <h3 className="text-white text-lg font-semibold mb-4">
        Industry Prediction
      </h3>

      <ResponsiveContainer width="100%" height={320}>

        <PieChart>

          <Pie
            data={data}
            dataKey="confidence"
            nameKey="industry"
            outerRadius={110}
            label
            animationDuration={900}
            onClick={(entry: any) => {
              navigate("/app/analytics", {
                state: { selectedIndustry: entry.industry }
              })
            }}
          >

            {data.map((_: any, index: number) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}

          </Pie>

          <Tooltip />
          <Legend />

        </PieChart>

      </ResponsiveContainer>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Click a section to view analytics →
      </p>

    </motion.div>

  )
}

export default IndustryPieChart
