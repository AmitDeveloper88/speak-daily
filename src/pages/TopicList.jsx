import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import TopicCard from '../components/TopicCard'
import { speakingTopics } from '../data/content'
import { sortSpeakingTopicsByTag } from '../utils/sortByTag'

export default function TopicList() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? speakingTopics.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.subtitle.toLowerCase().includes(q) ||
            t.tag.toLowerCase().includes(q)
        )
      : speakingTopics
    return sortSpeakingTopicsByTag(list)
  }, [query])

  return (
    <AppShell>
      <div className="px-4">
        <Header title="Speaking Topics" />
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={18}
          />
          <input
            type="search"
            placeholder="Search topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
        </div>
        <div className="flex flex-col gap-3">
          {filtered.map((topic, index) => (
            <TopicCard
              key={topic.id}
              number={index + 1}
              topic={topic}
              onClick={() => navigate(`/topic/${topic.id}`)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-8 dark:text-gray-400">No topics found.</p>
          )}
        </div>
      </div>
    </AppShell>
  )
}
