const KEY = 'theme'

export function getTheme() {
  const saved = localStorage.getItem(KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return 'dark'
}

export function applyTheme(theme = getTheme()) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function setTheme(theme) {
  localStorage.setItem(KEY, theme)
  applyTheme(theme)
  window.dispatchEvent(new Event('themechange'))
}

export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark')
}

export function subscribeTheme(callback) {
  const handler = () => callback(getTheme())
  window.addEventListener('themechange', handler)
  return () => window.removeEventListener('themechange', handler)
}
