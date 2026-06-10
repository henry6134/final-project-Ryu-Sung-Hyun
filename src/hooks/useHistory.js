import { useState } from 'react'

export function useHistory(initial) {
  const [past, setPast] = useState([])
  const [present, setPresent] = useState(initial)
  const [future, setFuture] = useState([])

  const set = (next) => {
    setPast((p) => [...p, present])
    setPresent(next)
    setFuture([])
  }

  const undo = () => {
    if (!past.length) return
    const prev = past[past.length - 1]
    setPast((p) => p.slice(0, -1))
    setFuture((f) => [present, ...f])
    setPresent(prev)
  }

  const redo = () => {
    if (!future.length) return
    const next = future[0]
    setFuture((f) => f.slice(1))
    setPast((p) => [...p, present])
    setPresent(next)
  }

  return { present, set, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 }
}