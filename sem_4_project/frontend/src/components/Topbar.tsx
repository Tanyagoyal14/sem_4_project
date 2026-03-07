function Topbar(){

  return(

    <div className="flex justify-between items-center mb-6">

      <div>

        <h1 className="text-3xl font-bold">
          AI Feedback Dashboard
        </h1>

        <div className="flex items-center gap-2 text-green-400 text-sm mt-1">

          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>

          AI Models Active

        </div>

      </div>

      <div className="flex items-center gap-6">

        <span className="text-xl">🔔</span>

        <span className="flex items-center gap-2">
          👤 Admin
        </span>

      </div>

    </div>

  )

}

export default Topbar