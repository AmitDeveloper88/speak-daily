const STORAGE_KEY = 'ttsVoiceURI'
const USER_LOCKED_KEY = 'ttsVoiceUserLocked'
const PREF_VERSION_KEY = 'ttsVoicePrefVersion'
const PREF_VERSION = '3'

/** Higher = better. First match wins for tie-breaking. */
const VOICE_PRIORITY = [
  { pattern: /microsoft aria.*natural.*\(united states\)/i, score: 200 },
  { pattern: /microsoft jenny.*natural.*\(united states\)/i, score: 195 },
  { pattern: /microsoft guy.*natural.*\(united states\)/i, score: 190 },
  { pattern: /microsoft andrew.*natural.*\(united states\)/i, score: 185 },
  { pattern: /microsoft ana.*natural.*\(united states\)/i, score: 180 },
  { pattern: /google.*us english/i, score: 170 },
  { pattern: /microsoft mark.*english \(united states\)/i, score: 120 },
  { pattern: /microsoft zira.*english \(united states\)/i, score: 115 },
  { pattern: /samantha/i, score: 110 },
  { pattern: /microsoft david.*english \(united states\)/i, score: 60 },
  { pattern: /english \(united states\)/i, score: 40 },
]

const LOW_QUALITY = [/compact/i, /espeak/i, /android/i, /heera/i, /ravi/i]

const listeners = new Set()
let voicesCache = []

function isEnUS(voice) {
  const lang = voice.lang.toLowerCase().replace('_', '-')
  return lang === 'en-us' || lang.startsWith('en-us')
}

function isEnglishVoice(voice) {
  return voice.lang.toLowerCase().replace('_', '-').startsWith('en')
}

export function isUserVoiceLocked() {
  return localStorage.getItem(USER_LOCKED_KEY) === '1'
}

export function scoreVoice(voice) {
  if (!isEnUS(voice)) return -1000

  const name = voice.name
  for (const { pattern, score } of VOICE_PRIORITY) {
    if (pattern.test(name)) return score
  }

  let score = 20
  const lower = name.toLowerCase()
  if (lower.includes('natural') || lower.includes('neural') || lower.includes('premium')) score += 80
  if (lower.includes('online')) score += 50
  if (!voice.localService) score += 30
  for (const bad of LOW_QUALITY) {
    if (bad.test(name)) score -= 100
  }
  return score
}

export function isLowQualityVoice(voice) {
  if (!voice || !isEnUS(voice)) return true
  return scoreVoice(voice) < 50
}

export function isRecommendedVoice(voice) {
  return scoreVoice(voice) >= 100
}

function notify() {
  listeners.forEach((fn) => fn())
}

export function loadVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    voicesCache = []
    return voicesCache
  }
  voicesCache = window.speechSynthesis.getVoices()
  return voicesCache
}

function rankVoices(voices) {
  return [...voices].sort((a, b) => {
    const diff = scoreVoice(b) - scoreVoice(a)
    if (diff !== 0) return diff
    return a.name.localeCompare(b.name)
  })
}

export function subscribeVoices(callback) {
  listeners.add(callback)
  const onChange = () => {
    loadVoices()
    applyBestVoiceIfNeeded()
    notify()
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', onChange)
    loadVoices()
    applyBestVoiceIfNeeded()
    window.setTimeout(loadVoices, 150)
    window.setTimeout(() => {
      loadVoices()
      applyBestVoiceIfNeeded()
      notify()
    }, 600)
  }
  return () => {
    listeners.delete(callback)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.removeEventListener('voiceschanged', onChange)
    }
  }
}

export function getEnglishUSVoices() {
  const voices = voicesCache.length ? voicesCache : loadVoices()
  return rankVoices(voices.filter(isEnUS))
}

/** All English voices (mobile often only exposes one generic English voice). */
export function getSelectableVoices() {
  const voices = voicesCache.length ? voicesCache : loadVoices()
  const english = voices.filter(isEnglishVoice)
  const list = english.length > 0 ? english : voices
  return rankVoices(list)
}

export function getRecommendedVoices() {
  const ranked = getSelectableVoices()
  const recommended = ranked.filter(isRecommendedVoice)
  return recommended.length > 0 ? recommended : ranked.slice(0, 3)
}

export function getOtherVoices() {
  const ranked = getSelectableVoices()
  const recommendedURIs = new Set(getRecommendedVoices().map((v) => v.voiceURI))
  return ranked.filter((v) => !recommendedURIs.has(v.voiceURI))
}

export function hasNaturalVoices() {
  return getEnglishUSVoices().some((v) => /natural|neural/i.test(v.name))
}

export function getStoredVoiceURI() {
  return localStorage.getItem(STORAGE_KEY) || ''
}

export function setStoredVoiceURI(voiceURI, { userPick = false } = {}) {
  if (voiceURI) {
    localStorage.setItem(STORAGE_KEY, voiceURI)
    if (userPick) localStorage.setItem(USER_LOCKED_KEY, '1')
  } else {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(USER_LOCKED_KEY)
  }
  window.dispatchEvent(new Event('voicechange'))
}

export function getBestNaturalVoice() {
  return getEnglishUSVoices()[0] || null
}

export function getDefaultVoiceURI() {
  return getBestNaturalVoice()?.voiceURI || ''
}

export function resolveVoice() {
  const voices = voicesCache.length ? voicesCache : loadVoices()
  const stored = getStoredVoiceURI()
  if (stored) {
    const match = voices.find((v) => v.voiceURI === stored)
    if (match && (isUserVoiceLocked() || !isLowQualityVoice(match))) return match
  }
  const best = getSelectableVoices()[0] || getBestNaturalVoice()
  return best
}

export function getVoiceLabel(voice) {
  if (!voice) return 'US English'
  const short = voice.name
    .replace(/Microsoft /i, '')
    .replace(/ - English \(United States\)/i, '')
    .replace(/ \(Natural\)/i, ' Natural')
    .trim()
  return short || 'US English'
}

export function getSpeechRateForVoice(voice) {
  if (!voice) return 0.95
  const name = voice.name.toLowerCase()
  if (name.includes('natural') || name.includes('neural') || !voice.localService) return 1
  if (name.includes('google')) return 0.98
  return 0.94
}

function applyBestVoiceIfNeeded() {
  if (isUserVoiceLocked()) return

  const version = localStorage.getItem(PREF_VERSION_KEY)
  const best = getSelectableVoices()[0] || getBestNaturalVoice()
  if (!best) return

  const stored = getStoredVoiceURI()
  const voices = voicesCache.length ? voicesCache : loadVoices()
  const current = stored ? voices.find((v) => v.voiceURI === stored) : null

  const shouldReset =
    version !== PREF_VERSION ||
    !stored ||
    !current ||
    isLowQualityVoice(current) ||
    scoreVoice(current) < scoreVoice(best)

  if (shouldReset) {
    setStoredVoiceURI(best.voiceURI)
    localStorage.setItem(PREF_VERSION_KEY, PREF_VERSION)
  }
}

export function initVoices() {
  loadVoices()
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      loadVoices()
      applyBestVoiceIfNeeded()
    })
    applyBestVoiceIfNeeded()
    window.setTimeout(() => {
      loadVoices()
      applyBestVoiceIfNeeded()
    }, 300)
  }
}
