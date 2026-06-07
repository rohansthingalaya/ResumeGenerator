import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FilePlus, FolderOpen, FileText, Clock, Loader2, Upload } from 'lucide-react'
import { ThemeToggle } from '../components/UI/ThemeToggle'
import useCvStore from '../store/cvStore'
import { toast } from 'react-hot-toast'
import { ImportResumeModal } from '../components/ImportResumeModal'

export function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loadCvData, resetToDefault, lastSaved, cvData } = useCvStore()
  const [checking, setChecking] = useState(true)
  const [hasSavedData, setHasSavedData] = useState(false)
  const [showImport, setShowImport] = useState(false)

  // If we navigated here from within the editor (back arrow), don't auto-redirect
  const cameFromEditor = location.state?.fromEditor === true

  // Load saved data and auto-redirect to editor unless user explicitly came back here
  useEffect(() => {
    fetch('/api/load')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.personal && Object.keys(data.personal).some((k) => data.personal[k])) {
          loadCvData(data)
          setHasSavedData(true)
          if (!cameFromEditor) {
            navigate('/editor', { replace: true })
          }
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [loadCvData]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNew = () => {
    resetToDefault()
    navigate('/editor')
  }

  const handleLoad = () => {
    if (hasSavedData) {
      navigate('/editor')
    } else {
      toast('No saved CV found. Starting fresh.', { icon: 'ℹ️' })
      navigate('/editor')
    }
  }

  const savedName = cvData.personal?.fullName
  const savedTime = lastSaved
    ? new Date(lastSaved).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : null

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      {/* Nav */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FileText className="text-blue-600 dark:text-blue-400" size={22} />
          <span className="font-semibold text-slate-700 dark:text-slate-200">CV Generator</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              German CV Generator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
              Build ATS-friendly German CVs with real-time preview, keyword analysis, and one-click export.
            </p>
          </div>

          {checking ? (
            <div className="flex justify-center">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleNew}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group text-left"
              >
                <FilePlus size={28} className="text-blue-500 group-hover:scale-110 transition-transform self-center" />
                <div className="text-center">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Create New CV</p>
                  <p className="text-xs text-slate-400 mt-0.5">Start from scratch</p>
                </div>
              </button>

              <button
                onClick={handleLoad}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left"
              >
                <FolderOpen
                  size={28}
                  className={`group-hover:scale-110 transition-all self-center ${hasSavedData ? 'text-green-500' : 'text-slate-400'}`}
                />
                <div className="text-center">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    {hasSavedData ? 'Continue CV' : 'Load Saved CV'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {hasSavedData && savedName
                      ? savedName
                      : hasSavedData
                      ? 'Saved data found'
                      : 'No saved data found'}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setShowImport(true)}
                className="col-span-2 flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all group"
              >
                <Upload size={20} className="text-violet-400 group-hover:text-violet-500 group-hover:scale-110 transition-all" />
                <div className="text-center">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Import Existing CV</p>
                  <p className="text-xs text-slate-400 mt-0.5">Upload PDF or DOCX — prefills all fields automatically</p>
                </div>
              </button>
            </div>
          )}

          {showImport && (
            <ImportResumeModal
              onClose={(goToEditor) => {
                setShowImport(false)
                if (goToEditor) {
                  toast.success('CV imported! Review and edit your details.')
                  navigate('/editor')
                }
              }}
            />
          )}

          {savedTime && (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <Clock size={14} />
              <span>Last saved: {savedTime}</span>
            </div>
          )}
        </div>
      </div>

      <div className="text-center pb-6 text-xs text-slate-300 dark:text-slate-700">
        Runs entirely locally · No accounts · No cloud
      </div>
    </div>
  )
}
