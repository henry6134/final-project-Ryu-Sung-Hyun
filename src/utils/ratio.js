// src/utils/ratio.js
export function fitByRatio(preset, key, value) {
  if (!preset || preset.custom) return { [key]: value }
  const ratio = preset.width / preset.height
  if (key === 'width') return { width: value, height: Math.max(1, Math.round(value / ratio)) }
  return { width: Math.max(1, Math.round(value * ratio)), height: value }
}