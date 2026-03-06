import { Link } from "react-router-dom"
import AIFeedbackBackground from "../components/AIFeedbackBackground"

function Landing(){

  return(

    <div className="relative min-h-screen flex flex-col items-center justify-center text-white text-center px-6">

      <AIFeedbackBackground/>

      <h1 className="text-6xl font-bold mb-6">
        AI Feedback Intelligence
      </h1>

      <p className="text-lg max-w-2xl mb-10">
        Transform customer feedback into actionable insights using NLP and Generative AI.
      </p>

      <Link
        to="/app/dashboard"
        className="bg-pink-500 hover:bg-pink-600 px-8 py-3 rounded-xl text-lg font-semibold"
      >
        Launch Dashboard
      </Link>

    </div>

  )

}

export default Landing