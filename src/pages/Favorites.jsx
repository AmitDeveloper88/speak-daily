import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import TopicCard from '../components/TopicCard'
import { speakingTopics } from '../data/content'
import { getFavoriteTopics } from '../utils/storage'
import { sortSpeakingTopicsByTag } from '../utils/sortByTag'

export default function Favorites() {
  const navigate = useNavigate()
  const favoriteIds = getFavoriteTopics()

  const favorites = useMemo(
    () =>
      sortSpeakingTopicsByTag(
        speakingTopics.filter((t) => favoriteIds.includes(t.id))
      ),
    [favoriteIds]
  )

  return (
    <AppShell>
      <div className="px-4">
        <Header title="Favorites" showBack={false} />

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="text-gray-300 mb-4 dark:text-gray-600" size={48} />
            <p className="text-gray-500 font-medium dark:text-gray-400">No favorites yet.</p>
            <p className="text-sm text-gray-400 mt-1 dark:text-gray-500">
              Tap the heart on a topic to save it here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {favorites.map((topic, index) => (
              <TopicCard
                key={topic.id}
                number={index + 1}
                topic={topic}
                onClick={() => navigate(`/topic/${topic.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
