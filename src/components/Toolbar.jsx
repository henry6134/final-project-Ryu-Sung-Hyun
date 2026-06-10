// src/components/Toolbar.jsx
export default function Toolbar({
  tool, setTool,
  onUndo, onRedo, canUndo, canRedo,
  onImportJSON, onExportPNG, onExportJSON
}) {
  return (
    <header className="toolbar">
      <button className={tool === 'pen' ? 'active' : ''} onClick={() => setTool('pen')}>펜</button>
      <button className={tool === 'eraser' ? 'active' : ''} onClick={() => setTool('eraser')}>지우개</button>
      <button className={tool === 'eyedropper' ? 'active' : ''} onClick={() => setTool('eyedropper')}>색</button>
      <button onClick={onImportJSON}>불러오기</button>
      <button onClick={onExportPNG}>PNG</button>
      <button onClick={onExportJSON}>JSON</button>
      <button onClick={onUndo} disabled={!canUndo}>Undo</button>
      <button onClick={onRedo} disabled={!canRedo}>Redo</button>
    </header>
  )
}