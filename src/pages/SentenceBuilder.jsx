import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import { sentencePatterns } from '../data/content'

export default function SentenceBuilder() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className="px-4">
        <Header title="Sentence Builder" onBack={() => navigate('/home')} />
        <div className="space-y-3">
          {sentencePatterns.map((pattern, index) => (
            <button
              key={pattern.id}
              type="button"
              onClick={() => navigate(`/sentence-builder/${pattern.id}`)}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-left active:scale-[0.99] transition dark:bg-gray-800 dark:border-gray-700"
            >
              <span className="w-6 shrink-0 text-sm font-bold text-gray-400 dark:text-gray-500">
                {index + 1}.
              </span>
              <span className="flex-1 font-semibold text-gray-900 dark:text-gray-100">
                {pattern.title}
              </span>
              <ChevronRight className="text-gray-400 dark:text-gray-500" size={20} />
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
