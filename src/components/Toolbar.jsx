export default function Toolbar({
  tool, setTool, color,
  onOpenColor, onOpenExport, onOpenImport,
  onUndo, onRedo, canUndo, canRedo,
  onOpenSettings, onEraserSize,
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
          ✏️ 펜
        </button>
        <button
          className={tool === 'eraser' ? 'active' : ''}
          onClick={() => setTool('eraser')}
          onContextMenu={onEraserSize}
          title="지우개 — 선택 중 다시 클릭하면 모두 지우기 / 우클릭하면 크기 조절"
        >
          🧹 지우개
        </button>
        <button
          className={tool === 'eyedropper' ? 'active' : ''}
          onClick={() => setTool('eyedropper')}
          title="스포이드"
        >
          💉 스포이드
        </button>
      </div>

      <div className="toolbar-sep" />

      {/* Color */}
      <div className="tool-group">
        <button onClick={onOpenColor} title="색 선택" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="color-chip" style={{ background: color }} />
          색 선택
        </button>
      </div>

      <div className="toolbar-sep" />

      {/* History */}
      <div className="tool-group">
        <button onClick={onUndo} disabled={!canUndo} title="실행 취소">↩ Undo</button>
        <button onClick={onRedo} disabled={!canRedo} title="다시 실행">↪ Redo</button>
      </div>

      <div className="toolbar-sep" />

      {/* File */}
      <div className="tool-group">
        <button onClick={onOpenImport} title="불러오기">불러오기</button>
        <button onClick={onOpenExport} title="내보내기">내보내기</button>
      </div>

      <div className="spacer" />

      {/* Settings */}
      <button className="tool-icon-btn" onClick={onOpenSettings} title="설정">⚙️</button>
    </header>
  )
}
