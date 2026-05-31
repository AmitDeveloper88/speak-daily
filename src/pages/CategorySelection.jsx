import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import CategoryCard from '../components/CategoryCard'
import {
  hindiToEnglishPractice,
  sentencePatterns,
  speakingTopics,
  grammarTopics,
} from '../data/content'

export default function CategorySelection() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className="px-4">
        <Header title="Choose a Category" />
        <div className="grid grid-cols-2 gap-3">
          <CategoryCard
            accent="purple"
            title="Speaking Topics"
            description="Daily life, interview, restaurant, office, travel, phone and more."
            totalCount={speakingTopics.length}
            totalLabel="topics"
            onClick={() => navigate('/topics')}
          />
          <CategoryCard
            accent="green"
            title="Hindi to English Practice"
            description="Translate Hindi sentences into English."
            onClick={() => navigate('/hindi-to-english')}
            totalCount={hindiToEnglishPractice.length}
            totalLabel="sentences"
          />
          <CategoryCard
            accent="orange"
            title="Sentence Builder"
            description="Build sentences using useful patterns."
            onClick={() => navigate('/sentence-builder')}
            totalCount={sentencePatterns.length}
            totalLabel="patterns"
          />
          <CategoryCard
            accent="teal"
            title="Grammar for Speaking"
            description="Essential grammar for speaking."
            onClick={() => navigate('/grammar')}
            totalCount={grammarTopics.length}
            totalLabel="topics"
          />
        </div>
      </div>
    </AppShell>
  )
}
