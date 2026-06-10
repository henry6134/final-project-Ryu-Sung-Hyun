export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label="테마 전환"
      title="테마 전환"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}