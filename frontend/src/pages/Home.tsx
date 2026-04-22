import { useState } from "react";
import { useNavigate } from "react-router-dom";
import IndustryPieChart from "../components/IndustryPieChart";
import SentimentBadge from "../components/SentimentBadge";

function Home(){

  const navigate = useNavigate()
  const [feedback,setFeedback]=useState("")
  const [result,setResult]=useState<any>(null)
  const [live,setLive]=useState<any[]>([])

  const analyze=async()=>{

    if(!feedback) return

    const res=await fetch("http://localhost:8002/analyze-feedback",{

      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({feedback})

    })

    const data=await res.json()

    setResult(data)

    setLive(prev=>[
      {text:feedback,sentiment:data.sentiment},
      ...prev
    ])

    setFeedback("")
  }

  return(

    <div>

      <h1 className="text-4xl font-bold text-white mb-8">
        Live AI Feedback Dashboard
      </h1>

      {/* feedback input */}

      <div className="bg-white/30 backdrop-blur-xl p-6 rounded-xl shadow-lg mb-8">

        <textarea
          className="w-full p-4 rounded-lg border"
          rows={3}
          placeholder="Example: The delivery was late 😡 and the app keeps crashing during payment"
          value={feedback}
          onChange={(e)=>setFeedback(e.target.value)}
        />

        <button
          onClick={analyze}
          className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg"
        >
          Analyze Feedback
        </button>

      </div>

      {/* result */}

      {result && (

        <div className="grid md:grid-cols-2 gap-6 mb-8">

          <div className="bg-white/30 backdrop-blur-xl p-6 rounded-xl shadow-lg">

            <h2 className="font-semibold mb-3 text-white">
              Sentiment
            </h2>

            <SentimentBadge sentiment={result.sentiment}/>

            <p className="text-white text-sm mt-2">
              Confidence: {result.sentiment_confidence}
            </p>

          </div>

          <div className="bg-white/30 backdrop-blur-xl p-6 rounded-xl shadow-lg">

            <h2 className="font-semibold mb-3 text-white">
              Industry Detection
            </h2>

            <IndustryPieChart
              data={result.top_industries}
              onSliceClick={(entry) => {
                navigate("/app/analytics", {
                  state: { selectedIndustry: entry.name }
                })
              }}
            />

          </div>

        </div>

      )}

      {/* live stream */}

      <div className="bg-white/30 backdrop-blur-xl p-6 rounded-xl shadow-lg">

        <h2 className="text-white font-semibold mb-4">
          Live Feedback Stream
        </h2>

        <div className="space-y-3 max-h-60 overflow-y-auto">

          {live.map((item,index)=>(
            <div
              key={index}
              className="bg-white p-3 rounded-lg flex justify-between"
            >

              <span>{item.text}</span>

              <SentimentBadge sentiment={item.sentiment}/>

            </div>
          ))}

        </div>

      </div>

    </div>

  )

}

export default Home
