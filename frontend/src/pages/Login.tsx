import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"

import { clearAuth, decodeJwt, getStoredToken, setAuthSession } from "../utils/auth"
import { apiFetch } from "../utils/api"

type AuthResponse = {
  message?: string
  detail?: string
  access_token?: string
  user?: {
    id?: string
    email?: string
    role?: "free" | "premium"
    credits?: number
    created_at?: string
  }
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = getStoredToken()
    const payload = token ? decodeJwt(token) : null
    const isExpired = typeof payload?.exp === "number" && payload.exp * 1000 < Date.now()

    if (token && payload && !isExpired) {
      navigate("/app/dashboard", { replace: true })
    } else if (token) {
      clearAuth()
    }
  }, [navigate])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await apiFetch(`/auth/${mode}`, {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password })
      })

      const data = (await res.json()) as AuthResponse

      if (!res.ok) {
        throw new Error(data?.message || data?.detail || "Authentication failed")
      }

      if (!data.access_token || !data.user) {
        throw new Error("Invalid authentication response")
      }

      setAuthSession(data.access_token, data.user)

      const destination =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
        "/app/dashboard"

      navigate(destination, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_40%),linear-gradient(135deg,_#09111d,_#0b1720_55%,_#05070d)] px-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/8 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
      >
        <div className="mb-6 text-center">
          <p className="text-[11px] font-semibold tracking-[0.28em] text-cyan-300/80">
            {mode === "login" ? "WELCOME BACK" : "CREATE ACCOUNT"}
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            {mode === "login" ? "Login to Dashboard" : "Sign up for Access"}
          </h1>
          <p className="mt-2 text-sm text-slate-300/80">
            Launch the dashboard with your AI feedback credits.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
              placeholder="Enter your password"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 px-4 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(34,197,94,0.24)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading
              ? "Processing..."
              : mode === "login"
                ? "Login"
                : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-300">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-semibold text-cyan-300 transition hover:text-cyan-200"
          >
            {mode === "login" ? "Sign up" : "Login"}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Free users get 200 credits. Premium users are unlimited.
        </p>
      </motion.div>
    </div>
  )
}

export default Login
