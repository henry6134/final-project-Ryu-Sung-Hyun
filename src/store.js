export const state = {
  activeTab:         'audio',
  uploadedItems:     [],
  outputItems:       [],
  targetFormat:      '',
  converting:        false,
  cancelRequested:   false,
  progress:          0,
  sortKey:           'date',
  sortAsc:           false,
  selectedOutputIds: new Set(),
}

const listeners = []
export function subscribe(fn) { listeners.push(fn) }
export function emit()        { listeners.forEach(fn => fn()) }
