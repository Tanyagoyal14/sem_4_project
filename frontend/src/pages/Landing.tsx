import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

import FeatureCarousel from "../components/FeatureCarousel"
import bgVideo from "../assets/video/feedback-bg.mp4"
import logo from "../assets/logo.png"

function Landing(){

  const [showContent, setShowContent] = useState(false)
  const [displayedText, setDisplayedText] = useState("")

  const fullText = "Turn Feedback into Intelligence"
  const brand = "SENTILYTICS".split("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // ✍️ Typing Effect
  useEffect(() => {
    if (!showContent) return

    let i = 0
    const interval = setInterval(() => {
      setDisplayedText(fullText.slice(0, i + 1))
      i++
      if (i === fullText.length) clearInterval(interval)
    }, 40)

    return () => clearInterval(interval)
  }, [showContent])

  return (

    <div className="relative min-h-screen text-white flex flex-col items-center justify-center px-6 overflow-visible">

      {/* 🎥 VIDEO */}
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

      {/* 🔘 SKIP */}
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

      {/* 🚀 HERO */}
      <div
        className={`relative text-center max-w-3xl pt-2 transition-opacity duration-1000 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >

        {/* 🌫 GLASS */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md rounded-2xl -z-10"></div>

        <div className="px-6 py-8">

          {/* 🔥 LOGO */}
          <motion.img
            src={logo}
            alt="logo"
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={showContent ? { scale: 1, rotate: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="w-20 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]"
          />

          {/* 🔥 BRAND (ROLLING) */}
          <h1
            className="flex justify-center text-7xl md:text-8xl font-extrabold mb-6 tracking-widest"
            style={{ perspective: "1200px" }}
          >
            {brand.map((char, index) => (
              <motion.span
                key={index}
                initial={{ rotateX: 90, y: 60, opacity: 0 }}
                animate={
                  showContent
                    ? { rotateX: 0, y: 0, opacity: 1, scale: [1, 1.15, 1] }
                    : {}
                }
                transition={{
                  delay: 0.4 + index * 0.08,
                  duration: 0.6
                }}
                className="inline-block origin-bottom"
                style={{ transformStyle: "preserve-3d" }}
              >
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]">
                  {char}
                </span>
              </motion.span>
            ))}
          </h1>

          {/* ✍️ TYPING TAGLINE */}
          <p className="text-2xl md:text-3xl text-purple-300 font-semibold mb-6 h-[40px]">
            {displayedText}
            <span className="animate-pulse">|</span>
          </p>

          {/* 📄 DESCRIPTION */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.2 }}
            className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed"
          >
            Transform customer feedback into actionable insights using
            NLP and Generative AI.
          </motion.p>

          {/* 💎 BUTTON */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={showContent ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 1.4 }}
          >
            <Link
              to="/login"
              className="relative inline-block px-10 py-4 text-lg font-semibold rounded-xl 
                         bg-gradient-to-r from-pink-500 to-purple-600 
                         shadow-lg shadow-purple-500/30
                         hover:shadow-pink-500/40 hover:scale-105
                         transition-all duration-300"
            >
              <span className="relative z-10">Launch Dashboard</span>
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 opacity-30 blur-xl"></span>
            </Link>
          </motion.div>

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
