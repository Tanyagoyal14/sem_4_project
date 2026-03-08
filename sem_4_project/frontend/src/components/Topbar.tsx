import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Topbar() {

  const navigate = useNavigate()

  const [showNotifications,setShowNotifications] = useState(false)
  const [showAdmin,setShowAdmin] = useState(false)

  const notifications = [
    "New negative feedback detected",
    "Complaint spike detected",
    "AI trend detected: Delivery delays"
  ]

  return (

    <div className="flex justify-between items-center mb-6">

      {/* Title */}

      <div>

        <h1 className="text-2xl font-bold text-white">
          AI Feedback Dashboard
        </h1>

        <p className="text-green-400 text-sm">
          ● AI Models Running
        </p>

      </div>


      <div className="flex items-center gap-8">

        {/* Notifications */}

        <div className="relative">

          <button
            onClick={()=>setShowNotifications(!showNotifications)}
            className="relative text-xl text-white hover:text-pink-400 transition"
          >

            🔔

            <span className="absolute -top-2 -right-2 bg-pink-500 text-xs px-1.5 py-0.5 rounded-full">
              {notifications.length}
            </span>

          </button>


          {showNotifications && (

            <div className="absolute right-0 mt-3 w-64 bg-black border border-white/10 rounded-xl p-4 shadow-xl z-50">

              <h3 className="font-semibold mb-3 text-white">
                Notifications
              </h3>

              {notifications.map((n,i)=>(

                <p
                  key={i}
                  className="text-sm text-gray-300 mb-2 p-2 rounded hover:bg-white/10 transition"
                >
                  {n}
                </p>

              ))}

            </div>

          )}

        </div>


        {/* Admin Menu */}

        <div className="relative">

          <button
            onClick={()=>setShowAdmin(!showAdmin)}
            className="flex items-center gap-2 hover:text-pink-400 transition"
          >

            <div className="w-9 h-9 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center font-semibold">
              A
            </div>

            <span className="text-white">
              Admin
            </span>

          </button>


          {showAdmin && (

            <div className="absolute right-0 mt-3 bg-black border border-white/10 rounded-xl p-4 w-40 shadow-xl">

              <p
                className="cursor-pointer hover:text-pink-400 mb-2"
                onClick={()=>navigate("/app/profile")}
              >
                Profile
              </p>

              <p
                className="cursor-pointer hover:text-pink-400 mb-2"
                onClick={()=>navigate("/app/settings")}
              >
                Settings
              </p>

              <p className="cursor-pointer hover:text-red-400">
                Logout
              </p>

            </div>

          )}

        </div>

      </div>

    </div>

  )

}

export default Topbar