import SentimentBadge from "./SentimentBadge";

function LiveFeed({stream}:any){

  return(

    <div className="bg-white/30 backdrop-blur-xl p-6 rounded-xl">

      <h2 className="text-white mb-4">
        Live Feedback
      </h2>

      {stream.map((item:any,index:number)=>(
        <div
          key={index}
          className="bg-white p-3 rounded mb-2 flex justify-between"
        >

          <span>{item.text}</span>

          <SentimentBadge sentiment={item.sentiment}/>

        </div>
      ))}

    </div>

  )

}

export default LiveFeed