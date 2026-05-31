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

function mapSpeechError(event) {
  const code = event?.error
  if (code === 'not-allowed' || code === 'service-not-allowed') {
    return 'Microphone blocked. Allow mic for this site in Chrome settings.'
  }
  if (code === 'no-speech') {
    return ''
  }
  if (code === 'network') {
    return 'Speech recognition needs internet. Check your connection.'
  }
  if (code === 'aborted') return ''
  return code ? `Speech error: ${code}` : 'Speech recognition failed. Try again.'
}

export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)
  const finalPartsRef = useRef('')
  const sessionActiveRef = useRef(false)
  const restartTimerRef = useRef(null)

  const mergeInterimIntoFinal = useCallback(() => {
    setInterimTranscript((interim) => {
      if (interim) {
        const merged = `${finalPartsRef.current} ${interim}`.trim()
        finalPartsRef.current = merged
        setTranscript(merged)
      }
      return ''
    })
  }, [])

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
  }, [])

  const beginRecognition = useCallback(() => {
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
    recognition.interimResults = true
    recognition.continuous = true
    recognition.maxAlternatives = 1

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

    recognition.onerror = (event) => {
      const code = event?.error
      if (sessionActiveRef.current && (code === 'no-speech' || code === 'aborted')) {
        return
      }
      const message = mapSpeechError(event)
      if (message) setError(message)
      if (!sessionActiveRef.current) setIsListening(false)
    }

    recognition.onend = () => {
      mergeInterimIntoFinal()
      recognitionRef.current = null

      if (!sessionActiveRef.current) {
        setIsListening(false)
        return
      }

      clearRestartTimer()
      restartTimerRef.current = setTimeout(() => {
        if (sessionActiveRef.current) beginRecognition()
      }, 280)
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
      return true
    } catch {
      if (sessionActiveRef.current) {
        clearRestartTimer()
        restartTimerRef.current = setTimeout(() => beginRecognition(), 400)
      }
      return false
    }
  }, [clearRestartTimer, mergeInterimIntoFinal])

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
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        /* already stopped */
      }
      recognitionRef.current = null
    }
    finalPartsRef.current = ''
    setTranscript('')
    setInterimTranscript('')
    setError('')
    setIsListening(false)
  }, [clearRestartTimer])

  const start = useCallback(() => {
    const SpeechRecognition = getSpeechRecognitionConstructor()
    if (!SpeechRecognition) {
      setError(
        'Speech-to-text is not available in this browser. On Android, try Microsoft Edge, or type what you said after recording.'
      )
      return false
    }

    sessionActiveRef.current = true
    finalPartsRef.current = ''
    setTranscript('')
    setInterimTranscript('')
    setError('')

    return beginRecognition()
  }, [beginRecognition])

  const stop = useCallback(() => {
    sessionActiveRef.current = false
    clearRestartTimer()
    mergeInterimIntoFinal()

    const recognition = recognitionRef.current
    if (!recognition) {
      setIsListening(false)
      return
    }
    try {
      recognition.stop()
    } catch {
      recognition.abort()
    }
    recognitionRef.current = null
    setIsListening(false)
  }, [clearRestartTimer, mergeInterimIntoFinal])

  const liveTranscript = [transcript, interimTranscript].filter(Boolean).join(' ').trim()

  return {
    isSupported,
    isListening,
    transcript: transcript.trim(),
    interimTranscript,
    liveTranscript,
    error,
    start,
    stop,
    reset,
  }
}
