function About() {

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        About This Project
      </h1>

      <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-6 border">

        <p className="text-gray-700">
          The Intelligent Customer Feedback Analysis System
          uses Natural Language Processing and Generative AI
          to convert raw customer feedback into actionable
          business insights.
        </p>

        <ul className="list-disc mt-4 ml-6 space-y-2 text-gray-700">

          <li>Sentiment Analysis using BERT</li>
          <li>Zero-shot Industry Classification</li>
          <li>Confidence Visualization</li>
          <li>Industry-Specific Recommendations</li>
          <li>NLP Data Cleaning Pipeline</li>

        </ul>

      </div>

    </div>
  );
}

export default About;