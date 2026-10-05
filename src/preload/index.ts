import { contextBridge, ipcRenderer } from 'electron'
import type {
  ApiResponse,
  ConnectionConfig,
  DatabaseNode,
  ErDiagramData,
  QueryResult,
  TableDataResult,
  TableSchema
} from '../shared/types'

const api = {
  connect: (config: ConnectionConfig): Promise<ApiResponse<boolean>> =>
    ipcRenderer.invoke('mysql:connect', config),
  disconnect: (): Promise<ApiResponse<boolean>> => ipcRenderer.invoke('mysql:disconnect'),
  status: (): Promise<ApiResponse<boolean>> => ipcRenderer.invoke('mysql:status'),
  listDatabases: (): Promise<ApiResponse<DatabaseNode[]>> =>
    ipcRenderer.invoke('mysql:listDatabases'),
  getTableSchema: (database: string, table: string): Promise<ApiResponse<TableSchema>> =>
    ipcRenderer.invoke('mysql:getTableSchema', database, table),
  getErDiagram: (database: string): Promise<ApiResponse<ErDiagramData>> =>
    ipcRenderer.invoke('mysql:getErDiagram', database),
  getTableData: (
    database: string,
    table: string,
    page?: number,
    pageSize?: number
  ): Promise<ApiResponse<TableDataResult>> =>
    ipcRenderer.invoke('mysql:getTableData', database, table, page, pageSize),
  executeQuery: (sql: string, database?: string): Promise<ApiResponse<QueryResult>> =>
    ipcRenderer.invoke('mysql:executeQuery', sql, database)
}

contextBridge.exposeInMainWorld('mysqlApi', api)

export type MysqlApi = typeof api
