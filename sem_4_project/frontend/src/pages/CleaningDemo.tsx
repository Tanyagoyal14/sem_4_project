import { useState } from "react";

function CleaningDemo() {

  const [rawText, setRawText] = useState("");
  const [cleaned, setCleaned] = useState("");

  const cleanText = () => {
    let text = rawText.toLowerCase();
    text = text.replace(/http\S+/g, "");
    text = text.replace(/[^\w\s]/g, "");
    setCleaned(text);
  };

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold">
        NLP Data Cleaning Demo
      </h1>

      {/* Input Card */}
      <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-6 border">

        <textarea
          className="w-full border rounded-lg p-4"
          rows={4}
          placeholder="Example: Delivery was late 😡😡!!!"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
        />

        <button
          onClick={cleanText}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Clean Text
        </button>

      </div>

      {/* Result */}
      {cleaned && (
        <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-6 border">

          <h2 className="font-semibold mb-2">
            Cleaned Output
          </h2>

          <p className="text-gray-700">{cleaned}</p>

        </div>
      )}

    </div>
  );
}

export default CleaningDemo;