export const FORMAT_MAP = {
  audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus'],
  image: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'],
  video: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'],
}

export const EXT_TO_TYPE = {
  mp3:'audio', wav:'audio', ogg:'audio', flac:'audio', aac:'audio', m4a:'audio', opus:'audio',
  jpg:'image', jpeg:'image', png:'image', webp:'image', gif:'image', bmp:'image', tiff:'image',
  mp4:'video', mov:'video', avi:'video', mkv:'video', webm:'video', flv:'video', wmv:'video',
}

export function getFileType(name) {
  const ext = name.split('.').pop().toLowerCase()
  return EXT_TO_TYPE[ext] || 'unknown'
}

export function getExt(name) {
  return name.split('.').pop().toLowerCase()
}

export function formatSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024)           return bytes + ' B'
  if (bytes < 1024 * 1024)    return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

export function formatDate(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString('ko-KR') + ' ' +
         d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}
