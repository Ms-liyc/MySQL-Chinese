import mysql, { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import type {
  ConnectionConfig,
  DatabaseNode,
  ErDiagramData,
  ErRelation,
  QueryResult,
  TableDataResult,
  TableSchema
} from '../../shared/types'

let pool: Pool | null = null
let activeConfig: ConnectionConfig | null = null

export function getActiveConfig(): ConnectionConfig | null {
  return activeConfig
}

export async function connect(config: ConnectionConfig): Promise<void> {
  await disconnect()

  pool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database || undefined,
    waitForConnections: true,
    connectionLimit: 5,
    enableKeepAlive: true
  })

  const conn = await pool.getConnection()
  await conn.ping()
  conn.release()

  activeConfig = config
}

export async function disconnect(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
  activeConfig = null
}

export function isConnected(): boolean {
  return pool !== null
}

async function query<T extends RowDataPacket[]>(
  sql: string,
  params: unknown[] = []
): Promise<T> {
  if (!pool) throw new Error('未连接到 MySQL，请先建立连接')
  const [rows] = await pool.query<T>(sql, params)
  return rows
}

export async function listDatabases(): Promise<DatabaseNode[]> {
  const dbRows = await query<RowDataPacket[]>('SHOW DATABASES')
  const databases: DatabaseNode[] = []

  for (const row of dbRows) {
    const name = String(row.Database)
    if (['information_schema', 'performance_schema', 'mysql', 'sys'].includes(name)) {
      continue
    }

    const tableRows = await query<RowDataPacket[]>(
      `SELECT TABLE_NAME AS tableName FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME`,
      [name]
    )

    databases.push({
      name,
      tables: tableRows.map((t) => String(t.tableName))
    })
  }

  return databases
}

export async function getTableSchema(database: string, table: string): Promise<TableSchema> {
  const columns = await query<RowDataPacket[]>(
    `SELECT COLUMN_NAME AS name, COLUMN_TYPE AS type, IS_NULLABLE AS nullable,
            COLUMN_KEY AS colKey, COLUMN_DEFAULT AS defaultValue, EXTRA AS extra
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
     ORDER BY ORDINAL_POSITION`,
    [database, table]
  )

  const fkRows = await query<RowDataPacket[]>(
    `SELECT COLUMN_NAME AS columnName, REFERENCED_TABLE_NAME AS referencedTable,
            REFERENCED_COLUMN_NAME AS referencedColumn
     FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
    [database, table]
  )

  const columnInfos = columns.map((col) => ({
    name: String(col.name),
    type: String(col.type),
    nullable: col.nullable === 'YES',
    key: String(col.colKey || ''),
    default: col.defaultValue != null ? String(col.defaultValue) : null,
    extra: String(col.extra || '')
  }))

  return {
    name: table,
    columns: columnInfos,
    primaryKeys: columnInfos.filter((c) => c.key === 'PRI').map((c) => c.name),
    foreignKeys: fkRows.map((fk) => ({
      column: String(fk.columnName),
      referencedTable: String(fk.referencedTable),
      referencedColumn: String(fk.referencedColumn)
    }))
  }
}

export async function getErDiagram(database: string): Promise<ErDiagramData> {
  const db = await listDatabases()
  const target = db.find((d) => d.name === database)
  if (!target) throw new Error(`数据库 ${database} 不存在`)

  const tables: TableSchema[] = []
  const relations: ErRelation[] = []

  for (const tableName of target.tables) {
    const schema = await getTableSchema(database, tableName)
    tables.push(schema)

    for (const fk of schema.foreignKeys) {
      relations.push({
        fromTable: tableName,
        fromColumn: fk.column,
        toTable: fk.referencedTable,
        toColumn: fk.referencedColumn
      })
    }
  }

  return { tables, relations }
}

function escapeIdentifier(name: string): string {
  return `\`${name.replace(/`/g, '``')}\``
}

export async function getTableData(
  database: string,
  table: string,
  page = 1,
  pageSize = 100
): Promise<TableDataResult> {
  if (!pool) throw new Error('未连接到 MySQL，请先建立连接')

  const safePage = Math.max(1, page)
  const safePageSize = Math.min(Math.max(1, pageSize), 500)
  const offset = (safePage - 1) * safePageSize
  const qualifiedTable = `${escapeIdentifier(database)}.${escapeIdentifier(table)}`

  const start = Date.now()
  const conn = await pool.getConnection()

  try {
    await conn.query(`USE ${escapeIdentifier(database)}`)

    const [countRows] = await conn.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM ${qualifiedTable}`
    )
    const total = Number(countRows[0]?.total ?? 0)

    const [rows, fields] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM ${qualifiedTable} LIMIT ${safePageSize} OFFSET ${offset}`
    )

    const columns =
      fields && Array.isArray(fields)
        ? fields.map((f) => String(f.name))
        : rows[0]
          ? Object.keys(rows[0])
          : []

    return {
      columns,
      rows: rows as Record<string, unknown>[],
      total,
      page: safePage,
      pageSize: safePageSize,
      durationMs: Date.now() - start
    }
  } finally {
    conn.release()
  }
}

export async function executeQuery(sql: string, database?: string): Promise<QueryResult> {
  if (!pool) throw new Error('未连接到 MySQL，请先建立连接')

  const start = Date.now()
  const conn = await pool.getConnection()

  try {
    if (database) {
      await conn.query(`USE \`${database.replace(/`/g, '``')}\``)
    }

    const [result, fields] = await conn.query(sql)
    const durationMs = Date.now() - start

    if (Array.isArray(result)) {
      const rows = result as Record<string, unknown>[]
      const columns =
        fields && Array.isArray(fields) ? fields.map((f) => String(f.name)) : rows[0] ? Object.keys(rows[0]) : []

      return {
        columns,
        rows,
        rowCount: rows.length,
        durationMs
      }
    }

    const header = result as ResultSetHeader
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      durationMs,
      affectedRows: header.affectedRows,
      message: `执行成功，影响 ${header.affectedRows} 行`
    }
  } finally {
    conn.release()
  }
}
