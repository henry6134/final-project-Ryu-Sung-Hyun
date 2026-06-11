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
      <div
        className="ratio-preview-box"
        style={{ width: `${w}px`, height: `${h}px` }}
      />
      <span className="ratio-label">{width} × {height} px</span>
    </div>
  )
}

export default function SetupScreen({ config, setConfig, onStart, onToggleTheme }) {
  const [presetIndex, setPresetIndex] = useState(4)
  const preset = PRESETS[presetIndex]

  const updateSize = (key, value) => {
    const next = fitByRatio(preset, key, value)
    setConfig((c) => ({ ...c, ...next }))
  }

  const handlePresetChange = (idx) => {
    setPresetIndex(idx)
    const p = PRESETS[idx]
    if (!p.custom) {
      const ratio = p.width / p.height
      const newH = Math.max(1, Math.round(config.width / ratio))
      setConfig((c) => ({ ...c, height: newH }))
    }
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
          <div className="field">
            <span>가로 (px)</span>
            <input
              type="number"
              min="1"
              max="512"
              value={config.width}
              onChange={(e) => updateSize('width', Number(e.target.value))}
            />
          </div>
          <div className="field">
            <span>세로 (px)</span>
            <input
              type="number"
              min="1"
              max="512"
              value={config.height}
              onChange={(e) => updateSize('height', Number(e.target.value))}
            />
          </div>
        </div>

        <button className="primary setup-start" onClick={onStart}>
          시작하기 →
        </button>
      </div>
    </div>
  )
}
