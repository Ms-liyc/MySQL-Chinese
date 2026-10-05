import { useEffect, useState } from 'react'
import { LogIn } from 'lucide-react'
import ThemeSettingsPanel from '../components/ThemeSettingsPanel'
import logo from '../assets/logo.png'
import {
  clearRememberedLogin,
  loadRememberedLogin,
  saveRememberedLogin
} from '../utils/rememberLogin'
import type { ConnectionConfig } from '../../../shared/types'
import '../styles/Login.css'
import '../styles/ThemeSettings.css'

interface Props {
  loading: boolean
  onLogin: (config: ConnectionConfig) => Promise<void>
}

const defaultConfig: ConnectionConfig = {
  name: '本地 MySQL',
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: ''
}

export default function LoginPage({ loading, onLogin }: Props): React.JSX.Element {
  const [config, setConfig] = useState<ConnectionConfig>(defaultConfig)
  const [rememberPassword, setRememberPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = loadRememberedLogin()
    if (saved) {
      setConfig(saved)
      setRememberPassword(true)
    }
  }, [])

  const update = <K extends keyof ConnectionConfig>(key: K, value: ConnectionConfig[K]): void => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const handleRememberChange = (checked: boolean): void => {
    setRememberPassword(checked)
    if (!checked) {
      clearRememberedLogin()
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError('')
    try {
      await onLogin(config)
      if (rememberPassword) {
        saveRememberedLogin(config)
      } else {
        clearRememberedLogin()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    }
  }

  return (
    <div className="login-page">
      <div className="login-theme-btn">
        <ThemeSettingsPanel />
      </div>
      <div className="login-bg" />
      <div className="login-card panel">
        <div className="login-brand">
          <div className="login-logo">
            <img src={logo} alt="屿·mysql" className="app-logo" />
          </div>
          <h1>屿·mysql</h1>
          <p>MySQL 中文版可视化工具 · 登录后开始查询与分析</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-row inline">
            <div>
              <label>主机</label>
              <input
                value={config.host}
                onChange={(e) => update('host', e.target.value)}
                placeholder="127.0.0.1"
                disabled={loading}
                autoFocus
              />
            </div>
            <div>
              <label>端口</label>
              <input
                type="number"
                value={config.port}
                onChange={(e) => update('port', Number(e.target.value))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row inline">
            <div>
              <label>用户名</label>
              <input
                value={config.user}
                onChange={(e) => update('user', e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label>密码</label>
              <input
                type="password"
                value={config.password}
                onChange={(e) => update('password', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <label>默认数据库（可选）</label>
            <input
              value={config.database || ''}
              onChange={(e) => update('database', e.target.value)}
              placeholder="留空则登录后手动选择"
              disabled={loading}
            />
          </div>

          <div className="form-row remember-row">
            <label className="remember-label">
              <input
                type="checkbox"
                checked={rememberPassword}
                onChange={(e) => handleRememberChange(e.target.checked)}
                disabled={loading}
              />
              <span>记住密码</span>
            </label>
          </div>

          {error && <div className="error-text">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <LogIn size={16} />
              {loading ? '登录中...' : '登录'}
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}
