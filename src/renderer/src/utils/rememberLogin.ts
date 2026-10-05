import type { ConnectionConfig } from '../../../shared/types'

const STORAGE_KEY = 'mysql-visualizer-remember-login'

interface SavedLogin {
  name: string
  host: string
  port: number
  user: string
  password: string
  database?: string
}

export function loadRememberedLogin(): ConnectionConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const saved = JSON.parse(raw) as SavedLogin
    if (!saved.host || !saved.user) return null

    return {
      name: saved.name || '本地 MySQL',
      host: saved.host,
      port: Number(saved.port) || 3306,
      user: saved.user,
      password: saved.password ?? '',
      database: saved.database ?? ''
    }
  } catch {
    return null
  }
}

export function saveRememberedLogin(config: ConnectionConfig): void {
  const payload: SavedLogin = {
    name: config.name,
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function clearRememberedLogin(): void {
  localStorage.removeItem(STORAGE_KEY)
}
