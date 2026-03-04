import { TagCloud } from "react-tagcloud";

const data = [
  { value: "delivery", count: 20 },
  { value: "refund", count: 15 },
  { value: "payment", count: 10 },
  { value: "slow", count: 8 },
];

function WordCloud() {
  return (
    <div className="bg-white/30 backdrop-blur-xl p-6 rounded-xl shadow-lg">
      <h2 className="text-white font-semibold mb-4">Keyword Cloud</h2>
      <TagCloud minSize={12} maxSize={35} tags={data} />
    </div>
  );
}

export default WordCloud;