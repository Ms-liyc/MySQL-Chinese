export interface ConnectionConfig {
  id?: string
  name: string
  host: string
  port: number
  user: string
  password: string
  database?: string
}

export interface DatabaseNode {
  name: string
  tables: string[]
}

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  key: string
  default: string | null
  extra: string
}

export interface ForeignKeyInfo {
  column: string
  referencedTable: string
  referencedColumn: string
}

export interface TableSchema {
  name: string
  columns: ColumnInfo[]
  primaryKeys: string[]
  foreignKeys: ForeignKeyInfo[]
}

export interface ErRelation {
  fromTable: string
  fromColumn: string
  toTable: string
  toColumn: string
}

export interface ErDiagramData {
  tables: TableSchema[]
  relations: ErRelation[]
}

export interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  durationMs: number
  affectedRows?: number
  message?: string
}

export interface TableDataResult {
  columns: string[]
  rows: Record<string, unknown>[]
  total: number
  page: number
  pageSize: number
  durationMs: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export type ChartType = 'bar' | 'line' | 'pie'

export interface ChartConfig {
  type: ChartType
  xColumn: string
  yColumn: string
  title?: string
}
