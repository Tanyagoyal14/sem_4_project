import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

import FeatureCarousel from "../components/FeatureCarousel"
import bgVideo from "../assets/video/feedback-bg.mp4"

function Landing(){

  const [showContent, setShowContent] = useState(false)

  useEffect(() => {

    const timer = setTimeout(() => {
      setShowContent(true)
    }, 5000)

    return () => clearTimeout(timer)

  }, [])

  return (

    <div className="relative min-h-screen text-white flex flex-col items-center justify-center px-6 overflow-hidden">

      {/* 🎥 VIDEO BACKGROUND */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-contain bg-black -z-20"
      >
        <source src={bgVideo} type="video/mp4"/>
      </video>

      {/* 🌑 OVERLAY */}
      <div className="absolute inset-0 bg-black/50 -z-10"></div>

      {/* 🔘 SKIP BUTTON (JUST SKIPS ANIMATION) */}
      {!showContent && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={() => setShowContent(true)}
          className="absolute top-6 right-6 z-50 px-4 py-2 rounded-lg 
                     bg-black/60 backdrop-blur text-white text-sm 
                     border border-gray-600 hover:bg-black/80 transition"
        >
          Skip →
        </motion.button>
      )}

      {/* 🚀 HERO CONTENT */}
      <div
  className={`relative text-center max-w-3xl pt-50 transition-opacity duration-1000 ${
    showContent ? "opacity-100" : "opacity-0"
  }`}
>

  {/* 🔥 Glass Blur Background */}
  <div className="absolute inset-0 bg-black/40 backdrop-blur-md rounded-2xl -z-10"></div>

  <div className="px-6 py-8">

    {/* 🧠 BRAND */}
    <h1 className="text-7xl md:text-8xl font-extrabold mb-6 tracking-widest 
                   bg-gradient-to-r from-purple-400 to-pink-500 
                   text-transparent bg-clip-text drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">
      SENTILYTICS
    </h1>

    {/* ✨ TAGLINE */}
    <p className="text-2xl md:text-3xl text-purple-300 font-semibold mb-6">
      Turn Feedback into Intelligence
    </p>

    {/* 📄 DESCRIPTION */}
    <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed">
      Transform customer feedback into actionable insights using
      NLP and Generative AI.
    </p>

    {/* 💎 PREMIUM BUTTON */}
    <Link
      to="/app/dashboard"
      className="relative inline-block px-10 py-4 text-lg font-semibold rounded-xl 
                 bg-gradient-to-r from-pink-500 to-purple-600 
                 shadow-lg shadow-purple-500/30
                 hover:shadow-pink-500/40 hover:scale-105
                 transition-all duration-300"
    >
      <span className="relative z-10">Launch Dashboard</span>

      {/* Glow layer */}
      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 opacity-30 blur-xl"></span>
    </Link>

  </div>

</div>

      {/* 🎠 CAROUSEL */}
      {showContent && (
        <div className="w-full max-w-3xl mt-20">
          <FeatureCarousel/>
        </div>
      )}

    </div>
  )
}

export default Landing