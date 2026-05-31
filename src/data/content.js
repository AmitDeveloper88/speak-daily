import { speakingTopics } from './speakingTopics.js'
import { hindiToEnglishPractice } from './hindiToEnglishPractice.js'
import { sentencePatterns } from './sentencePatterns.js'
import { grammarTopics } from './grammarTopics.js'

export { speakingTopics }
export { hindiToEnglishPractice }
export { sentencePatterns }
export { grammarTopics }

export function getTopicById(id) {
  return speakingTopics.find((t) => t.id === id)
}

export function getPatternById(id) {
  return sentencePatterns.find((p) => p.id === id)
}

export function getGrammarTopicById(id) {
  return grammarTopics.find((g) => g.id === id)
}
