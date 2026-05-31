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

/** Chrome often sends the full phrase as interim — avoid doubling with final text. */
export function combineFinalAndInterim(final, interim) {
  const f = (final || '').trim()
  const i = (interim || '').trim()
  if (!i) return f
  if (!f) return i
  if (i.startsWith(f) || i.includes(f)) return i
  return `${f} ${i}`.trim()
}

function parseResultList(results) {
  let final = ''
  let interim = ''

  for (let i = 0; i < results.length; i++) {
    const text = results[i][0].transcript
    if (results[i].isFinal) {
      final += text
    } else {
      interim = text
    }
  }

  return { final, interim }
}

export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)
  const sessionActiveRef = useRef(false)

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported())
    return () => {
      sessionActiveRef.current = false
      recognitionRef.current?.abort()
    }
  }, [])

  const reset = useCallback(() => {
    sessionActiveRef.current = false
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        /* already stopped */
      }
      recognitionRef.current = null
    }
    setTranscript('')
    setInterimTranscript('')
    setError('')
    setIsListening(false)
  }, [])

  const start = useCallback(() => {
    const SpeechRecognition = getSpeechRecognitionConstructor()
    if (!SpeechRecognition) {
      setError(
        'Speech-to-text is not available in this browser. Type your answer after recording.'
      )
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
      const { final, interim } = parseResultList(event.results)
      setTranscript(final.trim())
      setInterimTranscript(interim.trim())
    }

    recognition.onerror = (event) => {
      const code = event?.error
      if (code === 'no-speech' || code === 'aborted') return
      const message = mapSpeechError(event)
      if (message) setError(message)
    }

    recognition.onend = () => {
      recognitionRef.current = null
      setIsListening(false)
      if (sessionActiveRef.current) {
        setInterimTranscript((interim) => {
          setTranscript((prev) => combineFinalAndInterim(prev, interim))
          return ''
        })
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
  }, [])

  const stop = useCallback(() => {
    sessionActiveRef.current = false

    setInterimTranscript((interim) => {
      setTranscript((prev) => combineFinalAndInterim(prev, interim))
      return ''
    })

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

  const liveTranscript = combineFinalAndInterim(transcript, interimTranscript)

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
