export default function ExportPopup({ onPNG, onJPG, onJSON, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <h3>내보내기</h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>저장 형식을 선택하세요</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onPNG} style={{ textAlign: 'left', padding: '10px 14px' }}>
            <span style={{ fontWeight: 600 }}>PNG</span>
            <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-muted)' }}>투명 배경 이미지</span>
          </button>
          <button onClick={onJPG} style={{ textAlign: 'left', padding: '10px 14px' }}>
            <span style={{ fontWeight: 600 }}>JPG</span>
            <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-muted)' }}>흰 배경 포함 이미지</span>
          </button>
          <button onClick={onJSON} style={{ textAlign: 'left', padding: '10px 14px' }}>
            <span style={{ fontWeight: 600 }}>JSON</span>
            <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-muted)' }}>이어서 작업 가능한 형식</span>
          </button>
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  )
}
