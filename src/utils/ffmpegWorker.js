import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

let ffmpeg = null
let loaded = false

async function load() {
  if (loaded) return
  ffmpeg = new FFmpeg()
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  })
  loaded = true
}

export async function convertFile(file, targetFormat, onProgress) {
  await load()

  const inputName = 'input.' + file.name.split('.').pop()
  const outputName = 'output.' + targetFormat

  ffmpeg.on('progress', ({ progress }) => {
    onProgress && onProgress(Math.min(progress, 1))
  })

  await ffmpeg.writeFile(inputName, await fetchFile(file))

  const args = buildFFmpegArgs(inputName, outputName, targetFormat)
  await ffmpeg.exec(args)

  const data = await ffmpeg.readFile(outputName)

  await ffmpeg.deleteFile(inputName)
  await ffmpeg.deleteFile(outputName)

  const mimeType = getMimeType(targetFormat)
  return new Blob([data.buffer], { type: mimeType })
}

function buildFFmpegArgs(input, output, fmt) {
  const base = ['-i', input]
  switch (fmt) {
    case 'mp3':  return [...base, '-codec:a', 'libmp3lame', '-q:a', '2', output]
    case 'wav':  return [...base, '-codec:a', 'pcm_s16le', output]
    case 'ogg':  return [...base, '-codec:a', 'libvorbis', output]
    case 'aac':  return [...base, '-codec:a', 'aac', output]
    case 'flac': return [...base, '-codec:a', 'flac', output]
    case 'm4a':  return [...base, '-codec:a', 'aac', output]
    case 'opus': return [...base, '-codec:a', 'libopus', output]
    case 'jpg':  return [...base, '-vframes', '1', '-q:v', '2', output]
    case 'png':  return [...base, '-vframes', '1', output]
    case 'webp': return [...base, '-vframes', '1', output]
    case 'gif':  return [...base, '-vf', 'fps=10,scale=320:-1', output]
    case 'bmp':  return [...base, '-vframes', '1', output]
    case 'mp4':  return [...base, '-codec:v', 'libx264', '-codec:a', 'aac', '-movflags', '+faststart', output]
    case 'webm': return [...base, '-codec:v', 'libvpx-vp9', '-codec:a', 'libopus', output]
    case 'avi':  return [...base, '-codec:v', 'mpeg4', '-codec:a', 'mp3', output]
    case 'mov':  return [...base, '-codec:v', 'libx264', '-codec:a', 'aac', output]
    default:     return [...base, output]
  }
}

function getMimeType(fmt) {
  const map = {
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', aac: 'audio/aac',
    flac: 'audio/flac', m4a: 'audio/mp4', opus: 'audio/ogg',
    jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif',
    bmp: 'image/bmp', tiff: 'image/tiff', avif: 'image/avif',
    mp4: 'video/mp4', webm: 'video/webm', avi: 'video/x-msvideo',
    mov: 'video/quicktime', mkv: 'video/x-matroska',
  }
  return map[fmt] || 'application/octet-stream'
}
