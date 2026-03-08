import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import FeatureCarousel from "../components/FeatureCarousel"
import bgVideo from "../assets/video/feedback-bg.mp4"

function Landing(){

  const [showContent,setShowContent] = useState(false)

  useEffect(()=>{

    const timer = setTimeout(()=>{
      setShowContent(true)
    },5000)

    return ()=>clearTimeout(timer)

  },[])

  return(

    <div className="relative min-h-screen text-white flex flex-col items-center justify-center px-6 overflow-hidden">

      {/* VIDEO BACKGROUND */}

      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-contain bg-black -z-20"
      >
        <source src={bgVideo} type="video/mp4"/>
      </video>

      {/* OVERLAY */}

      <div className="absolute inset-0 bg-black/50 -z-10"></div>


      {/* HERO CONTENT */}

      <div
        className={`text-center max-w-3xl pt-50 transition-opacity duration-1000 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >

        <h1 className="text-6xl font-bold mb-6">
          AI Feedback Intelligence
        </h1>

        <p className="text-lg text-gray-200 mb-8">
          Transform customer feedback into actionable insights using
          NLP and Generative AI.
        </p>

        <Link
          to="/app/dashboard"
          className="bg-pink-500 hover:bg-pink-600 px-8 py-3 rounded-xl text-lg font-semibold shadow-lg"
        >
          Launch Dashboard
        </Link>

      </div>


      {/* CAROUSEL */}

      {showContent && (

        <div className="w-full max-w-3xl mt-20">

          <FeatureCarousel/>

        </div>

      )}

    </div>

  )

}

export default Landing