import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import QueryWorkspace from './pages/QueryWorkspace'
import { ThemeProvider } from './theme/ThemeProvider'
import type { ConnectionConfig } from '../../shared/types'

export default function App(): React.JSX.Element {
  const [session, setSession] = useState<ConnectionConfig | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (config: ConnectionConfig): Promise<void> => {
    setLoading(true)
    const res = await window.mysqlApi.connect(config)
    setLoading(false)
    if (!res.success) throw new Error(res.error || '登录失败')
    setSession(config)
  }

  const handleLogout = async (): Promise<void> => {
    await window.mysqlApi.disconnect()
    setSession(null)
  }

  return (
    <ThemeProvider>
      {!session ? (
        <LoginPage loading={loading} onLogin={handleLogin} />
      ) : (
        <QueryWorkspace session={session} onLogout={handleLogout} />
      )}
    </ThemeProvider>
  )
}
