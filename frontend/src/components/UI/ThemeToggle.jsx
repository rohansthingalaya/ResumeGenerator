import { Sun, Moon } from 'lucide-react'
import useCvStore from '../../store/cvStore'

export function ThemeToggle() {
  const { cvData, updateSetting } = useCvStore()
  const isDark = cvData.settings.theme === 'dark'

  const toggle = () => {
    const newTheme = isDark ? 'light' : 'dark'
    updateSetting('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    // Persist to localStorage for instant next-load application (see main.jsx)
    localStorage.setItem('cv-theme', newTheme)
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
