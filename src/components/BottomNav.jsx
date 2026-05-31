import { NavLink } from 'react-router-dom'
import { mainNavLinks } from '../config/navLinks'

export default function BottomNav() {
  return (
    <nav
      className="w-full shrink-0 border-t border-gray-200 bg-white safe-bottom dark:border-gray-800 dark:bg-gray-900 md:hidden"
      aria-label="Main navigation"
    >
      <div className="flex justify-around py-2">
        {mainNavLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition ${
                isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
