import { state, emit } from '../store.js'
import { getFileType, getExt, formatBytes, FORMAT_MAP } from '../utils/formats.js'

let fileInputEl = null
let folderInputEl = null

function genId() { return Math.random().toString(36).slice(2) }

function buildUploadedItems(files, folderPath = '') {
  return files.map(f => ({
    id: genId(),
    file: f,
    name: f.name,
    size: f.size,
    ext: getExt(f.name),
    type: getFileType(f.name),
    folderPath,
    isFolder: false,
  }))
}

export function renderUploadPanel() {
  const items = state.uploadedItems
  const hasFiles = items.length > 0

  return `
    <div class="upload-panel">
      <div class="panel-label">업로드</div>
      <div class="drop-zone ${hasFiles ? 'has-files' : ''}" id="dropZone">
        ${hasFiles ? renderFileList(items) : renderPlaceholder()}
      </div>
      ${renderConvertBar()}
    </div>
  `
}

function renderPlaceholder() {
  return `
    <div class="drop-placeholder">
      <div class="drop-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>
      <h3>파일을 드래그하거나 선택하세요</h3>
      <p>파일 또는 폴더 단위로 업로드 가능</p>
      <div class="upload-btns">
        <button class="upload-btn-sm" id="filePickBtn">📄 파일 선택</button>
        <button class="upload-btn-sm" id="folderPickBtn">📁 폴더 선택</button>
      </div>
    </div>
  `
}

function renderFileList(items) {
  // Group by folderPath
  const grouped = {}
  items.forEach(item => {
    const key = item.folderPath || '__root__'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(item)
  })

  let html = '<div class="uploaded-files">'

  Object.entries(grouped).forEach(([folder, files]) => {
    if (folder !== '__root__') {
      html += `
        <div class="uploaded-item" style="background:rgba(255,184,48,0.06); border-color:rgba(255,184,48,0.2);">
          <div class="file-icon folder">📁</div>
          <span class="file-name" style="color:var(--warn)">${folder}</span>
          <span class="file-meta">${files.length}개 파일</span>
          <button class="remove-btn" data-folder="${folder}" title="폴더 제거">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `
    }
    files.forEach(item => {
      const typeIcon = item.type === 'audio' ? '🎵' : item.type === 'video' ? '🎬' : item.type === 'image' ? '🖼️' : '📄'
      html += `
        <div class="uploaded-item" ${folder !== '__root__' ? 'style="margin-left:24px;"' : ''}>
          <div class="file-icon ${item.type}">${item.ext.toUpperCase().slice(0,4)}</div>
          <span class="file-name">${item.name}</span>
          <span class="file-meta">${formatBytes(item.size)}</span>
          <button class="remove-btn" data-id="${item.id}" title="제거">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `
    })
  })

  html += `
    <button class="upload-btn-sm" id="addMoreBtn" style="width:fit-content;margin-top:4px">+ 더 추가</button>
  `
  html += '</div>'
  return html
}

function renderConvertBar() {
  const { uploadedItems, activeTab } = state
  const formats = FORMAT_MAP[activeTab] || []

  // Detect source format / folder name
  let sourceLabel = '파일 형식'
  if (uploadedItems.length > 0) {
    const folders = [...new Set(uploadedItems.filter(i => i.folderPath).map(i => i.folderPath))]
    if (folders.length > 0) {
      sourceLabel = folders.length === 1 ? folders[0] : `${folders.length}개 폴더`
    } else {
      const exts = [...new Set(uploadedItems.map(i => i.ext.toUpperCase()))]
      sourceLabel = exts.length === 1 ? exts[0] : `${exts.slice(0,3).join(', ')}`
    }
  }

  const isConverting = state.converting

  return `
    <div class="convert-bar">
      <div class="format-flow">
        <div class="format-dropdown">
          <select id="srcFormatSel" disabled>
            <option>${sourceLabel}</option>
          </select>
        </div>
        <div class="format-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
        <div class="format-dropdown">
          <select id="tgtFormatSel">
            <option value="">파일 형식</option>
            ${formats.map(f => `<option value="${f}" ${state.targetFormat === f ? 'selected' : ''}>${f.toUpperCase()}</option>`).join('')}
          </select>
        </div>
      </div>
      <button class="convert-btn" id="convertBtn" ${uploadedItems.length === 0 || isConverting ? 'disabled' : ''}>
        ${isConverting
          ? '<div class="spinner"></div> 변환 중...'
          : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg> 변환 시작'}
      </button>
    </div>
  `
}

export function bindUploadPanelEvents(onConvert) {
  // Hidden inputs
  if (!fileInputEl) {
    fileInputEl = document.createElement('input')
    fileInputEl.type = 'file'
    fileInputEl.multiple = true
    fileInputEl.accept = getAcceptAttr()
    fileInputEl.style.display = 'none'
    document.body.appendChild(fileInputEl)
    fileInputEl.addEventListener('change', () => handleFilesAdded(Array.from(fileInputEl.files)))
  } else {
    fileInputEl.accept = getAcceptAttr()
  }

  if (!folderInputEl) {
    folderInputEl = document.createElement('input')
    folderInputEl.type = 'file'
    folderInputEl.multiple = true
    folderInputEl.webkitdirectory = true
    folderInputEl.style.display = 'none'
    document.body.appendChild(folderInputEl)
    folderInputEl.addEventListener('change', () => handleFolderAdded(Array.from(folderInputEl.files)))
  }

  document.getElementById('filePickBtn')?.addEventListener('click', (e) => { e.stopPropagation(); fileInputEl.click() })
  document.getElementById('folderPickBtn')?.addEventListener('click', (e) => { e.stopPropagation(); folderInputEl.click() })
  document.getElementById('addMoreBtn')?.addEventListener('click', (e) => { e.stopPropagation(); fileInputEl.click() })

  // Drop zone
  const dz = document.getElementById('dropZone')
  if (dz) {
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover') })
    dz.addEventListener('dragleave', () => dz.classList.remove('dragover'))
    dz.addEventListener('drop', e => {
      e.preventDefault()
      dz.classList.remove('dragover')
      const files = Array.from(e.dataTransfer.files)
      handleFilesAdded(files)
    })
    if (!state.uploadedItems.length) {
      dz.addEventListener('click', () => fileInputEl.click())
    }
  }

  // Remove buttons
  document.querySelectorAll('.remove-btn[data-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      state.uploadedItems = state.uploadedItems.filter(i => i.id !== btn.dataset.id)
      emit()
    })
  })
  document.querySelectorAll('.remove-btn[data-folder]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      state.uploadedItems = state.uploadedItems.filter(i => i.folderPath !== btn.dataset.folder)
      emit()
    })
  })

  // Format selects
  document.getElementById('tgtFormatSel')?.addEventListener('change', (e) => {
    state.targetFormat = e.target.value
  })

  // Convert button
  document.getElementById('convertBtn')?.addEventListener('click', () => {
    if (!state.converting && state.uploadedItems.length > 0) onConvert()
  })
}

function getAcceptAttr() {
  const t = state.activeTab
  if (t === 'audio') return 'audio/*'
  if (t === 'image') return 'image/*'
  if (t === 'video') return 'video/*'
  return '*/*'
}

function handleFilesAdded(files) {
  const filtered = files.filter(f => getFileType(f.name) === state.activeTab || getFileType(f.name) !== 'unknown')
  const newItems = buildUploadedItems(filtered)
  state.uploadedItems = [...state.uploadedItems, ...newItems]
  emit()
}

function handleFolderAdded(files) {
  if (!files.length) return
  // Get folder name from first file's path
  const firstPath = files[0].webkitRelativePath || files[0].name
  const folderName = firstPath.split('/')[0]

  const newItems = files.map(f => ({
    id: genId(),
    file: f,
    name: f.name,
    size: f.size,
    ext: getExt(f.name),
    type: getFileType(f.name),
    folderPath: folderName,
    relativePath: f.webkitRelativePath,
    isFolder: false,
  }))

  state.uploadedItems = [...state.uploadedItems, ...newItems]
  emit()
}
