import { useState } from "react";
import IndustryChart from "../components/IndustryChart";

function Analytics() {

  const exampleData = [
    { industry: "E-commerce", confidence: 0.85 },
    { industry: "Food Delivery", confidence: 0.75 },
    { industry: "Technology", confidence: 0.60 },
  ];

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold">
        Analytics Dashboard
      </h1>

      {/* Chart Card */}
      <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-6 border">

        <h2 className="text-xl font-semibold mb-4">
          Industry Prediction Distribution
        </h2>

        <IndustryChart data={exampleData} />

      </div>

      {/* Sentiment Statistics */}
      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-6 border text-center">
          <h3 className="text-lg font-semibold">Positive</h3>
          <p className="text-3xl text-green-600 font-bold">45</p>
        </div>

        <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-6 border text-center">
          <h3 className="text-lg font-semibold">Neutral</h3>
          <p className="text-3xl text-yellow-600 font-bold">20</p>
        </div>

        <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-6 border text-center">
          <h3 className="text-lg font-semibold">Negative</h3>
          <p className="text-3xl text-red-600 font-bold">15</p>
        </div>

      </div>

    </div>
  );
}

export default Analytics;