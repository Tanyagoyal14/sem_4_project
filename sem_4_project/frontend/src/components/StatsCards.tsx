import { motion } from "framer-motion";

const stats = [
  { title: "Total Feedback", value: 215 },
  { title: "Positive", value: 102 },
  { title: "Neutral", value: 56 },
  { title: "Negative", value: 57 }
];

function StatsCards() {

  return (

    <div className="grid md:grid-cols-4 grid-cols-2 gap-6">

      {stats.map((s, index) => (

        <motion.div
          key={index}
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:index * 0.2 }}
          className="bg-white/25 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg p-6 text-center"
        >

          <p className="text-white">{s.title}</p>

          <p className="text-3xl font-bold text-white">
            {s.value}
          </p>

        </motion.div>

      ))}

    </div>

  );

}

export default StatsCards;