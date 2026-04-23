import { useEffect, useState } from "react"

const FEEDBACK_STREAM_STORAGE_KEY = "dashboard_feedback_stream"

const getStoredStream = () => {
  try {
    const saved = localStorage.getItem(FEEDBACK_STREAM_STORAGE_KEY)
    if (!saved) return []

    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Unable to read saved feedback stream:", error)
    return []
  }
}

export default function useFeedbackStream() {
  const [stream, setStream] = useState<any[]>(getStoredStream)

  useEffect(() => {
    localStorage.setItem(FEEDBACK_STREAM_STORAGE_KEY, JSON.stringify(stream))
  }, [stream])

  const addFeedback = (text: string, sentiment: string) => {
    setStream((prev) => [
      {
        text,
        feedback: text,
        sentiment,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ])
  }

  return { stream, addFeedback }
}
