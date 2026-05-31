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

const MAX_SECONDS = 60
const TRANSCRIPT_DELAY_MS = 450

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function buildTranscriptText(speech) {
  if (!speech.isSupported) {
    return 'Speech recognition is not supported in this browser. You can still practice by speaking aloud.'
  }
  const text = (speech.transcript || speech.liveTranscript || '').trim()
  return text || 'We could not detect your speech. Please try again.'
}

export default function SpeakingTask() {
  const { id } = useParams()
  const navigate = useNavigate()
  const topic = getTopicById(id)

  const [phase, setPhase] = useState('idle')
  const [seconds, setSeconds] = useState(0)
  const [finalTranscript, setFinalTranscript] = useState('')
  const [mediaUnavailable, setMediaUnavailable] = useState(false)

  const timerRef = useRef(null)
  const secondsRef = useRef(0)
  const mediaRef = useRef(null)
  const speechRef = useRef(null)

  const speech = useSpeechRecognition()
  speechRef.current = speech

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRef.current?.state === 'recording') mediaRef.current.stop()
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

  const stopMediaRecorder = () => {
    if (mediaRef.current?.state === 'recording') {
      mediaRef.current.stop()
    }
    mediaRef.current = null
  }

  const finishRecording = () => {
    const s = speechRef.current
    if (!s) return
    setFinalTranscript(buildTranscriptText(s))
    setPhase('done')
    markTopicCompleted(topic.id)
    addRecentPractice({
      id: topic.id,
      title: topic.title,
    })
  }

  const handleStop = () => {
    clearTimer()
    stopMediaRecorder()
    speech.stop()
    if (secondsRef.current > 0) addPracticeTimeSeconds(secondsRef.current)
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

  const startMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      recorder.onstop = () => stream.getTracks().forEach((t) => t.stop())
      mediaRef.current = recorder
      recorder.start()
      setMediaUnavailable(false)
    } catch {
      setMediaUnavailable(true)
    }
  }

  const handleStart = async () => {
    setFinalTranscript('')
    setPhase('listening')
    await startMediaRecorder()
    speech.start()
    startTimer()
  }

  const handleTryAgain = () => {
    clearTimer()
    stopMediaRecorder()
    speech.reset()
    secondsRef.current = 0
    setSeconds(0)
    setFinalTranscript('')
    setPhase('idle')
    setMediaUnavailable(false)
  }

  const isListening = phase === 'listening'
  const isDone = phase === 'done'

  const youSaidText = isDone
    ? finalTranscript
    : isListening
      ? speech.liveTranscript || 'Listening... start speaking'
      : finalTranscript ||
        'Tap the mic and speak. Your words will show here live.'

  return (
    <AppShell showNav={false}>
      <div className="px-4 pt-1">
        <Header title="Speaking Task" showHome />

        <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
          <p className="font-medium text-gray-900 dark:text-gray-100">{topic.speakingTask}</p>
        </div>

        {!speech.isSupported && phase === 'idle' && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            Speech recognition is not supported in this browser. You can still
            practice by speaking aloud.
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
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {isListening
                  ? mediaUnavailable
                    ? 'Listening... (mic only for practice)'
                    : 'Listening...'
                  : 'Tap the mic to start recording'}
              </p>
            </div>

            {isListening && (
              <Button onClick={handleStop} className="mb-4">
                Stop Recording
              </Button>
            )}
          </>
        )}

        {isDone && (
          <div className="space-y-3">
            <Button onClick={handleTryAgain}>Try Again</Button>
            <Button variant="outline" onClick={() => navigate('/topics')}>
              Back to Topics
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
