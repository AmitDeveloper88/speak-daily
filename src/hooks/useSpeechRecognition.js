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

const RESTART_GAP_MS = 900

export function useSpeechRecognition() {
  const mobile = isMobileBrowser()
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState('')

  const recognitionRef = useRef(null)
  const sessionActiveRef = useRef(false)
  const committedRef = useRef('')
  const sessionTextRef = useRef('')
  const restartTimerRef = useRef(null)
  const lastRestartAtRef = useRef(0)

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
  }, [])

  const publishTranscript = useCallback(
    (committed, session, interim = '') => {
      const merged = dedupeSpokenText(mergeSpeechSegments(committed, session))
      setTranscript(merged)
      if (mobile) {
        setInterimTranscript('')
      } else {
        const live = dedupeSpokenText(mergeSpeechSegments(merged, interim))
        setInterimTranscript(interim && live !== merged ? interim.trim() : '')
      }
    },
    [mobile]
  )

  const commitSession = useCallback(() => {
    if (sessionTextRef.current) {
      committedRef.current = dedupeSpokenText(
        mergeSpeechSegments(committedRef.current, sessionTextRef.current)
      )
      sessionTextRef.current = ''
    }
  }, [])

  const attachRecognition = useCallback(() => {
    const SpeechRecognition = getSpeechRecognitionConstructor()
    if (!SpeechRecognition || !sessionActiveRef.current) return false

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1
    recognition.interimResults = !mobile
    recognition.continuous = true

    recognition.onresult = (event) => {
      const best = pickBestFromResults(event.results)
      sessionTextRef.current = best

      let interim = ''
      if (!mobile) {
        for (let i = event.results.length - 1; i >= 0; i--) {
          if (!event.results[i].isFinal) {
            interim = event.results[i][0].transcript
            break
          }
        }
      }

      publishTranscript(committedRef.current, sessionTextRef.current, interim)
    }

    recognition.onerror = (event) => {
      const message = mapSpeechError(event)
      if (message) setError(message)
    }

    recognition.onend = () => {
      recognitionRef.current = null
      commitSession()
      publishTranscript(committedRef.current, '')

      if (!sessionActiveRef.current) {
        setIsListening(false)
        return
      }

      const now = Date.now()
      const wait = Math.max(0, RESTART_GAP_MS - (now - lastRestartAtRef.current))
      clearRestartTimer()
      restartTimerRef.current = setTimeout(() => {
        if (!sessionActiveRef.current) return
        lastRestartAtRef.current = Date.now()
        attachRecognition()
      }, wait)
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
      return true
    } catch {
      return false
    }
  }, [clearRestartTimer, commitSession, mobile, publishTranscript])

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported())
    return () => {
      sessionActiveRef.current = false
      clearRestartTimer()
      recognitionRef.current?.abort()
    }
  }, [clearRestartTimer])

  const reset = useCallback(() => {
    sessionActiveRef.current = false
    clearRestartTimer()
    committedRef.current = ''
    sessionTextRef.current = ''
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
  }, [clearRestartTimer])

  const start = useCallback(() => {
    if (!getSpeechRecognitionConstructor()) {
      setError('Speech-to-text is not available. Type your answer after recording.')
      return false
    }

    sessionActiveRef.current = true
    committedRef.current = ''
    sessionTextRef.current = ''
    lastRestartAtRef.current = 0
    setTranscript('')
    setInterimTranscript('')
    setError('')

    return attachRecognition()
  }, [attachRecognition])

  const stop = useCallback(() => {
    sessionActiveRef.current = false
    clearRestartTimer()
    commitSession()
    publishTranscript(committedRef.current, '')

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
  }, [clearRestartTimer, commitSession, publishTranscript])

  const liveTranscript = dedupeSpokenText(
    mobile
      ? transcript
      : mergeSpeechSegments(transcript, interimTranscript)
  )

  return {
    isSupported,
    isListening,
    isMobileMode: mobile,
    transcript: dedupeSpokenText(transcript),
    interimTranscript,
    liveTranscript,
    error,
    start,
    stop,
    reset,
  }
}
