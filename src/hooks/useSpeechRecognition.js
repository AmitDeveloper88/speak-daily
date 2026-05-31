import { useCallback, useEffect, useRef, useState } from 'react'

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

/** chrome | edge | mobile | chromium — drives lang + restart timing */
export function getSpeechEngineKind() {
  if (typeof navigator === 'undefined') return 'chromium'
  const ua = navigator.userAgent
  if (/Android|iPhone|iPad|iPod/i.test(ua)) return 'mobile'
  if (/Edg\//.test(ua)) return 'edge'
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return 'chrome'
  return 'chromium'
}

function getEngineConfig(kind) {
  switch (kind) {
    case 'chrome':
      return { lang: 'en-US', restartDelayMs: 300, retryDelayMs: 500 }
    case 'edge':
      return { lang: 'en-US', restartDelayMs: 200, retryDelayMs: 400 }
    case 'mobile':
      return { lang: 'en-IN', restartDelayMs: 350, retryDelayMs: 600 }
    default:
      return { lang: 'en-US', restartDelayMs: 250, retryDelayMs: 500 }
  }
}

function liveText(finalText, interimText) {
  const f = (finalText || '').trim()
  const i = (interimText || '').trim()
  if (!i) return f
  if (!f) return i
  return `${f} ${i}`.trim()
}

function flushInterimIntoFinal(finalRef, interim) {
  const piece = (interim || '').trim()
  if (!piece) return
  finalRef.current += piece
}

export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')

  const recognitionRef = useRef(null)
  const shouldRunRef = useRef(false)
  const restartTimerRef = useRef(null)
  const finalRef = useRef('')
  const engineKindRef = useRef('chromium')
  const configRef = useRef(getEngineConfig('chromium'))

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
  }, [])

  const syncDisplay = useCallback((interim) => {
    setTranscript(finalRef.current)
    setInterimTranscript(interim)
  }, [])

  const scheduleRestart = useCallback((recognition) => {
    if (!shouldRunRef.current || !recognition) return
    clearRestartTimer()
    const { restartDelayMs, retryDelayMs } = configRef.current

    restartTimerRef.current = setTimeout(() => {
      if (!shouldRunRef.current) return
      try {
        recognition.start()
        setIsListening(true)
      } catch {
        restartTimerRef.current = setTimeout(() => {
          if (!shouldRunRef.current) return
          try {
            recognition.start()
            setIsListening(true)
          } catch {
            /* wait for next onend */
          }
        }, retryDelayMs)
      }
    }, restartDelayMs)
  }, [clearRestartTimer])

  const bindRecognition = useCallback(
    (recognition) => {
      recognition.onresult = (event) => {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const piece = result[0]?.transcript || ''
          if (!piece) continue
          if (result.isFinal) {
            finalRef.current += piece
          } else {
            interim += piece
          }
        }
        syncDisplay(interim.trim())
      }

      recognition.onend = () => {
        if (!shouldRunRef.current) {
          setIsListening(false)
          return
        }
        scheduleRestart(recognition)
      }

      recognition.onerror = (event) => {
        const code = event?.error
        if (code === 'no-speech' || code === 'aborted') {
          if (shouldRunRef.current) scheduleRestart(recognition)
          return
        }
        if (FATAL_ERRORS.has(code)) {
          shouldRunRef.current = false
          setIsListening(false)
          return
        }
        if (shouldRunRef.current) scheduleRestart(recognition)
      }
    },
    [scheduleRestart, syncDisplay],
  )

  const createRecognition = useCallback(() => {
    const SpeechRecognition = getSpeechRecognitionConstructor()
    if (!SpeechRecognition) return null

    engineKindRef.current = getSpeechEngineKind()
    configRef.current = getEngineConfig(engineKindRef.current)

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = configRef.current.lang
    recognition.maxAlternatives = 1
    bindRecognition(recognition)
    return recognition
  }, [bindRecognition])

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported())
    return () => {
      shouldRunRef.current = false
      clearRestartTimer()
      const rec = recognitionRef.current
      if (rec) {
        try {
          rec.abort()
        } catch {
          /* ignore */
        }
      }
      recognitionRef.current = null
    }
  }, [clearRestartTimer])

  const reset = useCallback(() => {
    shouldRunRef.current = false
    clearRestartTimer()
    const rec = recognitionRef.current
    if (rec) {
      try {
        rec.abort()
      } catch {
        /* ignore */
      }
    }
    recognitionRef.current = null
    finalRef.current = ''
    setTranscript('')
    setInterimTranscript('')
    setIsListening(false)
  }, [clearRestartTimer])

  const start = useCallback(() => {
    if (!getSpeechRecognitionConstructor()) return false

    shouldRunRef.current = true
    finalRef.current = ''
    setTranscript('')
    setInterimTranscript('')
    clearRestartTimer()

    let recognition = recognitionRef.current
    if (!recognition) {
      recognition = createRecognition()
      if (!recognition) return false
      recognitionRef.current = recognition
    }

    try {
      recognition.start()
      setIsListening(true)
      return true
    } catch {
      recognitionRef.current = null
      recognition = createRecognition()
      if (!recognition) return false
      recognitionRef.current = recognition
      const { retryDelayMs } = configRef.current
      restartTimerRef.current = setTimeout(() => {
        if (!shouldRunRef.current) return
        try {
          recognition.start()
          setIsListening(true)
        } catch {
          shouldRunRef.current = false
          setIsListening(false)
        }
      }, retryDelayMs)
      return true
    }
  }, [clearRestartTimer, createRecognition])

  const stop = useCallback(() => {
    shouldRunRef.current = false
    clearRestartTimer()

    setInterimTranscript((interim) => {
      flushInterimIntoFinal(finalRef, interim)
      setTranscript(finalRef.current.trim())
      return ''
    })

    const recognition = recognitionRef.current
    if (recognition) {
      try {
        recognition.stop()
      } catch {
        try {
          recognition.abort()
        } catch {
          /* ignore */
        }
      }
    }
    setIsListening(false)
  }, [clearRestartTimer])

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
