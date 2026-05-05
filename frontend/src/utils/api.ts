import { clearAuth, getStoredToken } from "./auth"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8002"

type RequestOptions = RequestInit & {
  auth?: boolean
}

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

export const apiFetch = async (path: string, options: RequestOptions = {}) => {
  const headers = new Headers(options.headers || {})
  const isFormData = options.body instanceof FormData

  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (options.auth !== false) {
    const token = getStoredToken()
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    headers,
  })

  if (response.status === 401 && options.auth !== false) {
    clearAuth()
  }

  return response
}
