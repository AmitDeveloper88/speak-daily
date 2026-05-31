import { useEffect, useState } from 'react'
import { getSpeechSpeed, setSpeechSpeed, subscribeSpeechSpeed } from '../utils/speechRate'

export function useSpeechRate() {
  const [speed, setSpeed] = useState(getSpeechSpeed)

  useEffect(() => subscribeSpeechSpeed(setSpeed), [])

  return {
    speed,
    setSpeed: setSpeechSpeed,
  }
}
