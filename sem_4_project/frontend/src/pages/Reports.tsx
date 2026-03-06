function Reports() {

  return (

    <div className="p-8 text-white">

      <h1 className="text-3xl font-bold mb-6">
        AI Reports
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6">

          <h2 className="font-semibold mb-3">
            Weekly Sentiment Report
          </h2>

          <button className="bg-pink-500 px-4 py-2 rounded-lg">
            Download PDF
          </button>

        </div>

        <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6">

          <h2 className="font-semibold mb-3">
            Industry Insights
          </h2>

          <button className="bg-pink-500 px-4 py-2 rounded-lg">
            Download CSV
          </button>

        </div>

        <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6">

          <h2 className="font-semibold mb-3">
            Feedback Trends
          </h2>

          <button className="bg-pink-500 px-4 py-2 rounded-lg">
            Download Report
          </button>

        </div>

      </div>

    </div>

  );

}

export default Reports;