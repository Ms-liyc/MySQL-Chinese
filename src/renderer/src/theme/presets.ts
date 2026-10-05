import type { AccentPreset, ThemePalette } from './types'

export const STORAGE_KEY = 'mysql-visualizer-theme'

export const DEFAULT_THEME = {
  accentPreset: 'blue',
  customAccent: '#3b82f6',
  mode: 'dark' as const
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: 'blue', name: '默认蓝', accent: '#3b82f6' },
  { id: 'emerald', name: '翠绿', accent: '#10b981' },
  { id: 'violet', name: '紫罗兰', accent: '#8b5cf6' },
  { id: 'rose', name: '玫瑰', accent: '#f43f5e' },
  { id: 'amber', name: '琥珀', accent: '#f59e0b' },
  { id: 'cyan', name: '青色', accent: '#06b6d4' }
]

export const DARK_PALETTE: ThemePalette = {
  bgBase: '#0f1419',
  bgPanel: '#1a2332',
  bgElevated: '#243044',
  bgHover: '#2d3a52',
  border: '#334155',
  text: '#e2e8f0',
  textMuted: '#94a3b8'
}

export const LIGHT_PALETTE: ThemePalette = {
  bgBase: '#f1f5f9',
  bgPanel: '#ffffff',
  bgElevated: '#f8fafc',
  bgHover: '#e2e8f0',
  border: '#cbd5e1',
  text: '#0f172a',
  textMuted: '#64748b'
}
