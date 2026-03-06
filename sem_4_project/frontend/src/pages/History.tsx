function History() {

  const feedbackData = [
    {
      text: "Delivery was late",
      sentiment: "Negative",
      industry: "Food Delivery"
    },
    {
      text: "Great app performance",
      sentiment: "Positive",
      industry: "Technology"
    },
    {
      text: "Payment failed multiple times",
      sentiment: "Negative",
      industry: "E-commerce"
    }
  ];

  return (

    <div className="p-8 text-white">

      <h1 className="text-3xl font-bold mb-6">
        Feedback History
      </h1>

      <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6">

        <table className="w-full text-left">

          <thead>

            <tr className="border-b border-white/30">

              <th className="py-2">Feedback</th>
              <th>Sentiment</th>
              <th>Industry</th>

            </tr>

          </thead>

          <tbody>

            {feedbackData.map((f, i) => (

              <tr key={i} className="border-b border-white/10">

                <td className="py-3">{f.text}</td>
                <td>{f.sentiment}</td>
                <td>{f.industry}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default History;