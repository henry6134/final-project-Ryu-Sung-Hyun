// SVG 아이콘 컴포넌트 (이모지 대신 심플한 SVG)
const Icon = ({ d, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const Icons = {
  pen:        "M11 2l3 3-8 8H3v-3L11 2z",
  eraser:     "M12 3L3 12l2 2 9-9-2-2zM1 15h14",
  eyedropper: "M10 2l4 4-7 7-2-1-3 3H1v-2l3-3-1-2 7-7z",
  grab:       "M6 1v6M10 3v4M4 7v3M8 7v3M12 7v3M4 10c0 2 8 2 8 0",
  color:      null, // color chip instead
  undo:       "M3 7H9a4 4 0 010 8H7M3 7L6 4M3 7l3 3",
  redo:       "M13 7H7a4 4 0 000 8h2M13 7l-3-3M13 7l-3 3",
  import:     "M8 2v9M4 7l4 4 4-4M2 13h12",
  export:     "M8 11V2M4 5l4-4 4 4M2 13h12",
  settings:   "M8 10a2 2 0 100-4 2 2 0 000 4zM8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4",
  moon:       "M12 3a6 6 0 01-9 9 6 6 0 009-9z",
  sun:        "M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3M8 5a3 3 0 100 6 3 3 0 000-6z",
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
        <button
          className={tool === 'pen' ? 'active' : ''}
          onClick={() => setTool('pen')}
          title="펜 — 선택 중 다시 클릭하면 크기 조절"
        >
          <Icon d={Icons.pen} /> 펜
        </button>
        <button
          className={tool === 'eraser' ? 'active' : ''}
          onClick={() => setTool('eraser')}
          onContextMenu={onEraserSize}
          title="지우개 — 선택 중 다시 클릭하면 모두 지우기 / 우클릭하면 크기 조절"
        >
          <Icon d={Icons.eraser} /> 지우개
        </button>
        <button
          className={tool === 'eyedropper' ? 'active' : ''}
          onClick={() => setTool('eyedropper')}
          title="스포이드"
        >
          <Icon d={Icons.eyedropper} /> 스포이드
        </button>
        <button
          className={tool === 'grab' ? 'active' : ''}
          onClick={() => setTool('grab')}
          title="손 — 캔버스 드래그로 이동"
        >
          <Icon d={Icons.grab} /> 이동
        </button>
      </div>

      <div className="toolbar-sep" />

      {/* Color */}
      <div className="tool-group">
        <button
          onClick={onOpenColor}
          title="색 선택"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span className="color-chip" style={{ background: color }} />
          색
        </button>
      </div>

      <div className="toolbar-sep" />

      {/* History */}
      <div className="tool-group">
        <button onClick={onUndo} disabled={!canUndo} title="실행 취소">
          <Icon d={Icons.undo} />
        </button>
        <button onClick={onRedo} disabled={!canRedo} title="다시 실행">
          <Icon d={Icons.redo} />
        </button>
      </div>

      <div className="toolbar-sep" />

      {/* File */}
      <div className="tool-group">
        <button onClick={onOpenImport} title="불러오기" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon d={Icons.import} /> 불러오기
        </button>
        <button onClick={onOpenExport} title="내보내기" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon d={Icons.export} /> 내보내기
        </button>
      </div>

      <div className="spacer" />

      {/* Theme toggle + Settings — right side */}
      <div className="tool-group">
        <button
          className="tool-icon-btn"
          onClick={onToggleTheme}
          title={theme === 'light' ? '다크 모드' : '라이트 모드'}
        >
          <Icon d={theme === 'light' ? Icons.moon : Icons.sun} />
        </button>
        <button
          className="tool-icon-btn"
          onClick={onOpenSettings}
          title="설정"
        >
          <Icon d={Icons.settings} />
        </button>
      </div>
    </header>
  )
}
