function StatsCards(){

  const cards = [

    {title:"Total Feedback", value:215},
    {title:"Positive", value:102},
    {title:"Neutral", value:56},
    {title:"Negative", value:57}

  ]

  return(

    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

      {cards.map((c,i)=>(

        <div
          key={i}
          className="
          bg-white/10
          backdrop-blur-xl
          border border-white/20
          rounded-xl
          p-6
          text-center
          shadow-[0_0_25px_rgba(168,85,247,0.3)]
          hover:scale-105
          transition
          "
        >

          <p className="text-sm mb-2">
            {c.title}
          </p>

          <h3 className="text-3xl font-bold">
            {c.value}
          </h3>

        </div>

      ))}

    </div>

  )

}

export default StatsCards