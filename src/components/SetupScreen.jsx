import { useState } from 'react'
import { PRESETS } from '../constants/presets'
import { fitByRatio } from '../utils/ratio'
import ThemeToggle from './ThemeToggle'

function RatioPreview({ width, height }) {
  const maxW = 100
  const maxH = 80
  const ratio = width / height
  let w, h
  if (ratio >= maxW / maxH) {
    w = maxW
    h = Math.max(8, Math.round(maxW / ratio))
  } else {
    h = maxH
    w = Math.max(8, Math.round(maxH * ratio))
  }
  return (
    <div className="ratio-preview-wrap">
      <div className="ratio-preview-box" style={{ width: `${w}px`, height: `${h}px` }} />
      <span className="ratio-label">{width} × {height} px</span>
    </div>
  )
}

// 숫자 입력 — 빈 값 허용, blur 시 0으로 fallback
function NumberInput({ label, value, onChange }) {
  const [raw, setRaw] = useState(String(value))

  // 부모 value가 바뀌면 raw 동기화 (단, 포커스 중엔 무시)
  // → 간단하게 controlled 방식으로 처리
  const handleChange = (e) => {
    const v = e.target.value
    setRaw(v)
    const n = parseInt(v, 10)
    if (!isNaN(n) && n >= 1) onChange(n)
  }

  const handleBlur = () => {
    const n = parseInt(raw, 10)
    if (isNaN(n) || n < 1) {
      setRaw('1')
      onChange(1)
    } else {
      setRaw(String(n))
      onChange(n)
    }
  }

  // 부모에서 value가 바뀌면 raw도 맞춰줌 (플립 등)
  // useEffect 없이 render마다 비교
  const strVal = String(value)
  if (raw !== strVal && document.activeElement?.dataset?.field !== label) {
    // 포커스 아닌 경우에만 덮어쓰기
  }

  return (
    <div className="field">
      <span>{label}</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        data-field={label}
        value={raw}
        onChange={handleChange}
        onFocus={(e) => {
          // 포커스 시 0이면 전체 선택
          if (raw === '0') e.target.select()
        }}
        onBlur={handleBlur}
        style={{ width: '100%' }}
      />
    </div>
  )
}

// flip-aware NumberInput wrapper
function SizeInput({ label, valueKey, config, setConfig, preset }) {
  const value = config[valueKey]

  const handleChange = (n) => {
    const next = fitByRatio(preset, valueKey, n)
    setConfig((c) => ({ ...c, ...next }))
  }

  return <NumberInput label={label} value={value} onChange={handleChange} />
}

// 플립 버튼 SVG
const FlipIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 5h12M11 2l3 3-3 3"/>
    <path d="M14 11H2M5 8l-3 3 3 3"/>
  </svg>
)

export default function SetupScreen({ config, setConfig, onStart, onToggleTheme }) {
  const [presetIndex, setPresetIndex] = useState(7)
  const preset = PRESETS[presetIndex]

  const handlePresetChange = (idx) => {
    setPresetIndex(idx)
    const p = PRESETS[idx]
    if (!p.custom) {
      const ratio = p.width / p.height
      const newH = Math.max(1, Math.round(config.width / ratio))
      setConfig((c) => ({ ...c, height: newH }))
    }
  }

  const flipOrientation = () => {
    setConfig((c) => ({ ...c, width: c.height, height: c.width }))
  }

  return (
    <div className={`page theme-${config.theme} setup-page`}>
      <ThemeToggle theme={config.theme} onToggle={onToggleTheme} />

      <div className="setup-card">
        <div>
          <h1 className="setup-logo">PIXEL<span>.</span>MAKER</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
            브라우저에서 바로 픽셀 아트 제작
          </p>
        </div>

        <div className="setup-divider" />

        <div className="field">
          <span>비율 프리셋</span>
          <select
            value={presetIndex}
            onChange={(e) => handlePresetChange(Number(e.target.value))}
          >
            {PRESETS.map((p, i) => (
              <option key={p.label} value={i}>{p.label}</option>
            ))}
          </select>
        </div>

        <RatioPreview width={config.width} height={config.height} />

        <div className="size-row">
          <SizeInput label="가로 (px)" valueKey="width"  config={config} setConfig={setConfig} preset={preset} />

          {/* 플립 버튼: 입력란과 같은 높이, 둥근 사각형 */}
          <div className="flip-btn-wrap">
            <button className="flip-btn" onClick={flipOrientation} title="가로 ↔ 세로 전환">
              <FlipIcon />
            </button>
          </div>

          <SizeInput label="세로 (px)" valueKey="height" config={config} setConfig={setConfig} preset={preset} />
        </div>

        <button className="primary setup-start" onClick={onStart}>
          시작하기 →
        </button>
      </div>
    </div>
  )
}
