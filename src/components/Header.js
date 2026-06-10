import { state, emit } from '../store.js'

export function renderHeader() {
  const tabs = [
    { key: 'audio', label: '오디오', icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>` },
    { key: 'image', label: '사진',   icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>` },
    { key: 'video', label: '영상',   icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>` },
  ]
  return `
    <header class="app-header">
      <div class="app-logo">
        <div class="logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        Media Converter
      </div>
      <nav class="tab-bar">
        ${tabs.map(t => `
          <button class="tab-btn ${state.activeTab === t.key ? 'active' : ''}" data-tab="${t.key}">
            ${t.icon} ${t.label}
          </button>
        `).join('')}
      </nav>
      <div style="width:160px"></div>
    </header>
  `
}

export function bindHeaderEvents() {
  document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeTab    = btn.dataset.tab
      state.uploadedItems = []
      state.targetFormat  = ''
      emit()
    })
  })
}
