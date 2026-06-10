// src/components/SetupScreen.jsx
import { useState } from 'react'
import { PRESETS } from '../constants/presets'
import { fitByRatio } from '../utils/ratio'
import RatioPreview from './RatioPreview'

export default function SetupScreen({ config, setConfig, onStart }) {
  const [presetIndex, setPresetIndex] = useState(4)
  const preset = PRESETS[presetIndex]

  const updateSize = (key, value) => {
    const next = fitByRatio(preset, key, value)
    setConfig((c) => ({ ...c, ...next }))
  }

  return (
    <div className={`page theme-${config.theme} setup-page`}>
      <h1>PIXEL MAKER</h1>

      <label className="field">
        <span>비율 선택</span>
        <select value={presetIndex} onChange={(e) => setPresetIndex(Number(e.target.value))}>
          {PRESETS.map((p, i) => <option key={p.label} value={i}>{p.label}</option>)}
        </select>
      </label>

      <RatioPreview width={config.width} height={config.height} />

      <div className="row">
        <label className="field">
          <span>가로</span>
          <input type="number" min="1" value={config.width} onChange={(e) => updateSize('width', Number(e.target.value))} />
        </label>
        <label className="field">
          <span>세로</span>
          <input type="number" min="1" value={config.height} onChange={(e) => updateSize('height', Number(e.target.value))} />
        </label>
      </div>

      <label className="field">
        <span>테마</span>
        <select value={config.theme} onChange={(e) => setConfig((c) => ({ ...c, theme: e.target.value }))}>
          <option value="light">라이트</option>
          <option value="dark">다크</option>
        </select>
      </label>

      <button className="primary" onClick={onStart}>시작</button>
    </div>
  )
}