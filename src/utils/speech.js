import { getSpeechSpeed } from './speechRate'
import { getSpeechRateForVoice, resolveVoice } from './voice'

function effectiveRate(voice) {
  return getSpeechRateForVoice(voice) * getSpeechSpeed()
}

const PREVIEW = 'Hello. I am here to help you practice natural US English.'

function createUtterance(text, voice) {
  const utterance = new SpeechSynthesisUtterance(text)
  if (voice) {
    utterance.voice = voice
    utterance.lang = voice.lang
  } else {
    utterance.lang = 'en-US'
  }
  utterance.rate = effectiveRate(voice)
  utterance.pitch = 1
  utterance.volume = 1
  return utterance
}

function speakUtterance(utterance) {
  const run = () => {
    const voice = resolveVoice()
    if (voice) {
      utterance.voice = voice
      utterance.lang = voice.lang
      utterance.rate = effectiveRate(voice)
    }
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', run, { once: true })
  } else {
    run()
  }
}

export function speakText(text, { preview = false } = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  if (!preview && !text) return
  speakUtterance(createUtterance(preview ? PREVIEW : text, resolveVoice()))
}

export function previewSpeech() {
  speakText('', { preview: true })
}

export function previewVoice(voiceURI) {
  if (!voiceURI || typeof window === 'undefined' || !window.speechSynthesis) return

  const voice = window.speechSynthesis.getVoices().find((v) => v.voiceURI === voiceURI)
  speakUtterance(createUtterance(PREVIEW, voice || resolveVoice()))
}
