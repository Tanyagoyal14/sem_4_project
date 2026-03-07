import { useEffect, useState } from "react";

interface FeedbackItem {
  text: string;
  sentiment: string;
}

interface Props {
  stream: FeedbackItem[];
}

function TrendDetector({ stream }: Props) {

  const [trends, setTrends] = useState<{word:string,count:number}[]>([]);

  useEffect(() => {

    const wordCount: Record<string, number> = {};

    stream.forEach(item => {

      const words = item.text.toLowerCase().split(" ");

      words.forEach(word => {

        if(word.length < 4) return;

        wordCount[word] = (wordCount[word] || 0) + 1;

      });

    });

    const sorted = Object.entries(wordCount)
      .map(([word,count]) => ({word,count}))
      .sort((a,b) => b.count - a.count)
      .slice(0,6);

    setTrends(sorted);

  }, [stream]);

  return (

    <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6">

      <h2 className="text-lg font-semibold mb-4">
        Real-Time AI Trends
      </h2>

      <div className="flex flex-wrap gap-3">

        {trends.map((t,i) => (

          <span
            key={i}
            className="bg-purple-600 px-3 py-1 rounded-full text-sm"
          >
            {t.word} ({t.count})
          </span>

        ))}

      </div>

    </div>

  );

}

export default TrendDetector;