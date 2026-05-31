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

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function buildTranscriptText(speech) {
  if (!speech.isSupported || speech.manualPractice) {
    return ''
  }
  return dedupeSpokenText(speech.transcript || speech.liveTranscript || '')
}

export default function SpeakingTask() {
  const { id } = useParams()
  const navigate = useNavigate()
  const topic = getTopicById(id)

  const [phase, setPhase] = useState('idle')
  const [seconds, setSeconds] = useState(0)
  const [finalTranscript, setFinalTranscript] = useState('')
  const [manualTranscript, setManualTranscript] = useState('')

  const timerRef = useRef(null)
  const secondsRef = useRef(0)
  const speechRef = useRef(null)

  const speech = useSpeechRecognition()
  speechRef.current = speech
  const manualMode = speech.manualPractice

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

  const completePractice = (answerText) => {
    setFinalTranscript(answerText)
    setPhase('done')
    markTopicCompleted(topic.id)
    addRecentPractice({ id: topic.id, title: topic.title })
  }

  const finishRecording = () => {
    const s = speechRef.current
    const typed = manualTranscript.trim()

    if (manualMode || !s?.isSupported) {
      completePractice(typed)
      return
    }

    const detected = buildTranscriptText(s)
    if (typed) {
      completePractice(typed)
    } else if (detected) {
      completePractice(detected)
    } else {
      setFinalTranscript('')
      setPhase('done')
      markTopicCompleted(topic.id)
      addRecentPractice({ id: topic.id, title: topic.title })
    }
  }

  const handleStop = () => {
    clearTimer()
    speech.stop()
    if (secondsRef.current > 0) addPracticeTimeSeconds(secondsRef.current)

    if (manualMode) {
      finishRecording()
      return
    }

    setTimeout(finishRecording, TRANSCRIPT_DELAY_MS)
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
    setPhase('idle')
  }

  const handleSaveManual = () => {
    const text = manualTranscript.trim()
    if (!text) return
    completePractice(text)
  }

  const isListening = phase === 'listening'
  const isDone = phase === 'done'
  const showTypeBox = isDone && (manualMode || !finalTranscript)
  const showAnswer = isDone && finalTranscript && !showTypeBox

  const youSaidText = isDone
    ? finalTranscript
    : isListening
      ? manualMode
        ? 'Speak aloud in English. Timer is running — type your answer after Stop.'
        : speech.liveTranscript || 'Listening… speak clearly in English'
      : manualMode
        ? 'Tap mic to start the timer. Speak, then type what you said.'
        : 'Tap the mic and speak. Your words will show here live.'

  return (
    <AppShell showNav={false}>
      <div className="px-4 pt-1 pb-6">
        <Header title="Speaking Task" showHome />

        <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
          <p className="font-medium text-gray-900 dark:text-gray-100">{topic.speakingTask}</p>
        </div>

        {phase === 'idle' && manualMode && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <strong>Chrome on phone:</strong> live speech-to-text is not reliable. Use the
            timer, speak aloud, then <strong>type your answer</strong> after you tap Stop. For
            live captions, try <strong>Microsoft Edge</strong> on the same link.
          </p>
        )}

        {phase === 'idle' && !manualMode && !speech.isSupported && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            Live captions are not supported here. Practice aloud, then type your answer.
          </p>
        )}

        {!manualMode && speech.error && (
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
            {youSaidText || (showTypeBox ? 'Type your answer below.' : '')}
          </p>
        </div>

        {showTypeBox && (
          <div className="mb-4 rounded-2xl border border-primary/30 bg-white p-4 dark:border-primary/40 dark:bg-gray-800">
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">
              Type what you said (English)
            </label>
            <textarea
              value={manualTranscript}
              onChange={(e) => setManualTranscript(e.target.value)}
              rows={5}
              autoFocus
              placeholder="Example: Hello, my name is Rahul. I am from Delhi…"
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
            <Button onClick={handleSaveManual} className="mt-3" disabled={!manualTranscript.trim()}>
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
                aria-label={isListening ? 'Recording' : 'Start practice'}
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
                  ? manualMode
                    ? 'Speak now — tap Stop when finished'
                    : 'Speak in English, then tap Stop Recording'
                  : manualMode
                    ? 'Tap mic to start practice timer'
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

        {showAnswer && (
          <div className="space-y-3">
            <Button onClick={handleTryAgain}>Try Again</Button>
            <Button variant="outline" onClick={() => navigate('/topics')}>
              Back to Topics
            </Button>
          </div>
        )}

        {showTypeBox && (
          <div className="mt-3 space-y-3">
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
