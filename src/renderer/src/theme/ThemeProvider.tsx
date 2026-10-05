import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { applyTheme } from './applyTheme'
import { ACCENT_PRESETS, DEFAULT_THEME, STORAGE_KEY } from './presets'
import type { ThemeConfig, ThemeMode } from './types'

interface ThemeContextValue {
  theme: ThemeConfig
  accentColor: string
  setAccentPreset: (presetId: string) => void
  setCustomAccent: (color: string) => void
  setMode: (mode: ThemeMode) => void
  resetTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function loadTheme(): ThemeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_THEME
    const parsed = JSON.parse(raw) as Partial<ThemeConfig>
    return {
      accentPreset: parsed.accentPreset ?? DEFAULT_THEME.accentPreset,
      customAccent: parsed.customAccent ?? DEFAULT_THEME.customAccent,
      mode: parsed.mode === 'light' ? 'light' : 'dark'
    }
  } catch {
    return DEFAULT_THEME
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [theme, setTheme] = useState<ThemeConfig>(loadTheme)

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
  }, [theme])

  const accentColor = useMemo(() => {
    if (theme.accentPreset === 'custom') return theme.customAccent
    return ACCENT_PRESETS.find((item) => item.id === theme.accentPreset)?.accent ?? ACCENT_PRESETS[0].accent
  }, [theme])

  const setAccentPreset = useCallback((presetId: string) => {
    setTheme((prev) => ({ ...prev, accentPreset: presetId }))
  }, [])

  const setCustomAccent = useCallback((color: string) => {
    setTheme((prev) => ({
      ...prev,
      accentPreset: 'custom',
      customAccent: color
    }))
  }, [])

  const setMode = useCallback((mode: ThemeMode) => {
    setTheme((prev) => ({ ...prev, mode }))
  }, [])

  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME)
  }, [])

  const value = useMemo(
    () => ({
      theme,
      accentColor,
      setAccentPreset,
      setCustomAccent,
      setMode,
      resetTheme
    }),
    [theme, accentColor, setAccentPreset, setCustomAccent, setMode, resetTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme 必须在 ThemeProvider 内使用')
  return context
}
