import { useEffect, useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

import { decodeJwt, getStoredToken } from "../utils/auth"

function RequireAuth() {
  const location = useLocation()
  const [, setTick] = useState(0)
  const token = getStoredToken()
  const payload = token ? decodeJwt(token) : null
  const isExpired = typeof payload?.exp === "number" && payload.exp * 1000 < Date.now()

  useEffect(() => {
    const refresh = () => setTick((value) => value + 1)

    window.addEventListener("auth-change", refresh)
    window.addEventListener("storage", refresh)

    return () => {
      window.removeEventListener("auth-change", refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  if (!token || !payload || isExpired) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default RequireAuth
