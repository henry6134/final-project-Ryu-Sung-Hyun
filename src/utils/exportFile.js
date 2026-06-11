export function downloadText(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * PNG 내보내기: 투명 배경 지원
 * - pixels 배열을 직접 렌더해서 원본 해상도(1px = 1px)로 저장
 * - 캔버스의 흰 배경·격자선 없이 순수 픽셀만 출력
 */
export function downloadCanvasPNG(canvas, pixels, width, height, filename = 'pixel-art.png') {
  // pixels 배열이 있으면 투명 배경으로 직접 렌더
  if (pixels && width && height) {
    const tmp = document.createElement('canvas')
    tmp.width = width
    tmp.height = height
    const ctx = tmp.getContext('2d')
    ctx.clearRect(0, 0, width, height) // 투명 배경
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = pixels[y]?.[x]
        if (color) {
          ctx.fillStyle = color
          ctx.fillRect(x, y, 1, 1)
        }
      }
    }
    const url = tmp.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    return
  }
  // fallback: 캔버스 직접 사용
  if (!canvas) return
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

/**
 * JPG 내보내기: 격자선 포함/미포함 옵션
 * - withGrid: true → 격자선 포함 (scale 적용)
 * - withGrid: false → 격자선 없이 원본 해상도
 */
export function downloadCanvasJPG(canvas, pixels, width, height, withGrid = false, filename = 'pixel-art.jpg') {
  if (pixels && width && height) {
    if (withGrid) {
      // 격자 포함: 캔버스를 흰 배경에 합성
      if (!canvas) return
      const tmp = document.createElement('canvas')
      tmp.width = canvas.width
      tmp.height = canvas.height
      const ctx = tmp.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, tmp.width, tmp.height)
      ctx.drawImage(canvas, 0, 0)
      const url = tmp.toDataURL('image/jpeg', 0.95)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
    } else {
      // 격자 없음: 원본 해상도, 흰 배경
      const tmp = document.createElement('canvas')
      tmp.width = width
      tmp.height = height
      const ctx = tmp.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const color = pixels[y]?.[x]
          if (color) {
            ctx.fillStyle = color
            ctx.fillRect(x, y, 1, 1)
          }
        }
      }
      const url = tmp.toDataURL('image/jpeg', 0.95)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
    }
    return
  }
  // fallback
  if (!canvas) return
  const tmp = document.createElement('canvas')
  tmp.width = canvas.width
  tmp.height = canvas.height
  const ctx = tmp.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, tmp.width, tmp.height)
  ctx.drawImage(canvas, 0, 0)
  const url = tmp.toDataURL('image/jpeg', 0.95)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}
