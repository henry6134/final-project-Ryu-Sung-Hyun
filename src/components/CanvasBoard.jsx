import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react'

function CanvasBoardInner({ pixels, width, height, tool, onPaint, onPickColor, bgImage }, ref) {
  const canvasRef = useRef(null)
  const offscreenRef = useRef(null) // 오프스크린 캔버스 (픽셀만)
  const [scale, setScale] = useState(16)
  const [drag, setDrag] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const grabStart = useRef(null)
  const bgImgCache = useRef(null) // 로드된 배경 이미지 캐시
  const bgImgSrc = useRef(null)   // 현재 캐시된 src

  useImperativeHandle(ref, () => canvasRef.current)

  const getCell = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / scale)
    const y = Math.floor((e.clientY - rect.top) / scale)
    return { x, y }
  }

  // 픽셀 레이어만 오프스크린에 렌더 (배경 없이)
  const renderPixelLayer = (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
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

  // 최종 합성 (배경 + 픽셀)
  const compositeToMain = (mainCtx, cw, ch, imgEl) => {
    mainCtx.clearRect(0, 0, cw, ch)

    if (imgEl) {
      // 배경 이미지 있을 때: 흰 바탕 → 반투명 배경 이미지 → 픽셀
      mainCtx.fillStyle = '#ffffff'
      mainCtx.fillRect(0, 0, cw, ch)
      mainCtx.globalAlpha = 0.35
      mainCtx.drawImage(imgEl, 0, 0, cw, ch)
      mainCtx.globalAlpha = 1
    } else {
      // 배경 이미지 없을 때: 흰 바탕
      mainCtx.fillStyle = '#ffffff'
      mainCtx.fillRect(0, 0, cw, ch)
    }

    // 오프스크린 픽셀 레이어 합성
    if (offscreenRef.current) {
      mainCtx.drawImage(offscreenRef.current, 0, 0)
    }
  }

  // 픽셀 변경 시: 오프스크린 업데이트 → 메인 합성
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const cw = width * scale
    const ch = height * scale
    c.width = cw
    c.height = ch

    // 오프스크린 캔버스 초기화/리사이즈
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement('canvas')
    }
    offscreenRef.current.width = cw
    offscreenRef.current.height = ch
    const offCtx = offscreenRef.current.getContext('2d')
    renderPixelLayer(offCtx, cw, ch)

    const mainCtx = c.getContext('2d')

    if (bgImage) {
      if (bgImgSrc.current === bgImage && bgImgCache.current) {
        // 이미 캐시된 이미지 재사용
        compositeToMain(mainCtx, cw, ch, bgImgCache.current)
      } else {
        // 새로운 배경 이미지 로드
        const img = new Image()
        img.onload = () => {
          bgImgCache.current = img
          bgImgSrc.current = bgImage
          compositeToMain(mainCtx, cw, ch, img)
        }
        img.src = bgImage
      }
    } else {
      bgImgCache.current = null
      bgImgSrc.current = null
      compositeToMain(mainCtx, cw, ch, null)
    }
  }, [pixels, width, height, scale, bgImage])

  const cursorMap = {
    pen: 'crosshair',
    eraser: 'cell',
    eyedropper: 'crosshair',
    grab: drag ? 'grabbing' : 'grab',
  }

  // ── 한 칸 꾹 누름 시 여러 번 칠 방지 ──
  const lastPainted = useRef(null) // { x, y } 마지막으로 칠한 셀
  const isPainting = useRef(false)

  const tryPaint = (x, y) => {
    const key = `${x},${y}`
    if (lastPainted.current === key) return // 같은 칸 중복 칠 방지
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
    lastPainted.current = null // 새 드래그 시작 시 초기화
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

  // ── 스크롤 고정: wheel 이벤트를 passive:false로 등록 ──
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
          style={{
            width: width * scale,
            height: height * scale,
            cursor: cursorMap[tool] || 'crosshair',
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
