import { useState } from 'react'
import DropScreen      from './screens/DropScreen'
import LoadingScreen   from './screens/LoadingScreen'
import DashboardScreen from './screens/DashboardScreen'
import { useOllamaStatus } from './hooks/useOllamaStatus'

export default function App() {
  const [screen, setScreen] = useState('drop')   // 'drop' | 'loading' | 'dashboard'
  const [files, setFiles]   = useState({})
  const [data, setData]     = useState(null)
  const { online: ollamaOnline } = useOllamaStatus()

  function handleReady(droppedFiles) {
    setFiles(droppedFiles)
    setScreen('loading')
  }

  function handleDone(parsedData) {
    setData(parsedData)
    setScreen('dashboard')
  }

  if (screen === 'drop') {
    return <DropScreen onReady={handleReady} />
  }

  if (screen === 'loading') {
    return <LoadingScreen files={files} onDone={handleDone} />
  }

  return <DashboardScreen data={data} ollamaOnline={ollamaOnline} />
}
