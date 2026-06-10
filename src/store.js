// ── Central reactive store ──
export const state = {
  activeTab: 'audio',
  uploadedItems: [],
  outputItems: [],   // { id, name, size, ext, type, date, status, blob, folderName, errorMsg, progress }
  sortField: 'date',
  sortDir: 'desc',
  selectedOutput: new Set(),
  converting: false,
  progress: 0,           // 전체 진행률 0~1
  currentFileName: '',   // 현재 변환 중인 파일명
  sourceFormat: '',
  targetFormat: '',
}

let listeners = []
export function subscribe(fn) { listeners.push(fn); return () => { listeners = listeners.filter(l => l !== fn) } }
export function emit() { listeners.forEach(fn => fn(state)) }

export function setTab(tab) { state.activeTab = tab; state.uploadedItems = []; state.sourceFormat = ''; state.targetFormat = ''; emit() }
export function setSort(field) {
  if (state.sortField === field) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc'
  else { state.sortField = field; state.sortDir = 'asc' }
  emit()
}
export function toggleSelect(id) {
  if (state.selectedOutput.has(id)) state.selectedOutput.delete(id)
  else state.selectedOutput.add(id)
  emit()
}
export function selectAll(ids) { ids.forEach(id => state.selectedOutput.add(id)); emit() }
export function deselectAll() { state.selectedOutput.clear(); emit() }
