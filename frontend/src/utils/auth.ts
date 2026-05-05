export type JwtPayload = {
  sub?: string
  role?: "free" | "premium"
  email?: string
  user_id?: string
  exp?: number
}

export type AuthUser = {
  id?: string
  email?: string
  role?: "free" | "premium"
  credits?: number
  created_at?: string
}

const TOKEN_KEYS = ["access_token", "token", "authToken"]
const USER_KEY = "auth_user"

const base64UrlDecode = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
  return atob(padded)
}

export const getStoredToken = () => {
  for (const key of TOKEN_KEYS) {
    const token = localStorage.getItem(key)
    if (token) return token
  }
  return null
}

export const getStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export const getStorageScopeId = () => {
  const user = getStoredUser()
  if (user?.id) return user.id
  if (user?.email) return user.email

  const token = getStoredToken()
  const payload = token ? decodeJwt(token) : null

  return payload?.user_id ?? payload?.sub ?? "guest"
}

export const setAuthSession = (token: string, user: AuthUser) => {
  TOKEN_KEYS.forEach((key) => localStorage.setItem(key, token))
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event("auth-change"))
}

export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const [, payload] = token.split(".")
    if (!payload) return null
    return JSON.parse(base64UrlDecode(payload)) as JwtPayload
  } catch {
    return null
  }
}

export const getAuthRole = (): "free" | "premium" | null => {
  const user = getStoredUser()
  if (user?.role) return user.role

  const token = getStoredToken()
  if (!token) return null

  const payload = decodeJwt(token)
  return payload?.role ?? null
}

export const isPremiumUser = () => getAuthRole() === "premium"

export const getAuthCredits = (): number | null => {
  const user = getStoredUser()
  if (typeof user?.credits === "number") return user.credits
  return null
}

export const updateStoredCredits = (credits: number) => {
  const user = getStoredUser()
  if (!user) return

  const nextUser = {
    ...user,
    credits,
  }

  localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  window.dispatchEvent(new Event("auth-change"))
}

export const clearAuth = () => {
  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key))
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event("auth-change"))
}
