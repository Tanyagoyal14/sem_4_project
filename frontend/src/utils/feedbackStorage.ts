import { getStorageScopeId } from "./auth"

const FEEDBACK_STREAM_STORAGE_PREFIX = "dashboard_feedback_stream"
const DASHBOARD_STATE_STORAGE_PREFIX = "dashboard_page_state"

const buildScopedStorageKey = (prefix: string) => {
  const scopeId = getStorageScopeId()
  return `${prefix}:${scopeId}`
}

export const getFeedbackStreamStorageKey = () =>
  buildScopedStorageKey(FEEDBACK_STREAM_STORAGE_PREFIX)

export const getDashboardStateStorageKey = () =>
  buildScopedStorageKey(DASHBOARD_STATE_STORAGE_PREFIX)

const readParsedStorageValue = (key: string) => {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return null

    return JSON.parse(saved)
  } catch (error) {
    console.error(`Unable to read saved storage value for ${key}:`, error)
  }
  return null
}

export const readStoredFeedbackStream = () =>
  readParsedStorageValue(getFeedbackStreamStorageKey())

export const saveStoredFeedbackStream = (value: unknown) => {
  const serialized = JSON.stringify(value)
  localStorage.setItem(getFeedbackStreamStorageKey(), serialized)
}

export const readStoredDashboardState = () =>
  readParsedStorageValue(getDashboardStateStorageKey())

export const saveStoredDashboardState = (value: unknown) => {
  const serialized = JSON.stringify(value)
  localStorage.setItem(getDashboardStateStorageKey(), serialized)
}
