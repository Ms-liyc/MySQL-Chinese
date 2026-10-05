import type { QueryResult } from '../../../shared/types'
import { formatCellValue } from '../utils/formatCellValue'

interface Props {
  result: QueryResult | null
  error: string | null
}

export default function QueryResults({ result, error }: Props): React.JSX.Element {
  if (error) {
    return (
      <div className="panel" style={{ height: '100%' }}>
        <div className="panel-header">查询结果</div>
        <div className="panel-body">
          <div className="error-text">{error}</div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="panel" style={{ height: '100%' }}>
        <div className="panel-header">查询结果</div>
        <div className="empty-state">
          <span>执行 SQL 后在此查看结果</span>
        </div>
      </div>
    )
  }

  if (result.message) {
    return (
      <div className="panel" style={{ height: '100%' }}>
        <div className="panel-header">
          <span>查询结果</span>
          <span className="badge">{result.durationMs} ms</span>
        </div>
        <div className="panel-body">
          <div className="success-text">{result.message}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span>查询结果</span>
        <span className="badge">
          {result.rowCount} 行 · {result.durationMs} ms
        </span>
      </div>
      <div className="table-wrap" style={{ flex: 1 }}>
        <table className="data-table">
          <thead>
            <tr>
              {result.columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, idx) => (
              <tr key={idx}>
                {result.columns.map((col) => (
                  <td key={col}>{formatCellValue(row[col])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
