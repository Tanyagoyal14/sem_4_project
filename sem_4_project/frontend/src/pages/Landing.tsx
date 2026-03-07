import { Link } from "react-router-dom"
import { motion } from "framer-motion"

function Landing(){

  return(

    <motion.div
      initial={{ opacity:0 }}
      animate={{ opacity:1 }}
      exit={{ opacity:0 }}
      transition={{ duration:0.7 }}
      className="relative min-h-screen flex items-center justify-center text-white"
    >

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-cover"
      >
        <source src="/feedback-bg.mp4" type="video/mp4"/>
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 text-center">

        <h1 className="text-6xl font-bold mb-6">
          AI Feedback Intelligence
        </h1>

        <p className="text-lg mb-10 max-w-xl mx-auto">
          Transform customer feedback into actionable insights using
          NLP and Generative AI.
        </p>

        <Link
          to="/app/dashboard"
          className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-xl text-lg shadow-lg"
        >
          Launch Dashboard
        </Link>

      </div>

    </motion.div>

  )

}

export default Landing