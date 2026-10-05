import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { applyTheme } from './theme/applyTheme'
import { DEFAULT_THEME, STORAGE_KEY } from './theme/presets'
import type { ThemeConfig } from './theme/types'
import './styles/global.css'

function loadInitialTheme(): ThemeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_THEME
    return { ...DEFAULT_THEME, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_THEME
  }
}

applyTheme(loadInitialTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
