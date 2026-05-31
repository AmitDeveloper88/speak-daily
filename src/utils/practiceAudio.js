/** Timeslice for MediaRecorder — steady chunks, fewer level glitches on long takes */
export const RECORD_CHUNK_MS = 1000

/**
 * Mic stream with stable levels. Browsers default AGC/noise suppression often
 * boosts the first seconds then ducks the rest of the recording.
 */
export async function getPracticeMicStream() {
  const base = {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    channelCount: 1,
  }

  try {
    return await navigator.mediaDevices.getUserMedia({ audio: base })
  } catch {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        autoGainControl: false,
      },
    })
  }
}

export function createPracticeMediaRecorder(stream) {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
  let options = undefined
  for (const mimeType of types) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      options = { mimeType, audioBitsPerSecond: 128000 }
      break
    }
  }
  return new MediaRecorder(stream, options)
}

export function stopMediaStream(stream) {
  stream?.getTracks().forEach((track) => track.stop())
}
