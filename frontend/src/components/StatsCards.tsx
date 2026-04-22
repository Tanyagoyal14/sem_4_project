import { motion } from "framer-motion"

type StatsCardsProps = {
  total: number
  positive: number
  negative: number
  csat: number
}

function StatsCards({ total, positive, negative, csat }: StatsCardsProps) {
  const stats = [
    { title: "Total Feedback", value: total, icon: "📊" },
    { title: "Positive", value: positive, icon: "😊" },
    { title: "Negative", value: negative, icon: "😡" },
    { title: "CSAT Score", value: `${csat}%`, icon: "⭐" }
  ]

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
          whileHover={{ scale: 1.05 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-white/10 dark:bg-[#12121a]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-gray-400">
                {stat.title}
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </h2>
            </div>

            <div className="text-3xl">{stat.icon}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default StatsCards
