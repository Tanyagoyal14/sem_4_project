import { useState } from "react";
import IndustryChart from "../components/IndustryChart";
import LoadingSpinner from "../components/LoadingSpinner";

function Home() {
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!feedback.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8002/analyze-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      alert("Backend not reachable");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-10">

      <div className="max-w-5xl mx-auto space-y-8">

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center">
          AI Feedback Intelligence Dashboard
        </h1>

        {/* Feedback Input Card */}
        <div className="bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition rounded-2xl p-6 border">

          <h2 className="text-xl font-semibold mb-4">
            Enter Customer Feedback
          </h2>

          <textarea
            className="w-full border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Example: The app crashes during payment..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />

          <button
            onClick={analyze}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Analyze Feedback
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && <LoadingSpinner />}

        {/* Results */}
        {result && !loading && (
          <>
            {/* Sentiment Card */}
            <div className="bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition rounded-2xl p-6 border">

              <h2 className="text-xl font-semibold mb-2">
                Sentiment Analysis
              </h2>

              <p className="text-lg">
                Sentiment:
                <span
                  className={`ml-2 font-bold ${
                    result.sentiment === "POSITIVE"
                      ? "text-green-600"
                      : result.sentiment === "NEGATIVE"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {result.sentiment}
                </span>
              </p>

              <p className="text-sm text-gray-600">
                Confidence: {result.sentiment_confidence}
              </p>
            </div>

            {/* Industry Confidence Chart */}
            <div className="bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition rounded-2xl p-6 border">

              <h2 className="text-xl font-semibold mb-4">
                Industry Confidence
              </h2>

              <IndustryChart data={result.top_industries} />
            </div>

            {/* Recommendations */}
            <div className="bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition rounded-2xl p-6 border">

              <h2 className="text-xl font-semibold mb-4">
                AI Recommendations
              </h2>

              <div className="space-y-3">
                {result.recommendations.map((rec: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg border"
                  >
                    <p className="font-medium">{rec.industry}</p>
                    <p className="text-sm text-gray-600">
                      {rec.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Explanation */}
            <div className="bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition rounded-2xl p-6 border">

              <h2 className="text-xl font-semibold mb-2">
                AI Explanation
              </h2>

              <p className="text-gray-700">
                The model detected keywords in the feedback that relate
                strongly to the predicted industries. Sentiment analysis
                was performed using a transformer-based BERT model,
                while industry classification uses zero-shot learning
                with BART.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;