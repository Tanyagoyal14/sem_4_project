import { useState } from "react"
import Topbar from "../components/Topbar"
import StatsCards from "../components/StatsCards"
import IndustryPieChart from "../components/IndustryPieChart"
import LiveFeed from "../components/LiveFeed"
import AIInsights from "../components/AIInsights"

import useFeedbackStream from "../hooks/useFeedbackStream"

function Dashboard() {

  const { stream, addFeedback } = useFeedbackStream()

  const [feedback, setFeedback] = useState("")
  const [industryData, setIndustryData] = useState<any[]>([])
  const [sentiment, setSentiment] = useState("")
  const [feedbackType, setFeedbackType] = useState("")
  const [csat, setCsat] = useState(0)
  const [recommendations, setRecommendations] = useState<any[]>([])

  const analyze = async () => {

    if (!feedback) return

    const res = await fetch("http://localhost:8002/analyze-feedback", {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback })

    })

    const data = await res.json()

    addFeedback(feedback, data.sentiment)

    setIndustryData(data.top_industries || [])
    setSentiment(data.sentiment)
    setFeedbackType(data.feedback_type)
    setRecommendations(data.recommendations || [])
    setCsat(data.csat_score)

    setFeedback("")
  }

  return (

    <div className="p-8 text-gray-200 min-h-screen bg-[#0b0b0f]">

      <Topbar />

      <StatsCards csat={csat} />

      {/* Feedback Input */}

      <div className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6 mt-8">

        <textarea
          className="w-full p-4 rounded-xl bg-black border border-[#1f1f2e]"
          placeholder="Example: Delivery bahut late tha aur app crash ho gaya"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />

        <button
          onClick={analyze}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl"
        >
          Analyze Feedback
        </button>

      </div>

      {/* Analysis Result */}

      <div className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6 mt-6">

        <h2 className="text-lg font-semibold mb-4">
          Analysis Result
        </h2>

        <p>
          Sentiment:
          <span className="ml-2 font-bold text-purple-400">
            {sentiment}
          </span>
        </p>

        <p>
          Feedback Type:
          <span className="ml-2 font-bold text-purple-400">
            {feedbackType}
          </span>
        </p>

        <p>
          CSAT Score:
          <span className="ml-2 font-bold text-purple-400">
            {csat}%
          </span>
        </p>

      </div>

      {/* Charts */}

      <div className="grid lg:grid-cols-2 gap-6 mt-8">

        <IndustryPieChart data={industryData} />

        <LiveFeed stream={stream} />

      </div>

      {/* AI Recommendations */}

      <div className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6 mt-8">

        <h2 className="text-lg font-semibold mb-4">
          AI Recommendations
        </h2>

        {recommendations.map((r, i) => (

          <div key={i} className="mb-3">

            <p className="text-purple-400 font-semibold">
              {r.industry}
            </p>

            <p className="text-gray-300">
              {r.recommendation}
            </p>

          </div>

        ))}

      </div>

      <div className="mt-8">

        <AIInsights />

      </div>

    </div>

  )

}

export default Dashboard