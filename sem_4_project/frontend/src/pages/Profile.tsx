import { useState } from "react"

function Profile() {

  const [name,setName] = useState("Admin")
  const [email,setEmail] = useState("")
  const [company,setCompany] = useState("")
  const [role,setRole] = useState("AI Analyst")

  const saveProfile = () => {

    const profile = {
      name,
      email,
      company,
      role
    }

    localStorage.setItem("ai_profile", JSON.stringify(profile))

    alert("Profile updated successfully!")

  }

  return (

    <div className="p-8 text-white">

      <h1 className="text-3xl font-bold mb-6">
        Profile Settings
      </h1>

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-8 max-w-xl space-y-6">

        {/* Name */}

        <div>
          <label className="text-gray-400 text-sm">Name</label>

          <input
            value={name}
            onChange={(e)=>setName(e.target.value)}
            className="w-full mt-2 p-3 bg-black/50 border border-white/10 rounded-lg"
          />
        </div>


        {/* Email */}

        <div>
          <label className="text-gray-400 text-sm">Email</label>

          <input
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full mt-2 p-3 bg-black/50 border border-white/10 rounded-lg"
          />
        </div>


        {/* Company */}

        <div>
          <label className="text-gray-400 text-sm">Company</label>

          <input
            value={company}
            onChange={(e)=>setCompany(e.target.value)}
            className="w-full mt-2 p-3 bg-black/50 border border-white/10 rounded-lg"
          />
        </div>


        {/* Role */}

        <div>
          <label className="text-gray-400 text-sm">Role</label>

          <input
            value={role}
            onChange={(e)=>setRole(e.target.value)}
            className="w-full mt-2 p-3 bg-black/50 border border-white/10 rounded-lg"
          />
        </div>


        <button
          onClick={saveProfile}
          className="bg-pink-500 hover:bg-pink-600 px-6 py-2 rounded-xl"
        >
          Save Profile
        </button>

      </div>

    </div>

  )
}

export default Profile