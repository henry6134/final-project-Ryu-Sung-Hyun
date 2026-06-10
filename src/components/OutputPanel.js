import { state, setSort, toggleSelect, selectAll, deselectAll, emit } from '../store.js'
import { formatBytes, formatDate } from '../utils/formats.js'
import JSZip from 'jszip'

export function renderOutputPanel() {
  const { outputItems, sortField, sortDir, selectedOutput, converting, progress, currentFileName } = state
  const sorted = getSorted(outputItems, sortField, sortDir)
  const allIds = sorted.map(i => i.id)
  const allSelected = allIds.length > 0 && allIds.every(id => selectedOutput.has(id))

  const arrow = dir => dir === 'asc' ? '↑' : '↓'
  const sa = f => sortField === f ? 'sort-active' : ''
  const pct = Math.round(progress * 100)

  return `
    <div class="output-panel">
      <div class="output-toolbar">
        <div class="output-toolbar-left">
          <label class="select-all-chk">
            <input type="checkbox" id="selectAllChk" ${allSelected ? 'checked' : ''}>
            <span class="custom-chk"></span>
            전체 선택
          </label>
          <div style="width:1px;height:20px;background:var(--border);margin:0 6px"></div>
          <button class="sort-btn ${sa('size')}" data-sort="size">
            용량 ${sortField==='size'?`<span class="sort-arrow">${arrow(sortDir)}</span>`:''}
          </button>
          <button class="sort-btn ${sa('ext')}" data-sort="ext">
            확장자 ${sortField==='ext'?`<span class="sort-arrow">${arrow(sortDir)}</span>`:''}
          </button>
          <button class="sort-btn ${sa('date')}" data-sort="date">
            날짜 ${sortField==='date'?`<span class="sort-arrow">${arrow(sortDir)}</span>`:''}
          </button>
          <button class="sort-btn ${sa('name')}" data-sort="name">
            이름 ${sortField==='name'?`<span class="sort-arrow">${arrow(sortDir)}</span>`:''}
          </button>
        </div>
        <div class="output-toolbar-right">
          <button class="dl-btn" id="downloadBtn" ${selectedOutput.size === 0 ? 'disabled' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            다운로드 ${selectedOutput.size > 0 ? `(${selectedOutput.size})` : ''}
          </button>
          <button class="dl-btn delete-selected-btn" id="deleteSelectedBtn" ${selectedOutput.size === 0 ? 'disabled' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            선택 삭제 ${selectedOutput.size > 0 ? `(${selectedOutput.size})` : ''}
          </button>
        </div>
      </div>

      <!-- 전체 진행률 바 -->
      <div class="progress-bar-wrap" id="progressBarWrap"
           style="display:${converting ? 'flex' : 'none'}; opacity:1;">
        <div class="progress-bar-track">
          <div class="progress-bar-fill" id="progressBarFill" style="width:${pct}%"></div>
        </div>
        <span class="progress-bar-pct" id="progressBarPct">${pct}%</span>
      </div>

      <!-- 변환 중 파일 오버레이 (업로드 패널 위에 표시) -->
      <div class="conv-overlay" id="convOverlay" style="display:${converting ? 'flex' : 'none'}">
        <div class="conv-overlay-inner">
          <div class="conv-spinner"></div>
          <div class="conv-overlay-info">
            <span class="conv-overlay-label">변환 중</span>
            <span class="conv-overlay-name" id="convOverlayName">${currentFileName || ''}</span>
          </div>
          <span class="conv-overlay-pct" id="convOverlayPct">${pct}%</span>
        </div>
        <div class="conv-overlay-bar">
          <div class="conv-overlay-fill" id="convOverlayFill" style="width:${pct}%"></div>
        </div>
      </div>

      <div class="file-table-wrap">
        ${sorted.length === 0 ? renderEmpty() : renderTable(sorted, selectedOutput)}
      </div>
    </div>
  `
}

function renderEmpty() {
  return `
    <div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 9h6M9 13h4"/>
      </svg>
      <p>변환된 파일이 여기 표시됩니다</p>
    </div>
  `
}

function renderTable(items, selected) {
  return `
    <table class="file-table">
      <thead>
        <tr>
          <th class="td-check"></th>
          <th class="td-name">이름</th>
          <th class="td-size">용량</th>
          <th class="td-ext">확장자</th>
          <th class="td-date">날짜</th>
          <th class="td-status">상태</th>
          <th class="td-actions"></th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => renderRow(item, selected.has(item.id))).join('')}
      </tbody>
    </table>
  `
}

function renderRow(item, isSelected) {
  const extClass = item.type || 'audio'
  const pct = Math.round((item.progress || 0) * 100)
  const isWorking = item.status === 'working'

  let statusHtml
  if (item.status === 'done') {
    statusHtml = `<span class="status-badge done" id="rowstatus-${item.id}"><span class="dot"></span>완료</span>`
  } else if (item.status === 'error') {
    statusHtml = `
      <span class="status-badge error clickable-error" id="rowstatus-${item.id}" data-id="${item.id}" title="클릭하여 오류 확인">
        <span class="dot"></span>오류
        <span class="err-detail-icon">?</span>
      </span>`
  } else {
    statusHtml = `<span class="status-badge working" id="rowstatus-${item.id}"><span class="dot"></span>${pct}%</span>`
  }

  const canDownload = item.status === 'done' && item.blob

  return `
    <tr class="${isSelected ? 'selected' : ''}" data-id="${item.id}">
      <td class="td-check">
        <label class="row-chk-wrap">
          <input type="checkbox" class="row-chk" data-id="${item.id}" ${isSelected ? 'checked' : ''}>
          <span class="custom-chk"></span>
        </label>
      </td>
      <td class="td-name">
        <div class="file-name-cell">
          <div class="file-name-stack">
            <div class="file-name-top">
              <span class="name-text" title="${item.name}">${item.name}</span>
              ${item.folderName ? `<span class="folder-tag">${item.folderName}</span>` : ''}
            </div>
            <div class="row-prog-wrap" id="rowprogwrap-${item.id}"
                 style="display:${isWorking ? 'block' : 'none'}">
              <div class="row-prog-track">
                <div class="row-prog-fill" id="rowprog-${item.id}" style="width:${pct}%"></div>
              </div>
            </div>
          </div>
        </div>
      </td>
      <td class="td-size"><span class="cell-mono">${formatBytes(item.size)}</span></td>
      <td class="td-ext"><span class="ext-badge ${extClass}">${item.ext.toUpperCase()}</span></td>
      <td class="td-date"><span class="cell-mono">${formatDate(item.date)}</span></td>
      <td class="td-status">${statusHtml}</td>
      <td class="td-actions">
        <div class="row-actions">
          <button class="row-action-btn dl-single-btn ${canDownload ? '' : 'disabled'}"
            data-id="${item.id}" title="개별 다운로드" ${canDownload ? '' : 'disabled'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            다운로드
          </button>
          <button class="row-action-btn del-single-btn" data-id="${item.id}" title="삭제">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            삭제
          </button>
        </div>
      </td>
    </tr>
  `
}

function getSorted(items, field, dir) {
  return [...items].sort((a, b) => {
    let va = a[field], vb = b[field]
    if (field === 'size') { va = a.size || 0; vb = b.size || 0 }
    if (field === 'date') { va = a.date || 0; vb = b.date || 0 }
    if (field === 'ext')  { va = a.ext || ''; vb = b.ext || '' }
    if (field === 'name') { va = a.name || ''; vb = b.name || '' }
    if (va < vb) return dir === 'asc' ? -1 : 1
    if (va > vb) return dir === 'asc' ? 1 : -1
    return 0
  })
}

export function bindOutputPanelEvents() {
  // Sort buttons
  document.querySelectorAll('.sort-btn[data-sort]').forEach(btn => {
    btn.addEventListener('click', () => setSort(btn.dataset.sort))
  })

  // Select all
  const saChk = document.getElementById('selectAllChk')
  if (saChk) {
    saChk.addEventListener('change', () => {
      const ids = state.outputItems.map(i => i.id)
      if (saChk.checked) selectAll(ids)
      else deselectAll()
    })
  }

  // Row checkboxes
  document.querySelectorAll('.row-chk').forEach(chk => {
    chk.addEventListener('change', () => toggleSelect(chk.dataset.id))
  })

  // Clickable error badges (delegated via renderRow — also bind here for initial render)
  document.querySelectorAll('.clickable-error').forEach(badge => {
    badge.addEventListener('click', (e) => {
      e.stopPropagation()
      // Import dynamically to avoid circular dep — call via window bridge
      window.__showErrorModal?.(badge.dataset.id)
    })
  })

  // Individual download buttons
  document.querySelectorAll('.dl-single-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const item = state.outputItems.find(i => i.id === btn.dataset.id)
      if (item?.blob) triggerDownload(item.blob, item.name)
    })
  })

  // Individual delete buttons
  document.querySelectorAll('.del-single-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const id = btn.dataset.id
      state.outputItems = state.outputItems.filter(i => i.id !== id)
      state.selectedOutput.delete(id)
      emit()
    })
  })

  // Download button
  document.getElementById('downloadBtn')?.addEventListener('click', downloadSelected)

  // Delete selected button
  document.getElementById('deleteSelectedBtn')?.addEventListener('click', () => {
    const ids = [...state.selectedOutput]
    state.outputItems = state.outputItems.filter(i => !ids.includes(i.id))
    deselectAll()
  })
}

async function downloadSelected() {
  const ids = [...state.selectedOutput]
  if (!ids.length) return

  const items = state.outputItems.filter(i => ids.includes(i.id) && i.blob && i.status === 'done')
  if (!items.length) return

  // Group by folder
  const byFolder = {}
  const rootItems = []
  items.forEach(item => {
    if (item.folderName) {
      if (!byFolder[item.folderName]) byFolder[item.folderName] = []
      byFolder[item.folderName].push(item)
    } else {
      rootItems.push(item)
    }
  })

  const folderNames = Object.keys(byFolder)

  // If only one file and no folder: direct download
  if (items.length === 1 && !items[0].folderName) {
    triggerDownload(items[0].blob, items[0].name)
    return
  }

  // Build ZIP
  const zip = new JSZip()

  // Root files
  rootItems.forEach(item => {
    zip.file(item.name, item.blob)
  })

  // Folder items
  folderNames.forEach(folder => {
    const f = zip.folder(folder)
    byFolder[folder].forEach(item => {
      f.file(item.name, item.blob)
    })
  })

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  triggerDownload(zipBlob, 'converted_files.zip')
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
