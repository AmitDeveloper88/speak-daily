const DB_NAME = 'speakdaily-voice-log'
const DB_VERSION = 1
const STORE = 'recordings'
export const PRACTICE_RECORDING_ID = 'practice'

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
  })
}

export function isVoiceLogStorageSupported() {
  return typeof indexedDB !== 'undefined'
}

export async function savePracticeRecording(blob) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put({
      id: PRACTICE_RECORDING_ID,
      blob,
      recordedAt: new Date().toISOString(),
    })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPracticeRecording() {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(PRACTICE_RECORDING_ID)
    req.onsuccess = () => resolve(req.result?.blob ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function getPracticeRecordingMeta() {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(PRACTICE_RECORDING_ID)
    req.onsuccess = () => {
      const row = req.result
      resolve(row ? { recordedAt: row.recordedAt } : null)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function deletePracticeRecording() {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(PRACTICE_RECORDING_ID)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
