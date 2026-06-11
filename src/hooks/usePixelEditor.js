import { useMemo, useState } from 'react'
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

  const getColorAt = (x, y) => pixels[y]?.[x] ?? null

  const fromJSON = (obj) => {
    if (obj?.pixels) set(obj.pixels)
  }

  const clearAll = () => set(makeBlank())

  return {
    pixels, tool, color, penSize, eraserSize,
    setTool, setColor, setPenSize, setEraserSize,
    paint, getColorAt, fromJSON, clearAll,
    undo, redo, canUndo, canRedo,
  }
}
