// 지우개 팝업: 크기 조절 + 모두 지우기 버튼 통합
export default function EraserPopup({ value, setValue, onClear, onClose }) {
  const dotSize = Math.min(60, value * 8 + 4)

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <h3>지우개</h3>

        <div className="size-preview">
          <div
            className="size-dot"
            style={{ width: dotSize, height: dotSize }}
          />
        </div>

        <div className="size-controls">
          <button
            className="size-step-btn"
            onClick={() => setValue(Math.max(1, value - 1))}
          >−</button>
          <input
            type="number"
            min="1"
            max="16"
            value={value}
            onChange={(e) => setValue(Math.max(1, Math.min(16, Number(e.target.value))))}
          />
          <button
            className="size-step-btn"
            onClick={() => setValue(Math.min(16, value + 1))}
          >+</button>
        </div>

        <div className="modal-actions">
          <button className="danger" onClick={onClear}>모두 지우기</button>
          <button className="primary" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  )
}
