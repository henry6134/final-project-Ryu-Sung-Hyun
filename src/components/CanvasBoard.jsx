import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react'

function CanvasBoardInner({ pixels, width, height, tool, onPaint, onPickColor, bgImage }, ref) {
  const canvasRef = useRef(null)
  const offscreenRef = useRef(null)
  const [scale, setScale] = useState(16)
  const [drag, setDrag] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const grabStart = useRef(null)
  const bgImgCache = useRef(null)
  const bgImgSrc = useRef(null)

  // devicePixelRatio: Retina 등 고밀도 디스플레이 대응
  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1

  useImperativeHandle(ref, () => canvasRef.current)

  const getCell = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / scale)
    const y = Math.floor((e.clientY - rect.top) / scale)
    return { x, y }
  }

  // 픽셀 레이어 오프스크린 렌더 (DPR 반영)
  const renderPixelLayer = (ctx, cw, ch) => {
    ctx.clearRect(0, 0, cw, ch)
    ctx.save()
    ctx.scale(dpr, dpr)
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const color = pixels[row]?.[col]
        if (color) {
          ctx.fillStyle = color
          ctx.fillRect(col * scale, row * scale, scale, scale)
        }
        // 그리드선: scale이 작으면 생략해 흐림 방지
        if (scale >= 6) {
          ctx.strokeStyle = 'rgba(150,150,150,0.3)'
          ctx.lineWidth = 0.5
          ctx.strokeRect(col * scale, row * scale, scale, scale)
        }
      }
    }
    ctx.restore()
  }

  const compositeToMain = (mainCtx, cw, ch, imgEl) => {
    mainCtx.clearRect(0, 0, cw, ch)
    mainCtx.save()
    mainCtx.scale(dpr, dpr)
    // 흰 배경
    mainCtx.fillStyle = '#ffffff'
    mainCtx.fillRect(0, 0, width * scale, height * scale)
    if (imgEl) {
      mainCtx.globalAlpha = 0.35
      mainCtx.drawImage(imgEl, 0, 0, width * scale, height * scale)
      mainCtx.globalAlpha = 1
    }
    mainCtx.restore()
    // 오프스크린 픽셀 레이어 합성 (이미 DPR 반영됨)
    if (offscreenRef.current) {
      mainCtx.drawImage(offscreenRef.current, 0, 0)
    }
  }

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return

    // CSS 표시 크기
    const cssW = width * scale
    const cssH = height * scale

    // 실제 버퍼 크기 = CSS 크기 × DPR → 선명하게
    c.width  = Math.round(cssW * dpr)
    c.height = Math.round(cssH * dpr)
    c.style.width  = `${cssW}px`
    c.style.height = `${cssH}px`

    // 오프스크린도 동일 크기
    if (!offscreenRef.current) offscreenRef.current = document.createElement('canvas')
    offscreenRef.current.width  = c.width
    offscreenRef.current.height = c.height
    const offCtx = offscreenRef.current.getContext('2d')
    renderPixelLayer(offCtx, c.width, c.height)

    const mainCtx = c.getContext('2d')

    if (bgImage) {
      if (bgImgSrc.current === bgImage && bgImgCache.current) {
        compositeToMain(mainCtx, c.width, c.height, bgImgCache.current)
      } else {
        const img = new Image()
        img.onload = () => {
          bgImgCache.current = img
          bgImgSrc.current = bgImage
          compositeToMain(mainCtx, c.width, c.height, img)
        }
        img.src = bgImage
      }
    } else {
      bgImgCache.current = null
      bgImgSrc.current = null
      compositeToMain(mainCtx, c.width, c.height, null)
    }
  }, [pixels, width, height, scale, bgImage, dpr])

  const cursorMap = {
    pen: 'crosshair',
    eraser: 'cell',
    eyedropper: 'crosshair',
    grab: drag ? 'grabbing' : 'grab',
    fill: 'cell',
  }

  const lastPainted = useRef(null)
  const isPainting = useRef(false)

  const tryPaint = (x, y) => {
    const key = `${x},${y}`
    if (lastPainted.current === key) return
    lastPainted.current = key
    onPaint(x, y)
  }

  const handleMouseDown = (e) => {
    if (tool === 'grab') {
      setDrag(true)
      grabStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
      return
    }
    const { x, y } = getCell(e)
    setDrag(true)
    isPainting.current = true
    lastPainted.current = null
    if (tool === 'eyedropper') {
      onPickColor(x, y)
    } else {
      tryPaint(x, y)
    }
  }

  const handleMouseMove = (e) => {
    if (!drag) return
    if (tool === 'grab') {
      const dx = e.clientX - grabStart.current.mx
      const dy = e.clientY - grabStart.current.my
      setOffset({ x: grabStart.current.ox + dx, y: grabStart.current.oy + dy })
      return
    }
    if (!isPainting.current) return
    const { x, y } = getCell(e)
    if (tool !== 'eyedropper') tryPaint(x, y)
  }

  const handleMouseUp = () => {
    setDrag(false)
    isPainting.current = false
    lastPainted.current = null
  }

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const handleWheel = (e) => {
      e.preventDefault()
      setScale((s) => Math.max(2, Math.min(64, s + (e.deltaY < 0 ? 2 : -2))))
    }
    c.addEventListener('wheel', handleWheel, { passive: false })
    return () => c.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <div style={{
      transform: `translate(${offset.x}px, ${offset.y}px)`,
      transition: drag ? 'none' : 'transform 0.05s',
    }}>
      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          className="pixel-canvas"
          style={{ cursor: cursorMap[tool] || 'crosshair' }}
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
