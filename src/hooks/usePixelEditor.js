import { useMemo, useState, useCallback } from 'react'
import { useHistory } from './useHistory'

export function usePixelEditor(width, height) {
  const makeBlank = () => Array.from({ length: height }, () => Array(width).fill(null))
  const blank = useMemo(makeBlank, [width, height])
  const { present: pixels, set, undo, redo, canUndo, canRedo } = useHistory(blank)

  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState('#2563eb')
  const [penSize, setPenSize] = useState(1)
  const [eraserSize, setEraserSize] = useState(1)

  const applySquare = (x, y, size, nextColor) => {
    const next = pixels.map((row) => row.slice())
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const px = x + dx
        const py = y + dy
        if (px >= 0 && py >= 0 && px < width && py < height) next[py][px] = nextColor
      }
    }
    set(next)
  }

  const paint = (x, y) =>
    applySquare(x, y, tool === 'pen' ? penSize : eraserSize, tool === 'pen' ? color : null)

  // 전체 채우기: 모든 칸을 현재 색으로
  const fillAll = useCallback(() => {
    const next = Array.from({ length: height }, () => Array(width).fill(color))
    set(next)
  }, [color, width, height, set])

  const getColorAt = (x, y) => pixels[y]?.[x] ?? null

  const fromJSON = (obj) => {
    if (obj?.pixels) set(obj.pixels)
  }

  const clearAll = () => set(makeBlank())

  // 현재 pixels에서 실제 사용된 색 목록 추출
  const getUsedColors = useCallback(() => {
    const seen = new Set()
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const c = pixels[y]?.[x]
        if (c) seen.add(c)
      }
    }
    return Array.from(seen)
  }, [pixels, width, height])

  return {
    pixels, tool, color, penSize, eraserSize,
    setTool, setColor, setPenSize, setEraserSize,
    paint, fillAll, getColorAt, fromJSON, clearAll,
    getUsedColors,
    undo, redo, canUndo, canRedo,
  }
}
