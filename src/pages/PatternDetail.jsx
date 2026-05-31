import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Volume2 } from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import { getPatternById } from '../data/content'
import { speakText } from '../utils/speech'

function stripPatternPrefix(text, prefix) {
  const trimmed = text.trimStart()
  const p = prefix.trim()
  if (!trimmed.toLowerCase().startsWith(p.toLowerCase())) return trimmed
  return trimmed.slice(p.length).trimStart()
}

export default function PatternDetail() {
  const { patternId } = useParams()
  const navigate = useNavigate()
  const pattern = getPatternById(patternId)
  const [inputs, setInputs] = useState(['', '', ''])

  useEffect(() => {
    localStorage.removeItem('sentenceBuilderPractice')
    if (!pattern) return
    setInputs(Array(pattern.blankCount).fill(''))
  }, [patternId])

  if (!pattern) {
    return (
      <AppShell showNav={false}>
        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
          Pattern not found.
        </div>
      </AppShell>
    )
  }

  const placeholders = pattern.placeholders ?? []
  const prefixLabel = pattern.prefix.trim()

  const handleChange = (index, raw) => {
    const value = stripPatternPrefix(raw, prefixLabel)
    setInputs((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  return (
    <AppShell showNav={false}>
      <div className="px-4 pt-1">
        <Header title={pattern.title} />

        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-5 dark:bg-green-950/40 dark:border-green-900">
          <p className="text-sm font-semibold text-green-800 mb-2 dark:text-green-300">
            Use / Explanation
          </p>
          <p className="text-sm text-gray-800 leading-relaxed dark:text-gray-200">
            {pattern.useHindi}
          </p>
        </div>

        <h2 className="font-bold text-gray-900 mb-3 dark:text-gray-100">Example Sentences</h2>
        <ol className="space-y-3 mb-6">
          {pattern.examples.map((sentence, i) => (
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

        <h2 className="font-bold text-gray-900 mb-3 dark:text-gray-100">
          Make Your Own Sentences
        </h2>
        <div className="space-y-3 mb-6">
          {inputs.map((value, i) => (
            <div key={`${patternId}-${i}`} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-sm font-bold text-gray-400 dark:text-gray-500">
                {i + 1}.
              </span>
              <div className="flex min-w-0 flex-1 items-stretch gap-2">
                <span className="flex shrink-0 items-center rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                  {prefixLabel}
                </span>
                <input
                  type="text"
                  name={`pattern-${patternId}-${i}`}
                  value={value}
                  onChange={(e) => handleChange(i, e.target.value)}
                  placeholder={placeholders[i] ?? 'your words here'}
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-label={`${prefixLabel} ${placeholders[i] ?? 'your sentence'}`}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate('/sentence-builder')}
          className="w-full py-2 text-center text-sm font-semibold text-primary"
        >
          ← Back to patterns
        </button>
      </div>
    </AppShell>
  )
}
