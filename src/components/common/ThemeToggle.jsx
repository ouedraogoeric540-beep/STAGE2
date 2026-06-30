import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className={`sp-toggle ${isDark ? 'dark' : ''}`}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
    />
  )
}