import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import Button from '../components/Button'
import {
  createPracticeMediaRecorder,
  getPracticeMicStream,
  RECORD_CHUNK_MS,
  stopMediaStream,
} from '../utils/practiceAudio'
import {
  deletePracticeRecording,
  getPracticeRecording,
  getPracticeRecordingMeta,
  isVoiceLogStorageSupported,
  savePracticeRecording,
} from '../utils/voiceLogStorage'

const MAX_SECONDS = 300

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatRecordedAt(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function VoiceLog() {
  const storageOk = isVoiceLogStorageSupported()
  const [hasRecording, setHasRecording] = useState(false)
  const [recordedAt, setRecordedAt] = useState('')
  const [phase, setPhase] = useState('idle')
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')
  const [playing, setPlaying] = useState(false)

  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const mimeTypeRef = useRef('audio/webm')
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const audioRef = useRef(null)
  const objectUrlRef = useRef(null)

  const isRecording = phase === 'recording'

  useEffect(() => {
    if (!storageOk) return
    let cancelled = false
    getPracticeRecordingMeta().then((meta) => {
      if (cancelled || !meta) return
      setHasRecording(true)
      setRecordedAt(meta.recordedAt)
    })
    return () => {
      cancelled = true
      if (timerRef.current) clearInterval(timerRef.current)
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      audioRef.current?.pause()
      if (recorderRef.current?.state === 'recording') {
        try {
          recorderRef.current.stop()
        } catch {
          /* ignore */
        }
      }
      stopMediaStream(streamRef.current)
    }
  }, [storageOk])

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const stopRecording = () => {
    clearTimer()
    const recorder = recorderRef.current
    if (recorder?.state === 'recording') {
      try {
        recorder.requestData()
      } catch {
        /* ignore */
      }
      recorder.stop()
    }
  }

  const startRecording = async () => {
    setError('')
    if (!storageOk) {
      setError('This browser cannot save recordings. Use Chrome or Edge.')
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Microphone is not available in this browser.')
      return
    }
    if (!window.MediaRecorder) {
      setError('Voice recording is not supported here. Try Chrome or Edge.')
      return
    }

    try {
      const stream = await getPracticeMicStream()
      streamRef.current = stream
      chunksRef.current = []

      const recorder = createPracticeMediaRecorder(stream)
      mimeTypeRef.current = recorder.mimeType || 'audio/webm'
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = async () => {
        stopMediaStream(stream)
        streamRef.current = null

        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current })
        chunksRef.current = []

        if (blob.size < 1) {
          setPhase('idle')
          setSeconds(0)
          setError('No audio captured. Please try again.')
          return
        }

        try {
          await savePracticeRecording(blob)
          const meta = await getPracticeRecordingMeta()
          setHasRecording(true)
          setRecordedAt(meta?.recordedAt || new Date().toISOString())
          setPhase('idle')
          setSeconds(0)
        } catch {
          setPhase('idle')
          setSeconds(0)
          setError('Could not save recording. Please try again.')
        }
      }

      recorderRef.current = recorder
      recorder.start(RECORD_CHUNK_MS)
      setPhase('recording')
      setSeconds(0)
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          const next = s + 1
          if (next >= MAX_SECONDS) {
            stopRecording()
            return MAX_SECONDS
          }
          return next
        })
      }, 1000)
    } catch {
      setError('Microphone permission denied. Allow mic for this site.')
    }
  }

  const playRecording = async () => {
    setError('')
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    audioRef.current?.pause()

    try {
      const blob = await getPracticeRecording()
      if (!blob) {
        setHasRecording(false)
        setError('Recording not found. Please record again.')
        return
      }
      const url = URL.createObjectURL(blob)
      objectUrlRef.current = url
      const audio = new Audio(url)
      audio.volume = 1
      audioRef.current = audio
      audio.onended = () => {
        setPlaying(false)
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
        audioRef.current = null
      }
      audio.onerror = () => {
        setPlaying(false)
        setError('Could not play recording.')
      }
      await audio.play()
      setPlaying(true)
    } catch {
      setError('Could not play recording.')
    }
  }

  const stopPlayback = () => {
    audioRef.current?.pause()
    audioRef.current = null
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = null
    setPlaying(false)
  }

  const handleDelete = async () => {
    stopPlayback()
    try {
      await deletePracticeRecording()
      setHasRecording(false)
      setRecordedAt('')
      setError('')
    } catch {
      setError('Could not delete recording.')
    }
  }

  return (
    <AppShell>
      <div className="px-4 pb-6">
        <Header title="Voice Practice" showHome />

        <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            Practice your speaking
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Record your voice and listen back. Up to 5 minutes.
          </p>
        </div>

        {!storageOk && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            This browser cannot save voice recordings. Please use Chrome or Edge.
          </p>
        )}

        <div
          className={`rounded-2xl border p-5 ${
            isRecording
              ? 'border-primary/40 bg-blue-50 dark:border-primary/30 dark:bg-blue-950/40'
              : 'border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'
          }`}
        >
          {error && (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              {error}
            </p>
          )}

          {isRecording ? (
            <div className="mb-5 flex flex-col items-center">
              <button
                type="button"
                onClick={stopRecording}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-red-500 text-white shadow-lg animate-pulse"
                aria-label="Stop recording"
              >
                <Square size={36} fill="currentColor" />
              </button>
              <p className="mt-4 font-mono text-lg text-gray-800 dark:text-gray-200">
                {formatTime(seconds)} / {formatTime(MAX_SECONDS)}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Recording…</p>
            </div>
          ) : (
            <div className="mb-5 flex flex-col items-center">
              <button
                type="button"
                disabled={!storageOk}
                onClick={startRecording}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-white shadow-lg transition active:scale-95 disabled:opacity-50"
                aria-label="Start recording"
              >
                <Mic size={40} />
              </button>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Tap to record
              </p>
            </div>
          )}

          {hasRecording && !isRecording && recordedAt && (
            <p className="mb-4 text-center text-sm text-green-700 dark:text-green-300">
              Saved · {formatRecordedAt(recordedAt)}
            </p>
          )}

          {hasRecording && !isRecording && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 min-w-[120px]"
                disabled={!storageOk || playing}
                onClick={playing ? stopPlayback : playRecording}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {playing ? <Pause size={18} /> : <Play size={18} />}
                  {playing ? 'Stop' : 'Listen'}
                </span>
              </Button>
              <button
                type="button"
                disabled={playing}
                onClick={handleDelete}
                className="rounded-xl border border-gray-200 p-3 text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                aria-label="Delete recording"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}

          {isRecording && (
            <Button type="button" onClick={stopRecording}>
              Stop Recording
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  )
}
