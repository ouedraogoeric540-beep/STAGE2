import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

// ─── Palettes de couleur disponibles ───────────────────────────────────────
export const PALETTES = {
  blue: {
    name: 'Bleu',
    primary:      '#2563eb',
    primaryDark:  '#1d4ed8',
    primaryLight: '#60a5fa',
    secondary:    '#6366f1',
    glow:         'rgba(37,99,235,0.15)',
    gradient:     'linear-gradient(135deg, #2563eb, #6366f1)',
    swatch:       '#2563eb',
  },
  pink: {
    name: 'Rose',
    primary:      '#ec4899',
    primaryDark:  '#db2777',
    primaryLight: '#f472b6',
    secondary:    '#a855f7',
    glow:         'rgba(236,72,153,0.15)',
    gradient:     'linear-gradient(135deg, #ec4899, #a855f7)',
    swatch:       '#ec4899',
  },
  red: {
    name: 'Rouge',
    primary:      '#ef4444',
    primaryDark:  '#dc2626',
    primaryLight: '#f87171',
    secondary:    '#f97316',
    glow:         'rgba(239,68,68,0.15)',
    gradient:     'linear-gradient(135deg, #ef4444, #f97316)',
    swatch:       '#ef4444',
  },
  green: {
    name: 'Vert',
    primary:      '#10b981',
    primaryDark:  '#059669',
    primaryLight: '#34d399',
    secondary:    '#06b6d4',
    glow:         'rgba(16,185,129,0.15)',
    gradient:     'linear-gradient(135deg, #10b981, #06b6d4)',
    swatch:       '#10b981',
  },
  purple: {
    name: 'Violet',
    primary:      '#8b5cf6',
    primaryDark:  '#7c3aed',
    primaryLight: '#a78bfa',
    secondary:    '#ec4899',
    glow:         'rgba(139,92,246,0.15)',
    gradient:     'linear-gradient(135deg, #8b5cf6, #ec4899)',
    swatch:       '#8b5cf6',
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
  el.style.setProperty('--shadow-brand',    `0 4px 14px ${palette.glow}`)
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