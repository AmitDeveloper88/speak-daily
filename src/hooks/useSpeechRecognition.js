import { useCallback, useEffect, useRef, useState } from 'react'
import {
  dedupeSpokenText,
  mergeSpeechSegments,
  pickBestFromResults,
} from '../utils/transcript'

export function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function isSpeechRecognitionSupported() {
  return !!getSpeechRecognitionConstructor()
}

export function isMobileBrowser() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/** Mobile browsers (esp. Chrome Android) break speech recognition — use timer + type instead. */
export function useManualPracticeMode() {
  return isMobileBrowser()
}

function mapSpeechError(event) {
  const code = event?.error
  if (code === 'not-allowed' || code === 'service-not-allowed') {
    return 'Microphone blocked. Allow mic for this site in Chrome settings.'
  }
  if (code === 'no-speech' || code === 'aborted') {
    return ''
  }
  if (code === 'network') {
    return 'Speech recognition needs internet. Check your connection.'
  }
  return code ? `Speech error: ${code}` : ''
}

export function useSpeechRecognition() {
  const manualPractice = useManualPracticeMode()
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState('')

  const recognitionRef = useRef(null)
  const sessionActiveRef = useRef(false)

  useEffect(() => {
    setIsSupported(!manualPractice && isSpeechRecognitionSupported())
    return () => {
      sessionActiveRef.current = false
      recognitionRef.current?.abort()
    }
  }, [manualPractice])

  const reset = useCallback(() => {
    sessionActiveRef.current = false
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
    }
    setTranscript('')
    setInterimTranscript('')
    setError('')
    setIsListening(false)
  }, [])

  const start = useCallback(() => {
    if (manualPractice) {
      setIsListening(true)
      return true
    }

    const SpeechRecognition = getSpeechRecognitionConstructor()
    if (!SpeechRecognition) {
      setError('Speech-to-text is not available. Type your answer after recording.')
      return false
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
    }

    sessionActiveRef.current = true
    setTranscript('')
    setInterimTranscript('')
    setError('')

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const best = pickBestFromResults(event.results)
      let interim = ''
      for (let i = event.results.length - 1; i >= 0; i--) {
        if (!event.results[i].isFinal) {
          interim = event.results[i][0].transcript
          break
        }
      }
      setTranscript(dedupeSpokenText(best))
      setInterimTranscript(interim.trim())
    }

    recognition.onerror = (event) => {
      const message = mapSpeechError(event)
      if (message) setError(message)
    }

    recognition.onend = () => {
      recognitionRef.current = null
      if (!sessionActiveRef.current) {
        setIsListening(false)
      }
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
      return true
    } catch {
      sessionActiveRef.current = false
      setError('Could not start microphone. Tap the mic again.')
      setIsListening(false)
      return false
    }
  }, [manualPractice])

  const stop = useCallback(() => {
    if (manualPractice) {
      setIsListening(false)
      return
    }

    sessionActiveRef.current = false
    setInterimTranscript((interim) => {
      setTranscript((prev) => dedupeSpokenText(mergeSpeechSegments(prev, interim)))
      return ''
    })

    const recognition = recognitionRef.current
    if (recognition) {
      try {
        recognition.stop()
      } catch {
        recognition.abort()
      }
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [manualPractice])

  const liveTranscript = dedupeSpokenText(
    mergeSpeechSegments(transcript, interimTranscript)
  )

  return {
    manualPractice,
    isSupported: !manualPractice && isSupported,
    isListening,
    isMobileMode: manualPractice,
    transcript: dedupeSpokenText(transcript),
    interimTranscript,
    liveTranscript,
    error: manualPractice ? '' : error,
    start,
    stop,
    reset,
  }
}
