import { useCallback, useEffect, useState } from 'react'
import { GitBranch, LineChart, LogOut, Rows3, Table2, Terminal } from 'lucide-react'
import logo from '../assets/logo.png'
import DatabaseTree from '../components/DatabaseTree'
import SqlEditor from '../components/SqlEditor'
import QueryResults from '../components/QueryResults'
import ErDiagram from '../components/ErDiagram'
import ChartPanel from '../components/ChartPanel'
import TableSchemaView from '../components/TableSchemaView'
import TableDataView from '../components/TableDataView'
import ThemeSettingsPanel from '../components/ThemeSettingsPanel'
import AppInfoPanel from '../components/AppInfoPanel'
import type {
  ChartConfig,
  ConnectionConfig,
  DatabaseNode,
  ErDiagramData,
  QueryResult,
  TableDataResult,
  TableSchema
} from '../../../shared/types'
import '../styles/App.css'
import '../styles/ThemeSettings.css'

type TabKey = 'workbench' | 'data' | 'schema' | 'er' | 'chart'

interface Props {
  session: ConnectionConfig
  onLogout: () => Promise<void>
}

export default function QueryWorkspace({ session, onLogout }: Props): React.JSX.Element {
  const [loggingOut, setLoggingOut] = useState(false)
  const [databases, setDatabases] = useState<DatabaseNode[]>([])
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(session.database || null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('workbench')

  const [sql, setSql] = useState('SELECT 1 AS demo;')
  const [executing, setExecuting] = useState(false)
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [queryError, setQueryError] = useState<string | null>(null)

  const [tableSchema, setTableSchema] = useState<TableSchema | null>(null)
  const [schemaLoading, setSchemaLoading] = useState(false)
  const [schemaError, setSchemaError] = useState<string | null>(null)

  const [tableData, setTableData] = useState<TableDataResult | null>(null)
  const [tableDataLoading, setTableDataLoading] = useState(false)
  const [tableDataError, setTableDataError] = useState<string | null>(null)
  const [dataPage, setDataPage] = useState(1)
  const [dataPageSize, setDataPageSize] = useState(100)

  const [erData, setErData] = useState<ErDiagramData | null>(null)
  const [erLoading, setErLoading] = useState(false)
  const [erError, setErError] = useState<string | null>(null)

  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: 'bar',
    xColumn: '',
    yColumn: '',
    title: '查询结果可视化'
  })

  const refreshDatabases = useCallback(async (): Promise<void> => {
    const res = await window.mysqlApi.listDatabases()
    if (res.success && res.data) {
      setDatabases(res.data)
      setSelectedDatabase((current) => {
        if (current && res.data!.some((db) => db.name === current)) return current
        if (session.database && res.data!.some((db) => db.name === session.database)) {
          return session.database
        }
        return res.data!.length > 0 ? res.data![0].name : null
      })
    }
  }, [session.database])

  const loadTableSchema = useCallback(async (database: string, table: string): Promise<void> => {
    setSchemaLoading(true)
    setSchemaError(null)
    const res = await window.mysqlApi.getTableSchema(database, table)
    setSchemaLoading(false)
    if (res.success && res.data) {
      setTableSchema(res.data)
    } else {
      setTableSchema(null)
      setSchemaError(res.error || '加载失败')
    }
  }, [])

  const loadTableData = useCallback(async (
    database: string,
    table: string,
    page: number,
    pageSize: number
  ): Promise<void> => {
    setTableDataLoading(true)
    setTableDataError(null)
    const res = await window.mysqlApi.getTableData(database, table, page, pageSize)
    setTableDataLoading(false)
    if (res.success && res.data) {
      setTableData(res.data)
    } else {
      setTableData(null)
      setTableDataError(res.error || '加载失败')
    }
  }, [])

  const loadErDiagram = useCallback(async (database: string): Promise<void> => {
    setErLoading(true)
    setErError(null)
    const res = await window.mysqlApi.getErDiagram(database)
    setErLoading(false)
    if (res.success && res.data) {
      setErData(res.data)
    } else {
      setErData(null)
      setErError(res.error || '加载失败')
    }
  }, [])

  useEffect(() => {
    void refreshDatabases()
  }, [refreshDatabases])

  useEffect(() => {
    if (selectedDatabase && selectedTable) {
      loadTableSchema(selectedDatabase, selectedTable)
      setSql(`SELECT * FROM \`${selectedTable}\` LIMIT 100;`)
    } else {
      setTableData(null)
      setTableDataError(null)
    }
  }, [selectedDatabase, selectedTable, loadTableSchema])

  useEffect(() => {
    if (!selectedDatabase || !selectedTable || activeTab !== 'data') return
    void loadTableData(selectedDatabase, selectedTable, dataPage, dataPageSize)
  }, [selectedDatabase, selectedTable, activeTab, dataPage, dataPageSize, loadTableData])

  useEffect(() => {
    if (selectedDatabase && activeTab === 'er') {
      loadErDiagram(selectedDatabase)
    }
  }, [selectedDatabase, activeTab, loadErDiagram])

  useEffect(() => {
    if (queryResult?.columns.length) {
      const cols = queryResult.columns
      setChartConfig((prev) => ({
        ...prev,
        xColumn: prev.xColumn && cols.includes(prev.xColumn) ? prev.xColumn : cols[0],
        yColumn:
          prev.yColumn && cols.includes(prev.yColumn)
            ? prev.yColumn
            : cols[1] || cols[0]
      }))
    }
  }, [queryResult])

  const executeQuery = useCallback(async (): Promise<void> => {
    if (!sql.trim()) return
    setExecuting(true)
    setQueryError(null)
    const res = await window.mysqlApi.executeQuery(sql, selectedDatabase || undefined)
    setExecuting(false)
    if (res.success && res.data) {
      setQueryResult(res.data)
    } else {
      setQueryResult(null)
      setQueryError(res.error || '执行失败')
    }
  }, [sql, selectedDatabase])

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        void executeQuery()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [executeQuery])

  const handleLogout = async (): Promise<void> => {
    setLoggingOut(true)
    await onLogout()
    setLoggingOut(false)
  }

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'workbench', label: 'SQL 查询', icon: <Terminal size={14} /> },
    { key: 'data', label: '表数据', icon: <Rows3 size={14} /> },
    { key: 'schema', label: '表结构', icon: <Table2 size={14} /> },
    { key: 'er', label: 'ER 图', icon: <GitBranch size={14} /> },
    { key: 'chart', label: '图表', icon: <LineChart size={14} /> }
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={logo} alt="屿·mysql" className="sidebar-logo" />
          <div>
            <h1>屿·mysql</h1>
            <p>{session.user}@{session.host}:{session.port}</p>
          </div>
        </div>

        <div className="panel session-panel">
          <div className="panel-header">
            <span>当前连接</span>
            <span className="badge connected">已登录</span>
          </div>
          <div className="panel-body session-info">
            <div><span>用户</span><strong>{session.user}</strong></div>
            <div><span>主机</span><strong>{session.host}:{session.port}</strong></div>
            {session.database && (
              <div><span>默认库</span><strong>{session.database}</strong></div>
            )}
          </div>
        </div>

        <div className="panel sidebar-db-panel">
          <div className="panel-header">
            <span>数据库浏览器</span>
            {selectedDatabase && <span className="badge">{selectedDatabase}</span>}
          </div>
          <div className="panel-body sidebar-db-body">
            <DatabaseTree
              databases={databases}
              selectedDatabase={selectedDatabase}
              selectedTable={selectedTable}
              onSelectDatabase={(db) => {
                setSelectedDatabase(db)
                setSelectedTable(null)
              }}
              onSelectTable={(db, table) => {
                setSelectedDatabase(db)
                setSelectedTable(table)
                setDataPage(1)
                setActiveTab('data')
              }}
            />
          </div>
        </div>

        <AppInfoPanel />
      </aside>

      <main className="main-area">
        <div className="workspace-topbar">
          <div className="tab-bar">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
          <div className="topbar-actions">
            <ThemeSettingsPanel />
            <button className="secondary topbar-action-btn" onClick={handleLogout} disabled={loggingOut}>
              <LogOut size={14} />
              {loggingOut ? '退出中...' : '退出登录'}
            </button>
          </div>
        </div>

        <div className="content-tabs">
          {activeTab === 'workbench' && (
            <div className="workbench-grid">
              <SqlEditor
                value={sql}
                onChange={setSql}
                onExecute={executeQuery}
                executing={executing}
                selectedDatabase={selectedDatabase}
              />
              <QueryResults result={queryResult} error={queryError} />
            </div>
          )}

          {activeTab === 'data' && (
            <div className="tab-content">
              <div className="panel table-data-panel">
                <div className="panel-header">
                  <span>表数据</span>
                  {selectedTable && selectedDatabase && (
                    <span className="badge">
                      {selectedDatabase}.{selectedTable}
                    </span>
                  )}
                </div>
                <div className="panel-body table-data-panel-body">
                  <TableDataView
                    database={selectedDatabase}
                    table={selectedTable}
                    data={tableData}
                    loading={tableDataLoading}
                    error={tableDataError}
                    page={dataPage}
                    pageSize={dataPageSize}
                    onPageChange={setDataPage}
                    onPageSizeChange={(size) => {
                      setDataPageSize(size)
                      setDataPage(1)
                    }}
                    onRefresh={() => {
                      if (selectedDatabase && selectedTable) {
                        void loadTableData(selectedDatabase, selectedTable, dataPage, dataPageSize)
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="tab-content">
              <div className="panel" style={{ height: '100%' }}>
                <div className="panel-header">
                  <span>表结构详情</span>
                  {selectedTable && selectedDatabase && (
                    <span className="badge">
                      {selectedDatabase}.{selectedTable}
                    </span>
                  )}
                </div>
                <div className="panel-body" style={{ height: 'calc(100% - 44px)' }}>
                  <TableSchemaView
                    schema={tableSchema}
                    database={selectedDatabase}
                    loading={schemaLoading}
                    error={schemaError}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'er' && (
            <div className="tab-content" style={{ paddingBottom: 0 }}>
              <div className="panel" style={{ height: '100%', overflow: 'hidden' }}>
                <div className="panel-header">
                  <span>ER 关系图</span>
                  {selectedDatabase && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="badge">{selectedDatabase}</span>
                      <button
                        className="secondary"
                        onClick={() => selectedDatabase && loadErDiagram(selectedDatabase)}
                      >
                        刷新
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ height: 'calc(100% - 44px)' }}>
                  <ErDiagram data={erData} loading={erLoading} error={erError} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chart' && (
            <div className="tab-content">
              <div className="panel" style={{ height: '100%' }}>
                <div className="panel-header">
                  <span>查询结果图表</span>
                  {queryResult && <span className="badge">{queryResult.rowCount} 行数据</span>}
                </div>
                <div className="panel-body" style={{ height: 'calc(100% - 44px)' }}>
                  <ChartPanel
                    result={queryResult}
                    config={chartConfig}
                    onConfigChange={setChartConfig}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
