// src/components/ColorPanel.jsx
export default function ColorPanel({ color, setColor }) {
  return (
    <div className="color-panel">
      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      <input type="text" value={color} onChange={(e) => setColor(e.target.value)} />
    </div>
  )
}