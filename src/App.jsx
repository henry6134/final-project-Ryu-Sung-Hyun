import { useEffect, useState } from 'react'
import SetupScreen from './components/SetupScreen'
import EditorScreen from './components/EditorScreen'

const savedTheme = localStorage.getItem('pixel-theme') || 'light'

export default function App() {
  const [view, setView] = useState('setup')
  const [config, setConfig] = useState({ width: 32, height: 32, theme: savedTheme })

  useEffect(() => {
    localStorage.setItem('pixel-theme', config.theme)
  }, [config.theme])

  const toggleTheme = () =>
    setConfig((c) => ({ ...c, theme: c.theme === 'light' ? 'dark' : 'light' }))

  return view === 'setup' ? (
    <SetupScreen
      config={config}
      setConfig={setConfig}
      onStart={() => setView('editor')}
      onToggleTheme={toggleTheme}
    />
  ) : (
    <EditorScreen
      config={config}
      setConfig={setConfig}
      onBack={() => setView('setup')}
      onToggleTheme={toggleTheme}
    />
  )
}
