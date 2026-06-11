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

// 버킷: 바깥 통 윤곽 + 물방울 모양
const FillIcon = () => (
  <Icon>
    <path d="M2 11L7 2l5 9a4 4 0 01-5 2 4 4 0 01-2-2z"/>
    <path d="M13 10c0 1.1.9 2 2 2"/>
    <path d="M13 10c0-1.1.9-2 2-2"/>
    <path d="M15 8v4"/>
  </Icon>
)

// 이동: 화살표 머리 크기 50% 축소
const MoveIcon   = () => (
  <Icon>
    {/* 수직선 */}
    <path d="M8 2v12"/>
    {/* 수평선 */}
    <path d="M2 8h12"/>
    {/* 위 화살표 머리 (작게) */}
    <path d="M6.5 4.5L8 2l1.5 2.5"/>
    {/* 아래 화살표 머리 (작게) */}
    <path d="M6.5 11.5L8 14l1.5-2.5"/>
    {/* 왼 화살표 머리 (작게) */}
    <path d="M4.5 6.5L2 8l2.5 1.5"/>
    {/* 오른 화살표 머리 (작게) */}
    <path d="M11.5 6.5L14 8l-2.5 1.5"/>
  </Icon>
)

const UndoIcon   = () => <Icon><path d="M3 7H9a4 4 0 010 8H7M3 7L6 4M3 7l3 3"/></Icon>
const RedoIcon   = () => <Icon><path d="M13 7H7a4 4 0 000 8h2M13 7l-3-3M13 7l-3 3"/></Icon>
const ImportIcon = () => <Icon><path d="M8 2v9M4 7l4 4 4-4M2 13h12"/></Icon>
const ExportIcon = () => <Icon><path d="M8 11V2M4 5l4-4 4 4M2 13h12"/></Icon>

// 설정 아이콘: 가운데 두 겹 원 + 바깥 원과 연결된 8개 선 (해 모양과 구분)
// → 안쪽 작은 원(r=1.8) + 바깥 원(r=4.5) + 8방향 연결선
const SettingsIcon = () => (
  <Icon>
    {/* 바깥 원 */}
    <circle cx="8" cy="8" r="4.5"/>
    {/* 안쪽 작은 원 */}
    <circle cx="8" cy="8" r="1.8"/>
    {/* 바깥 원에서 짧게 뻗은 8개 선 (r=4.5 끝점에서 r=6.5까지) */}
    <line x1="8"    y1="1.5"  x2="8"    y2="3.5"/>
    <line x1="8"    y1="12.5" x2="8"    y2="14.5"/>
    <line x1="1.5"  y1="8"    x2="3.5"  y2="8"/>
    <line x1="12.5" y1="8"    x2="14.5" y2="8"/>
    <line x1="3.29" y1="3.29" x2="4.71" y2="4.71"/>
    <line x1="11.29" y1="11.29" x2="12.71" y2="12.71"/>
    <line x1="3.29" y1="12.71" x2="4.71" y2="11.29"/>
    <line x1="11.29" y1="4.71" x2="12.71" y2="3.29"/>
  </Icon>
)

const MoonIcon = () => <Icon><path d="M12 3a6 6 0 01-9 9 6 6 0 009-9z"/></Icon>

// 에디터 토글과 동일한 디자인의 테마 토글 (썬/문 아이콘 버튼)
export function ThemeToggleEditor({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      className="theme-toggle-editor"
      onClick={onToggle}
      title={isDark ? '라이트 모드' : '다크 모드'}
      aria-label="테마 전환"
    >
      <span className={`toggle-track ${isDark ? 'dark' : 'light'}`}>
        <span className="toggle-thumb">
          {isDark
            ? <MoonIcon />
            : (
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="8" cy="8" r="3"/>
                <line x1="8" y1="1" x2="8" y2="3"/>
                <line x1="8" y1="13" x2="8" y2="15"/>
                <line x1="1" y1="8" x2="3" y2="8"/>
                <line x1="13" y1="8" x2="15" y2="8"/>
                <line x1="3.05" y1="3.05" x2="4.5" y2="4.5"/>
                <line x1="11.5" y1="11.5" x2="12.95" y2="12.95"/>
                <line x1="3.05" y1="12.95" x2="4.5" y2="11.5"/>
                <line x1="11.5" y1="4.5" x2="12.95" y2="3.05"/>
              </svg>
            )
          }
        </span>
      </span>
    </button>
  )
}

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
        <button className={tool === 'fill'       ? 'active' : ''} onClick={() => setTool('fill')}       title="버킷 채우기 — 닫힌 영역을 현재 색으로 채움"><FillIcon /> 채우기</button>
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
        <ThemeToggleEditor theme={theme} onToggle={onToggleTheme} />
        <button className="tool-icon-btn" onClick={onOpenSettings} title="설정">
          <SettingsIcon />
        </button>
      </div>
    </header>
  )
}
