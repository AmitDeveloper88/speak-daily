export default function YourPracticeCard({
  topicsPracticed = 0,
  topicsTotal = 12,
  favoritesCount = 0,
  practiceTime = '0m',
}) {
  return (
    <div className="bg-primary rounded-2xl p-5 text-white shadow-md">
      <p className="text-sm font-semibold opacity-95 mb-4">Your Practice</p>
      <div className="grid grid-cols-3 gap-2 divide-x divide-white/20">
        <div className="px-1 text-center">
          <p className="text-lg font-bold leading-tight">
            {topicsPracticed}
            <span className="text-sm font-medium opacity-80"> / {topicsTotal}</span>
          </p>
          <p className="text-[10px] opacity-90 mt-1 leading-snug">Topics Practiced</p>
        </div>
        <div className="px-1 text-center">
          <p className="text-lg font-bold">{practiceTime}</p>
          <p className="text-[10px] opacity-90 mt-1 leading-snug">Total Practice Time</p>
        </div>
        <div className="px-1 text-center">
          <p className="text-lg font-bold">{favoritesCount}</p>
          <p className="text-[10px] opacity-90 mt-1 leading-snug">Favorites</p>
        </div>
      </div>
    </div>
  )
}
