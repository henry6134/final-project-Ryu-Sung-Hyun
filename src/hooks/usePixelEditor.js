import { useMemo, useState, useCallback } from 'react'
import { useHistory } from './useHistory'

// ── Flood Fill (BFS) ──────────────────────────────────────────────────────────
function floodFill(pixels, width, height, startX, startY, fillColor) {
  const targetColor = pixels[startY]?.[startX] ?? null

  // 같은 색이면 아무것도 안 함
  if (targetColor === fillColor) return pixels

  const next = pixels.map((row) => row.slice())
  const queue = [[startX, startY]]
  const visited = new Uint8Array(width * height)
  visited[startY * width + startX] = 1

  while (queue.length > 0) {
    const [x, y] = queue.shift()
    next[y][x] = fillColor

    const neighbors = [
      [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1],
    ]
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
      if (visited[ny * width + nx]) continue
      const nc = next[ny]?.[nx] ?? null
      // targetColor가 null이면 null인 셀만, 아니면 같은 색만 채움
      if (nc !== targetColor) continue
      visited[ny * width + nx] = 1
      queue.push([nx, ny])
    }
  }
  return next
}

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

  const paint = (x, y) => {
    if (tool === 'fill') {
      // 버킷 채우기
      const filled = floodFill(pixels, width, height, x, y, color)
      set(filled)
    } else {
      applySquare(
        x, y,
        tool === 'pen' ? penSize : eraserSize,
        tool === 'pen' ? color : null
      )
    }
  }

  const getColorAt = (x, y) => pixels[y]?.[x] ?? null

  const fromJSON = (obj) => {
    if (obj?.pixels) set(obj.pixels)
  }

  const clearAll = () => set(makeBlank())

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
    paint, getColorAt, fromJSON, clearAll,
    getUsedColors,
    undo, redo, canUndo, canRedo,
  }
}
