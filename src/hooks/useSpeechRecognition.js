import { useCallback, useEffect, useRef, useState } from 'react'

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

function pickBestFromResults(results) {
  if (!results?.length) return ''
  let best = ''
  for (let i = 0; i < results.length; i++) {
    const t = (results[i][0]?.transcript || '').trim()
    if (t.length > best.length) best = t
  }
  return best
}

function mergeSegments(committed, segment) {
  const c = (committed || '').trim()
  const s = (segment || '').trim()
  if (!s) return c
  if (!c) return s
  if (s.startsWith(c)) return s
  if (c.startsWith(s)) return c
  if (c.includes(s)) return c
  if (s.includes(c)) return s
  return `${c} ${s}`.trim()
}

function liveText(final, interim) {
  const f = (final || '').trim()
  const i = (interim || '').trim()
  if (!i) return f
  if (!f) return i
  if (i.startsWith(f)) return i
  return `${f} ${i}`.trim()
}

export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')

  const recognitionRef = useRef(null)
  const sessionActiveRef = useRef(false)
  const committedRef = useRef('')
  const restartTimerRef = useRef(null)

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
  }, [])

  const commitSession = useCallback(() => {
    setTranscript((prev) => {
      const merged = mergeSegments(committedRef.current, prev)
      committedRef.current = merged
      return merged
    })
    setInterimTranscript('')
  }, [])

  const startRecognitionInstance = useCallback(() => {
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
    recognition.lang = isMobileBrowser() ? 'en-US' : 'en-IN'
    recognition.interimResults = true
    recognition.continuous = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const sessionText = pickBestFromResults(event.results)
      let interim = ''
      for (let i = event.results.length - 1; i >= 0; i--) {
        if (!event.results[i].isFinal) {
          interim = event.results[i][0].transcript
          break
        }
      }
      const merged = mergeSegments(committedRef.current, sessionText)
      setTranscript(merged)
      setInterimTranscript(interim.trim())
    }

    recognition.onerror = () => {
      if (!sessionActiveRef.current) setIsListening(false)
    }

    recognition.onend = () => {
      recognitionRef.current = null
      commitSession()

      if (!sessionActiveRef.current) {
        setIsListening(false)
        return
      }

      clearRestartTimer()
      restartTimerRef.current = setTimeout(() => {
        startRecognitionInstance()
      }, 350)
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
      return true
    } catch {
      return false
    }
  }, [clearRestartTimer, commitSession])

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
    setIsListening(false)
  }, [clearRestartTimer])

  const start = useCallback(() => {
    if (!getSpeechRecognitionConstructor()) return false

    sessionActiveRef.current = true
    committedRef.current = ''
    setTranscript('')
    setInterimTranscript('')
    return startRecognitionInstance()
  }, [startRecognitionInstance])

  const stop = useCallback(() => {
    sessionActiveRef.current = false
    clearRestartTimer()
    commitSession()

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
  }, [clearRestartTimer, commitSession])

  return {
    isSupported,
    isListening,
    transcript: transcript.trim(),
    interimTranscript,
    liveTranscript: liveText(transcript, interimTranscript),
    start,
    stop,
    reset,
  }
}
