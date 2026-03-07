function Reports(){

  return(

    <div className="min-h-screen bg-[#0b0b0f] text-gray-200 p-8">

      <h1 className="text-3xl font-bold mb-8">
        Reports
      </h1>


      {/* Report Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6">

          <p className="text-gray-400 mb-2">
            Reports Generated
          </p>

          <h2 className="text-3xl font-bold">
            42
          </h2>

        </div>

        <div className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6">

          <p className="text-gray-400 mb-2">
            Most Common Issue
          </p>

          <h2 className="text-xl font-semibold">
            Delivery Delays
          </h2>

        </div>

        <div className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6">

          <p className="text-gray-400 mb-2">
            Average Sentiment
          </p>

          <h2 className="text-xl font-semibold text-green-400">
            Positive
          </h2>

        </div>

      </div>


      {/* Reports List */}

      <div className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6">

        <h2 className="text-xl font-semibold mb-6">
          Available Reports
        </h2>

        <div className="space-y-4">

          {/* Weekly Report */}

          <div className="flex justify-between items-center border-b border-[#1f1f2e] pb-4">

            <div>

              <h3 className="font-semibold">
                Weekly Sentiment Report
              </h3>

              <p className="text-sm text-gray-400">
                Summary of sentiment trends over the past week
              </p>

            </div>

            <button
              className="
              bg-purple-600
              hover:bg-purple-700
              px-4 py-2
              rounded-lg
              shadow-[0_0_12px_rgba(124,58,237,0.6)]
              transition
              "
            >
              Download
            </button>

          </div>


          {/* Industry Report */}

          <div className="flex justify-between items-center border-b border-[#1f1f2e] pb-4">

            <div>

              <h3 className="font-semibold">
                Industry Insights Report
              </h3>

              <p className="text-sm text-gray-400">
                AI analysis of feedback by predicted industry
              </p>

            </div>

            <button
              className="
              bg-purple-600
              hover:bg-purple-700
              px-4 py-2
              rounded-lg
              shadow-[0_0_12px_rgba(124,58,237,0.6)]
              transition
              "
            >
              Download
            </button>

          </div>


          {/* Feedback Trends */}

          <div className="flex justify-between items-center">

            <div>

              <h3 className="font-semibold">
                Feedback Trend Report
              </h3>

              <p className="text-sm text-gray-400">
                Overview of trending customer feedback topics
              </p>

            </div>

            <button
              className="
              bg-purple-600
              hover:bg-purple-700
              px-4 py-2
              rounded-lg
              shadow-[0_0_12px_rgba(124,58,237,0.6)]
              transition
              "
            >
              Download
            </button>

          </div>

        </div>

      </div>

    </div>

  )

}

export default Reports