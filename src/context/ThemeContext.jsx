import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

// ─── Palettes de couleur disponibles (Design System) ─────────────────────────
export const PALETTES = {
  blue: {
    name: 'Bleu',
    primary:      '#0D6EFD',
    primaryDark:  '#0a58ca',
    primaryLight: '#3b82f6',
    secondary:    '#6366f1',
    glow:         'rgba(13, 110, 253, 0.2)',
    gradient:     'linear-gradient(135deg, #0D6EFD, #3b82f6)',
    swatch:       '#0D6EFD',
  },
  indigo: {
    name: 'Indigo',
    primary:      '#4f46e5',
    primaryDark:  '#4338ca',
    primaryLight: '#818cf8',
    secondary:    '#0ea5e9',
    glow:         'rgba(79, 70, 229, 0.2)',
    gradient:     'linear-gradient(135deg, #4f46e5, #818cf8)',
    swatch:       '#4f46e5',
  },
  violet: {
    name: 'Violet',
    primary:      '#8b5cf6',
    primaryDark:  '#7c3aed',
    primaryLight: '#a78bfa',
    secondary:    '#d946ef',
    glow:         'rgba(139, 92, 246, 0.2)',
    gradient:     'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    swatch:       '#8b5cf6',
  },
  green: {
    name: 'Vert',
    primary:      '#10b981',
    primaryDark:  '#059669',
    primaryLight: '#34d399',
    secondary:    '#06b6d4',
    glow:         'rgba(16, 185, 129, 0.2)',
    gradient:     'linear-gradient(135deg, #10b981, #34d399)',
    swatch:       '#10b981',
  },
  turquoise: {
    name: 'Turquoise',
    primary:      '#06b6d4',
    primaryDark:  '#0891b2',
    primaryLight: '#22d3ee',
    secondary:    '#3b82f6',
    glow:         'rgba(6, 182, 212, 0.2)',
    gradient:     'linear-gradient(135deg, #06b6d4, #22d3ee)',
    swatch:       '#06b6d4',
  },
  red: {
    name: 'Rouge',
    primary:      '#ef4444',
    primaryDark:  '#dc2626',
    primaryLight: '#f87171',
    secondary:    '#f97316',
    glow:         'rgba(239, 68, 68, 0.2)',
    gradient:     'linear-gradient(135deg, #ef4444, #f87171)',
    swatch:       '#ef4444',
  },
  orange: {
    name: 'Orange',
    primary:      '#f97316',
    primaryDark:  '#ea580c',
    primaryLight: '#fb923c',
    secondary:    '#eab308',
    glow:         'rgba(249, 115, 22, 0.2)',
    gradient:     'linear-gradient(135deg, #f97316, #fb923c)',
    swatch:       '#f97316',
  },
}

// ─── Applique la palette sur les variables CSS ──────────────────────────────
function applyPalette(palette) {
  const el = document.documentElement
  el.style.setProperty('--primary',         palette.primary)
  el.style.setProperty('--primary-dark',    palette.primaryDark)
  el.style.setProperty('--primary-light',   palette.primaryLight)
  el.style.setProperty('--secondary',       palette.secondary)
  el.style.setProperty('--brand-color',     palette.primary)
  el.style.setProperty('--brand-glow',      palette.glow)
  el.style.setProperty('--gradient-brand',  palette.gradient)
  el.style.setProperty('--shadow-brand',    `0 8px 24px ${palette.glow}`)
}

// ─── Provider ───────────────────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  const [paletteName, setPaletteNameState] = useState(() => {
    return localStorage.getItem('palette') || 'blue'
  })

  // Appliquer le thème (dark/light)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // Appliquer la palette de couleur
  useEffect(() => {
    const palette = PALETTES[paletteName] || PALETTES.blue
    applyPalette(palette)
    localStorage.setItem('palette', paletteName)
  }, [paletteName])

  const toggleTheme = () => setIsDark((prev) => !prev)

  const setPalette = (name) => {
    if (PALETTES[name]) {
      setPaletteNameState(name)
    }
  }

  return (
    <ThemeContext.Provider value={{
      isDark,
      toggleTheme,
      paletteName,
      setPalette,
      palettes: PALETTES,
      currentPalette: PALETTES[paletteName] || PALETTES.blue,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}