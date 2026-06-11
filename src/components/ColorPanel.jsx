const SWATCHES = [
  '#000000','#ffffff','#6b7280','#d1d5db',
  '#ef4444','#f97316','#f59e0b','#eab308',
  '#22c55e','#10b981','#06b6d4','#3b82f6',
  '#8b5cf6','#ec4899','#f43f5e','#84cc16',
]

export default function ColorPanel({ color, setColor }) {
  return (
    <div className="color-grid">
      <div className="color-swatches">
        {SWATCHES.map((c) => (
          <button
            key={c}
            className={`color-swatch${color === c ? ' selected' : ''}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
            title={c}
          />
        ))}
      </div>
      <div className="color-inputs">
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="#000000"
          spellCheck={false}
        />
        <input
          type="color"
          value={color.startsWith('#') && color.length === 7 ? color : '#000000'}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
    </div>
  )
}
