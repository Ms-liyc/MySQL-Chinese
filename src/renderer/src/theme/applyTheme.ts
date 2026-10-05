import { ACCENT_PRESETS, DARK_PALETTE, LIGHT_PALETTE } from './presets'
import { darkenHex, hexToRgb } from './colors'
import type { ThemeConfig } from './types'

function resolveAccent(config: ThemeConfig): string {
  if (config.accentPreset === 'custom') return config.customAccent
  return ACCENT_PRESETS.find((item) => item.id === config.accentPreset)?.accent ?? ACCENT_PRESETS[0].accent
}

export function applyTheme(config: ThemeConfig): void {
  const root = document.documentElement
  const palette = config.mode === 'light' ? LIGHT_PALETTE : DARK_PALETTE
  const accent = resolveAccent(config)
  const accentHover = darkenHex(accent, 0.12)
  const rgb = hexToRgb(accent)

  root.style.setProperty('--bg-base', palette.bgBase)
  root.style.setProperty('--bg-panel', palette.bgPanel)
  root.style.setProperty('--bg-elevated', palette.bgElevated)
  root.style.setProperty('--bg-hover', palette.bgHover)
  root.style.setProperty('--border', palette.border)
  root.style.setProperty('--text', palette.text)
  root.style.setProperty('--text-muted', palette.textMuted)
  root.style.setProperty('--accent', accent)
  root.style.setProperty('--accent-hover', accentHover)

  if (rgb) {
    root.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
  }

  root.dataset.themeMode = config.mode
}
