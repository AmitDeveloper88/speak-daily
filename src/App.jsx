import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import CategorySelection from './pages/CategorySelection'
import TopicList from './pages/TopicList'
import TopicDetail from './pages/TopicDetail'
import SpeakingTask from './pages/SpeakingTask'
import ModelAnswer from './pages/ModelAnswer'
import HindiToEnglish from './pages/HindiToEnglish'
import SentenceBuilder from './pages/SentenceBuilder'
import PatternDetail from './pages/PatternDetail'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'
import GrammarList from './pages/GrammarList'
import GrammarDetail from './pages/GrammarDetail'

export default function App() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/onboarding" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/categories" element={<CategorySelection />} />
        <Route path="/topics" element={<TopicList />} />
        <Route path="/topic/:id" element={<TopicDetail />} />
        <Route path="/speaking-task/:id" element={<SpeakingTask />} />
        <Route path="/model-answer/:id" element={<ModelAnswer />} />
        <Route path="/hindi-to-english" element={<HindiToEnglish />} />
        <Route path="/sentence-builder" element={<SentenceBuilder />} />
        <Route path="/sentence-builder/:patternId" element={<PatternDetail />} />
        <Route path="/grammar" element={<GrammarList />} />
        <Route path="/grammar/:id" element={<GrammarDetail />} />
        <Route path="/progress" element={<Navigate to="/home" replace />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
