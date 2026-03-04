import { useState } from "react";

import StatsCards from "../components/StatsCards";
import IndustryPieChart from "../components/IndustryPieChart";
import LiveFeed from "../components/LiveFeed";
import useFeedbackStream from "../hooks/useFeedbackStream";

function Dashboard(){

  const {stream,addFeedback}=useFeedbackStream()

  const [feedback,setFeedback]=useState("")
  const [industryData,setIndustryData]=useState<any[]>([])

  const analyze=async()=>{

    const res=await fetch("http://localhost:8002/analyze-feedback",{

      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({feedback})

    })

    const data=await res.json()

    addFeedback(feedback,data.sentiment)

    setIndustryData(data.top_industries)

    setFeedback("")

  }

  return(

    <div>

      <h1 className="text-4xl text-white mb-6">
        AI Feedback Dashboard
      </h1>

      <StatsCards/>

      <div className="bg-white/30 backdrop-blur-xl p-6 rounded-xl mt-8">

        <textarea
          className="w-full p-3 rounded-lg"
          placeholder="Example: Delivery was late and the app crashed"
          value={feedback}
          onChange={(e)=>setFeedback(e.target.value)}
        />

        <button
          onClick={analyze}
          className="mt-4 bg-pink-500 px-6 py-2 rounded-lg text-white"
        >
          Analyze Feedback
        </button>

      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">

        <IndustryPieChart data={industryData}/>

        <LiveFeed stream={stream}/>

      </div>

    </div>

  )

}

export default Dashboard