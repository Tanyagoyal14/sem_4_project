function StatsCards({ csat }: { csat: number }) {

  return (

    <div className="grid md:grid-cols-4 gap-6 mt-6">

      <div className="bg-[#12121a] p-6 rounded-xl border border-[#1f1f2e]">
        <p className="text-gray-400">Total Feedback</p>
        <h2 className="text-2xl font-bold">Live</h2>
      </div>

      <div className="bg-[#12121a] p-6 rounded-xl border border-[#1f1f2e]">
        <p className="text-gray-400">Positive</p>
        <h2 className="text-2xl font-bold text-green-400">Realtime</h2>
      </div>

      <div className="bg-[#12121a] p-6 rounded-xl border border-[#1f1f2e]">
        <p className="text-gray-400">Negative</p>
        <h2 className="text-2xl font-bold text-red-400">Realtime</h2>
      </div>

      <div className="bg-[#12121a] p-6 rounded-xl border border-[#1f1f2e]">
        <p className="text-gray-400">CSAT Score</p>
        <h2 className="text-2xl font-bold text-purple-400">
          {csat}%
        </h2>
      </div>

    </div>

  )

}

export default StatsCards