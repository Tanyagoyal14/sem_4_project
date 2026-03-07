function Analytics(){

  return(

    <div className="min-h-screen bg-[#0b0b0f] text-gray-200 p-8">

      <h1 className="text-3xl font-bold mb-6">
        Analytics
      </h1>

      <div className="grid lg:grid-cols-2 gap-6">

        <div className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6">

          <h2 className="text-lg font-semibold mb-4">
            Sentiment Distribution
          </h2>

          <p className="text-gray-400">
            Chart will appear here.
          </p>

        </div>

        <div className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6">

          <h2 className="text-lg font-semibold mb-4">
            Industry Insights
          </h2>

          <p className="text-gray-400">
            AI analytics insights will appear here.
          </p>

        </div>

      </div>

    </div>

  )

}

export default Analytics