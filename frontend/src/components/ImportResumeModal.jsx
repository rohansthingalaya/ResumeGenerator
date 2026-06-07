import { useRef, useState } from 'react'
import { Upload, X, CheckCircle, AlertCircle, Loader2, FileText, File } from 'lucide-react'
import useCvStore from '../store/cvStore'

function FieldBadge({ label, value }) {
  if (!value) return null
  const display = typeof value === 'number' ? `${value} found` : String(value).slice(0, 40)
  return (
    <div className="flex items-start gap-2 py-1">
      <span className="text-xs text-slate-500 dark:text-slate-400 w-28 shrink-0">{label}</span>
      <span className="text-xs text-slate-700 dark:text-slate-200 font-medium truncate">{display}</span>
    </div>
  )
}

export function ImportResumeModal({ onClose }) {
  const { loadCvData } = useCvStore()
  const fileInputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [parsed, setParsed] = useState(null)

  async function processFile(file) {
    if (!file) return
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    if (!allowed.includes(file.type)) {
      setErrorMsg('Only PDF and DOCX files are supported.')
      setStatus('error')
      return
    }

    setStatus('uploading')
    setErrorMsg('')
    setParsed(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/import-resume', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Import failed.')
      }
      setParsed(json.data)
      setStatus('success')
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong.')
      setStatus('error')
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    processFile(file)
  }

  function handleFileChange(e) {
    processFile(e.target.files[0])
  }

  function handleApply() {
    if (!parsed) return
    loadCvData(parsed)
    onClose(true) // true = navigate to editor
  }

  const p = parsed?.personal || {}
  const expCount = parsed?.experience?.length || 0
  const eduCount = parsed?.education?.length || 0
  const skillCount = parsed?.skills?.reduce((acc, s) => acc + (s.items?.length || 0), 0) || 0
  const langCount = parsed?.languages?.length || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-blue-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">Import Existing CV</span>
          </div>
          <button
            onClick={() => onClose(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Drop zone — shown when idle or error */}
          {(status === 'idle' || status === 'error') && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragging
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="flex gap-2 text-slate-300 dark:text-slate-600">
                    <FileText size={28} />
                    <File size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Drop your CV here or click to browse
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PDF or DOCX · max 15 MB</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                Fields are extracted automatically. You can review and edit everything in the editor.
              </p>
            </>
          )}

          {/* Uploading */}
          {status === 'uploading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Parsing your CV...</p>
            </div>
          )}

          {/* Success preview */}
          {status === 'success' && parsed && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle size={18} />
                <span className="text-sm font-medium">CV parsed successfully</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 divide-y divide-slate-100 dark:divide-slate-700">
                <FieldBadge label="Name" value={p.fullName} />
                <FieldBadge label="Email" value={p.email} />
                <FieldBadge label="Phone" value={p.phone} />
                <FieldBadge label="LinkedIn" value={p.linkedin} />
                <FieldBadge label="Summary" value={parsed.summary ? 'Found' : null} />
                <FieldBadge label="Experience" value={expCount > 0 ? `${expCount} position${expCount > 1 ? 's' : ''}` : null} />
                <FieldBadge label="Education" value={eduCount > 0 ? `${eduCount} entry` : null} />
                <FieldBadge label="Skills" value={skillCount > 0 ? `${skillCount} skills` : null} />
                <FieldBadge label="Languages" value={langCount > 0 ? `${langCount} language${langCount > 1 ? 's' : ''}` : null} />
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500">
                Parsing is heuristic — review all fields in the editor after import.
              </p>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setStatus('idle'); setParsed(null) }}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Try another file
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                >
                  Use this data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
