import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import SentenceCard from '../components/SentenceCard'
import Button from '../components/Button'
import { hindiToEnglishPractice } from '../data/content'

export default function HindiToEnglish() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return hindiToEnglishPractice
    return hindiToEnglishPractice.filter(
      (item) =>
        item.hindi.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <AppShell>
      <div className="px-4">
        <Header title="Hindi to English Practice" onBack={() => navigate('/home')} />
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={18}
          />
          <input
            type="search"
            placeholder="Search Hindi or English..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
        </div>
        <div className="space-y-3">
          {filtered.map((item, index) => (
            <SentenceCard
              key={item.id}
              number={index + 1}
              hindi={item.hindi}
              english={item.english}
            />
          ))}
        </div>
        <div className="mt-2">
          <Button variant="outline" onClick={() => navigate('/categories')}>
            Practice More
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
