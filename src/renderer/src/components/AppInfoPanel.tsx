import { APP_DEVELOPER, APP_VERSION } from '../../../shared/appInfo'

export default function AppInfoPanel(): React.JSX.Element {
  return (
    <div className="panel app-info-panel">
      <div className="app-info-row">
        <span>开发部门</span>
        <strong>{APP_DEVELOPER}</strong>
      </div>
      <div className="app-info-row">
        <span>版本号</span>
        <strong>{APP_VERSION}</strong>
      </div>
    </div>
  )
}
