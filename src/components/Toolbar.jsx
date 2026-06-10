export default function Toolbar({
  tool, setTool,
  onOpenColor, onOpenExport, onOpenImport,
  onUndo, onRedo, canUndo, canRedo,
  onOpenSize, onOpenClear, onOpenSettings
}) {
  return (
    <header className="toolbar">
      <button className={tool === 'pen' ? 'active' : ''} onClick={() => setTool('pen')} onDoubleClick={onOpenSize}>펜</button>
      <button className={tool === 'eraser' ? 'active' : ''} onClick={() => setTool('eraser')} onDoubleClick={onOpenSize}>지우개</button>
      <button onClick={onOpenColor}>색</button>
      <button onClick={onOpenImport}>불러오기</button>
      <button onClick={onOpenExport}>내보내기</button>
      <button onClick={onUndo} disabled={!canUndo}>Undo</button>
      <button onClick={onRedo} disabled={!canRedo}>Redo</button>
      <button onClick={onOpenSettings} title="설정">⚙️</button>
    </header>
  )
}