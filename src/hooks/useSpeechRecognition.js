import { useCallback, useEffect, useRef, useState } from 'react'

export function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function isSpeechRecognitionSupported() {
  return !!getSpeechRecognitionConstructor()
}

function isMobileBrowser() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function mapSpeechError(event) {
  const code = event?.error
  if (code === 'not-allowed' || code === 'service-not-allowed') {
    return 'Microphone blocked. Allow mic for this site in Chrome settings.'
  }
  if (code === 'no-speech') {
    return 'No speech heard. Speak closer to the mic and try again.'
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
    setError('')
    setIsListening(false)
  }, [])

  const start = useCallback(() => {
    const SpeechRecognition = getSpeechRecognitionConstructor()
    if (!SpeechRecognition) {
      setError(
        'Speech-to-text is not available in this browser. On Android, try Microsoft Edge, or practice by speaking aloud.'
      )
      return false
    }

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
    setError('')

    const recognition = new SpeechRecognition()
    const mobile = isMobileBrowser()
    recognition.lang = mobile ? 'en-US' : 'en-IN'
    recognition.interimResults = true
    recognition.continuous = !mobile
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
      const message = mapSpeechError(event)
      if (message) setError(message)
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
      setError('Could not start microphone. Tap the mic again.')
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
    error,
    start,
    stop,
    reset,
  }
}
