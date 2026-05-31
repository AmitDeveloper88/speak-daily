import { NavLink } from 'react-router-dom'
import { APP_NAME, APP_TAGLINE } from '../config/brand'
import { mainNavLinks } from '../config/navLinks'

export default function SideNav() {
  return (
    <aside
      className="hidden h-full min-h-0 w-56 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:flex"
      aria-label="Main navigation"
    >
      <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800">
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{APP_NAME}</p>
        <p className="mt-1 text-sm leading-snug text-gray-500 dark:text-gray-400">
          {APP_TAGLINE}
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {mainNavLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition ${
                isActive
                  ? 'bg-blue-50 text-primary dark:bg-blue-950/60'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
