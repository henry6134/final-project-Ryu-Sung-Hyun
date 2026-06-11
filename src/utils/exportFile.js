// 내보내기 해상도 배율: 픽셀 1개 → EXPORT_SCALE × EXPORT_SCALE px 블록
const EXPORT_SCALE = 8

export function downloadText(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// pixels 배열을 고해상도 캔버스에 렌더링 (내보내기 전용)
function renderHighRes(pixels, width, height, bgColor = null) {
  const s = EXPORT_SCALE
  const tmp = document.createElement('canvas')
  tmp.width  = width  * s
  tmp.height = height * s
  const ctx = tmp.getContext('2d')

  // 배경
  if (bgColor) {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, tmp.width, tmp.height)
  } else {
    ctx.clearRect(0, 0, tmp.width, tmp.height)
  }

  // 픽셀 블록 렌더
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = pixels[y]?.[x]
      if (color) {
        ctx.fillStyle = color
        ctx.fillRect(x * s, y * s, s, s)
      }
    }
  }
  return tmp
}

// PNG: 투명 배경, 고해상도
export function downloadCanvasPNG(canvas, pixels, width, height, filename = 'pixel-art.png') {
  if (pixels && width && height) {
    const tmp = renderHighRes(pixels, width, height, null)
    const a = document.createElement('a')
    a.href = tmp.toDataURL('image/png')
    a.download = filename
    a.click()
    return
  }
  if (!canvas) return
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = filename
  a.click()
}

// JPG: 흰 배경, 고해상도, 최고 품질
export function downloadCanvasJPG(canvas, pixels, width, height, filename = 'pixel-art.jpg') {
  if (pixels && width && height) {
    const tmp = renderHighRes(pixels, width, height, '#ffffff')
    const a = document.createElement('a')
    a.href = tmp.toDataURL('image/jpeg', 1.0)
    a.download = filename
    a.click()
    return
  }
  if (!canvas) return
  const tmp = document.createElement('canvas')
  tmp.width  = canvas.width
  tmp.height = canvas.height
  const ctx = tmp.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, tmp.width, tmp.height)
  ctx.drawImage(canvas, 0, 0)
  const a = document.createElement('a')
  a.href = tmp.toDataURL('image/jpeg', 1.0)
  a.download = filename
  a.click()
}
