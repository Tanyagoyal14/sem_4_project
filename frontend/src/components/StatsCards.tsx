import { motion } from "framer-motion"

function StatsCards({ csat }: any) {

  const stats = [
    {
      title: "Total Feedback",
      value: 128,
      icon: "📊"
    },
    {
      title: "Positive",
      value: 85,
      icon: "😊"
    },
    {
      title: "Negative",
      value: 32,
      icon: "😡"
    },
    {
      title: "CSAT Score",
      value: `${csat}%`,
      icon: "⭐"
    }
  ]

  return (

    <div className="grid md:grid-cols-4 gap-6 mt-6">

      {stats.map((s, i) => (

        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2 }}
          whileHover={{ scale: 1.05 }}
          className="bg-[#12121a] border border-white/10 rounded-xl p-6 shadow-lg"
        >

          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-400 text-sm">
                {s.title}
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {s.value}
              </h2>
            </div>

            {/* Icon */}
            <div className="text-3xl">
              {s.icon}
            </div>

          </div>

        </motion.div>

      ))}

    </div>

  )
}

export default StatsCards