import { useEffect, useRef, useState } from 'react'
import { Palette, RotateCcw, Sun, Moon, X } from 'lucide-react'
import { ACCENT_PRESETS } from '../theme/presets'
import { isValidHexColor } from '../theme/colors'
import { useTheme } from '../theme/ThemeProvider'
import '../styles/ThemeSettings.css'

export default function ThemeSettingsPanel(): React.JSX.Element {
  const { theme, accentColor, setAccentPreset, setCustomAccent, setMode, resetTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [customInput, setCustomInput] = useState(theme.customAccent)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCustomInput(theme.customAccent)
  }, [theme.customAccent])

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent): void => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const applyCustomHex = (value: string): void => {
    setCustomInput(value)
    if (isValidHexColor(value)) {
      setCustomAccent(value)
    }
  }

  return (
    <div className="theme-settings" ref={panelRef}>
      <button
        className="secondary topbar-action-btn theme-toggle-btn"
        onClick={() => setOpen((prev) => !prev)}
        title="主题设置"
      >
        <Palette size={14} />
        主题
      </button>

      {open && (
        <div className="theme-panel panel">
          <div className="panel-header">
            <span>主题设置</span>
            <button className="secondary theme-icon-btn" onClick={() => setOpen(false)}>
              <X size={14} />
            </button>
          </div>

          <div className="panel-body theme-panel-body">
            <div className="theme-section">
              <label>外观模式</label>
              <div className="theme-mode-switch">
                <button
                  className={`secondary ${theme.mode === 'dark' ? 'active' : ''}`}
                  onClick={() => setMode('dark')}
                >
                  <Moon size={14} />
                  深色
                </button>
                <button
                  className={`secondary ${theme.mode === 'light' ? 'active' : ''}`}
                  onClick={() => setMode('light')}
                >
                  <Sun size={14} />
                  浅色
                </button>
              </div>
            </div>

            <div className="theme-section">
              <label>主题色</label>
              <div className="theme-preset-grid">
                {ACCENT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className={`theme-preset ${theme.accentPreset === preset.id ? 'active' : ''}`}
                    onClick={() => setAccentPreset(preset.id)}
                    title={preset.name}
                  >
                    <span className="theme-swatch" style={{ background: preset.accent }} />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="theme-section">
              <label>自定义颜色</label>
              <div className="theme-custom-row">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => applyCustomHex(e.target.value)}
                />
                <input
                  value={customInput}
                  onChange={(e) => applyCustomHex(e.target.value)}
                  placeholder="#3b82f6"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="theme-preview">
              <div className="theme-preview-bar" style={{ background: accentColor }} />
              <div className="theme-preview-content">
                <span className="badge">预览标签</span>
                <button>主按钮</button>
              </div>
            </div>

            <button className="secondary theme-reset-btn" onClick={resetTheme}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={14} />
                恢复默认
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
