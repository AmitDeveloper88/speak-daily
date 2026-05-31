/** Fix "earlier.I'm" → "earlier. I'm" and collapse extra spaces. */
export function normalizeSpeechText(text) {
  return (text || '')
    .replace(/([.!?])([A-Za-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Light cleanup for STT stutter like "will will". */
export function collapseRepeatedWords(text) {
  return (text || '').replace(/\b(\w+)(\s+\1\b)+/gi, '$1')
}

function words(text) {
  return normalizeSpeechText(text).split(/\s+/).filter(Boolean)
}

function tailOverlapWordCount(acc, piece) {
  const a = words(acc)
  const p = words(piece)
  const max = Math.min(a.length, p.length)
  for (let len = max; len > 0; len--) {
    const suffix = a.slice(-len).join(' ').toLowerCase()
    const prefix = p.slice(0, len).join(' ').toLowerCase()
    if (suffix === prefix) return len
  }
  return 0
}

function endsWithPhrase(acc, piece) {
  const a = normalizeSpeechText(acc).toLowerCase()
  const p = normalizeSpeechText(piece).toLowerCase()
  if (!p) return true
  return a === p || a.endsWith(p)
}

/** New phrase starts mid-script again (user re-spoke from the top). */
function looksLikeFreshTake(acc, piece) {
  const a = normalizeSpeechText(acc)
  const p = normalizeSpeechText(piece)
  if (a.length < 35 || p.length < 12) return false
  if (tailOverlapWordCount(a, p) >= 2) return false
  if (endsWithPhrase(a, p)) return false

  const pStart = words(p).slice(0, 4).join(' ').toLowerCase()
  if (!pStart) return false

  const aLower = a.toLowerCase()
  const idx = aLower.indexOf(pStart)
  if (idx === -1) return false

  const nearEnd = idx >= aLower.length - pStart.length - 8
  return !nearEnd
}

/**
 * Append a new final/interim chunk without duplicates or out-of-order overlap.
 * Chrome may resend the same final or a cumulative phrase on mic restart.
 */
export function appendSpeechSegment(accumulated, rawPiece) {
  const piece = normalizeSpeechText(rawPiece)
  if (!piece) return normalizeSpeechText(accumulated)

  const acc = normalizeSpeechText(accumulated)
  if (!acc) return piece

  if (acc === piece || endsWithPhrase(acc, piece)) return acc

  if (piece.startsWith(acc)) return piece

  if (acc.startsWith(piece)) return acc

  if (looksLikeFreshTake(acc, piece)) return piece

  const overlap = tailOverlapWordCount(acc, piece)
  if (overlap > 0) {
    const rest = words(piece).slice(overlap).join(' ')
    if (!rest) return acc
    return `${acc} ${rest}`.trim()
  }

  const accLower = acc.toLowerCase()
  const pieceLower = piece.toLowerCase()
  if (accLower.includes(pieceLower) && !accLower.endsWith(pieceLower)) {
    return acc
  }

  const sep = /[.!?]$/.test(acc) ? ' ' : ' '
  return `${acc}${sep}${piece}`.trim()
}
