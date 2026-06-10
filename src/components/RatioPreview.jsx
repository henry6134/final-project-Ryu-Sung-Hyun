export default function RatioPreview({ width, height }) {
  const w = 120
  const h = Math.max(30, Math.round((height / width) * 120))
  return (
    <div className="ratio-preview">
      <div className="ratio-box" style={{ width: `${w}px`, height: `${h}px`, background: '#fff' }} />
      <small>{width} : {height}</small>
    </div>
  )
}