import { useState } from "react"
import { motion } from "framer-motion"

import Topbar from "../components/Topbar"
import StatsCards from "../components/StatsCards"
import IndustryPieChart from "../components/IndustryPieChart"
import LiveFeed from "../components/LiveFeed"
import AIInsights from "../components/AIInsights"
import SentimentHeatmap from "../components/SentimentHeatmap"
import TrendDetector from "../components/TrendDetector"
import NeuralBackground from "../components/NeuralBackground"

import useFeedbackStream from "../hooks/useFeedbackStream"

function Dashboard(){

  const {stream, addFeedback} = useFeedbackStream()

  const [feedback,setFeedback] = useState("")
  const [industryData,setIndustryData] = useState<any[]>([])

  const analyze = async()=>{

    if(!feedback) return

    const res = await fetch("http://localhost:8002/analyze-feedback",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({feedback})
    })

    const data = await res.json()

    addFeedback(feedback,data.sentiment)

    setIndustryData(data.top_industries || [])

    setFeedback("")
  }

  return(

    <motion.div
      initial={{ opacity:0, y:40 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, y:-40 }}
      transition={{ duration:0.6 }}
      className="min-h-screen bg-[#0b0b0f] text-gray-200 relative p-8"
    >

      <NeuralBackground/>

      <div className="relative z-10 max-w-7xl mx-auto">

        <Topbar/>

        <div className="mt-6">
          <StatsCards/>
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">

          <div className="xl:col-span-2 bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6">

            <h2 className="text-xl font-semibold mb-4">
              Analyze Customer Feedback
            </h2>

            <textarea
              className="w-full p-4 rounded-lg bg-black border border-[#1f1f2e]"
              placeholder="Example: Delivery was late"
              value={feedback}
              onChange={(e)=>setFeedback(e.target.value)}
            />

            <button
              onClick={analyze}
              className="mt-4 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg"
            >
              Analyze
            </button>

          </div>

          <div className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6">

            <LiveFeed stream={stream}/>

          </div>

        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">

          <IndustryPieChart data={industryData}/>

          <SentimentHeatmap stream={stream}/>

        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">

          <TrendDetector stream={stream}/>

          <AIInsights/>

        </div>

      </div>

    </motion.div>

  )

}

export default Dashboard