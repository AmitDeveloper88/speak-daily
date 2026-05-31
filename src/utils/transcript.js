/** Merge two speech segments without repeating the same phrase. */
export function mergeSpeechSegments(committed, segment) {
  const c = (committed || '').trim()
  const s = (segment || '').trim()
  if (!s) return c
  if (!c) return s
  if (s.startsWith(c)) return s
  if (c.startsWith(s)) return c
  if (c.includes(s)) return c
  if (s.includes(c)) return s
  return `${c} ${s}`.trim()
}

/** Pick the longest transcript slice (Chrome often resends full phrase). */
export function pickBestFromResults(results) {
  if (!results?.length) return ''
  let best = ''
  for (let i = 0; i < results.length; i++) {
    const t = (results[i][0]?.transcript || '').trim()
    if (t.length > best.length) best = t
  }
  return best
}

/** Clean stutter / doubled words from mobile speech recognition. */
export function dedupeSpokenText(text) {
  if (!text) return ''
  let s = text.replace(/\s+/g, ' ').trim()

  const words = s.split(' ')
  const out = []
  for (const w of words) {
    const prev = out[out.length - 1]
    if (prev && prev.toLowerCase() === w.toLowerCase()) continue
    out.push(w)
  }
  s = out.join(' ')

  while (s.length > 6) {
    let shortened = false
    for (let len = Math.min(40, Math.floor(s.length / 2)); len >= 3; len--) {
      const chunk = s.slice(0, len)
      if (s.startsWith(chunk + chunk)) {
        s = s.slice(len).trim()
        shortened = true
        break
      }
    }
    if (!shortened) break
  }

  return s.trim()
}
