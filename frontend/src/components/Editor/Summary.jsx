import { useState } from 'react'
import { FileText, Sparkles, X, Check } from 'lucide-react'
import { Accordion } from '../UI/Accordion'
import { Textarea } from '../UI/Input'
import { Button } from '../UI/Button'
import useCvStore from '../../store/cvStore'
import { toast } from 'react-hot-toast'

export function Summary() {
  const { cvData, updateSummary } = useCvStore()
  const [showModal, setShowModal] = useState(false)
  const [jdText, setJdText] = useState('')
  const [suggestion, setSuggestion] = useState(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const wordCount = cvData.summary.trim() ? cvData.summary.trim().split(/\s+/).length : 0
  const charCount = cvData.summary.length

  const handleOptimize = async () => {
    if (!jdText.trim()) return
    setIsOptimizing(true)
    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvData, jobDescription: jdText }),
      })
      const data = await res.json()
      if (data.summary) {
        setSuggestion(data.summary)
      }
    } catch {
      toast.error('Optimization failed')
    } finally {
      setIsOptimizing(false)
    }
  }

  const acceptSuggestion = () => {
    updateSummary(suggestion)
    setSuggestion(null)
    setShowModal(false)
    toast.success('Summary updated')
  }

  return (
    <>
      <Accordion title="Kurzprofil (Professional Summary)" icon={FileText}>
        <Textarea
          label="Summary"
          placeholder="Senior Software Engineer mit 8+ Jahren Erfahrung in der Entwicklung skalierbarer Cloud-Infrastrukturen..."
          value={cvData.summary}
          onChange={(e) => updateSummary(e.target.value)}
          className="min-h-[120px]"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {wordCount} words · {charCount} chars
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowModal(true)}
          >
            <Sparkles size={14} />
            Optimize with Job Description
          </Button>
        </div>
      </Accordion>

      {/* Optimize Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">Optimize Summary</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <Textarea
                label="Paste job description"
                placeholder="Paste the job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="min-h-[150px]"
              />

              <Button
                onClick={handleOptimize}
                disabled={!jdText.trim() || isOptimizing}
                className="w-full"
              >
                {isOptimizing ? 'Analyzing...' : 'Generate Optimized Summary'}
              </Button>

              {suggestion && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Suggested Summary:</p>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                    {suggestion}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={acceptSuggestion} size="sm">
                      <Check size={14} />
                      Accept
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSuggestion(null)}>
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
