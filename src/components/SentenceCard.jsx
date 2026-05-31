import { Volume2 } from 'lucide-react'
import { speakText } from '../utils/speech'

export default function SentenceCard({
  number,
  hindi,
  english,
  tag,
  showHindi = true,
  variant = 'purple',
  onClick,
}) {
  const bg =
    variant === 'purple'
      ? 'bg-purple-50 border-purple-100 dark:bg-purple-950/50 dark:border-purple-900'
      : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700'

  const handleSpeak = (e) => {
    e.stopPropagation()
    speakText(english)
  }

  const Wrapper = onClick ? 'button' : 'div'
  const wrapperProps = onClick
    ? {
        type: 'button',
        onClick,
        className: `${bg} border rounded-2xl p-4 w-full text-left active:scale-[0.99] transition`,
      }
    : { className: `${bg} border rounded-2xl p-4 w-full` }

  return (
    <Wrapper {...wrapperProps}>
      <div className="flex gap-3">
        {number != null && (
          <span className="w-6 shrink-0 text-sm font-bold text-gray-400 dark:text-gray-500">
            {number}.
          </span>
        )}
        <div className="min-w-0 flex-1">
          {showHindi && hindi && (
            <p className="mb-2 font-medium text-gray-800 dark:text-gray-200">{hindi}</p>
          )}
          <div className="flex items-center justify-between gap-2">
            <p className="flex-1 font-semibold text-primary">{english}</p>
            <button
              type="button"
              onClick={handleSpeak}
              className="shrink-0 rounded-full bg-blue-100 p-2 text-primary hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900"
              aria-label="Listen"
            >
              <Volume2 size={18} />
            </button>
          </div>
          {tag && (
            <span className="mt-2 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-green-800 dark:bg-green-950 dark:text-green-300">
              {tag}
            </span>
          )}
        </div>
      </div>
    </Wrapper>
  )
}
