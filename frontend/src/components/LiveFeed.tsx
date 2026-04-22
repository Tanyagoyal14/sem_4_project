function LiveFeed({ stream }: any) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm dark:border-[#1f1f2e] dark:bg-[#12121a] dark:text-white">
      <h2 className="mb-4 text-lg font-semibold">Live Feedback Stream</h2>

      {stream.map((item: any, index: number) => (
        <div key={index} className="border-b border-slate-200 py-2 dark:border-[#1f1f2e]">
          <p className="text-slate-700 dark:text-gray-300">
            {item.feedback || item.text}
          </p>

          <p className="text-sm text-slate-500 dark:text-gray-400">
            {item.sentiment}
          </p>
        </div>
      ))}
    </div>
  )
}

export default LiveFeed
