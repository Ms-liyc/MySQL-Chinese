import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { useTheme } from '../theme/ThemeProvider'
import type { ChartConfig, QueryResult } from '../../../shared/types'

interface Props {
  result: QueryResult | null
  config: ChartConfig
  onConfigChange: (config: ChartConfig) => void
}

function isNumeric(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false
  return !Number.isNaN(Number(value))
}

export default function ChartPanel({ result, config, onConfigChange }: Props): React.JSX.Element {
  const { accentColor, theme } = useTheme()
  const columns = result?.columns ?? []
  const textColor = theme.mode === 'light' ? '#0f172a' : '#e2e8f0'
  const mutedColor = theme.mode === 'light' ? '#64748b' : '#94a3b8'

  const option = useMemo(() => {
    if (!result || result.rows.length === 0) return null

    const labels = result.rows.map((row) => String(row[config.xColumn] ?? ''))
    const values = result.rows.map((row) => Number(row[config.yColumn] ?? 0))

    if (config.type === 'pie') {
      return {
        title: { text: config.title || '查询结果图表', textStyle: { color: textColor, fontSize: 14 } },
        tooltip: { trigger: 'item' },
        backgroundColor: 'transparent',
        series: [
          {
            type: 'pie',
            radius: '60%',
            data: labels.map((name, i) => ({ name, value: values[i] })),
            label: { color: mutedColor }
          }
        ]
      }
    }

    return {
      title: { text: config.title || '查询结果图表', textStyle: { color: textColor, fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      backgroundColor: 'transparent',
      grid: { left: 48, right: 24, top: 48, bottom: 48 },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { color: mutedColor, rotate: labels.length > 8 ? 30 : 0 }
      },
      yAxis: { type: 'value', axisLabel: { color: mutedColor } },
      series: [
        {
          type: config.type,
          data: values,
          itemStyle: { color: accentColor },
          smooth: config.type === 'line'
        }
      ]
    }
  }, [result, config, accentColor, textColor, mutedColor])

  const numericColumns = columns.filter((col) =>
    result?.rows.some((row) => isNumeric(row[col]))
  )

  if (!result || result.rows.length === 0) {
    return (
      <div className="empty-state">
        <span>先执行返回数据的 SELECT 查询，再在此生成图表</span>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 10
        }}
      >
        <div>
          <label>图表类型</label>
          <select
            value={config.type}
            onChange={(e) =>
              onConfigChange({ ...config, type: e.target.value as ChartConfig['type'] })
            }
          >
            <option value="bar">柱状图</option>
            <option value="line">折线图</option>
            <option value="pie">饼图</option>
          </select>
        </div>
        <div>
          <label>X 轴 / 分类</label>
          <select
            value={config.xColumn}
            onChange={(e) => onConfigChange({ ...config, xColumn: e.target.value })}
          >
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Y 轴 / 数值</label>
          <select
            value={config.yColumn}
            onChange={(e) => onConfigChange({ ...config, yColumn: e.target.value })}
          >
            {numericColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>标题</label>
          <input
            value={config.title || ''}
            onChange={(e) => onConfigChange({ ...config, title: e.target.value })}
            placeholder="图表标题"
          />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 280 }}>
        {option ? (
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
        ) : (
          <div className="empty-state">请选择有效的 X/Y 字段</div>
        )}
      </div>
    </div>
  )
}
