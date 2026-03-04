import { Link } from "react-router-dom";

function Landing() {

  return (

    <div className="min-h-screen flex flex-col items-center justify-center text-white text-center px-6">

      {/* Title */}

      <h1 className="text-6xl font-bold mb-6">
        AI Feedback Intelligence
      </h1>

      {/* Subtitle */}

      <p className="text-lg max-w-2xl mb-10">
        Analyze customer feedback using NLP and Generative AI.
        Detect sentiment, classify industries, and generate
        actionable business insights automatically.
      </p>

      {/* Buttons */}

      <div className="flex gap-6">

        <Link
          to="/app/dashboard"
          className="bg-pink-500 hover:bg-pink-600 transition px-8 py-3 rounded-xl text-lg font-semibold"
        >
          Open Dashboard
        </Link>

        <a
          href="https://github.com"
          className="border border-white/40 hover:bg-white/20 transition px-8 py-3 rounded-xl text-lg"
        >
          View Project
        </a>

      </div>

      {/* Feature Section */}

      <div className="grid md:grid-cols-3 gap-10 mt-20 max-w-5xl">

        <div className="bg-white/20 backdrop-blur-xl rounded-xl p-6">

          <h3 className="text-xl font-semibold mb-2">
            Sentiment Analysis
          </h3>

          <p>
            Automatically detect positive, neutral,
            and negative customer feedback.
          </p>

        </div>

        <div className="bg-white/20 backdrop-blur-xl rounded-xl p-6">

          <h3 className="text-xl font-semibold mb-2">
            Industry Detection
          </h3>

          <p>
            Identify the business domain behind
            customer feedback using AI.
          </p>

        </div>

        <div className="bg-white/20 backdrop-blur-xl rounded-xl p-6">

          <h3 className="text-xl font-semibold mb-2">
            AI Insights
          </h3>

          <p>
            Generate actionable recommendations
            for product improvement.
          </p>

        </div>

      </div>

    </div>

  );

}

export default Landing;