const KEYS = {
  completed: 'completedTopics',
  favorites: 'favoriteTopics',
  recent: 'recentPractice',
  practiceTime: 'practiceTime',
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getCompletedTopics() {
  return readJSON(KEYS.completed, [])
}

export function markTopicCompleted(topicId) {
  const list = getCompletedTopics()
  if (!list.includes(topicId)) {
    writeJSON(KEYS.completed, [...list, topicId])
  }
}

export function getPracticeTimeSeconds() {
  return parseInt(localStorage.getItem(KEYS.practiceTime) || '0', 10) || 0
}

export function addPracticeTimeSeconds(seconds) {
  const total = getPracticeTimeSeconds() + seconds
  localStorage.setItem(KEYS.practiceTime, String(total))
  return total
}

export function formatPracticeTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return '0m'
}

export function getFavoriteTopics() {
  return readJSON(KEYS.favorites, [])
}

export function isTopicFavorite(topicId) {
  return getFavoriteTopics().includes(topicId)
}

export function toggleFavoriteTopic(topicId) {
  const list = getFavoriteTopics()
  const next = list.includes(topicId)
    ? list.filter((id) => id !== topicId)
    : [...list, topicId]
  writeJSON(KEYS.favorites, next)
  return next.includes(topicId)
}

export function getRecentPractice() {
  return readJSON(KEYS.recent, [])
}

export function addRecentPractice(item) {
  const list = getRecentPractice().filter((r) => r.id !== item.id)
  const entry = { ...item, practicedAt: new Date().toISOString() }
  writeJSON(KEYS.recent, [entry, ...list].slice(0, 10))
}
