import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { existsSync } from 'fs'
import { join } from 'path'
import {
  connect,
  disconnect,
  executeQuery,
  getErDiagram,
  getTableData,
  getTableSchema,
  isConnected,
  listDatabases
} from './mysql/service'
import type { ConnectionConfig } from '../shared/types'

function getIconPath(): string | undefined {
  const candidates = [
    join(process.cwd(), 'resources/icon.png'),
    join(__dirname, '../../resources/icon.png')
  ]
  return candidates.find((path) => existsSync(path))
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    autoHideMenuBar: true,
    title: '屿·mysql',
    icon: getIconPath(),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpcHandlers(): void {
  ipcMain.handle('mysql:connect', async (_event, config: ConnectionConfig) => {
    try {
      await connect(config)
      return { success: true, data: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '连接失败' }
    }
  })

  ipcMain.handle('mysql:disconnect', async () => {
    try {
      await disconnect()
      return { success: true, data: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '断开失败' }
    }
  })

  ipcMain.handle('mysql:status', async () => {
    return { success: true, data: isConnected() }
  })

  ipcMain.handle('mysql:listDatabases', async () => {
    try {
      const data = await listDatabases()
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '获取数据库列表失败' }
    }
  })

  ipcMain.handle('mysql:getTableSchema', async (_event, database: string, table: string) => {
    try {
      const data = await getTableSchema(database, table)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '获取表结构失败' }
    }
  })

  ipcMain.handle('mysql:getErDiagram', async (_event, database: string) => {
    try {
      const data = await getErDiagram(database)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '获取 ER 图失败' }
    }
  })

  ipcMain.handle('mysql:getTableData', async (
    _event,
    database: string,
    table: string,
    page?: number,
    pageSize?: number
  ) => {
    try {
      const data = await getTableData(database, table, page, pageSize)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '获取表数据失败' }
    }
  })

  ipcMain.handle('mysql:executeQuery', async (_event, sql: string, database?: string) => {
    try {
      const data = await executeQuery(sql, database)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'SQL 执行失败' }
    }
  })
}

app.whenReady().then(() => {
  app.setName('屿·mysql')
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  disconnect().finally(() => {
    if (process.platform !== 'darwin') app.quit()
  })
})
