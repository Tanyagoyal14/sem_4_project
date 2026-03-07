function History(){

  return(

    <div className="min-h-screen bg-[#0b0b0f] text-gray-200 p-8">

      <h1 className="text-3xl font-bold mb-6">
        Feedback History
      </h1>

      <div className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6">

        <table className="w-full text-left">

          <thead className="text-gray-400">

            <tr>
              <th className="pb-3">Feedback</th>
              <th>Sentiment</th>
              <th>Industry</th>
            </tr>

          </thead>

          <tbody className="text-gray-300">

            <tr className="border-t border-[#1f1f2e]">
              <td className="py-3">Delivery was late</td>
              <td>Negative</td>
              <td>Food Delivery</td>
            </tr>

            <tr className="border-t border-[#1f1f2e]">
              <td className="py-3">App works great</td>
              <td>Positive</td>
              <td>Technology</td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>

  )

}

export default History