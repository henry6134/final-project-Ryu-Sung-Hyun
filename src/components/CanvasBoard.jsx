import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react'

function CanvasBoardInner({ pixels, width, height, tool, onPaint, onPickColor }, ref) {
  const canvasRef = useRef(null)
  const [scale, setScale] = useState(16)
  const [drag, setDrag] = useState(false)

  useImperativeHandle(ref, () => canvasRef.current)

  const getCell = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / scale)
    const y = Math.floor((e.clientY - rect.top) / scale)
    return { x, y }
  }

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    c.width = width * scale
    c.height = height * scale
    ctx.clearRect(0, 0, c.width, c.height)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        ctx.fillStyle = pixels[y]?.[x] || '#ffffff'
        ctx.fillRect(x * scale, y * scale, scale, scale)
        ctx.strokeStyle = '#d0d0d0'
        ctx.strokeRect(x * scale, y * scale, scale, scale)
      }
    }
  }, [pixels, width, height, scale])

  return (
    <canvas
      ref={canvasRef}
      className="pixel-canvas"
      style={{ width: width * scale, height: height * scale }}
      onWheel={(e) => {
        e.preventDefault()
        setScale((s) => Math.max(4, Math.min(40, s + (e.deltaY < 0 ? 2 : -2))))
      }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={(e) => {
        const { x, y } = getCell(e)
        setDrag(true)
        if (tool === 'eyedropper') onPickColor(x, y)
        else onPaint(x, y)
      }}
      onMouseMove={(e) => {
        if (!drag) return
        const { x, y } = getCell(e)
        if (tool !== 'eyedropper') onPaint(x, y)
      }}
      onMouseUp={() => setDrag(false)}
      onMouseLeave={() => setDrag(false)}
    />
  )
}

const CanvasBoard = forwardRef(CanvasBoardInner)
export default CanvasBoard