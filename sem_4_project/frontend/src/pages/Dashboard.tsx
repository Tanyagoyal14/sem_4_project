import { useState } from "react";

import Topbar from "../components/Topbar";
import StatsCards from "../components/StatsCards";
import IndustryPieChart from "../components/IndustryPieChart";
import LiveFeed from "../components/LiveFeed";
import AIInsights from "../components/AIInsights";

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

    <div>

      <Topbar/>

      <StatsCards/>

      {/* Feedback Input */}

      <div className="bg-white/25 backdrop-blur-xl border border-white/30 rounded-2xl p-6 mt-8">

        <textarea
          className="w-full p-4 rounded-xl"
          placeholder="Example: Delivery was late and the app crashed"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />

        <button
          onClick={analyze}
          className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-xl"
        >
          Analyze Feedback
        </button>

      </div>

      {/* Charts */}

      <div className="grid lg:grid-cols-2 gap-6 mt-8">

        <IndustryPieChart data={industryData}/>

        <LiveFeed stream={stream}/>

      </div>

      {/* AI Insights */}

      <div className="mt-8">

        <AIInsights/>

      </div>

    </div>

  );

}

export default Dashboard;