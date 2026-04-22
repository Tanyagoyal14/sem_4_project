function LiveFeed({ stream }: any) {
  return (
    <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#0b1720]/70 p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.1),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-[1px] rounded-[19px] border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />

      <div className="relative z-10">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-white/55">
          LIVE FEED
        </p>
        <h2 className="mt-2 mb-4 text-lg font-semibold text-white">
          Feedback Stream
        </h2>

        <div className="space-y-3">
          {stream.map((item: any, index: number) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/8"
            >
              <p className="text-slate-100">
                {item.feedback || item.text}
              </p>

              <p className="mt-1 text-sm text-slate-300/70">
                {item.sentiment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LiveFeed
