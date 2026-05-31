import BottomNav from './BottomNav'
import SideNav from './SideNav'

export default function AppShell({ children, showNav = true, className = '' }) {
  return (
    <div
      className={`flex h-dvh max-h-dvh overflow-hidden bg-gray-100 dark:bg-gray-950 ${className}`}
    >
      {showNav && <SideNav />}
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-gray-900">
        <main
          className={`min-h-0 flex-1 overflow-y-auto overscroll-y-contain ${
            showNav ? 'pb-24 md:pb-8' : 'pb-4'
          }`}
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  )
}
