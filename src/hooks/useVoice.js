import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getDefaultVoiceURI,
  getSelectableVoices,
  getOtherVoices,
  getRecommendedVoices,
  getVoiceLabel,
  hasNaturalVoices,
  loadVoices,
  resolveVoice,
  setStoredVoiceURI,
  subscribeVoices,
} from '../utils/voice'

export function useVoice() {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    loadVoices()
    return subscribeVoices(() => setVersion((v) => v + 1))
  }, [])

  useEffect(() => {
    const onVoiceChange = () => setVersion((v) => v + 1)
    window.addEventListener('voicechange', onVoiceChange)
    return () => window.removeEventListener('voicechange', onVoiceChange)
  }, [])

  const voices = useMemo(() => getSelectableVoices(), [version])
  const recommendedVoices = useMemo(() => getRecommendedVoices(), [version])
  const otherVoices = useMemo(() => getOtherVoices(), [version])
  const selectedVoice = useMemo(() => resolveVoice(), [version])
  const selectedURI = selectedVoice?.voiceURI || getDefaultVoiceURI()
  const naturalAvailable = useMemo(() => hasNaturalVoices(), [version])

  const selectVoice = useCallback((voiceURI) => {
    setStoredVoiceURI(voiceURI, { userPick: true })
    setVersion((v) => v + 1)
  }, [])

  return {
    voices,
    recommendedVoices,
    otherVoices,
    selectedVoice,
    selectedURI,
    selectedLabel: getVoiceLabel(selectedVoice),
    naturalAvailable,
    selectVoice,
  }
}
