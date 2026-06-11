export function downloadText(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// PNG: 배경 없이 (투명)
export function downloadCanvasPNG(canvas, filename = 'pixel-art.png') {
  if (!canvas) return
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

// JPG: 흰 배경 합성 후 내보내기
export function downloadCanvasJPG(canvas, filename = 'pixel-art.jpg') {
  if (!canvas) return
  const tmp = document.createElement('canvas')
  tmp.width = canvas.width
  tmp.height = canvas.height
  const ctx = tmp.getContext('2d')
  // 흰 배경
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, tmp.width, tmp.height)
  ctx.drawImage(canvas, 0, 0)
  const url = tmp.toDataURL('image/jpeg', 0.95)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}
