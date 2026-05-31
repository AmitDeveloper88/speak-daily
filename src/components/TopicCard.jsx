import { ChevronRight } from 'lucide-react'

export default function TopicCard({ topic, onClick, number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-left active:scale-[0.99] transition dark:bg-gray-800 dark:border-gray-700"
    >
      {number != null && (
        <span className="w-6 shrink-0 text-sm font-bold text-gray-400 dark:text-gray-500">
          {number}.
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{topic.title}</h3>
        {topic.subtitle && (
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">{topic.subtitle}</p>
        )}
        {topic.tag && (
          <span className="mt-1.5 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-green-800 dark:bg-green-950 dark:text-green-300">
            {topic.tag}
          </span>
        )}
      </div>
      <ChevronRight className="text-gray-400 shrink-0 dark:text-gray-500" size={20} />
    </button>
  )
}
