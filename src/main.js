import { state, subscribe, emit } from './store.js'
import { renderHeader, bindHeaderEvents } from './components/Header.js'
import { renderUploadPanel, bindUploadPanelEvents } from './components/UploadPanel.js'
import { renderOutputPanel, bindOutputPanelEvents } from './components/OutputPanel.js'
import { convertFile } from './utils/ffmpegWorker.js'
import { getExt, getFileType } from './utils/formats.js'

const app = document.getElementById('app')

function render() {
  app.innerHTML = `
    ${renderHeader()}
    <div class="main-layout">
      ${renderUploadPanel()}
      ${renderOutputPanel()}
    </div>
    <div class="toast-container" id="toastContainer"></div>
  `
  bindHeaderEvents()
  bindUploadPanelEvents(startConversion)
  bindOutputPanelEvents()
}

subscribe(render)
render()

// 에러 모달 전역 브릿지 (OutputPanel → main)
window.__showErrorModal = (id) => _showErrorModal(id)

// ── CONVERSION LOGIC ──
async function startConversion() {
  const { uploadedItems, targetFormat } = state

  if (!targetFormat) {
    showToast('변환할 형식을 선택해주세요.', 'error')
    return
  }
  if (!uploadedItems.length) return

  state.converting = true
  state.progress = 0
  state.currentFileName = ''
  emit()

  const total = uploadedItems.length
  let done = 0

  for (const item of uploadedItems) {
    const outId = Math.random().toString(36).slice(2)
    const outName = item.name.replace(/\.[^.]+$/, '') + '.' + targetFormat

    const outputItem = {
      id: outId,
      name: outName,
      size: 0,
      ext: targetFormat,
      type: getFileType(outName),
      date: Date.now(),
      status: 'working',
      blob: null,
      folderName: item.folderPath || null,
      errorMsg: null,
      progress: 0,
    }

    state.outputItems = [...state.outputItems, outputItem]
    state.currentFileName = item.name
    emit()

    // 오버레이 파일명 즉시 갱신 (re-render 없이)
    _setOverlayFile(item.name, 0)

    try {
      const blob = await convertFile(item.file, targetFormat, (p) => {
        // 파일별 진행률
        state.outputItems = state.outputItems.map(o =>
          o.id === outId ? { ...o, progress: p } : o
        )
        // 전체 진행률
        const global = (done + p) / total
        state.progress = global
        // DOM 직접 업데이트 (re-render 없이)
        _setOverlayFile(item.name, p)
        _setGlobalProgress(global)
        _setRowProgress(outId, p)
      })

      state.outputItems = state.outputItems.map(o =>
        o.id === outId ? { ...o, status: 'done', blob, size: blob.size, progress: 1 } : o
      )
      _setRowProgress(outId, 1, 'done')
    } catch (err) {
      console.error('Conversion error:', err)
      const msg = _parseError(err)
      state.outputItems = state.outputItems.map(o =>
        o.id === outId ? { ...o, status: 'error', errorMsg: msg, progress: 0 } : o
      )
      _setRowProgress(outId, 0, 'error')
      showToast(`"${item.name}" 변환 실패`, 'error')
    }

    done++
    state.progress = done / total
    _setGlobalProgress(state.progress)
    emit()
  }

  state.converting = false
  state.currentFileName = ''
  state.progress = 1
  emit()

  const successCount = state.outputItems.filter(o => o.status === 'done').length
  const errorCount   = state.outputItems.filter(o => o.status === 'error').length
  if (errorCount > 0)
    showToast(`완료 ${successCount}개 / 실패 ${errorCount}개`, errorCount === total ? 'error' : 'info')
  else
    showToast(`${successCount}개 파일 변환 완료!`, 'success')

  setTimeout(() => {
    _setGlobalProgress(0, true)
  }, 1200)
}

// ── DOM 직접 업데이트 헬퍼 (re-render 없이) ──────────────────

function _setOverlayFile(name, progress) {
  const overlay = document.getElementById('convOverlay')
  if (!overlay) return
  overlay.style.display = 'flex'
  const nameEl = document.getElementById('convOverlayName')
  const pctEl  = document.getElementById('convOverlayPct')
  const fill   = document.getElementById('convOverlayFill')
  if (nameEl) nameEl.textContent = name
  if (pctEl)  pctEl.textContent  = Math.round(progress * 100) + '%'
  if (fill)   fill.style.width   = Math.round(progress * 100) + '%'
}

function _setGlobalProgress(ratio, hide = false) {
  const wrap = document.getElementById('progressBarWrap')
  const fill = document.getElementById('progressBarFill')
  const pct  = document.getElementById('progressBarPct')
  if (!wrap) return
  if (hide) { wrap.style.opacity = '0'; return }
  wrap.style.display  = 'flex'
  wrap.style.opacity  = '1'
  if (fill) fill.style.width = Math.round(ratio * 100) + '%'
  if (pct)  pct.textContent  = Math.round(ratio * 100) + '%'
}

function _setRowProgress(id, ratio, finalStatus) {
  const bar = document.getElementById(`rowprog-${id}`)
  if (bar) bar.style.width = Math.round(ratio * 100) + '%'
  if (!finalStatus) return
  // 상태 뱃지 교체
  const badge = document.getElementById(`rowstatus-${id}`)
  if (!badge) return
  if (finalStatus === 'done') {
    badge.className = 'status-badge done'
    badge.innerHTML = '<span class="dot"></span>완료'
  } else if (finalStatus === 'error') {
    badge.className = 'status-badge error clickable-error'
    badge.dataset.id = id
    badge.innerHTML = '<span class="dot"></span>오류 <span class="err-detail-icon">?</span>'
    badge.addEventListener('click', () => _showErrorModal(id))
  }
  // 진행바 행 숨기기
  const progRow = document.getElementById(`rowprogwrap-${id}`)
  if (progRow) progRow.style.display = 'none'
}

function _parseError(err) {
  if (!err) return '알 수 없는 오류'
  const msg = err.message || String(err)
  if (msg.includes('SharedArrayBuffer')) return 'SharedArrayBuffer 비활성화 — Vite 서버의 COOP/COEP 헤더가 필요합니다.'
  if (msg.includes('codec'))  return `코덱 오류: ${msg}`
  if (msg.includes('No such')) return '입력 파일을 찾을 수 없습니다.'
  if (msg.includes('Invalid')) return `잘못된 파일 형식입니다: ${msg}`
  if (msg.length > 200)       return msg.slice(0, 200) + '…'
  return msg
}

function _showErrorModal(id) {
  const item = state.outputItems.find(i => i.id === id)
  if (!item) return

  // 기존 모달 제거
  document.getElementById('errModal')?.remove()

  const modal = document.createElement('div')
  modal.id = 'errModal'
  modal.innerHTML = `
    <div class="err-modal-backdrop"></div>
    <div class="err-modal-box">
      <div class="err-modal-header">
        <span class="err-modal-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          변환 오류
        </span>
        <button class="err-modal-close">✕</button>
      </div>
      <div class="err-modal-body">
        <div class="err-modal-file">${item.name}</div>
        <div class="err-modal-msg">${item.errorMsg || '알 수 없는 오류가 발생했습니다.'}</div>
      </div>
      <div class="err-modal-footer">
        <span class="err-modal-tip">💡 다른 형식으로 변환하거나 파일을 확인해보세요.</span>
        <button class="err-modal-ok">확인</button>
      </div>
    </div>
  `
  document.body.appendChild(modal)
  const close = () => modal.remove()
  modal.querySelector('.err-modal-close').addEventListener('click', close)
  modal.querySelector('.err-modal-ok').addEventListener('click', close)
  modal.querySelector('.err-modal-backdrop').addEventListener('click', close)
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer')
  if (!container) return
  const el = document.createElement('div')
  el.className = `toast ${type}`
  el.textContent = msg
  container.appendChild(el)
  setTimeout(() => el.remove(), 3500)
}
