function SentimentBadge({sentiment}:any){

  if(sentiment==="POSITIVE")
    return <span className="text-green-400">Positive</span>

  if(sentiment==="NEGATIVE")
    return <span className="text-red-400">Negative</span>

  return <span className="text-yellow-400">Neutral</span>

}

export default SentimentBadge