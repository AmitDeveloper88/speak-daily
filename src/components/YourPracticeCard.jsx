export default function YourPracticeCard({
  topicsPracticed = 0,
  topicsTotal = 12,
  favoritesCount = 0,
  practiceTime = '0m',
}) {
  return (
    <div className="bg-primary rounded-2xl p-5 text-white shadow-md">
      <p className="mb-4 text-base font-semibold opacity-95">Your Practice</p>
      <div className="grid grid-cols-3 gap-2 divide-x divide-white/20">
        <div className="px-1 text-center">
          <p className="text-xl font-bold leading-tight">
            {topicsPracticed}
            <span className="text-base font-medium opacity-80"> / {topicsTotal}</span>
          </p>
          <p className="mt-1 text-sm leading-snug opacity-90">Topics Practiced</p>
        </div>
        <div className="px-1 text-center">
          <p className="text-xl font-bold">{practiceTime}</p>
          <p className="mt-1 text-sm leading-snug opacity-90">Total Practice Time</p>
        </div>
        <div className="px-1 text-center">
          <p className="text-xl font-bold">{favoritesCount}</p>
          <p className="mt-1 text-sm leading-snug opacity-90">Favorites</p>
        </div>
      </div>
    </div>
  )
}
