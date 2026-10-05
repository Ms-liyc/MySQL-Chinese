export type ThemeMode = 'dark' | 'light'

export interface ThemeConfig {
  accentPreset: string
  customAccent: string
  mode: ThemeMode
}

export interface AccentPreset {
  id: string
  name: string
  accent: string
}

export interface ThemePalette {
  bgBase: string
  bgPanel: string
  bgElevated: string
  bgHover: string
  border: string
  text: string
  textMuted: string
}
