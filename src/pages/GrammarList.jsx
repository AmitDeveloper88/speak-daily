import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import { grammarTopics } from '../data/content'
import { sortGrammarTopicsByTag } from '../utils/sortByTag'

export default function GrammarList() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? grammarTopics.filter((topic) => {
          const keywords = (topic.keywords || []).join(' ').toLowerCase()
          return (
            topic.title.toLowerCase().includes(q) ||
            topic.subtitle?.toLowerCase().includes(q) ||
            topic.tag?.toLowerCase().includes(q) ||
            keywords.includes(q)
          )
        })
      : grammarTopics
    return sortGrammarTopicsByTag(list)
  }, [query])

  return (
    <AppShell>
      <div className="px-4">
        <Header title="Grammar for Speaking" onBack={() => navigate('/home')} />
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={18}
          />
          <input
            type="search"
            placeholder="Search grammar topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
        </div>

        {grammarTopics.length === 0 ? (
          <p className="text-center text-gray-500 py-12 dark:text-gray-400">
            Grammar topics will be added soon.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((topic, index) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => navigate(`/grammar/${topic.id}`)}
                className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-left active:scale-[0.99] transition dark:bg-gray-800 dark:border-gray-700"
              >
                <span className="w-6 shrink-0 text-sm font-bold text-gray-400 dark:text-gray-500">
                  {index + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {topic.title}
                  </h3>
                  {topic.subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{topic.subtitle}</p>
                  )}
                  {topic.tag && (
                    <span className="mt-1.5 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-green-800 dark:bg-green-950 dark:text-green-300">
                      {topic.tag}
                    </span>
                  )}
                </div>
                <ChevronRight className="text-gray-400 shrink-0 dark:text-gray-500" size={20} />
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-gray-500 py-8 dark:text-gray-400">No topics found.</p>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
