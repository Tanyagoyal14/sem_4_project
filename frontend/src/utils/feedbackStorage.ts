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
