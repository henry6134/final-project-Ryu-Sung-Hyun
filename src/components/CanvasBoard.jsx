import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react'

function CanvasBoardInner({ pixels, width, height, tool, onPaint, onPickColor, bgImage }, ref) {
  const canvasRef = useRef(null)
  const [scale, setScale] = useState(16)
  const [drag, setDrag] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const grabStart = useRef(null)

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

    const draw = () => {
      // 항상 흰색 배경 먼저 (라이트/다크 모두 용지는 흰색)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, c.width, c.height)

      if (bgImage) {
        const img = new Image()
        img.onload = () => {
          ctx.globalAlpha = 0.35
          ctx.drawImage(img, 0, 0, c.width, c.height)
          ctx.globalAlpha = 1
          drawPixels(ctx)
        }
        img.src = bgImage
      } else {
        drawPixels(ctx)
      }
    }

    const drawPixels = (ctx) => {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const color = pixels[y]?.[x]
          if (color) {
            ctx.fillStyle = color
            ctx.fillRect(x * scale, y * scale, scale, scale)
          }
          ctx.strokeStyle = 'rgba(180,180,180,0.4)'
          ctx.strokeRect(x * scale, y * scale, scale, scale)
        }
      }
    }

    draw()
  }, [pixels, width, height, scale, bgImage])

  const cursorMap = {
    pen: 'crosshair',
    eraser: 'cell',
    eyedropper: 'crosshair',
    grab: drag ? 'grabbing' : 'grab',
  }

  const handleMouseDown = (e) => {
    if (tool === 'grab') {
      setDrag(true)
      grabStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
      return
    }
    const { x, y } = getCell(e)
    setDrag(true)
    if (tool === 'eyedropper') onPickColor(x, y)
    else onPaint(x, y)
  }

  const handleMouseMove = (e) => {
    if (!drag) return
    if (tool === 'grab') {
      const dx = e.clientX - grabStart.current.mx
      const dy = e.clientY - grabStart.current.my
      setOffset({ x: grabStart.current.ox + dx, y: grabStart.current.oy + dy })
      return
    }
    const { x, y } = getCell(e)
    if (tool !== 'eyedropper') onPaint(x, y)
  }

  const handleMouseUp = () => setDrag(false)

  return (
    <div style={{
      transform: `translate(${offset.x}px, ${offset.y}px)`,
      transition: drag ? 'none' : 'transform 0.05s',
    }}>
      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          className="pixel-canvas"
          style={{
            width: width * scale,
            height: height * scale,
            cursor: cursorMap[tool] || 'crosshair',
          }}
          onWheel={(e) => {
            e.preventDefault()
            setScale((s) => Math.max(4, Math.min(48, s + (e.deltaY < 0 ? 2 : -2))))
          }}
          onContextMenu={(e) => e.preventDefault()}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  )
}

export default forwardRef(CanvasBoardInner)
