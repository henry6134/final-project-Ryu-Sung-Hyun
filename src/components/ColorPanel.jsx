export default function ColorPanel({ color, setColor }) {
  return (
    <div className="color-grid">
      <div className="color-rainbow">
        {['#ff0000','#ff7f00','#ffff00','#00ff00','#00ffff','#0000ff','#8b00ff'].map((c) => (
          <button key={c} className="color-swatch" style={{ background: c }} onClick={() => setColor(c)} />
        ))}
      </div>
      <input type="text" value={color} onChange={(e) => setColor(e.target.value)} />
      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
    </div>
  )
}