import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import YourPracticeCard from '../components/YourPracticeCard'
import CategoryCard from '../components/CategoryCard'
import {
  getRecentPractice,
  getCompletedTopics,
  getFavoriteTopics,
  getPracticeTimeSeconds,
  formatPracticeTime,
} from '../utils/storage'
import {
  getTopicById,
  speakingTopics,
  hindiToEnglishPractice,
  sentencePatterns,
  grammarTopics,
} from '../data/content'
import { APP_NAME, APP_TAGLINE } from '../config/brand'

export default function Home() {
  const navigate = useNavigate()
  const recent = getRecentPractice()[0]
  const continueTopic = recent ? getTopicById(recent.id) : getTopicById('ask-for-help')

  const topicsPracticed = getCompletedTopics().length
  const favoritesCount = getFavoriteTopics().length
  const practiceTime = formatPracticeTime(getPracticeTimeSeconds())

  return (
    <AppShell>
      <div className="px-4 pt-4 pb-2">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{APP_NAME}</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">{APP_TAGLINE}</p>
        </div>

        <YourPracticeCard
          topicsPracticed={topicsPracticed}
          topicsTotal={speakingTopics.length}
          favoritesCount={favoritesCount}
          practiceTime={practiceTime}
        />

        {continueTopic && (
          <button
            type="button"
            onClick={() => navigate(`/topic/${continueTopic.id}`)}
            className="w-full mt-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-left active:scale-[0.99] transition dark:bg-gray-800 dark:border-gray-700"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Continue Learning
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
              {continueTopic.title}
            </p>
            <p className="text-base text-gray-500 dark:text-gray-400">Pick up where you left off</p>
          </button>
        )}

        <h2 className="mt-6 mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">Categories</h2>
        <div className="grid grid-cols-2 gap-3">
          <CategoryCard
            compact
            accent="purple"
            title="Speaking Topics"
            subtitle="Daily life, interview, office & more"
            totalCount={speakingTopics.length}
            totalLabel="topics"
            onClick={() => navigate('/topics')}
          />
          <CategoryCard
            compact
            accent="green"
            title="Hindi to English"
            subtitle="Translate Hindi into English"
            totalCount={hindiToEnglishPractice.length}
            totalLabel="sentences"
            onClick={() => navigate('/hindi-to-english')}
          />
          <CategoryCard
            compact
            accent="orange"
            title="Sentence Builder"
            subtitle="Useful sentence patterns"
            totalCount={sentencePatterns.length}
            totalLabel="patterns"
            onClick={() => navigate('/sentence-builder')}
          />
          <CategoryCard
            compact
            accent="teal"
            title="Grammar for Speaking"
            subtitle="Essential grammar for speaking"
            totalCount={grammarTopics.length}
            totalLabel="topics"
            onClick={() => navigate('/grammar')}
          />
        </div>
      </div>
    </AppShell>
  )
}
