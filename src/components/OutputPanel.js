import { state, emit } from '../store.js'
import { formatSize, formatDate } from '../utils/formats.js'

export function renderOutputPanel() {
  const items      = getSortedItems()
  const allIds     = items.map(i => i.id)
  const allChecked = allIds.length > 0 && allIds.every(id => state.selectedOutputIds.has(id))
  const anyChecked = allIds.some(id => state.selectedOutputIds.has(id))

  return `
    <div class="output-panel">
      <div class="output-toolbar">
        <div class="output-toolbar-left">
          <label class="select-all-chk">
            <input type="checkbox" id="selectAllChk" ${allChecked ? 'checked' : ''}>
            <span class="custom-chk"></span>
            전체 선택
          </label>
          ${['name','size','ext','date'].map(k => `
            <button class="sort-btn ${state.sortKey === k ? 'active' : ''}" data-sort="${k}">
              ${{ name:'이름', size:'용량', ext:'확장자', date:'날짜' }[k]}
              ${state.sortKey === k
                ? `<span class="sort-arrow">${state.sortAsc ? '↑' : '↓'}</span>`
                : ''}
            </button>
          `).join('')}
        </div>
        <div class="output-toolbar-right">
          <button class="dl-btn delete-selected-btn" id="deleteSelectedBtn" ${!anyChecked ? 'disabled' : ''}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            삭제
          </button>
          <button class="dl-btn" id="downloadSelectedBtn" ${!anyChecked ? 'disabled' : ''}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            다운로드
          </button>
        </div>
      </div>
      <div class="file-table-wrap">
        ${items.length === 0 ? `
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p>변환된 파일이 여기에 표시됩니다</p>
          </div>
        ` : `
          <table class="file-table">
            <thead>
              <tr>
                <th class="td-check"></th>
                <th class="td-name">이름</th>
                <th class="td-size">용량</th>
                <th class="td-ext">확장자</th>
                <th class="td-date">날짜</th>
                <th class="td-status">상태</th>
                <th class="td-actions">다운로드</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr class="${state.selectedOutputIds.has(item.id) ? 'selected' : ''}">
                  <td class="td-check">
                    <label class="row-chk-wrap">
                      <input type="checkbox"
                        ${state.selectedOutputIds.has(item.id) ? 'checked' : ''}
                        data-chk="${item.id}">
                      <span class="custom-chk"></span>
                    </label>
                  </td>
                  <td class="td-name">
                    <div class="file-name-cell">
                      <div class="file-icon ${item.type}">${item.ext.toUpperCase()}</div>
                      <span class="name-text" title="${item.name}">${item.name}</span>
                      ${item.folderName
                        ? `<span class="folder-tag">📁 ${item.folderName}</span>`
                        : ''}
                    </div>
                  </td>
                  <td class="td-size"><span class="cell-mono">${formatSize(item.size)}</span></td>
                  <td class="td-ext"><span class="ext-badge ${item.type}">.${item.ext}</span></td>
                  <td class="td-date"><span class="cell-mono">${formatDate(item.date)}</span></td>
                  <td class="td-status">
                    <span class="status-badge ${item.status}">
                      <span class="dot"></span>
                      ${{ done:'완료', error:'실패', working:'변환 중' }[item.status] || item.status}
                    </span>
                  </td>
                  <td class="td-actions">
                    <div class="row-actions">
                      <button class="row-action-btn dl-single-btn ${item.status !== 'done' ? 'disabled' : ''}"
                        data-dl="${item.id}" ${item.status !== 'done' ? 'disabled' : ''}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        다운
                      </button>
                      <button class="row-action-btn del-single-btn" data-del="${item.id}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `
}

export function bindOutputPanelEvents() {
  document.getElementById('selectAllChk')?.addEventListener('change', e => {
    const items = getSortedItems()
    if (e.target.checked) items.forEach(i => state.selectedOutputIds.add(i.id))
    else state.selectedOutputIds.clear()
    emit()
  })

  document.querySelectorAll('.sort-btn[data-sort]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.sortKey === btn.dataset.sort) state.sortAsc = !state.sortAsc
      else { state.sortKey = btn.dataset.sort; state.sortAsc = true }
      emit()
    })
  })

  document.querySelectorAll('[data-chk]').forEach(chk => {
    chk.addEventListener('change', e => {
      if (e.target.checked) state.selectedOutputIds.add(chk.dataset.chk)
      else state.selectedOutputIds.delete(chk.dataset.chk)
      emit()
    })
  })

  document.querySelectorAll('[data-dl]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = state.outputItems.find(i => i.id === btn.dataset.dl)
      if (item?.blob) downloadBlob(item.blob, item.name)
    })
  })

  document.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.outputItems = state.outputItems.filter(i => i.id !== btn.dataset.del)
      state.selectedOutputIds.delete(btn.dataset.del)
      emit()
    })
  })

  document.getElementById('downloadSelectedBtn')?.addEventListener('click', () => {
    const selected = state.outputItems.filter(i =>
      state.selectedOutputIds.has(i.id) && i.status === 'done' && i.blob
    )
    selected.forEach(item => downloadBlob(item.blob, item.name))
  })

  document.getElementById('deleteSelectedBtn')?.addEventListener('click', () => {
    state.outputItems = state.outputItems.filter(i => !state.selectedOutputIds.has(i.id))
    state.selectedOutputIds.clear()
    emit()
  })
}

function getSortedItems() {
  const items             = [...state.outputItems]
  const { sortKey, sortAsc } = state
  items.sort((a, b) => {
    let va = a[sortKey], vb = b[sortKey]
    if (sortKey === 'name' || sortKey === 'ext') {
      va = va?.toLowerCase?.() ?? ''
      vb = vb?.toLowerCase?.() ?? ''
    }
    if (va < vb) return sortAsc ? -1 : 1
    if (va > vb) return sortAsc ? 1  : -1
    return 0
  })
  return items
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename.split('/').pop()
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
