import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMemo } from 'react'
import { useTheme } from '../theme/ThemeProvider'
import type { ErDiagramData } from '../../../shared/types'

interface Props {
  data: ErDiagramData | null
  loading: boolean
  error: string | null
}

interface TableNodeData {
  label: string
  columns: { name: string; type: string; key: string }[]
}

function TableNode({ data }: { data: TableNodeData }): React.JSX.Element {
  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        minWidth: 220,
        fontSize: 12,
        color: 'var(--text)'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'var(--accent)' }} />
      <div
        style={{
          padding: '8px 12px',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border)',
          fontWeight: 600
        }}
      >
        {data.label}
      </div>
      <div style={{ padding: '4px 0' }}>
        {data.columns.map((col) => (
          <div
            key={col.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              padding: '4px 12px',
              borderBottom: '1px solid rgba(51,65,85,0.5)'
            }}
          >
            <span>
              {col.key === 'PRI' && '🔑 '}
              {col.key === 'MUL' && '🔗 '}
              {col.name}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>{col.type}</span>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--accent)' }} />
    </div>
  )
}

const nodeTypes = { tableNode: TableNode }

export default function ErDiagram({ data, loading, error }: Props): React.JSX.Element {
  const { accentColor, theme } = useTheme()
  const labelColor = theme.mode === 'light' ? '#64748b' : '#94a3b8'

  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [] as Node[], edges: [] as Edge[] }

    const cols = Math.ceil(Math.sqrt(data.tables.length))
    const nodeList: Node[] = data.tables.map((table, index) => ({
      id: table.name,
      type: 'tableNode',
      position: {
        x: (index % cols) * 320,
        y: Math.floor(index / cols) * 280
      },
      data: {
        label: table.name,
        columns: table.columns.map((c) => ({
          name: c.name,
          type: c.type,
          key: c.key
        }))
      }
    }))

    const edgeList: Edge[] = data.relations.map((rel, index) => ({
      id: `edge-${index}`,
      source: rel.fromTable,
      target: rel.toTable,
      label: `${rel.fromColumn} → ${rel.toColumn}`,
      animated: true,
      style: { stroke: accentColor },
      labelStyle: { fill: labelColor, fontSize: 11 }
    }))

    return { nodes: nodeList, edges: edgeList }
  }, [data, accentColor, labelColor])

  if (loading) {
    return <div className="empty-state"><span>正在加载 ER 图...</span></div>
  }

  if (error) {
    return <div className="empty-state"><span className="error-text">{error}</span></div>
  }

  if (!data || data.tables.length === 0) {
    return (
      <div className="empty-state">
        <span>选择数据库后可查看 ER 关系图</span>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg-base)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#334155" gap={20} />
        <Controls />
        <MiniMap
          nodeColor="#243044"
          maskColor="rgba(15, 20, 25, 0.8)"
          style={{ background: '#1a2332' }}
        />
      </ReactFlow>
    </div>
  )
}
