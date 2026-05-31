import { useCallback, useEffect, useRef, useState } from 'react'

export function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function isSpeechRecognitionSupported() {
  return !!getSpeechRecognitionConstructor()
}

export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef(null)
  const finalPartsRef = useRef('')

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported())
    return () => {
      recognitionRef.current?.abort()
    }
  }, [])

  const reset = useCallback(() => {
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
    setIsListening(false)
  }, [])

  const start = useCallback(() => {
    const SpeechRecognition = getSpeechRecognitionConstructor()
    if (!SpeechRecognition) return false

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        /* ignore */
      }
    }
    finalPartsRef.current = ''
    setTranscript('')
    setInterimTranscript('')

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = true
    recognition.continuous = true

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

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript((interim) => {
        if (interim) {
          const merged = `${finalPartsRef.current} ${interim}`.trim()
          finalPartsRef.current = merged
          setTranscript(merged)
        }
        return ''
      })
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
      return true
    } catch {
      setIsListening(false)
      return false
    }
  }, [])

  const stop = useCallback(() => {
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
  }, [])

  const liveTranscript = [transcript, interimTranscript].filter(Boolean).join(' ').trim()

  return {
    isSupported,
    isListening,
    transcript: transcript.trim(),
    interimTranscript,
    liveTranscript,
    start,
    stop,
    reset,
  }
}
