import { useState } from "react";

function Settings() {

  const [darkMode, setDarkMode] = useState(true);

  return (

    <div className="p-8 text-white">

      <h1 className="text-3xl font-bold mb-6">
        Settings
      </h1>

      <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 space-y-6">

        <div>

          <h2 className="font-semibold mb-2">
            Theme
          </h2>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-pink-500 px-4 py-2 rounded-lg"
          >
            Toggle Dark Mode
          </button>

        </div>

        <div>

          <h2 className="font-semibold mb-2">
            API Endpoint
          </h2>

          <input
            className="p-2 rounded text-black"
            defaultValue="http://localhost:8002"
          />

        </div>

      </div>

    </div>

  );

}

export default Settings;