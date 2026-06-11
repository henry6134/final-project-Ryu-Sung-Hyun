// SVG 아이콘 — 단일 path가 아닌 경우 children으로 처리
const Icon = ({ children, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

// 개별 아이콘 컴포넌트
const PenIcon    = () => <Icon><path d="M11 2l3 3-8 8H3v-3L11 2z"/></Icon>
const EraserIcon = () => <Icon><path d="M12 3L3 12l2 2 9-9-2-2zM1 15h14"/></Icon>
const EyedropIcon= () => <Icon><path d="M10 2l4 4-7 7-2-1-3 3H1v-2l3-3-1-2 7-7z"/></Icon>

// 이동: 십자 + 4방향 화살표
const MoveIcon   = () => (
  <Icon>
    {/* 위 */}
    <path d="M8 2v12"/>
    <path d="M5 5l3-3 3 3"/>
    {/* 아래 */}
    <path d="M5 11l3 3 3-3"/>
    {/* 왼 */}
    <path d="M2 8h12"/>
    <path d="M5 5L2 8l3 3"/>
    {/* 오른 */}
    <path d="M11 5l3 3-3 3"/>
  </Icon>
)

const UndoIcon   = () => <Icon><path d="M3 7H9a4 4 0 010 8H7M3 7L6 4M3 7l3 3"/></Icon>
const RedoIcon   = () => <Icon><path d="M13 7H7a4 4 0 000 8h2M13 7l-3-3M13 7l-3 3"/></Icon>
const ImportIcon = () => <Icon><path d="M8 2v9M4 7l4 4 4-4M2 13h12"/></Icon>
const ExportIcon = () => <Icon><path d="M8 11V2M4 5l4-4 4 4M2 13h12"/></Icon>

// 톱니바퀴: 원 + 6개 돌기
const SettingsIcon = () => (
  <Icon>
    <circle cx="8" cy="8" r="2.5"/>
    {/* 6개 돌기 */}
    <path d="M8 1v2.2"/>
    <path d="M8 12.8V15"/>
    <path d="M1 8h2.2"/>
    <path d="M12.8 8H15"/>
    <path d="M3.05 3.05l1.56 1.56"/>
    <path d="M11.39 11.39l1.56 1.56"/>
    <path d="M3.05 12.95l1.56-1.56"/>
    <path d="M11.39 4.61l1.56-1.56"/>
  </Icon>
)

const MoonIcon = () => <Icon><path d="M12 3a6 6 0 01-9 9 6 6 0 009-9z"/></Icon>
const SunIcon  = () => (
  <Icon>
    <circle cx="8" cy="8" r="3"/>
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3"/>
  </Icon>
)

export default function Toolbar({
  tool, setTool, color, theme,
  onOpenColor, onOpenExport, onOpenImport,
  onUndo, onRedo, canUndo, canRedo,
  onOpenSettings, onEraserSize, onToggleTheme,
}) {
  return (
    <header className="toolbar">
      {/* Drawing tools */}
      <div className="tool-group">
        <button className={tool === 'pen'        ? 'active' : ''} onClick={() => setTool('pen')}        title="펜 — 선택 중 다시 클릭하면 크기 조절"><PenIcon /> 펜</button>
        <button className={tool === 'eraser'     ? 'active' : ''} onClick={() => setTool('eraser')}     onContextMenu={onEraserSize} title="지우개 — 선택 중 다시 클릭하면 모두 지우기 / 우클릭하면 크기 조절"><EraserIcon /> 지우개</button>
        <button className={tool === 'eyedropper' ? 'active' : ''} onClick={() => setTool('eyedropper')} title="스포이드"><EyedropIcon /> 스포이드</button>
        <button className={tool === 'grab'       ? 'active' : ''} onClick={() => setTool('grab')}       title="이동 — 캔버스를 드래그로 이동"><MoveIcon /> 이동</button>
      </div>

      <div className="toolbar-sep" />

      {/* Color */}
      <div className="tool-group">
        <button onClick={onOpenColor} title="색 선택">
          <span className="color-chip" style={{ background: color }} />
          색
        </button>
      </div>

      <div className="toolbar-sep" />

      {/* History */}
      <div className="tool-group">
        <button onClick={onUndo} disabled={!canUndo} title="실행 취소"><UndoIcon /></button>
        <button onClick={onRedo} disabled={!canRedo} title="다시 실행"><RedoIcon /></button>
      </div>

      <div className="toolbar-sep" />

      {/* File */}
      <div className="tool-group">
        <button onClick={onOpenImport} title="불러오기"><ImportIcon /> 불러오기</button>
        <button onClick={onOpenExport} title="내보내기"><ExportIcon /> 내보내기</button>
      </div>

      <div className="spacer" />

      {/* Theme + Settings */}
      <div className="tool-group">
        <button className="tool-icon-btn" onClick={onToggleTheme} title={theme === 'light' ? '다크 모드' : '라이트 모드'}>
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
        <button className="tool-icon-btn" onClick={onOpenSettings} title="설정">
          <SettingsIcon />
        </button>
      </div>
    </header>
  )
}
