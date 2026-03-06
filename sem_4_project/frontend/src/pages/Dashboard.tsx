import { useState } from "react";

import Topbar from "../components/Topbar";
import StatsCards from "../components/StatsCards";
import IndustryPieChart from "../components/IndustryPieChart";
import LiveFeed from "../components/LiveFeed";
import AIInsights from "../components/AIInsights";
import AIFeedbackBackground from "../components/AIFeedbackBackground";

import useFeedbackStream from "../hooks/useFeedbackStream";

function Dashboard() {

  const { stream, addFeedback } = useFeedbackStream();

  const [feedback, setFeedback] = useState("");
  const [industryData, setIndustryData] = useState([]);

  const analyze = async () => {

    if (!feedback) return;

    const res = await fetch("http://localhost:8002/analyze-feedback", {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback })

    });

    const data = await res.json();

    addFeedback(feedback, data.sentiment);

    setIndustryData(data.top_industries);

    setFeedback("");

  };

  return (

    <div className="relative min-h-screen text-white">

      {/* AI Background */}
      <AIFeedbackBackground/>

      {/* Main UI */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">

        <Topbar/>

        {/* Stats Cards */}
        <div className="mt-6">
          <StatsCards/>
        </div>

        {/* Feedback Input */}
        <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 mt-8 shadow-lg">

          <h2 className="text-xl font-semibold mb-3">
            Analyze Customer Feedback
          </h2>

          <textarea
            className="w-full p-4 rounded-xl text-black"
            placeholder="Example: Delivery was late and the app crashed"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />

          <button
            onClick={analyze}
            className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-xl transition"
          >
            Analyze Feedback
          </button>

        </div>

        {/* Charts + Live Feed */}
        <div className="grid lg:grid-cols-2 gap-6 mt-8">

          <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Industry Prediction</h3>
            <IndustryPieChart data={industryData}/>
          </div>

          <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Live Feedback Stream</h3>
            <LiveFeed stream={stream}/>
          </div>

        </div>

        {/* AI Insights */}
        <div className="mt-8 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6">

          <h3 className="text-lg font-semibold mb-4">
            AI Insights
          </h3>

          <AIInsights/>

        </div>

      </div>

    </div>

  );

}

export default Dashboard;