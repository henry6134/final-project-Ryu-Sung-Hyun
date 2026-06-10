import { state, setTab, emit } from '../store.js'

const TABS = [
  {
    id: 'audio', label: '오디오',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`
  },
  {
    id: 'image', label: '사진',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
  },
  {
    id: 'video', label: '영상',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`
  },
]

export function renderHeader() {
  return `
    <header class="app-header">
      <div class="app-logo">
        <div class="logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
            <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
          </svg>
        </div>
        Media Converter
      </div>
      <nav class="tab-bar">
        ${TABS.map(t => `
          <button class="tab-btn ${state.activeTab === t.id ? 'active' : ''}" data-tab="${t.id}">
            ${t.icon} ${t.label}
          </button>
        `).join('')}
      </nav>
      <div style="width:160px"></div>
    </header>
  `
}

export function bindHeaderEvents() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => setTab(btn.dataset.tab))
  })
}
