import { useState } from 'react'
import { Moon, Volume2, Check, Play, Gauge } from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import { useTheme } from '../hooks/useTheme'
import { useVoice } from '../hooks/useVoice'
import { useSpeechRate } from '../hooks/useSpeechRate'
import { previewSpeech, previewVoice } from '../utils/speech'
import { SPEECH_SPEED_OPTIONS } from '../utils/speechRate'
import { isRecommendedVoice } from '../utils/voice'
import {
  getCompletedTopics,
  getFavoriteTopics,
  getPracticeTimeSeconds,
  formatPracticeTime,
} from '../utils/storage'
import { speakingTopics } from '../data/content'

export default function Profile() {
  const { isDark, toggle } = useTheme()
  const { speed, setSpeed } = useSpeechRate()
  const {
    voices,
    recommendedVoices,
    otherVoices,
    selectedURI,
    selectedLabel,
    naturalAvailable,
    selectVoice,
  } = useVoice()
  const [voicePickerOpen, setVoicePickerOpen] = useState(false)

  const renderVoiceRow = (voice) => {
    const isSelected = voice.voiceURI === selectedURI
    const recommended = isRecommendedVoice(voice)
    return (
      <li key={voice.voiceURI}>
        <div
          className={`flex items-center gap-2 rounded-xl px-2 py-2 ${
            isSelected ? 'bg-blue-50 dark:bg-blue-950/50' : 'hover:bg-white dark:hover:bg-gray-800'
          }`}
        >
          <button
            type="button"
            onClick={() => selectVoice(voice.voiceURI)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                isSelected
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {isSelected && <Check size={12} strokeWidth={3} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {voice.name}
              </span>
              {recommended && (
                <span className="text-xs font-medium text-primary">Recommended</span>
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={() => previewVoice(voice.voiceURI)}
            className="shrink-0 rounded-full p-2 text-primary hover:bg-blue-100 dark:hover:bg-blue-950"
            aria-label={`Preview ${voice.name}`}
          >
            <Play size={16} />
          </button>
        </div>
      </li>
    )
  }

  const topicsPracticed = getCompletedTopics().length
  const favoritesCount = getFavoriteTopics().length
  const practiceTime = formatPracticeTime(getPracticeTimeSeconds())

  return (
    <AppShell>
      <div className="px-4 pt-1 pb-6">
        <Header title="Settings" showBack={false} />

        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Customize your practice experience.
        </p>

        <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {topicsPracticed}/{speakingTopics.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Topics</p>
          </div>
          <div className="text-center border-x border-gray-100 dark:border-gray-700">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{favoritesCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Favorites</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{practiceTime}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Practice</p>
          </div>
        </div>

        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Preferences
        </h2>

        <ul className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <li className="flex items-center gap-3 px-4 py-4">
            <Moon className="shrink-0 text-gray-500 dark:text-gray-400" size={20} />
            <span className="flex-1 font-medium text-gray-900 dark:text-gray-100">Dark mode</span>
            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              onClick={toggle}
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                isDark ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                  isDark ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </li>

          <li className="border-t border-gray-100 px-4 py-4 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Gauge className="shrink-0 text-gray-500 dark:text-gray-400" size={20} />
              <span className="flex-1 font-medium text-gray-900 dark:text-gray-100">Speech speed</span>
            </div>
            <div
              className="mt-3 grid grid-cols-3 gap-2"
              role="group"
              aria-label="Speech speed"
            >
              {SPEECH_SPEED_OPTIONS.map(({ value, label }) => {
                const active = speed === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setSpeed(value)
                      previewSpeech()
                    }}
                    className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                      active
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                    }`}
                    aria-pressed={active}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </li>

          <li className="border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setVoicePickerOpen((open) => !open)}
              className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <Volume2 className="shrink-0 text-gray-500 dark:text-gray-400" size={20} />
              <span className="flex-1 font-medium text-gray-900 dark:text-gray-100">Voice</span>
              <span className="max-w-[40%] truncate text-sm text-gray-500 dark:text-gray-400">
                {selectedLabel}
              </span>
              <span
                className={`text-gray-400 transition dark:text-gray-500 ${voicePickerOpen ? 'rotate-90' : ''}`}
                aria-hidden
              >
                ›
              </span>
            </button>

            {voicePickerOpen && (
              <div className="border-t border-gray-100 bg-gray-50 px-3 py-3 dark:border-gray-700 dark:bg-gray-900/50">
                {!naturalAvailable && (
                  <p className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    Best quality: open this site in <strong>Microsoft Edge</strong> and choose a voice
                    with &quot;Natural&quot; in the name (e.g. Aria, Jenny).
                  </p>
                )}
                <p className="mb-2 px-1 text-xs text-gray-500 dark:text-gray-400">
                  Tap play to preview. We auto-select the best US English voice on your device.
                </p>
                <div className="max-h-72 overflow-y-auto overscroll-contain">
                  {voices.length === 0 && (
                    <p className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400">
                      Loading voices… Refresh if the list stays empty.
                    </p>
                  )}
                  {recommendedVoices.length > 0 && (
                    <>
                      <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Recommended
                      </p>
                      <ul className="mb-3 space-y-1">{recommendedVoices.map(renderVoiceRow)}</ul>
                    </>
                  )}
                  {otherVoices.length > 0 && (
                    <>
                      <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        More voices
                      </p>
                      <ul className="space-y-1">{otherVoices.map(renderVoiceRow)}</ul>
                    </>
                  )}
                </div>
              </div>
            )}
          </li>
        </ul>
      </div>
    </AppShell>
  )
}
