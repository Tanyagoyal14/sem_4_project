function LiveFeed({ stream }: any) {

  return (

    <div className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6">

      <h2 className="text-lg font-semibold mb-4">
        Live Feedback Stream
      </h2>

      {stream.map((item: any, i: number) => (

        <div key={i} className="border-b border-[#1f1f2e] py-2">

          <p className="text-gray-300">{item.feedback}</p>

          <p className="text-sm text-gray-400">
            {item.sentiment}
          </p>

        </div>

      ))}

    </div>

  )

}

export default LiveFeed