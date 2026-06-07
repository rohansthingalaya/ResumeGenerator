import { useState, useDeferredValue } from 'react'
import { ZoomIn, ZoomOut, FileDown, Maximize2 } from 'lucide-react'
import { TemplateSelector } from './TemplateSelector'
import { PreviewRenderer } from './PreviewRenderer'
import { Button } from '../UI/Button'
import useCvStore from '../../store/cvStore'
import { useNavigate } from 'react-router-dom'

const ZOOM_STEPS = [0.35, 0.45, 0.55, 0.65, 0.75, 0.90, 1.0]

export function PreviewPanel() {
  const { cvData } = useCvStore()
  // useDeferredValue lets React render the previous preview while the new one is being prepared,
  // keeping keystrokes snappy even when the preview is slow to re-render.
  const deferredCvData = useDeferredValue(cvData)

  const [zoomIdx, setZoomIdx] = useState(2) // default 0.55
  const zoom = ZOOM_STEPS[zoomIdx]

  const zoomIn = () => setZoomIdx((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))
  const zoomOut = () => setZoomIdx((i) => Math.max(0, i - 1))
  const fitPage = () => setZoomIdx(2) // back to default

  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full">
      {/* Controls bar */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2.5 shrink-0">
        <TemplateSelector />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={zoomOut} disabled={zoomIdx === 0} title="Zoom out">
              <ZoomOut size={14} />
            </Button>
            <button
              onClick={fitPage}
              className="text-xs text-slate-500 dark:text-slate-400 w-12 text-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <Button variant="ghost" size="sm" onClick={zoomIn} disabled={zoomIdx === ZOOM_STEPS.length - 1} title="Zoom in">
              <ZoomIn size={14} />
            </Button>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/export')}>
            <FileDown size={14} />
            Export
          </Button>
        </div>
      </div>

      {/* Scrollable preview area */}
      <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-950 p-6 flex justify-center items-start">
        <PreviewRenderer cvData={deferredCvData} zoom={zoom} />
      </div>
    </div>
  )
}
