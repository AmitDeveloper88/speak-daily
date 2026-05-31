import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'

export default function Header({
  title,
  showBack = true,
  showHome,
  rightAction,
  onBack,
}) {
  const navigate = useNavigate()
  const homeVisible = showHome ?? showBack

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-gray-100 bg-white/95 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
      {showBack && (
        <button
          type="button"
          onClick={handleBack}
          className="-ml-2 rounded-full p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
      )}
      <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h1>
      {rightAction && <div className="shrink-0">{rightAction}</div>}
      {homeVisible && (
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="shrink-0 rounded-full p-2 text-primary hover:bg-blue-50 dark:hover:bg-blue-950"
          aria-label="Go to home"
        >
          <Home size={22} />
        </button>
      )}
    </header>
  )
}
