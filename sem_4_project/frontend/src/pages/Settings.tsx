import { useState } from "react";

function Settings(){

  const [darkMode,setDarkMode] = useState(true)

  return(

    <div className="min-h-screen bg-[#0b0b0f] text-gray-200 p-8">

      <h1 className="text-3xl font-bold mb-6">
        Settings
      </h1>

      <div className="bg-[#12121a] border border-[#1f1f2e] rounded-xl p-6 space-y-6">

        <div>

          <h2 className="font-semibold mb-2">
            Theme
          </h2>

          <button
          onClick={()=>setDarkMode(!darkMode)}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
          >
            Toggle Dark Mode
          </button>

        </div>

        <div>

          <h2 className="font-semibold mb-2">
            API Endpoint
          </h2>

          <input
          className="p-2 rounded bg-black border border-[#1f1f2e]"
          defaultValue="http://localhost:8002"
          />

        </div>

      </div>

    </div>

  )

}

export default Settings