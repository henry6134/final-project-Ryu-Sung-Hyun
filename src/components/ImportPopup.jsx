export default function ImportPopup({ onImport, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <h3>불러오기</h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>파일 형식을 선택하세요</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => onImport('json')} style={{ textAlign: 'left', padding: '10px 14px' }}>
            <span style={{ fontWeight: 600 }}>JSON</span>
            <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-muted)' }}>저장된 작업 불러오기</span>
          </button>
          <button onClick={() => onImport('png')} style={{ textAlign: 'left', padding: '10px 14px' }}>
            <span style={{ fontWeight: 600 }}>PNG</span>
            <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-muted)' }}>이미지를 픽셀로 변환</span>
          </button>
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  )
}
