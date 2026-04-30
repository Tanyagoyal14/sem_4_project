import { useState, useEffect } from "react"
import { motion } from "framer-motion"

import { getStoredUser } from "../utils/auth"
import { apiFetch } from "../utils/api"

const avatars = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=AI",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Dev",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=User",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Tech",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Smile",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Hero"
]

function Profile() {

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    company: "",
    role: "AI Analyst",
    avatar: avatars[0]
  })

  const [showAvatars, setShowAvatars] = useState(false)
  const [loading, setLoading] = useState(true)

  // 🔥 Load profile from backend or set defaults
  useEffect(() => {
    const loadProfile = async () => {
      const user = getStoredUser()
      if (!user?.email) {
        setLoading(false)
        return
      }

      try {
        const res = await apiFetch(`/profile/get-profile?email=${encodeURIComponent(user.email)}`)
        const data = await res.json()

        if (data && Object.keys(data).length > 0) {
          setProfile({
            name: data.name || user.email,
            email: data.email || user.email,
            company: data.company || "",
            role: data.role || "AI Analyst",
            avatar: data.avatar || avatars[0]
          })
        } else {
          // No profile saved, set defaults with user's email
          setProfile(prev => ({
            ...prev,
            name: user.email!,
            email: user.email!
          }))
        }
      } catch (error) {
        console.error("Failed to load profile:", error)
        // Fallback to defaults
        setProfile(prev => ({
          ...prev,
          name: user.email!,
          email: user.email!
        }))
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  // 🔥 Save profile to backend and localStorage
  const saveProfile = async () => {
    try {
      const res = await apiFetch("/profile/save-profile", {
        method: "POST",
        body: JSON.stringify(profile)
      })

      if (res.ok) {
        localStorage.setItem("profile", JSON.stringify(profile))
        alert("Profile saved successfully 🚀")
      } else {
        throw new Error("Failed to save profile")
      }
    } catch (error) {
      console.error("Save profile error:", error)
      alert("Failed to save profile. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-white min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center">
        <div>Loading profile...</div>
      </div>
    )
  }

  return (

    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-8 text-white min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900"
    >

      <h1 className="text-3xl font-bold mb-8">
        Profile Settings
      </h1>

      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 max-w-xl mx-auto relative z-20"
      >

        {/* ---------------- AVATAR ---------------- */}

        <div className="flex flex-col items-center mb-6">

          <motion.img
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            src={profile.avatar}
            className="w-24 h-24 rounded-full border-2 border-purple-500 cursor-pointer shadow-lg"
            onClick={() => setShowAvatars(prev => !prev)}
          />

          <p className="text-sm mt-2 text-gray-400">
            Click to change avatar 🎮
          </p>

        </div>

        {/* ---------------- AVATAR SELECTOR ---------------- */}

        {showAvatars && (

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-3 gap-4 mb-6 bg-black/60 p-4 rounded-xl border border-white/10"
          >

            {avatars.map((a, i) => (

              <motion.img
                key={i}
                src={a}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setProfile({ ...profile, avatar: a })
                  setShowAvatars(false)
                }}
                className="w-16 h-16 rounded-full border cursor-pointer"
              />

            ))}

          </motion.div>

        )}

        {/* ---------------- FORM ---------------- */}

        <div className="space-y-4">

          <input
            className="w-full p-3 rounded-xl bg-black border border-white/10 focus:outline-none focus:border-purple-500"
            placeholder="Name"
            value={profile.name}
            onChange={(e) =>
              setProfile({ ...profile, name: e.target.value })
            }
          />

          <input
            className="w-full p-3 rounded-xl bg-black border border-white/10 focus:outline-none focus:border-purple-500"
            placeholder="Email"
            value={profile.email}
            onChange={(e) =>
              setProfile({ ...profile, email: e.target.value })
            }
          />

          <input
            className="w-full p-3 rounded-xl bg-black border border-white/10 focus:outline-none focus:border-purple-500"
            placeholder="Company"
            value={profile.company}
            onChange={(e) =>
              setProfile({ ...profile, company: e.target.value })
            }
          />

          <input
            className="w-full p-3 rounded-xl bg-black border border-white/10 text-gray-400"
            value={profile.role}
            disabled
          />

        </div>

        {/* ---------------- SAVE BUTTON ---------------- */}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveProfile}
          className="mt-6 bg-pink-500 hover:bg-pink-600 px-6 py-2 rounded-xl font-semibold shadow-lg"
        >
          Save Profile
        </motion.button>

      </motion.div>

    </motion.div>

  )
}

export default Profile