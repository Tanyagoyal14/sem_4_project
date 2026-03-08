import { useState, useEffect } from "react"

import dashboard from "../assets/carousel/dashboard.jpg"
import analytics from "../assets/carousel/analytics.jpg"
import history from "../assets/carousel/history.png"
import reports from "../assets/carousel/reports.jpg"
import settings from "../assets/carousel/settings.jpg"

const slides = [

  {
    title: "AI Dashboard",
    description: "Monitor real-time feedback insights powered by AI.",
    image: dashboard
  },

  {
    title: "Analytics",
    description: "Understand sentiment trends and CSAT scores visually.",
    image: analytics
  },

  {
    title: "Feedback History",
    description: "Track every customer feedback and its AI analysis.",
    image: history
  },

  {
    title: "AI Reports",
    description: "Generate automated feedback intelligence reports.",
    image: reports
  },

  {
    title: "Settings",
    description: "Customize notifications, AI behavior and preferences.",
    image: settings
  }

]

function FeatureCarousel(){

  const [index,setIndex] = useState(0)

  useEffect(()=>{

    const interval = setInterval(()=>{

      setIndex((prev)=>(prev+1)%slides.length)

    },4000)

    return ()=>clearInterval(interval)

  },[])

  const slide = slides[index]

  return(

    <div className="relative w-full max-w-5xl mx-auto mt-16">

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-xl max-w-xl mx-auto">

        <img
          src={slide.image}
          className="w-full h-[260px] object-cover rounded-lg"
        />

        <div className="p-6 text-center">

          <h2 className="text-2xl font-bold text-white">
            {slide.title}
          </h2>

          <p className="text-gray-300 mt-2">
            {slide.description}
          </p>

        </div>

      </div>


      {/* Indicators */}

      <div className="flex justify-center gap-3 mt-4">

        {slides.map((_,i)=>(

          <button
            key={i}
            onClick={()=>setIndex(i)}
            className={`w-3 h-3 rounded-full ${
              i===index ? "bg-pink-500" : "bg-gray-500"
            }`}
          />

        ))}

      </div>

    </div>

  )

}

export default FeatureCarousel