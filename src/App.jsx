// src/App.jsx
import { useState } from 'react'
import SetupScreen from './components/SetupScreen'
import EditorScreen from './components/EditorScreen'

export default function App() {
  const [view, setView] = useState('setup')
  const [config, setConfig] = useState({ width: 32, height: 32, theme: 'light' })

  return view === 'setup' ? (
    <SetupScreen config={config} setConfig={setConfig} onStart={() => setView('editor')} />
  ) : (
    <EditorScreen config={config} onBack={() => setView('setup')} />
  )
}