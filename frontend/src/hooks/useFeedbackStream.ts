import { useEffect, useState } from "react"
import { readStoredFeedbackStream, saveStoredFeedbackStream } from "../utils/feedbackStorage"

const getStoredStream = () => {
  try {
    const parsed = readStoredFeedbackStream()
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Unable to read saved feedback stream:", error)
    return []
  }
}

export default function useFeedbackStream() {
  const [stream, setStream] = useState<any[]>(getStoredStream)

  useEffect(() => {
    saveStoredFeedbackStream(stream)
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
