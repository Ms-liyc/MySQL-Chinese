import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import type { TableDataResult } from '../../../shared/types'
import { formatCellValue } from '../utils/formatCellValue'

interface Props {
  database: string | null
  table: string | null
  data: TableDataResult | null
  loading: boolean
  error: string | null
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onRefresh: () => void
}

const PAGE_SIZE_OPTIONS = [50, 100, 200, 500]

export default function TableDataView({
  database,
  table,
  data,
  loading,
  error,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRefresh
}: Props): React.JSX.Element {
  if (!database || !table) {
    return (
      <div className="empty-state">
        <span>在左侧选择一张表，查看其中的数据内容</span>
      </div>
    )
  }

  if (loading) {
    return <div className="empty-state"><span>正在加载表数据...</span></div>
  }

  if (error) {
    return <div className="empty-state"><span className="error-text">{error}</span></div>
  }

  if (!data) {
    return <div className="empty-state"><span>暂无数据</span></div>
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize))
  const rangeStart = data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1
  const rangeEnd = Math.min(data.page * data.pageSize, data.total)

  return (
    <div className="table-data-view">
      <div className="table-data-toolbar">
        <div className="table-data-meta">
          <span className="badge">{database}.{table}</span>
          <span className="badge">
            共 {data.total} 行 · 显示 {rangeStart}-{rangeEnd} · {data.durationMs} ms
          </span>
        </div>
        <div className="table-data-actions">
          <label className="page-size-label">
            每页
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
          <button className="secondary" onClick={onRefresh}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} />
              刷新
            </span>
          </button>
          <div className="pagination">
            <button
              className="secondary"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            <span>{page} / {totalPages}</span>
            <button
              className="secondary"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="table-wrap table-data-content">
        {data.rows.length === 0 ? (
          <div className="empty-state"><span>该表暂无数据</span></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {data.columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, idx) => (
                <tr key={idx}>
                  {data.columns.map((col) => (
                    <td key={col}>{formatCellValue(row[col])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
