// src/hooks/usePixelEditor.js
import { useMemo, useState } from 'react'
import { useHistory } from './useHistory'

export function usePixelEditor(width, height) {
  const blank = useMemo(() => Array.from({ length: height }, () => Array(width).fill(null)), [width, height])
  const { present: pixels, set, undo, redo, canUndo, canRedo } = useHistory(blank)
  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState('#ff0000')
  const [penSize, setPenSize] = useState(1)
  const [eraserSize, setEraserSize] = useState(1)

  const applySquare = (x, y, size, nextColor) => {
    const next = pixels.map((row) => row.slice())
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const px = x + dx, py = y + dy
        if (px >= 0 && py >= 0 && px < width && py < height) next[py][px] = nextColor
      }
    }
    set(next)
  }

  const paint = (x, y) => applySquare(x, y, tool === 'pen' ? penSize : eraserSize, tool === 'pen' ? color : null)
  const erase = (x, y) => applySquare(x, y, eraserSize, null)
  const getColorAt = (x, y) => pixels[y]?.[x] ?? null
  const fromJSON = (obj) => { if (obj?.pixels) set(obj.pixels) }

  return { pixels, tool, color, penSize, eraserSize, setTool, setColor, setPenSize, setEraserSize, paint, erase, getColorAt, fromJSON, undo, redo, canUndo, canRedo }
}