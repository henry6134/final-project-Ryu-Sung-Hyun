export const FORMAT_MAP = {
  audio: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'opus', 'wma'],
  image: ['jpg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'avif'],
  video: ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'mpeg'],
}

export const EXT_TYPE = {}
Object.entries(FORMAT_MAP).forEach(([type, exts]) => {
  exts.forEach(e => { EXT_TYPE[e] = type })
})

export function getFileType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return EXT_TYPE[ext] || 'unknown'
}

export function getExt(filename) {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

export function formatDate(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    + ' ' + d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
}
