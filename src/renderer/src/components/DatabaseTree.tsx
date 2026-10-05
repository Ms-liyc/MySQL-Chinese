import { ChevronDown, ChevronRight, Database, Table2 } from 'lucide-react'
import { useState } from 'react'
import type { DatabaseNode } from '../../../shared/types'

interface Props {
  databases: DatabaseNode[]
  selectedDatabase: string | null
  selectedTable: string | null
  onSelectDatabase: (database: string) => void
  onSelectTable: (database: string, table: string) => void
}

export default function DatabaseTree({
  databases,
  selectedDatabase,
  selectedTable,
  onSelectDatabase,
  onSelectTable
}: Props): React.JSX.Element {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggle = (name: string): void => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  if (databases.length === 0) {
    return (
      <div className="empty-state" style={{ height: 200 }}>
        <Database size={28} />
        <span>连接后可浏览数据库与表</span>
      </div>
    )
  }

  return (
    <div style={{ overflow: 'auto', height: '100%' }}>
      {databases.map((db) => {
        const isOpen = expanded[db.name] ?? selectedDatabase === db.name
        const isDbSelected = selectedDatabase === db.name && !selectedTable

        return (
          <div key={db.name}>
            <button
              className="secondary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 4,
                textAlign: 'left',
                background: isDbSelected ? 'var(--bg-hover)' : undefined
              }}
              onClick={() => {
                toggle(db.name)
                onSelectDatabase(db.name)
              }}
            >
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Database size={14} />
              {db.name}
              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 11 }}>
                {db.tables.length}
              </span>
            </button>

            {isOpen && (
              <div style={{ paddingLeft: 18, marginBottom: 8 }}>
                {db.tables.map((table) => {
                  const active = selectedDatabase === db.name && selectedTable === table
                  return (
                    <button
                      key={table}
                      className="secondary"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 2,
                        fontSize: 12,
                        padding: '6px 10px',
                        background: active ? 'rgba(var(--accent-rgb), 0.15)' : undefined,
                        borderColor: active ? 'var(--accent)' : undefined
                      }}
                      onClick={() => onSelectTable(db.name, table)}
                    >
                      <Table2 size={12} />
                      {table}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
