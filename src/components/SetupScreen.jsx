import { useState } from 'react'
import { PRESETS } from '../constants/presets'
import { fitByRatio } from '../utils/ratio'

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
function NumberInput({ label, value, onChange, disabled }) {
  const [raw, setRaw] = useState(String(value))

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

  return (
    <div className="field">
      <span>{label}</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        data-field={label}
        value={disabled ? String(value) : raw}
        onChange={handleChange}
        onFocus={(e) => { if (raw === '0') e.target.select() }}
        onBlur={handleBlur}
        disabled={disabled}
        style={{ width: '100%', opacity: disabled ? 0.45 : 1 }}
      />
    </div>
  )
}

// flip-aware NumberInput wrapper
function SizeInput({ label, valueKey, config, setConfig, preset, disabled }) {
  const value = config[valueKey]

  const handleChange = (n) => {
    const next = fitByRatio(preset, valueKey, n)
    setConfig((c) => ({ ...c, ...next }))
  }

  return <NumberInput label={label} value={value} onChange={handleChange} disabled={disabled} />
}

// 플립 버튼 SVG
const FlipIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 5h12M11 2l3 3-3 3"/>
    <path d="M14 11H2M5 8l-3 3 3 3"/>
  </svg>
)

// 에디터와 동일한 스타일의 테마 토글 (썬/문 트랙 슬라이더)
function ThemeToggleSetup({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      className="theme-toggle-editor"
      onClick={onToggle}
      title={isDark ? '라이트 모드' : '다크 모드'}
      aria-label="테마 전환"
      style={{ position: 'fixed', top: 14, right: 16, zIndex: 300 }}
    >
      <span className={`toggle-track ${isDark ? 'dark' : 'light'}`}>
        <span className="toggle-thumb">
          {isDark
            ? (
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 3a6 6 0 01-9 9 6 6 0 009-9z"/>
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="8" cy="8" r="3"/>
                <line x1="8" y1="1" x2="8" y2="3"/>
                <line x1="8" y1="13" x2="8" y2="15"/>
                <line x1="1" y1="8" x2="3" y2="8"/>
                <line x1="13" y1="8" x2="15" y2="8"/>
                <line x1="3.05" y1="3.05" x2="4.5" y2="4.5"/>
                <line x1="11.5" y1="11.5" x2="12.95" y2="12.95"/>
                <line x1="3.05" y1="12.95" x2="4.5" y2="11.5"/>
                <line x1="11.5" y1="4.5" x2="12.95" y2="3.05"/>
              </svg>
            )
          }
        </span>
      </span>
    </button>
  )
}

export default function SetupScreen({ config, setConfig, onStart, onToggleTheme }) {
  const [presetIndex, setPresetIndex] = useState(7)
  const preset = PRESETS[presetIndex]
  const isCustom = preset.custom === true

  const handlePresetChange = (idx) => {
    setPresetIndex(idx)
    const p = PRESETS[idx]
    if (!p.custom) {
      // 가로 기준 세로 자동 계산
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
      <ThemeToggleSetup theme={config.theme} onToggle={onToggleTheme} />

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
          {/* 가로: 항상 편집 가능 */}
          <SizeInput
            label="가로 (px)"
            valueKey="width"
            config={config}
            setConfig={setConfig}
            preset={preset}
            disabled={false}
          />

          {/* 플립 버튼 */}
          <div className="flip-btn-wrap">
            <button className="flip-btn" onClick={flipOrientation} title="가로 ↔ 세로 전환">
              <FlipIcon />
            </button>
          </div>

          {/* 세로: 사용자 지정일 때만 편집 가능 */}
          <SizeInput
            label="세로 (px)"
            valueKey="height"
            config={config}
            setConfig={setConfig}
            preset={preset}
            disabled={!isCustom}
          />
        </div>

        {!isCustom && (
          <p style={{ margin: '-8px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
            세로는 비율 프리셋에 따라 자동 계산됩니다
          </p>
        )}

        <button className="primary setup-start" onClick={onStart}>
          시작하기 →
        </button>
      </div>
    </div>
  )
}
