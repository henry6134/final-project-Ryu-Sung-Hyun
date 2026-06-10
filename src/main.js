import { toBlobURL, fetchFile } from 'https://esm.sh/@ffmpeg/util@0.12.2'
import { state, subscribe, emit } from './store.js'
import { renderHeader, bindHeaderEvents } from './components/Header.js'
import { renderUploadPanel, bindUploadPanelEvents } from './components/UploadPanel.js'
import { renderOutputPanel, bindOutputPanelEvents } from './components/OutputPanel.js'
import { getFileType } from './utils/formats.js'

// FFmpeg을 직접 esm.sh에서 import (blob URL 우회 문제 방지)
import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.10'

const ffmpeg = new FFmpeg()
ffmpeg.on('log', ({ message }) => console.log('[FFmpeg]', message))
ffmpeg.on('progress', ({ progress }) => {
  const pct = Math.round(progress * 100)
  const fill  = document.getElementById('progressBarFill')
  const pctEl = document.getElementById('progressBarPct')
  const wrap  = document.getElementById('progressBarWrap')
  if (fill)  fill.style.width  = pct + '%'
  if (pctEl) pctEl.textContent = pct + '%'
  if (wrap)  wrap.style.display = 'flex'
})

let ffmpegLoaded = false

async function loadFFmpeg() {
  if (ffmpegLoaded) return

  // single-thread 빌드 사용: SharedArrayBuffer / crossOriginIsolated 불필요
  // GitHub Pages 등 COOP/COEP 헤더 제어가 어려운 환경에서 안정적
  const coreBase = 'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/esm'
  const [coreURL, wasmURL] = await Promise.all([
    toBlobURL(`${coreBase}/ffmpeg-core.js`,   'text/javascript'),
    toBlobURL(`${coreBase}/ffmpeg-core.wasm`, 'application/wasm'),
  ])
  await ffmpeg.load({ coreURL, wasmURL })
  ffmpegLoaded = true
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer')
  if (!container) return
  const el = document.createElement('div')
  el.className = `toast ${type}`
  el.textContent = msg
  container.appendChild(el)
  setTimeout(() => el.remove(), 4000)
}

async function startConversion() {
  if (state.converting) return
  if (!state.targetFormat) { showToast('변환할 형식을 선택해주세요.', 'error'); return }
  if (!state.uploadedItems.length) return

  state.converting = true
  state.progress   = 0
  emit()

  try {
    showToast('FFmpeg 로딩 중... (첫 실행 시 10~30초 소요)', 'info')
    await loadFFmpeg()

    const total = state.uploadedItems.length
    let done    = 0

    for (const item of state.uploadedItems) {
      const outId   = crypto.randomUUID()
      const outName = item.name.replace(/\.[^.]+$/, '') + '.' + state.targetFormat
      const outputItem = {
        id: outId, name: outName, size: 0,
        ext: state.targetFormat, type: getFileType(outName),
        date: Date.now(), status: 'working', blob: null,
        folderName: item.folderName || null,
      }
      state.outputItems = [...state.outputItems, outputItem]
      emit()

      try {
        const inputExt   = item.file.name.split('.').pop()
        const inputName  = `input_${outId.slice(0, 8)}.${inputExt}`
        const outputName = `output_${outId.slice(0, 8)}.${state.targetFormat}`

        await ffmpeg.writeFile(inputName, await fetchFile(item.file))
        await ffmpeg.exec(['-i', inputName, '-y', outputName])
        const data = await ffmpeg.readFile(outputName)
        const blob = new Blob([data.buffer])
        await ffmpeg.deleteFile(inputName)
        await ffmpeg.deleteFile(outputName)

        state.outputItems = state.outputItems.map(o =>
          o.id === outId ? { ...o, status: 'done', blob, size: blob.size } : o
        )
      } catch (err) {
        console.error('변환 오류:', err)
        state.outputItems = state.outputItems.map(o =>
          o.id === outId ? { ...o, status: 'error' } : o
        )
        showToast(`"${item.name}" 변환 실패`, 'error')
      }

      done++
      state.progress = done / total
      emit()
    }
  } catch (err) {
    console.error('FFmpeg 로드 실패:', err)
    showToast('FFmpeg 로드에 실패했습니다. 페이지를 새로고침 해주세요.', 'error')
  } finally {
    state.converting = false
    emit()
    const ok = state.outputItems.filter(o => o.status === 'done').length
    if (ok > 0) showToast(`${ok}개 파일 변환 완료!`, 'success')
    setTimeout(() => {
      const wrap = document.getElementById('progressBarWrap')
      if (wrap) wrap.style.display = 'none'
    }, 1500)
  }
}

const app = document.getElementById('app')

function render() {
  app.innerHTML = `
    ${renderHeader()}
    <div class="main-layout">
      <div class="panel-top">${renderUploadPanel()}</div>
      <div class="panel-bottom">${renderOutputPanel()}</div>
    </div>
    <div id="progressBarWrap" class="progress-bar-wrap" style="display:none">
      <div class="progress-bar-track">
        <div class="progress-bar-fill" id="progressBarFill" style="width:0%"></div>
      </div>
      <span class="progress-bar-pct" id="progressBarPct">0%</span>
    </div>
    <div class="toast-container" id="toastContainer"></div>
  `
  bindHeaderEvents()
  bindUploadPanelEvents(startConversion)
  bindOutputPanelEvents()
}

subscribe(render)
render()
