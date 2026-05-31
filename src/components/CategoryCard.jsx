import { ChevronRight } from 'lucide-react'

const accentStyles = {
  purple:
    'bg-purple-600 border-purple-700 text-white dark:bg-purple-700 dark:border-purple-600',
  green:
    'bg-emerald-600 border-emerald-700 text-white dark:bg-emerald-700 dark:border-emerald-600',
  orange:
    'bg-orange-600 border-orange-700 text-white dark:bg-orange-700 dark:border-orange-600',
  teal:
    'bg-teal-600 border-teal-700 text-white dark:bg-teal-700 dark:border-teal-600',
}

export default function CategoryCard({
  number,
  title,
  subtitle,
  description,
  totalCount,
  totalLabel,
  accent,
  onClick,
  compact = false,
}) {
  const neutralClass =
    'bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700'

  if (compact && accent) {
    const accentClass = accentStyles[accent] || accentStyles.purple
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center gap-3 rounded-2xl border p-4 text-left shadow-sm active:scale-[0.99] transition ${accentClass}`}
      >
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-snug">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm leading-snug text-white/90">{subtitle}</p>
          )}
          {totalCount != null && totalLabel && (
            <p className="mt-2 text-sm font-medium text-white/80">
              {totalCount} {totalLabel} total
            </p>
          )}
        </div>
        {totalCount != null && (
          <div className="shrink-0 rounded-xl bg-white/15 px-3 py-2 text-center">
            <p className="text-2xl font-bold leading-none">{totalCount}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/85">
              {totalLabel}
            </p>
          </div>
        )}
      </button>
    )
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex min-w-0 flex-1 flex-col items-center gap-2 p-4 ${neutralClass} active:scale-[0.98] transition`}
      >
        {number != null && (
          <span className="text-sm font-bold text-gray-400 dark:text-gray-500">{number}.</span>
        )}
        <span className="text-center text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
          {title}
        </span>
        {subtitle && (
          <span className="text-center text-sm text-gray-500 dark:text-gray-400">{subtitle}</span>
        )}
      </button>
    )
  }

  const accentClass = accent ? accentStyles[accent] || accentStyles.purple : neutralClass
  const isAccent = Boolean(accent)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left shadow-sm active:scale-[0.99] transition ${accentClass}`}
    >
      <div className="min-w-0 flex-1">
        <h3
          className={`text-lg font-bold ${isAccent ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}
        >
          {title}
        </h3>
        {description && (
          <p
            className={`mt-0.5 text-base ${
              isAccent ? 'text-white/85' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {description}
          </p>
        )}
        {subtitle && !description && (
          <p
            className={`mt-0.5 text-base ${
              isAccent ? 'text-white/85' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {subtitle}
          </p>
        )}
        {totalCount != null && totalLabel && (
          <p
            className={`mt-1.5 text-sm font-medium ${
              isAccent ? 'text-white/80' : 'text-primary dark:text-blue-300'
            }`}
          >
            {totalCount} {totalLabel} total
          </p>
        )}
      </div>
      {totalCount != null && isAccent && (
        <div className="shrink-0 rounded-xl bg-white/15 px-3 py-2 text-center text-white">
          <p className="text-2xl font-bold leading-none">{totalCount}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/85">
            {totalLabel}
          </p>
        </div>
      )}
      <ChevronRight
        className={`shrink-0 ${isAccent ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}`}
        size={22}
      />
    </button>
  )
}
