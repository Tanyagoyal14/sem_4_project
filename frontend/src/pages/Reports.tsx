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

  const downloadReport = (format: string) => {
    const url = `http://localhost:8002/download-weekly-report?format=${format}`
    const link = document.createElement("a")
    link.href = url
    link.download = `report.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen p-8 text-slate-900 dark:text-gray-200"
    >
      <h1 className="mb-8 text-3xl font-bold">Available Reports</h1>

      <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#12121a]">
        {reports.map((report, index) => (
          <motion.div
            key={report.title}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="flex items-center justify-between border-b border-slate-200 pb-4 last:border-none dark:border-white/10"
          >
            <div>
              <h3 className="text-lg font-semibold">{report.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{report.desc}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => downloadReport(report.format)}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-white shadow-lg transition hover:shadow-purple-500/50"
            >
              Download {report.format.toUpperCase()}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default Reports
