import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Heart, Volume2 } from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import Button from '../components/Button'
import SentenceCard from '../components/SentenceCard'
import { getTopicById } from '../data/content'
import { speakText } from '../utils/speech'
import { isTopicFavorite, toggleFavoriteTopic } from '../utils/storage'

export default function TopicDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const topic = getTopicById(id)
  const [favorite, setFavorite] = useState(false)

  useEffect(() => {
    if (topic) setFavorite(isTopicFavorite(topic.id))
  }, [topic])

  if (!topic) {
    return (
      <AppShell showNav={false}>
        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
          Topic not found.
        </div>
      </AppShell>
    )
  }

  const handleFavorite = () => {
    const next = toggleFavoriteTopic(topic.id)
    setFavorite(next)
  }

  return (
    <AppShell showNav={false}>
      <div className="px-4 pt-1">
        <Header
          title={topic.title}
          rightAction={
            <button
              type="button"
              onClick={handleFavorite}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Favorite"
            >
              <Heart
                size={22}
                className={favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
              />
            </button>
          }
        />

        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-5 dark:bg-green-950/40 dark:border-green-900">
          <p className="text-xs font-semibold text-green-800 mb-2 dark:text-green-300">
            Use / Explanation
          </p>
          <p className="text-sm text-gray-800 leading-relaxed dark:text-gray-200">
            {topic.useHindi}
          </p>
        </div>

        <h2 className="font-bold text-gray-900 mb-3 dark:text-gray-100">Useful Sentences</h2>
        <ol className="space-y-3 mb-6">
          {topic.usefulSentences.map((sentence, i) => (
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
          Hindi to English Practice
        </h2>
        <div className="space-y-3 mb-6">
          {topic.hindiToEnglish.map((item, i) => (
            <SentenceCard
              key={i}
              number={i + 1}
              hindi={item.hindi}
              english={item.english}
            />
          ))}
        </div>

        <Button onClick={() => navigate(`/speaking-task/${topic.id}`)}>
          Next: Speaking Task →
        </Button>
      </div>
    </AppShell>
  )
}
