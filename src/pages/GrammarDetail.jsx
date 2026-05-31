import { useNavigate, useParams } from 'react-router-dom'
import { Volume2, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import { getGrammarTopicById } from '../data/content'
import { speakText } from '../utils/speech'

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export default function GrammarDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const grammar = getGrammarTopicById(id)
  const [copiedIndex, setCopiedIndex] = useState(null)

  if (!grammar) {
    return (
      <AppShell showNav={false}>
        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
          Grammar topic not found.
        </div>
      </AppShell>
    )
  }

  const handleCopy = async (english, index) => {
    const ok = await copyText(english)
    if (ok) {
      setCopiedIndex(index)
      window.setTimeout(() => setCopiedIndex(null), 2000)
    }
  }

  return (
    <AppShell showNav={false}>
      <div className="px-4 pt-1 pb-6">
        <Header title={grammar.title} />

        {grammar.useHindi && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-5 dark:bg-green-950/40 dark:border-green-900">
            <p className="text-xs font-semibold text-green-800 mb-2 dark:text-green-300">
              Use / Explanation
            </p>
            <p className="text-sm text-gray-800 leading-relaxed dark:text-gray-200">
              {grammar.useHindi}
            </p>
          </div>
        )}

        {grammar.simpleRule && (
          <>
            <h2 className="font-bold text-gray-900 mb-3 dark:text-gray-100">Simple Rule</h2>
            <div className="mb-5 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-blue-900 dark:bg-gray-800">
              <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                {grammar.simpleRule}
              </p>
            </div>
          </>
        )}

        {grammar.ruleExamples?.length > 0 && (
          <>
            <h2 className="font-bold text-gray-900 mb-3 dark:text-gray-100">Rule Examples</h2>
            <ul className="mb-6 space-y-2">
              {grammar.ruleExamples.map((example, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-200"
                >
                  {example}
                </li>
              ))}
            </ul>
          </>
        )}

        {grammar.usefulSentences?.length > 0 && (
          <>
            <h2 className="font-bold text-gray-900 mb-3 dark:text-gray-100">Useful Sentences</h2>
            <ol className="space-y-3 mb-6">
              {grammar.usefulSentences.map((sentence, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-700"
                >
                  <span className="text-sm font-bold text-gray-400 w-5 dark:text-gray-500">
                    {i + 1}.
                  </span>
                  <p className="flex-1 text-gray-900 dark:text-gray-100">{sentence}</p>
                  <button
                    type="button"
                    onClick={() => speakText(sentence)}
                    className="p-2 rounded-full bg-blue-100 text-primary shrink-0 dark:bg-blue-950"
                    aria-label="Listen"
                  >
                    <Volume2 size={18} />
                  </button>
                </li>
              ))}
            </ol>
          </>
        )}

        {grammar.hindiToEnglish?.length > 0 && (
          <>
            <h2 className="font-bold text-gray-900 mb-3 dark:text-gray-100">
              Hindi to English Practice
            </h2>
            <div className="space-y-3 mb-6">
              {grammar.hindiToEnglish.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-purple-100 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/50"
                >
                  <p className="mb-2 font-medium text-gray-800 dark:text-gray-200">{item.hindi}</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex-1 font-semibold text-primary">{item.english}</p>
                    <button
                      type="button"
                      onClick={() => speakText(item.english)}
                      className="shrink-0 rounded-full bg-blue-100 p-2 text-primary hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900"
                      aria-label="Listen"
                    >
                      <Volume2 size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.english, i)}
                      className="shrink-0 rounded-full bg-white p-2 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      aria-label="Copy English sentence"
                    >
                      {copiedIndex === i ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {grammar.speakingTask && (
          <>
            <h2 className="font-bold text-gray-900 mb-3 dark:text-gray-100">Speaking Task</h2>
            <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
              <p className="text-sm font-medium leading-relaxed text-gray-900 dark:text-gray-100">
                {grammar.speakingTask}
              </p>
            </div>
          </>
        )}

        {grammar.modelAnswer && (
          <>
            <h2 className="font-bold text-gray-900 mb-3 dark:text-gray-100">Model Answer</h2>
            <div className="mb-5 rounded-2xl border border-green-100 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/40">
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-green-800 dark:text-green-300">
                  Example
                </span>
                <button
                  type="button"
                  onClick={() => speakText(grammar.modelAnswer)}
                  className="shrink-0 rounded-full bg-green-200 p-2 text-green-800 dark:bg-green-900 dark:text-green-200"
                  aria-label="Listen to model answer"
                >
                  <Volume2 size={18} />
                </button>
              </div>
              <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                {grammar.modelAnswer}
              </p>
            </div>
          </>
        )}

        {grammar.tips?.length > 0 && (
          <>
            <h2 className="font-bold text-gray-900 mb-3 dark:text-gray-100">Tips</h2>
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/40">
              <ul className="space-y-2">
                {grammar.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm leading-relaxed text-gray-800 dark:text-gray-200"
                  >
                    <span className="font-bold text-orange-600 dark:text-orange-400">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => navigate('/grammar')}
          className="mt-6 w-full py-2 text-center text-sm font-semibold text-primary"
        >
          ← Back to grammar topics
        </button>
      </div>
    </AppShell>
  )
}
