import { useState } from 'react'

export default function ExportPopup({ onPNG, onJPG, onJSON, onClose }) {
  const [jpgGrid, setJpgGrid] = useState(false)

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <h3>내보내기</h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>저장 형식을 선택하세요</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onPNG} style={{ textAlign: 'left', padding: '10px 14px' }}>
            <span style={{ fontWeight: 600 }}>PNG</span>
            <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-muted)' }}>투명 배경 · 원본 해상도</span>
          </button>

          {/* JPG: 격자선 옵션 토글 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: 7, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <button
              onClick={() => onJPG(jpgGrid)}
              style={{ flex: 1, textAlign: 'left', padding: '10px 14px', border: 'none', borderRadius: 0 }}
            >
              <span style={{ fontWeight: 600 }}>JPG</span>
              <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                흰 배경 · {jpgGrid ? '격자선 포함' : '격자선 미포함'}
              </span>
            </button>
            {/* 격자선 토글 버튼 */}
            <button
              onClick={(e) => { e.stopPropagation(); setJpgGrid((v) => !v) }}
              title={jpgGrid ? '격자선 끄기' : '격자선 켜기'}
              style={{
                width: 44,
                height: '100%',
                padding: 0,
                border: 'none',
                borderLeft: '1px solid var(--border)',
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: jpgGrid ? 'var(--accent-bg)' : undefined,
                color: jpgGrid ? 'var(--accent)' : 'var(--text-muted)',
                flexShrink: 0,
              }}
            >
              <GridIcon active={jpgGrid} />
            </button>
          </div>

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

function GridIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1" y="1" width="14" height="14" rx="1"/>
      <line x1="6" y1="1" x2="6" y2="15"/>
      <line x1="11" y1="1" x2="11" y2="15"/>
      <line x1="1" y1="6" x2="15" y2="6"/>
      <line x1="1" y1="11" x2="15" y2="11"/>
    </svg>
  )
}
