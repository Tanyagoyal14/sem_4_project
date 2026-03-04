function StatsCards(){

  return(

    <div className="grid grid-cols-4 gap-6">

      <div className="bg-white/30 backdrop-blur-xl p-6 rounded-xl text-center">
        <p>Total Feedback</p>
        <p className="text-3xl font-bold">215</p>
      </div>

      <div className="bg-white/30 backdrop-blur-xl p-6 rounded-xl text-center">
        <p>Positive</p>
        <p className="text-3xl font-bold text-green-400">102</p>
      </div>

      <div className="bg-white/30 backdrop-blur-xl p-6 rounded-xl text-center">
        <p>Neutral</p>
        <p className="text-3xl font-bold text-yellow-400">56</p>
      </div>

      <div className="bg-white/30 backdrop-blur-xl p-6 rounded-xl text-center">
        <p>Negative</p>
        <p className="text-3xl font-bold text-red-400">57</p>
      </div>

    </div>

  )

}

export default StatsCards