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

      <div className="space-y-6 rounded-[20px] border border-white/10 bg-[#0b1720]/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
        {reports.map((report, index) => (
          <motion.div
            key={report.title}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-white/8"
          >
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-white/55">
                REPORT
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">{report.title}</h3>
              <p className="mt-1 text-sm text-slate-300/75">{report.desc}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => downloadReport(report.format)}
              className="rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-sky-500 px-5 py-2 text-white shadow-[0_10px_25px_rgba(34,197,94,0.28)] transition hover:shadow-[0_14px_30px_rgba(34,197,94,0.36)]"
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
