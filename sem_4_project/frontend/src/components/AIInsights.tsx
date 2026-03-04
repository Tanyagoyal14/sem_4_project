function AIInsights() {
  return (
    <div className="bg-white/30 backdrop-blur-xl p-6 rounded-xl shadow-lg">
      <h2 className="text-white font-semibold mb-4">
        AI Insights
      </h2>

      <p className="text-white mb-2">
        Main complaint detected: <b>Delivery Delay</b>
      </p>

      <p className="text-white mb-2">
        Frequent keywords: delivery, late, refund
      </p>

      <p className="text-white">
        Suggested action: Improve delivery tracking system.
      </p>
    </div>
  );
}

export default AIInsights;