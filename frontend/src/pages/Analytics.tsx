import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

function Analytics() {

  const [history, setHistory] = useState<any[]>([]);
  const [csat, setCsat] = useState(0);

  const COLORS = ["#22c55e", "#eab308", "#ef4444", "#3b82f6"];

  useEffect(() => {

    const fetchData = async () => {

      try {

        const res = await fetch("http://localhost:8002/feedback-history");
        const data = await res.json();

        if (!data || !data.history) {
          setHistory([]);
          return;
        }

        setHistory(data.history);

        const positive = data.history.filter(
          (f:any)=>f.sentiment === "Positive"
        ).length;

        const total = data.history.length;

        if(total > 0){
          setCsat(Math.round((positive / total) * 100));
        }

      } catch(err){

        console.error("Analytics error:", err);
        setHistory([]);

      }

    };

    fetchData();

  },[]);


  // --------------------------
  // Sentiment counts
  // --------------------------

  const sentimentCounts:any = {
    Positive: 0,
    Neutral: 0,
    Negative: 0
  };

  const complaintCounts:any = {
    Complaint: 0,
    Suggestion: 0,
    Praise: 0,
    Question: 0
  };


  if(history && history.length > 0){

    history.forEach((f:any)=>{

      if(sentimentCounts[f.sentiment] !== undefined){
        sentimentCounts[f.sentiment]++;
      }

      if(complaintCounts[f.type] !== undefined){
        complaintCounts[f.type]++;
      }

    });

  }


  const sentimentData = Object.keys(sentimentCounts).map(key => ({
    name: key,
    value: sentimentCounts[key]
  }));


  const complaintData = Object.keys(complaintCounts).map(key => ({
    name: key,
    value: complaintCounts[key]
  }));


  return (

    <div className="p-8 text-white">

      <h1 className="text-3xl font-bold mb-6">
        Analytics Dashboard
      </h1>


      {/* Stats */}

      <div className="grid grid-cols-3 gap-6 mb-8">

        <div className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-white/10">
          <h2 className="text-gray-400">Total Feedback</h2>
          <p className="text-3xl font-bold">{history.length}</p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-white/10">
          <h2 className="text-gray-400">CSAT Score</h2>
          <p className="text-3xl font-bold text-green-400">
            {csat}%
          </p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-white/10">
          <h2 className="text-gray-400">Positive Feedback</h2>
          <p className="text-3xl font-bold text-green-400">
            {sentimentCounts.Positive}
          </p>
        </div>

      </div>


      {/* Charts */}

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Sentiment Pie */}

        <div className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-white/10">

          <h2 className="text-xl mb-4">
            Sentiment Distribution
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={sentimentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >

                {sentimentData.map((entry, index) => (

                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />

                ))}

              </Pie>

              <Tooltip />
              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>


        {/* Complaint Types */}

        <div className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-white/10">

          <h2 className="text-xl mb-4">
            Feedback Type Distribution
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={complaintData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >

                {complaintData.map((entry, index) => (

                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />

                ))}

              </Pie>

              <Tooltip />
              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* Empty state */}

      {history.length === 0 && (

        <div className="mt-10 text-gray-400">
          No feedback data yet. Analyze some feedback first.
        </div>

      )}

    </div>

  );

}

export default Analytics;