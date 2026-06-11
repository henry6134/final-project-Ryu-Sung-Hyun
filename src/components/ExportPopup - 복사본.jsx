export default function ImportPopup({ onImport, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="import-title" onMouseDown={(e) => e.stopPropagation()}>
        <h3 id="import-title">불러오기</h3>
        <button onClick={() => onImport('json')}>JSON</button>
        <button onClick={() => onImport('png')}>PNG</button>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  )
}