import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import CountUp from "react-countup"

interface FeedbackItem {
  text: string
  sentiment: string
}

interface Props {
  stream: FeedbackItem[]
}

function TrendDetector({ stream }: Props) {

  const [trends, setTrends] = useState<{ word: string, count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  // 🔥 STOPWORDS (important upgrade)
  const stopWords = [
    "the","is","and","was","are","for","with","this","that",
    "have","had","very","but","not","you","your","from","they",
    "app","very","just","like","there","here"
  ]

  useEffect(() => {

    // --------------------------
    // Loading animation
    // --------------------------

    let value = 0

    const loader = setInterval(() => {

      value += Math.floor(Math.random() * 10) + 5

      if (value >= 100) {
        value = 100
        clearInterval(loader)
        setLoading(false)

        generateTrends()
      }

      setProgress(value)

    }, 150)

    // --------------------------
    // Trend Logic
    // --------------------------

    const generateTrends = () => {

      const wordCount: Record<string, number> = {}

      stream.forEach(item => {

        const words = item.text
          .toLowerCase()
          .replace(/[^\w\s]/g, "") // remove punctuation
          .split(" ")

        words.forEach(word => {

          if (word.length < 4) return
          if (stopWords.includes(word)) return

          wordCount[word] = (wordCount[word] || 0) + 1

        })

      })

      const sorted = Object.entries(wordCount)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)

      setTrends(sorted)
    }

    return () => clearInterval(loader)

  }, [stream])

  return (

    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative bg-[#12121a] border border-purple-500 rounded-xl p-6 mt-8 overflow-hidden"
    >

      {/* 🔥 Glow Effect */}
      <div className="absolute inset-0 bg-purple-500/10 blur-3xl animate-pulse" />

      <h2 className="text-lg font-semibold mb-4 text-purple-400">
        AI Trend Detector 🔥
      </h2>

      {/* ---------------- LOADING ---------------- */}

      {loading && (

        <div className="text-center">

          <p className="text-gray-400 mb-2">
            Detecting trends from feedback...
          </p>

          <div className="text-3xl font-bold text-purple-400">

            <CountUp end={progress} duration={0.5} />%

          </div>

          {/* Progress Bar */}

          <div className="mt-4 w-full h-2 bg-black rounded-full overflow-hidden">

            <motion.div
              className="h-full bg-purple-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />

          </div>

        </div>

      )}

      {/* ---------------- RESULTS ---------------- */}

      {!loading && (

        <div className="flex flex-wrap gap-3">

          {trends.length === 0 && (
            <p className="text-gray-400">
              Not enough data yet
            </p>
          )}

          {trends.map((t, i) => (

            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.15 }}
              className="bg-purple-600 px-3 py-1 rounded-full text-sm cursor-pointer shadow-lg"
            >
              🔥 {t.word} ({t.count})
            </motion.span>

          ))}

        </div>

      )}

    </motion.div>

  )
}

export default TrendDetector