import { useState } from "react";

function Settings() {

  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoAnalysis, setAutoAnalysis] = useState(false);
  const [language, setLanguage] = useState("English");

  const saveSettings = () => {

    const settings = {
      darkMode,
      notifications,
      autoAnalysis,
      language
    };

    localStorage.setItem("ai_dashboard_settings", JSON.stringify(settings));

    alert("Settings saved successfully!");

  };

  return (

    <div className="p-8 text-white">

      <h1 className="text-3xl font-bold mb-8">
        Settings
      </h1>


      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-6">


        {/* Dark Mode */}

        <div className="flex justify-between items-center">

          <div>
            <h2 className="font-semibold">Dark Mode</h2>
            <p className="text-gray-400 text-sm">
              Toggle dark theme for the dashboard
            </p>
          </div>

          <input
            type="checkbox"
            checked={darkMode}
            onChange={()=>setDarkMode(!darkMode)}
          />

        </div>


        {/* Notifications */}

        <div className="flex justify-between items-center">

          <div>
            <h2 className="font-semibold">Enable Notifications</h2>
            <p className="text-gray-400 text-sm">
              Receive alerts for important feedback
            </p>
          </div>

          <input
            type="checkbox"
            checked={notifications}
            onChange={()=>setNotifications(!notifications)}
          />

        </div>


        {/* Auto AI analysis */}

        <div className="flex justify-between items-center">

          <div>
            <h2 className="font-semibold">Auto Analyze Feedback</h2>
            <p className="text-gray-400 text-sm">
              Automatically analyze new feedback
            </p>
          </div>

          <input
            type="checkbox"
            checked={autoAnalysis}
            onChange={()=>setAutoAnalysis(!autoAnalysis)}
          />

        </div>


        {/* Language */}

        <div className="flex justify-between items-center">

          <div>
            <h2 className="font-semibold">Language</h2>
            <p className="text-gray-400 text-sm">
              Choose feedback language
            </p>
          </div>

          <select
            value={language}
            onChange={(e)=>setLanguage(e.target.value)}
            className="bg-black/60 p-2 rounded"
          >
            <option>English</option>
            <option>Hinglish</option>
            <option>Hindi</option>
          </select>

        </div>


        <button
          onClick={saveSettings}
          className="bg-pink-500 hover:bg-pink-600 px-6 py-2 rounded-xl"
        >
          Save Settings
        </button>

      </div>

    </div>

  );
}

export default Settings;