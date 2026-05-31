export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
}) {
  const base =
    'w-full py-3.5 px-4 rounded-2xl font-semibold text-base transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary: 'bg-primary text-white shadow-md hover:bg-primary-dark',
    outline:
      'border-2 border-primary text-primary bg-white hover:bg-primary-light dark:bg-gray-800 dark:hover:bg-gray-700',
    danger:
      'bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  )
}
