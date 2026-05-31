const STORAGE_KEY = 'speechSpeed'

export const SPEECH_SPEED_OPTIONS = [
  { value: 0.75, label: '0.75×' },
  { value: 1, label: '1×' },
  { value: 1.25, label: '1.25×' },
]

const ALLOWED = SPEECH_SPEED_OPTIONS.map((o) => o.value)

export function getSpeechSpeed() {
  const raw = parseFloat(localStorage.getItem(STORAGE_KEY))
  return ALLOWED.includes(raw) ? raw : 1
}

export function setSpeechSpeed(value) {
  if (!ALLOWED.includes(value)) return
  localStorage.setItem(STORAGE_KEY, String(value))
  window.dispatchEvent(new Event('speechspeedchange'))
}

export function subscribeSpeechSpeed(callback) {
  const handler = () => callback(getSpeechSpeed())
  window.addEventListener('speechspeedchange', handler)
  return () => window.removeEventListener('speechspeedchange', handler)
}
