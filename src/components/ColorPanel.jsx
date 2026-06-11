import { useCallback, useEffect, useRef, useState } from 'react'

// ── 색 변환 유틸 ──────────────────────────────────────────
function hexToHsv(hex) {
  let r = 0, g = 0, b = 0
  const h = hex.replace('#', '')
  if (h.length === 6) {
    r = parseInt(h.slice(0,2),16)/255
    g = parseInt(h.slice(2,4),16)/255
    b = parseInt(h.slice(4,6),16)/255
  }
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min
  let hh = 0
  if (d !== 0) {
    if (max === r) hh = ((g - b) / d + 6) % 6
    else if (max === g) hh = (b - r) / d + 2
    else hh = (r - g) / d + 4
    hh = hh / 6
  }
  return { h: hh, s: max === 0 ? 0 : d/max, v: max }
}

function hsvToHex(h, s, v) {
  const f = (n) => {
    const k = (n + h * 6) % 6
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1))
  }
  const toHex = (x) => Math.round(x * 255).toString(16).padStart(2,'0')
  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`
}

function hsvToRgb(h, s, v) {
  const f = (n) => {
    const k = (n + h * 6) % 6
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1))
  }
  return { r: f(5), g: f(3), b: f(1) }
}

// ── 기본 색 팔레트 ─────────────────────────────────────────
const PRESETS = [
  '#000000','#ffffff','#6b7280','#ef4444',
  '#f97316','#eab308','#22c55e','#06b6d4',
  '#3b82f6','#8b5cf6',
]

const MAX_HISTORY = 10

// ── 그라디언트 필드 (SV 평면) ─────────────────────────────
function SvField({ hue, s, v, onChange }) {
  const canvasRef = useRef(null)
  const drag = useRef(false)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    const W = c.width, H = c.height

    // 흰→색상 가로 그라디언트
    const gradH = ctx.createLinearGradient(0,0,W,0)
    gradH.addColorStop(0, '#fff')
    gradH.addColorStop(1, hsvToHex(hue, 1, 1))
    ctx.fillStyle = gradH
    ctx.fillRect(0,0,W,H)

    // 투명→검정 세로 그라디언트
    const gradV = ctx.createLinearGradient(0,0,0,H)
    gradV.addColorStop(0, 'rgba(0,0,0,0)')
    gradV.addColorStop(1, '#000')
    ctx.fillStyle = gradV
    ctx.fillRect(0,0,W,H)

    // 커서
    const cx = s * W, cy = (1 - v) * H
    ctx.beginPath()
    ctx.arc(cx, cy, 7, 0, Math.PI * 2)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, 6, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'
    ctx.lineWidth = 1
    ctx.stroke()
  }, [hue, s, v])

  const pick = useCallback((e) => {
    const c = canvasRef.current
    const rect = c.getBoundingClientRect()
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top)  / rect.height))
    onChange(nx, 1 - ny)
  }, [onChange])

  return (
    <canvas
      ref={canvasRef}
      width={260} height={160}
      style={{ width:'100%', height:160, borderRadius:8, cursor:'crosshair', display:'block' }}
      onMouseDown={(e) => { drag.current = true; pick(e) }}
      onMouseMove={(e) => { if (drag.current) pick(e) }}
      onMouseUp={() => { drag.current = false }}
      onMouseLeave={() => { drag.current = false }}
    />
  )
}

// ── 슬라이더 (H / S / V 각각) ────────────────────────────
function GradientSlider({ label, value, onChange, makeGradient, textValue }) {
  const trackRef = useRef(null)
  const drag = useRef(false)

  const pick = useCallback((e) => {
    const rect = trackRef.current.getBoundingClientRect()
    const v = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    onChange(v)
  }, [onChange])

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ fontSize:11, fontWeight:600, letterSpacing:'0.06em', color:'var(--text-muted)', width:24, textAlign:'center', flexShrink:0 }}>{label}</span>
      <div
        ref={trackRef}
        style={{
          flex:1, height:14, borderRadius:7,
          background: makeGradient(),
          position:'relative', cursor:'pointer',
          border:'1px solid rgba(0,0,0,0.12)',
        }}
        onMouseDown={(e) => { drag.current = true; pick(e) }}
        onMouseMove={(e) => { if (drag.current) pick(e) }}
        onMouseUp={() => { drag.current = false }}
        onMouseLeave={() => { drag.current = false }}
      >
        <div style={{
          position:'absolute',
          left: `calc(${value * 100}% - 8px)`,
          top: '50%', transform: 'translateY(-50%)',
          width:16, height:16, borderRadius:'50%',
          background:'#fff',
          border:'2px solid rgba(0,0,0,0.3)',
          boxShadow:'0 1px 4px rgba(0,0,0,0.25)',
          pointerEvents:'none',
        }} />
      </div>
      <span style={{ fontSize:11, fontFamily:'monospace', color:'var(--text-muted)', width:28, textAlign:'right', flexShrink:0 }}>{textValue}</span>
    </div>
  )
}

// ── 메인 ColorPanel ───────────────────────────────────────
export default function ColorPanel({ color, setColor, history, setHistory }) {
  // 현재 색을 HSV로 관리
  const initHsv = hexToHsv(color.startsWith('#') && color.length === 7 ? color : '#ff0000')
  const [hsv, setHsv] = useState(initHsv)
  const skipSync = useRef(false)

  // HSV → hex → 부모
  const applyHsv = useCallback((h, s, v) => {
    const next = hsvToHex(h, s, v)
    setHsv({ h, s, v })
    skipSync.current = true
    setColor(next)
  }, [setColor])

  // 부모 color가 외부에서 바뀌면 HSV 동기화 (스포이드 등)
  useEffect(() => {
    if (skipSync.current) { skipSync.current = false; return }
    if (color.startsWith('#') && color.length === 7) {
      setHsv(hexToHsv(color))
    }
  }, [color])

  // hex 입력란 직접 수정
  const handleHexInput = (val) => {
    setColor(val)
    if (val.startsWith('#') && val.length === 7) {
      setHsv(hexToHsv(val))
    }
  }

  const { h, s, v } = hsv
  const currentHex = hsvToHex(h, s, v)
  const { r, g, b } = hsvToRgb(h, s, v)

  const hueGradient = () =>
    'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'

  const satGradient = () => {
    const col = hsvToHex(h, 1, v)
    const gray = hsvToHex(h, 0, v)
    return `linear-gradient(to right, ${gray}, ${col})`
  }

  const valGradient = () => {
    const col = hsvToHex(h, s, 1)
    return `linear-gradient(to right, #000, ${col})`
  }

  return (
    <div className="color-panel-v2">
      {/* 1. 기본 색 팔레트 */}
      <div className="cp-section">
        <div className="cp-label">기본색</div>
        <div className="cp-swatches">
          {PRESETS.map((c) => (
            <button
              key={c}
              className={`cp-swatch${color === c ? ' selected' : ''}`}
              style={{ background: c }}
              onClick={() => { setColor(c); setHsv(hexToHsv(c)) }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* 2. 히스토리 — 실제 용지에 칠해진 색만 표시 */}
      {history.length > 0 && (
        <div className="cp-section">
          <div className="cp-label">최근 사용</div>
          <div className="cp-swatches">
            {history.map((c, i) => (
              <button
                key={i}
                className={`cp-swatch${color === c ? ' selected' : ''}`}
                style={{ background: c }}
                onClick={() => { setColor(c); setHsv(hexToHsv(c)) }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. SV 그라디언트 필드 */}
      <div className="cp-section">
        <SvField
          hue={h} s={s} v={v}
          onChange={(ns, nv) => applyHsv(h, ns, nv)}
        />
      </div>

      {/* 4. 슬라이더 3줄 */}
      <div className="cp-section cp-sliders">
        <GradientSlider
          label="H"
          value={h}
          onChange={(val) => applyHsv(val, s, v)}
          makeGradient={hueGradient}
          textValue={Math.round(h * 360) + '°'}
        />
        <GradientSlider
          label="S"
          value={s}
          onChange={(val) => applyHsv(h, val, v)}
          makeGradient={satGradient}
          textValue={Math.round(s * 100) + '%'}
        />
        <GradientSlider
          label="V"
          value={v}
          onChange={(val) => applyHsv(h, s, val)}
          makeGradient={valGradient}
          textValue={Math.round(v * 100) + '%'}
        />
      </div>

      {/* 5. 스포이드 스타일: 미리보기 박스 + hex 입력 대칭 배치 */}
      <div className="cp-section">
        <div className="cp-bottom-row">
          {/* 왼쪽: 이전 색 미리보기 (스포이드 '이전 색' 역할) */}
          <div className="cp-preview-pair">
            <div
              className="cp-preview cp-preview-old"
              style={{ background: history[0] || '#e5e5e5' }}
              title={history[0] ? `이전: ${history[0]}` : '이전 없음'}
            />
            {/* 현재 색 미리보기 */}
            <div
              className="cp-preview cp-preview-new"
              style={{ background: currentHex }}
              title={`현재: ${currentHex}`}
            />
          </div>

          {/* 오른쪽: hex 입력 + RGB */}
          <div className="cp-input-group">
            <input
              className="cp-hex-input"
              type="text"
              value={color}
              onChange={(e) => handleHexInput(e.target.value)}
              spellCheck={false}
              maxLength={7}
            />
            <span className="cp-rgb">
              {Math.round(r*255)}, {Math.round(g*255)}, {Math.round(b*255)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FillIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 13h12"/>
      <path d="M4 11V4l4-3 4 3v7"/>
      <path d="M4 7h8"/>
      <rect x="6" y="8" width="4" height="3" rx="0.5" fill="currentColor" stroke="none"/>
    </svg>
  )
}
