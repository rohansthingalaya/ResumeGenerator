import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Dashboard } from './pages/Dashboard'
import { Editor } from './pages/Editor'
import { Export } from './pages/Export'
import { ErrorBoundary } from './components/UI/ErrorBoundary'
import useCvStore from './store/cvStore'

function ThemeInitializer() {
  const theme = useCvStore((s) => s.cvData.settings.theme)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  return null
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeInitializer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/export" element={<Export />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
