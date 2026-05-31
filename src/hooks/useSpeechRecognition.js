import { useCallback, useEffect, useRef, useState } from 'react'

const RESTART_DELAY_MS = 280
const FATAL_ERRORS = new Set(['not-allowed', 'service-not-allowed', 'audio-capture'])

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

function pickLongestFromResults(results) {
  if (!results?.length) return ''
  let best = ''
  for (let i = 0; i < results.length; i++) {
    const t = (results[i][0]?.transcript || '').trim()
    if (t.length > best.length) best = t
  }
  return best
}

export function useSpeechRecognition() {
  const mobile = isMobileBrowser()
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')

  const recognitionRef = useRef(null)
  const shouldRunRef = useRef(false)
  const restartTimerRef = useRef(null)
  const spawnRef = useRef(() => false)

  const finalPartsRef = useRef('')
  const committedRef = useRef('')

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
  }, [])

  const teardownRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
    }
  }, [])

  const requestRestart = useCallback(() => {
    clearRestartTimer()
    restartTimerRef.current = setTimeout(() => {
      if (shouldRunRef.current) spawnRef.current()
    }, RESTART_DELAY_MS)
  }, [clearRestartTimer])

  const spawnRecognition = useCallback(() => {
    const SpeechRecognition = getSpeechRecognitionConstructor()
    if (!SpeechRecognition || !shouldRunRef.current) return false

    teardownRecognition()

    const recognition = new SpeechRecognition()
    recognition.lang = mobile ? 'en-US' : 'en-IN'
    recognition.interimResults = true
    recognition.continuous = true
    recognition.maxAlternatives = 1

    if (mobile) {
      recognition.onresult = (event) => {
        const sessionText = pickLongestFromResults(event.results)
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

      recognition.onend = () => {
        recognitionRef.current = null

        setTranscript((prev) => {
          const merged = mergeSegments(committedRef.current, prev)
          committedRef.current = merged
          return merged
        })
        setInterimTranscript('')

        if (!shouldRunRef.current) {
          setIsListening(false)
          return
        }

        requestRestart()
      }
    } else {
      recognition.onresult = (event) => {
        let interim = ''
        let finalText = finalPartsRef.current

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalText += piece
          } else {
            interim += piece
          }
        }

        finalPartsRef.current = finalText
        setTranscript(finalText.trim())
        setInterimTranscript(interim.trim())
      }

      recognition.onend = () => {
        recognitionRef.current = null
        setInterimTranscript((interim) => {
          if (interim) {
            const merged = `${finalPartsRef.current} ${interim}`.trim()
            finalPartsRef.current = merged
            setTranscript(merged)
          }
          return ''
        })
        if (!shouldRunRef.current) {
          setIsListening(false)
        }
      }
    }

    recognition.onerror = (event) => {
      const code = event?.error
      if (code === 'no-speech' || code === 'aborted') return
      if (FATAL_ERRORS.has(code)) {
        shouldRunRef.current = false
        setIsListening(false)
        return
      }
      if (mobile && shouldRunRef.current) {
        requestRestart()
      } else if (!mobile) {
        setIsListening(false)
      }
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
      return true
    } catch {
      if (shouldRunRef.current && mobile) {
        requestRestart()
        return true
      }
      shouldRunRef.current = false
      setIsListening(false)
      return false
    }
  }, [mobile, requestRestart, teardownRecognition])

  spawnRef.current = spawnRecognition

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported())
    return () => {
      shouldRunRef.current = false
      clearRestartTimer()
      teardownRecognition()
    }
  }, [clearRestartTimer, teardownRecognition])

  const reset = useCallback(() => {
    shouldRunRef.current = false
    clearRestartTimer()
    teardownRecognition()
    finalPartsRef.current = ''
    committedRef.current = ''
    setTranscript('')
    setInterimTranscript('')
    setIsListening(false)
  }, [clearRestartTimer, teardownRecognition])

  const start = useCallback(() => {
    if (!getSpeechRecognitionConstructor()) return false

    shouldRunRef.current = true
    finalPartsRef.current = ''
    committedRef.current = ''
    setTranscript('')
    setInterimTranscript('')
    clearRestartTimer()
    return spawnRecognition()
  }, [clearRestartTimer, spawnRecognition])

  const stop = useCallback(() => {
    shouldRunRef.current = false
    clearRestartTimer()

    if (mobile) {
      setTranscript((prev) => {
        const merged = mergeSegments(committedRef.current, prev)
        committedRef.current = merged
        return merged
      })
      setInterimTranscript('')
    } else {
      setInterimTranscript((interim) => {
        if (interim) {
          const merged = `${finalPartsRef.current} ${interim}`.trim()
          finalPartsRef.current = merged
          setTranscript(merged)
        }
        return ''
      })
    }

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
  }, [clearRestartTimer, mobile])

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
