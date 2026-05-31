const SPEAKING_TAG_ORDER = [
  'Daily Life',
  'Phone',
  'Restaurant',
  'Interview',
  'Office',
  'Travel',
  'Shopping',
  'Health',
  'Customer Care',
  'Personal',
]

const GRAMMAR_TAG_ORDER = [
  'Basic Grammar',
  'Modal Verbs',
  'Conditionals',
  'Speaking Connectors',
]

function sortByTagOrder(items, tagOrder) {
  const tagIndex = Object.fromEntries(tagOrder.map((tag, i) => [tag, i]))
  return [...items]
    .map((item, originalIndex) => ({ item, originalIndex }))
    .sort((a, b) => {
      const tagDiff =
        (tagIndex[a.item.tag] ?? 999) - (tagIndex[b.item.tag] ?? 999)
      if (tagDiff !== 0) return tagDiff
      return a.originalIndex - b.originalIndex
    })
    .map(({ item }) => item)
}

export function sortSpeakingTopicsByTag(topics) {
  return sortByTagOrder(topics, SPEAKING_TAG_ORDER)
}

export function sortGrammarTopicsByTag(topics) {
  return sortByTagOrder(topics, GRAMMAR_TAG_ORDER)
}

export function sortHindiToEnglishByCategory(items) {
  return [...items].sort((a, b) => {
    const byCategory = (a.category || '').localeCompare(b.category || '')
    if (byCategory !== 0) return byCategory
    return a.id.localeCompare(b.id)
  })
}
