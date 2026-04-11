import { useEffect, useState } from "react"

function History(){

  const [history,setHistory] = useState<any[]>([])

  useEffect(()=>{

    const fetchHistory = async()=>{

      const res = await fetch("http://localhost:8002/feedback-history")

      const data = await res.json()

      setHistory(data.history)

    }

    fetchHistory()

  },[])

  return(

    <div className="p-8 text-gray-200">

      <h1 className="text-2xl font-bold mb-6">
        Feedback History
      </h1>

      <div className="bg-[#12121a] rounded-xl border border-[#1f1f2e] overflow-x-auto">

        <table className="w-full text-left">

          <thead className="border-b border-[#1f1f2e]">

            <tr>

              <th className="p-4">Feedback</th>
              <th className="p-4">Sentiment</th>
              <th className="p-4">Type</th>

            </tr>

          </thead>

          <tbody>

            {history.map((item,i)=>(
              
              <tr key={i} className="border-b border-[#1f1f2e]">

                <td className="p-4">
                  {item.feedback}
                </td>

                <td className="p-4">
                  {item.sentiment}
                </td>

                <td className="p-4">
                  {item.type}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}

export default History