export default function ConfirmPopup({ title, message, onConfirm, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onMouseDown={(e) => e.stopPropagation()}>
        <h3 id="confirm-title">{title}</h3>
        <p>{message}</p>
        <button onClick={onConfirm}>확인</button>
        <button onClick={onClose}>취소</button>
      </div>
    </div>
  )
}