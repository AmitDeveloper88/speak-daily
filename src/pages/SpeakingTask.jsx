import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Mic, Square, Volume2 } from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import Button from '../components/Button'
import { getTopicById } from '../data/content'
import { speakText } from '../utils/speech'
import {
  addPracticeTimeSeconds,
  addRecentPractice,
  markTopicCompleted,
} from '../utils/storage'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { dedupeSpokenText } from '../utils/transcript'

const MAX_SECONDS = 60
const TRANSCRIPT_DELAY_MS = 450
const TRANSCRIPT_DELAY_MOBILE_MS = 1000

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function buildTranscriptText(speech) {
  if (!speech.isSupported) {
    return ''
  }
  return dedupeSpokenText(speech.transcript || speech.liveTranscript || '')
}

function needsManualTranscript(text) {
  return !text || text.length < 2
}

export default function SpeakingTask() {
  const { id } = useParams()
  const navigate = useNavigate()
  const topic = getTopicById(id)

  const [phase, setPhase] = useState('idle')
  const [seconds, setSeconds] = useState(0)
  const [finalTranscript, setFinalTranscript] = useState('')
  const [manualTranscript, setManualTranscript] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)

  const timerRef = useRef(null)
  const secondsRef = useRef(0)
  const speechRef = useRef(null)

  const speech = useSpeechRecognition()
  speechRef.current = speech

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  if (!topic) {
    return (
      <AppShell showNav={false}>
        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
          Topic not found.
        </div>
      </AppShell>
    )
  }

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const finishRecording = () => {
    const s = speechRef.current
    if (!s) return

    const detected = buildTranscriptText(s)
    const manual = manualTranscript.trim()

    if (manual) {
      setFinalTranscript(manual)
      setShowManualInput(false)
    } else if (needsManualTranscript(detected)) {
      setFinalTranscript('')
      setShowManualInput(true)
    } else {
      setFinalTranscript(detected)
      setShowManualInput(false)
    }

    setPhase('done')
    markTopicCompleted(topic.id)
    addRecentPractice({
      id: topic.id,
      title: topic.title,
    })
  }

  const handleStop = () => {
    clearTimer()
    speech.stop()
    if (secondsRef.current > 0) addPracticeTimeSeconds(secondsRef.current)
    const delay = speechRef.current?.isMobileMode
      ? TRANSCRIPT_DELAY_MOBILE_MS
      : TRANSCRIPT_DELAY_MS
    setTimeout(finishRecording, delay)
  }

  const startTimer = () => {
    clearTimer()
    secondsRef.current = 0
    setSeconds(0)
    timerRef.current = setInterval(() => {
      secondsRef.current += 1
      setSeconds(secondsRef.current)
      if (secondsRef.current >= MAX_SECONDS) {
        handleStop()
      }
    }, 1000)
  }

  const handleStart = () => {
    setFinalTranscript('')
    setManualTranscript('')
    setShowManualInput(false)
    setPhase('listening')
    speech.start()
    startTimer()
  }

  const handleTryAgain = () => {
    clearTimer()
    speech.reset()
    secondsRef.current = 0
    setSeconds(0)
    setFinalTranscript('')
    setManualTranscript('')
    setShowManualInput(false)
    setPhase('idle')
  }

  const handleSaveManual = () => {
    const text = manualTranscript.trim()
    if (!text) return
    setFinalTranscript(text)
    setShowManualInput(false)
  }

  const isListening = phase === 'listening'
  const isDone = phase === 'done'

  const youSaidText = isDone
    ? finalTranscript ||
      (showManualInput
        ? 'Mic could not catch speech on this phone. Type what you said below.'
        : 'We could not detect your speech. Type what you said below.')
    : isListening
      ? speech.isMobileMode
        ? 'Recording… speak in English. Tap Stop when finished.'
        : speech.liveTranscript || 'Listening… speak clearly in English'
      : 'Tap the mic and speak. Your words will show here live.'

  return (
    <AppShell showNav={false}>
      <div className="px-4 pt-1 pb-6">
        <Header title="Speaking Task" showHome />

        <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
          <p className="font-medium text-gray-900 dark:text-gray-100">{topic.speakingTask}</p>
        </div>

        {phase === 'idle' && (speech.isMobileMode || !speech.isSupported) && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {!speech.isSupported ? (
              <>
                Live captions are not supported here. Practice aloud, then type your
                answer after you stop.
              </>
            ) : (
              <>
                Tip: allow microphone. On Android, <strong>Edge</strong> often works better
                than Chrome. If text repeats or stops, tap Stop and type your answer below.
              </>
            )}
          </p>
        )}

        {speech.error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {speech.error}
          </p>
        )}

        <div className="relative mb-4 rounded-2xl border border-green-100 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/40">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h2 className="font-bold text-gray-900 dark:text-gray-100">Model Answer</h2>
            <button
              type="button"
              onClick={() => speakText(topic.modelAnswer)}
              className="shrink-0 rounded-full bg-green-200 p-2 text-green-800 dark:bg-green-900 dark:text-green-200"
              aria-label="Listen to model answer"
            >
              <Volume2 size={20} />
            </button>
          </div>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
            {topic.modelAnswer}
          </p>
        </div>

        <div
          className={`mb-4 rounded-2xl border p-4 ${
            isListening
              ? 'border-primary/30 bg-blue-50 dark:bg-blue-950/40'
              : 'border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40'
          }`}
        >
          <h2 className="mb-2 font-bold text-gray-900 dark:text-gray-100">You Said</h2>
          <p
            className={`text-sm leading-relaxed ${
              isListening && !speech.liveTranscript
                ? 'italic text-gray-500 dark:text-gray-400'
                : 'text-gray-800 dark:text-gray-200'
            }`}
          >
            {youSaidText}
          </p>
        </div>

        {(showManualInput || (isDone && needsManualTranscript(finalTranscript))) && (
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">
              Type what you said (English)
            </label>
            <textarea
              value={manualTranscript}
              onChange={(e) => setManualTranscript(e.target.value)}
              rows={4}
              placeholder="Type your spoken answer here…"
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
            <Button onClick={handleSaveManual} className="mt-3">
              Save answer
            </Button>
          </div>
        )}

        {!isDone && (
          <>
            <div className="mb-4 flex flex-col items-center">
              <button
                type="button"
                onClick={isListening ? undefined : handleStart}
                disabled={isListening}
                className={`flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition ${
                  isListening
                    ? 'animate-pulse bg-red-500 text-white'
                    : 'bg-primary text-white active:scale-95'
                }`}
                aria-label={isListening ? 'Listening' : 'Start recording'}
              >
                {isListening ? (
                  <Square size={36} fill="currentColor" />
                ) : (
                  <Mic size={40} />
                )}
              </button>
              <p className="mt-4 font-mono text-lg text-gray-700 dark:text-gray-300">
                {formatTime(seconds)} / {formatTime(MAX_SECONDS)}
              </p>
              <p className="mt-1 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                {isListening
                  ? 'Speak in English, then tap Stop Recording'
                  : 'Tap mic — allow microphone when asked'}
              </p>
            </div>

            {isListening && (
              <Button onClick={handleStop} className="mb-4">
                Stop Recording
              </Button>
            )}
          </>
        )}

        {isDone && !showManualInput && finalTranscript && (
          <div className="space-y-3">
            <Button onClick={handleTryAgain}>Try Again</Button>
            <Button variant="outline" onClick={() => navigate('/topics')}>
              Back to Topics
            </Button>
          </div>
        )}

        {isDone && (showManualInput || !finalTranscript) && (
          <div className="space-y-3">
            <Button variant="outline" onClick={handleTryAgain}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/topics')}>
              Back to Topics
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
