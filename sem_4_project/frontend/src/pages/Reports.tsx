import { motion } from "framer-motion"

function Reports() {

  const reports = [
    {
      title: "Weekly Sentiment Report",
      desc: "Summary of sentiment trends over the past week",
      format: "csv"
    },
    {
      title: "Industry Insights Report",
      desc: "AI analysis of feedback by predicted industry",
      format: "excel"
    },
    {
      title: "Feedback Trend Report",
      desc: "Overview of trending customer feedback topics",
      format: "pdf"
    }
  ]

  return (

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 text-gray-200 min-h-screen bg-[#0b0b0f]"
    >

      <h1 className="text-3xl font-bold mb-8">
        Available Reports
      </h1>

      <div className="bg-[#12121a] border border-white/10 rounded-xl p-6 space-y-6">

        {reports.map((r, i) => (

          <motion.div
            key={i}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex justify-between items-center border-b border-white/10 pb-4 last:border-none"
          >

            {/* LEFT TEXT */}

            <div>
              <h3 className="font-semibold text-lg">
                {r.title}
              </h3>

              <p className="text-sm text-gray-400 mt-1">
                {r.desc}
              </p>
            </div>

            {/* DOWNLOAD BUTTON */}

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                window.open(
                  `http://localhost:8002/download-weekly-report?format=pdf`
                )
              }
              className="bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 rounded-xl shadow-lg hover:shadow-purple-500/50 transition"
            >
              Download
            </motion.button>

          </motion.div>

        ))}

      </div>

    </motion.div>

  )
}

export default Reports