import { useEffect, useState } from "react";

interface FeedbackItem {
  text: string;
  sentiment: string;
}

interface Props {
  stream: FeedbackItem[];
}

function SentimentHeatmap({ stream }: Props) {

  const [grid, setGrid] = useState<number[][]>([]);

  useEffect(() => {

    const size = 6;
    const newGrid = Array(size)
      .fill(0)
      .map(() => Array(size).fill(0));

    stream.forEach(() => {

      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);

      newGrid[x][y] += 1;

    });

    setGrid(newGrid);

  }, [stream]);

  return (

    <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6">

      <h2 className="text-lg font-semibold mb-4">
        Live Sentiment Heatmap
      </h2>

      <div className="grid grid-cols-6 gap-2">

        {grid.map((row, i) =>
          row.map((value, j) => (

            <div
              key={`${i}-${j}`}
              className="h-10 rounded"
              style={{
                background: `rgba(236,72,153,${Math.min(value / 5, 1)})`
              }}
            />

          ))
        )}

      </div>

    </div>

  );

}

export default SentimentHeatmap;