export default function ExportPopup({ onPNG, onJSON, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="export-title" onMouseDown={(e) => e.stopPropagation()}>
        <h3 id="export-title">내보내기</h3>
        <button onClick={onPNG}>PNG</button>
        <button onClick={onJSON}>JSON</button>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  )
}