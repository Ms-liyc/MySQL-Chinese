import type { TableSchema } from '../../../shared/types'

interface Props {
  schema: TableSchema | null
  database: string | null
  loading: boolean
  error: string | null
}

export default function TableSchemaView({
  schema,
  database,
  loading,
  error
}: Props): React.JSX.Element {
  if (loading) {
    return <div className="empty-state"><span>正在加载表结构...</span></div>
  }

  if (error) {
    return <div className="empty-state"><span className="error-text">{error}</span></div>
  }

  if (!schema || !database) {
    return (
      <div className="empty-state">
        <span>在左侧选择一张表，查看字段、主键与外键</span>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>{database}.{schema.name}</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge">字段 {schema.columns.length}</span>
          <span className="badge">主键 {schema.primaryKeys.join(', ') || '无'}</span>
          <span className="badge">外键 {schema.foreignKeys.length}</span>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>字段</th>
              <th>类型</th>
              <th>可空</th>
              <th>键</th>
              <th>默认值</th>
              <th>Extra</th>
            </tr>
          </thead>
          <tbody>
            {schema.columns.map((col) => (
              <tr key={col.name}>
                <td>{col.name}</td>
                <td>{col.type}</td>
                <td>{col.nullable ? 'YES' : 'NO'}</td>
                <td>{col.key || '-'}</td>
                <td>{col.default ?? 'NULL'}</td>
                <td>{col.extra || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {schema.foreignKeys.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>外键关系</h4>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>本表字段</th>
                  <th>引用表</th>
                  <th>引用字段</th>
                </tr>
              </thead>
              <tbody>
                {schema.foreignKeys.map((fk) => (
                  <tr key={`${fk.column}-${fk.referencedTable}`}>
                    <td>{fk.column}</td>
                    <td>{fk.referencedTable}</td>
                    <td>{fk.referencedColumn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
