import IndustryPieChart from "../components/IndustryPieChart";
import SentimentChart from "../components/SentimentChart";

function Analytics() {

  const sampleIndustryData = [
    { industry: "E-commerce", confidence: 0.72 },
    { industry: "Technology", confidence: 0.18 },
    { industry: "Retail", confidence: 0.10 }
  ];

  return (

    <div className="p-8 text-white">

      <h1 className="text-3xl font-bold mb-6">
        Analytics Dashboard
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">

        <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6">

          <h2 className="text-lg font-semibold mb-4">
            Industry Distribution
          </h2>

          <IndustryPieChart data={sampleIndustryData} />

        </div>

        <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6">

          <h2 className="text-lg font-semibold mb-4">
            Sentiment Analysis
          </h2>

          <SentimentChart />

        </div>

      </div>

    </div>

  );

}

export default Analytics;