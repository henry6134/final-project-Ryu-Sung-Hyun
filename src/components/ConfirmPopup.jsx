export default function ConfirmPopup({ title, message, onConfirm, onClose, confirmLabel = '확인', confirmClass = '' }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {message && <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{message}</p>}
        <div className="modal-actions">
          <button onClick={onClose}>취소</button>
          <button className={confirmClass || 'primary'} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
