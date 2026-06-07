import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileDown, ArrowLeft, CheckCircle, Loader2,
  AlertTriangle, RotateCcw, XCircle, Circle, Info,
} from 'lucide-react'
import { Button } from '../components/UI/Button'
import { ThemeToggle } from '../components/UI/ThemeToggle'
import { TEMPLATE_META } from '../utils/templateHelpers'
import { renderClassic } from '../templates/preview/classic'
import { renderMinimal } from '../templates/preview/minimal'
import { renderBerlinTech } from '../templates/preview/berlin-tech'
import { renderCorporate } from '../templates/preview/corporate'
import { renderExecutive } from '../templates/preview/executive'
import useCvStore from '../store/cvStore'
import { toast } from 'react-hot-toast'

const RENDERERS = {
  classic: renderClassic,
  minimal: renderMinimal,
  'berlin-tech': renderBerlinTech,
  corporate: renderCorporate,
  executive: renderExecutive,
}

function getAtsWarnings(cvData) {
  const w = []
  if (!cvData.personal?.fullName?.trim()) w.push('Full name is missing')
  if (!cvData.personal?.email?.trim()) w.push('Email address is missing')
  if (!cvData.personal?.phone?.trim()) w.push('Phone number is missing')
  if ((cvData.experience || []).length === 0) w.push('No work experience entries')
  if ((cvData.skills || []).length === 0) w.push('No skills listed')
  return w
}

function StepRow({ status, label }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      {status === 'generating' && <Loader2 size={15} className="animate-spin text-blue-500 shrink-0" />}
      {status === 'done'       && <CheckCircle size={15} className="text-green-500 shrink-0" />}
      {status === 'error'      && <XCircle size={15} className="text-red-500 shrink-0" />}
      {status === 'pending'    && <Circle size={15} className="text-slate-300 dark:text-slate-600 shrink-0" />}
      <span className={
        status === 'done'       ? 'text-green-700 dark:text-green-400' :
        status === 'error'      ? 'text-red-600 dark:text-red-400' :
        status === 'generating' ? 'text-slate-700 dark:text-slate-200 font-medium' :
                                  'text-slate-400 dark:text-slate-500'
      }>{label}</span>
    </div>
  )
}

const FORMAT_LABELS = {
  docx: { generating: 'Generating DOCX…', done: 'DOCX ready — downloading', error: 'DOCX failed' },
  pdf:  { generating: 'Generating PDF…',  done: 'PDF ready — downloading',  error: 'PDF failed' },
}

export function Export() {
  const navigate = useNavigate()
  const { cvData } = useCvStore()

  const [format, setFormat] = useState('both')
  const [isExporting, setIsExporting] = useState(false)
  const [exportSteps, setExportSteps] = useState(null) // null = not started
  const [hasError, setHasError] = useState(false)
  const [libreOfficeAvailable, setLibreOfficeAvailable] = useState(null) // null = checking

  const nameParts = (cvData.personal?.fullName || '').trim().split(/\s+/)
  const [filename, setFilename] = useState(
    `Lebenslauf_${nameParts.join('_') || 'CV'}`
  )

  const template = TEMPLATE_META.find((t) => t.id === cvData.settings?.selectedTemplate) || TEMPLATE_META[0]
  const atsWarnings = getAtsWarnings(cvData)

  // Check LibreOffice once on mount
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setLibreOfficeAvailable(d.libreOfficeAvailable ?? false))
      .catch(() => setLibreOfficeAvailable(false))
  }, [])

  const updateStep = (id, patch) =>
    setExportSteps((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s))

  const handleExport = async () => {
    setIsExporting(true)
    setHasError(false)

    const formats = format === 'both' ? ['docx', 'pdf'] : [format]
    setExportSteps(formats.map((f) => ({ id: f, status: 'pending', label: FORMAT_LABELS[f].generating })))

    try {
      for (const f of formats) {
        updateStep(f, { status: 'generating', label: FORMAT_LABELS[f].generating })

        const body = { cvData, filename }
        if (f === 'pdf') {
          const renderer = RENDERERS[cvData.settings?.selectedTemplate] || renderClassic
          body.renderedHtml = renderer(cvData)
          // Strip photoPath from cvData in the PDF request — photo is already embedded
          // in renderedHtml as a base64 src, so sending it twice would double the payload.
          body.cvData = {
            ...cvData,
            personal: { ...cvData.personal, photoPath: '' },
          }
        }

        const res = await fetch(`/api/export/${f}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || `${f.toUpperCase()} export failed`)
        }

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${filename}.${f}`
        a.click()
        URL.revokeObjectURL(url)

        updateStep(f, { status: 'done', label: FORMAT_LABELS[f].done })
      }

      toast.success(`Exported: ${formats.map((f) => f.toUpperCase()).join(' & ')}`)
    } catch (err) {
      setExportSteps((prev) =>
        prev.map((s) =>
          s.status === 'generating' ? { ...s, status: 'error', label: err.message } : s
        )
      )
      setHasError(true)
      toast.error(err.message || 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const allDone = exportSteps && exportSteps.every((s) => s.status === 'done')
  const showPdfWarning = libreOfficeAvailable === false && (format === 'pdf' || format === 'both')

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      {/* Nav */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/editor')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="font-semibold text-slate-700 dark:text-slate-200">Export CV</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-start justify-center p-8">
        <div className="max-w-md w-full space-y-5">

          {/* Template */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <p className="text-xs font-medium text-slate-400 mb-2">Selected Template</p>
            <div className="flex items-center gap-3">
              <div className="w-3 h-8 rounded-full shrink-0" style={{ background: template.accent }} />
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{template.name}</p>
                <p className="text-xs text-slate-400">{template.description}</p>
              </div>
            </div>
          </div>

          {/* LibreOffice warning */}
          {showPdfWarning && (
            <div className="flex gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-300 space-y-0.5">
                <p className="font-semibold">LibreOffice not found</p>
                <p>PDF will use a browser fallback renderer — layout may differ slightly from DOCX. Install LibreOffice for best PDF fidelity.</p>
              </div>
            </div>
          )}

          {/* ATS warnings */}
          {atsWarnings.length > 0 && (
            <div className="flex gap-2.5 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <Info size={15} className="text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-700 dark:text-yellow-300">
                <p className="font-semibold mb-1">Incomplete data</p>
                <ul className="space-y-0.5">
                  {atsWarnings.map((w) => <li key={w}>• {w}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Filename */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Filename</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            <p className="text-xs text-slate-400">Extension will be added automatically (.docx / .pdf)</p>
          </div>

          {/* Format */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'pdf',  label: 'PDF Only' },
                { value: 'docx', label: 'DOCX Only' },
                { value: 'both', label: 'Both' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => !isExporting && setFormat(opt.value)}
                  className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    format === opt.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              disabled={isExporting || !filename.trim()}
              className="flex-1"
              size="lg"
            >
              {isExporting ? (
                <><Loader2 size={18} className="animate-spin" />Generating…</>
              ) : (
                <><FileDown size={18} />{allDone ? 'Export Again' : 'Generate & Download'}</>
              )}
            </Button>
            {hasError && !isExporting && (
              <Button onClick={handleExport} variant="secondary" size="lg" title="Retry export">
                <RotateCcw size={18} />
              </Button>
            )}
          </div>

          {/* Step-by-step progress */}
          {exportSteps && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 space-y-2.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Export Progress</p>
              {exportSteps.map((step) => (
                <StepRow key={step.id} status={step.status} label={step.label} />
              ))}
            </div>
          )}

          {/* Success summary */}
          {allDone && (
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
              <div className="text-sm text-green-700 dark:text-green-400">
                <p className="font-semibold">Files downloaded</p>
                <p className="text-xs opacity-80 mt-0.5">Check your Downloads folder. Use DOCX for ATS systems; PDF for email applications.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
