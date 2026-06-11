export default function ImportPopup({ onImport, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <h3>불러오기</h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>불러오기 방식을 선택하세요</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => onImport('json')} style={{ textAlign: 'left', padding: '10px 14px' }}>
            <span style={{ fontWeight: 600 }}>JSON</span>
            <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-muted)' }}>저장된 작업 불러오기</span>
          </button>
          <button onClick={() => onImport('png-pixel')} style={{ textAlign: 'left', padding: '10px 14px' }}>
            <span style={{ fontWeight: 600 }}>이미지 → 픽셀 변환</span>
            <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-muted)' }}>PNG를 픽셀 아트로 변환</span>
          </button>
          <button onClick={() => onImport('png-bg')} style={{ textAlign: 'left', padding: '10px 14px' }}>
            <span style={{ fontWeight: 600 }}>이미지 → 배경 종이</span>
            <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-muted)' }}>PNG를 캔버스 배경으로 설정</span>
          </button>
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  )
}
