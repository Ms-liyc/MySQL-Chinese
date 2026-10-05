import Editor from '@monaco-editor/react'
import { Play, RotateCcw } from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
  onExecute: () => void
  executing: boolean
  selectedDatabase: string | null
}

export default function SqlEditor({
  value,
  onChange,
  onExecute,
  executing,
  selectedDatabase
}: Props): React.JSX.Element {
  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="panel-header">
        <span>SQL 编辑器</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {selectedDatabase && (
            <span className="badge">当前库: {selectedDatabase}</span>
          )}
          <button
            className="secondary"
            onClick={() => onChange('SELECT 1;')}
            disabled={executing}
            title="重置示例"
          >
            <RotateCcw size={14} />
          </button>
          <button onClick={onExecute} disabled={executing}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Play size={14} />
              {executing ? '执行中...' : '执行 (Ctrl+Enter)'}
            </span>
          </button>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 180 }}>
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="vs-dark"
          value={value}
          onChange={(v) => onChange(v || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true
          }}
        />
      </div>
    </div>
  )
}
