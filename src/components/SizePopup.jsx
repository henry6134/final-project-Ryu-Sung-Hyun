// src/components/SizePopup.jsx
export default function SizePopup({ label, value, setValue }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type="number" min="1" value={value} onChange={(e) => setValue(Math.max(1, Number(e.target.value)))} />
    </label>
  )
}