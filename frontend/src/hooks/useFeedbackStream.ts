import { useState } from "react";

export default function useFeedbackStream(){

  const [stream,setStream] = useState<any[]>([])

  const addFeedback=(text:string,sentiment:string)=>{

    setStream(prev => [
      {text,sentiment},
      ...prev
    ])

  }

  return {stream,addFeedback}

}
