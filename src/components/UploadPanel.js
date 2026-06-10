import { state, emit } from '../store.js'
import { FORMAT_MAP, getFileType, getExt, formatSize } from '../utils/formats.js'

let _startConversion = null

export function renderUploadPanel() {
  const formats = FORMAT_MAP[state.activeTab] || []
  const items   = state.uploadedItems

  const sourceOptions = items.length === 0
    ? `<option value="">파일 형식</option>`
    : [...new Set(items.map(i => i.folderName ? i.folderName : `.${i.ext}`))].map(v =>
        `<option value="${v}">${v}</option>`
      ).join('')

  const targetOptions =
    `<option value="">파일 형식</option>` +
    formats.map(f =>
      `<option value="${f}" ${state.targetFormat === f ? 'selected' : ''}>.${f}</option>`
    ).join('')

  return `
    <div class="upload-panel">
      <div class="panel-label">업로드</div>
      <div class="drop-zone ${items.length ? 'has-files' : ''}" id="dropZone">
        ${items.length === 0 ? `
          <div class="drop-placeholder">
            <div class="drop-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <h3>파일 또는 폴더를 드래그하세요</h3>
            <p>또는 아래 버튼으로 선택하세요</p>
            <div class="upload-btns">
              <button class="upload-btn-sm" id="uploadFileBtn">📄 파일 선택</button>
              <button class="upload-btn-sm" id="uploadFolderBtn">📁 폴더 선택</button>
            </div>
          </div>
        ` : `
          <div class="uploaded-files">
            ${items.map(item => `
              <div class="uploaded-item" data-id="${item.id}">
                <div class="file-icon ${item.type}">${item.ext.toUpperCase()}</div>
                <span class="file-name">${item.folderName ? `[${item.folderName}] ` : ''}${item.name}</span>
                <span class="file-meta">${formatSize(item.size)}</span>
                <button class="remove-btn" data-remove="${item.id}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            `).join('')}
            <div class="upload-btns" style="padding:4px 0 2px">
              <button class="upload-btn-sm" id="uploadFileBtn">📄 파일 추가</button>
              <button class="upload-btn-sm" id="uploadFolderBtn">📁 폴더 추가</button>
            </div>
          </div>
        `}
      </div>
      <div class="convert-bar">
        <div class="format-flow">
          <div class="format-dropdown">
            <select id="sourceSelect">${sourceOptions}</select>
          </div>
          <span class="format-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
          <div class="format-dropdown">
            <select id="targetSelect">${targetOptions}</select>
          </div>
        </div>
        <button class="convert-btn" id="convertBtn"
          ${state.converting || !items.length || !state.targetFormat ? 'disabled' : ''}>
          ${state.converting
            ? `<span class="spinner"></span> 변환 중...`
            : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg> 변환 시작`
          }
        </button>
      </div>
    </div>
    <input type="file" id="fileInput"   multiple style="display:none">
    <input type="file" id="folderInput" webkitdirectory multiple style="display:none">
  `
}

export function bindUploadPanelEvents(startConversion) {
  _startConversion = startConversion

  const dropZone   = document.getElementById('dropZone')
  const fileInput  = document.getElementById('fileInput')
  const folderInput = document.getElementById('folderInput')

  document.getElementById('uploadFileBtn')?.addEventListener('click', e => {
    e.stopPropagation(); fileInput.click()
  })
  document.getElementById('uploadFolderBtn')?.addEventListener('click', e => {
    e.stopPropagation(); folderInput.click()
  })

  fileInput?.addEventListener('change', e => {
    addFiles(e.target.files)
    e.target.value = ''   // 같은 파일 재선택 가능하도록 초기화
  })
  folderInput?.addEventListener('change', e => {
    addFiles(e.target.files)
    e.target.value = ''
  })

  dropZone?.addEventListener('dragover', e => {
    e.preventDefault()
    dropZone.classList.add('dragover')
  })
  dropZone?.addEventListener('dragleave', e => {
    if (!dropZone.contains(e.relatedTarget)) {
      dropZone.classList.remove('dragover')
    }
  })
  dropZone?.addEventListener('drop', e => {
    e.preventDefault()
    dropZone.classList.remove('dragover')
    handleDrop(e.dataTransfer.items)
  })

  document.querySelectorAll('.remove-btn[data-remove]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation()
      state.uploadedItems = state.uploadedItems.filter(i => i.id !== btn.dataset.remove)
      emit()
    })
  })

  document.getElementById('targetSelect')?.addEventListener('change', e => {
    state.targetFormat = e.target.value
    emit()
  })

  document.getElementById('convertBtn')?.addEventListener('click', () => {
    if (_startConversion) _startConversion()
  })
}

function addFiles(files) {
  Array.from(files).forEach(file => {
    const isDuplicate = state.uploadedItems.some(
      i => i.name === file.name && i.size === file.size
    )
    if (!isDuplicate) {
      state.uploadedItems.push({
        id:         crypto.randomUUID(),
        name:       file.name,
        file,
        size:       file.size,
        ext:        getExt(file.name),
        type:       getFileType(file.name),
        folderPath: file.webkitRelativePath || null,
        folderName: file.webkitRelativePath
          ? file.webkitRelativePath.split('/')[0]
          : null,
      })
    }
  })
  emit()
}

async function handleDrop(items) {
  const files    = []
  const promises = []
  for (const item of items) {
    const entry = item.webkitGetAsEntry?.()
    if (entry) {
      promises.push(traverseEntry(entry, '', files))
    } else {
      const f = item.getAsFile()
      if (f) files.push({ file: f, folderName: null })
    }
  }
  await Promise.all(promises)

  files.forEach(({ file, folderName }) => {
    const isDuplicate = state.uploadedItems.some(
      i => i.name === file.name && i.size === file.size
    )
    if (!isDuplicate) {
      state.uploadedItems.push({
        id:         crypto.randomUUID(),
        name:       file.name,
        file,
        size:       file.size,
        ext:        getExt(file.name),
        type:       getFileType(file.name),
        folderPath: null,
        folderName,
      })
    }
  })
  emit()
}

async function traverseEntry(entry, path, results) {
  if (entry.isFile) {
    const file = await new Promise((res, rej) => entry.file(res, rej))
    results.push({ file, folderName: path ? path.split('/')[0] : null })
  } else if (entry.isDirectory) {
    const reader = entry.createReader()
    const readAll = async () => {
      const batch = await new Promise((res, rej) => reader.readEntries(res, rej))
      if (batch.length === 0) return
      for (const e of batch) {
        await traverseEntry(e, path ? `${path}/${entry.name}` : entry.name, results)
      }
      await readAll()
    }
    await readAll()
  }
}
