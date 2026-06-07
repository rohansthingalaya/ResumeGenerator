import { useState } from 'react'
import { Search, CheckCircle, XCircle, AlertCircle, Loader2, Sparkles, Check, X } from 'lucide-react'
import { Accordion } from '../UI/Accordion'
import { Textarea } from '../UI/Input'
import { Button } from '../UI/Button'
import useCvStore from '../../store/cvStore'
import { toast } from 'react-hot-toast'

function TrafficLight({ status }) {
  if (status === 'found') return <CheckCircle size={14} className="text-green-500 shrink-0" />
  if (status === 'missing') return <XCircle size={14} className="text-red-500 shrink-0" />
  return <AlertCircle size={14} className="text-yellow-500 shrink-0" />
}

function KeywordGroup({ title, keywords }) {
  if (!keywords || keywords.length === 0) return null
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
      <div className="space-y-1">
        {keywords.map((kw, i) => (
          <div key={i} className="flex items-center gap-2 py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800">
            <TrafficLight status={kw.found_in_cv ? 'found' : 'missing'} />
            <span className={`text-xs flex-1 ${kw.found_in_cv ? 'text-slate-600 dark:text-slate-300' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
              {kw.keyword}
            </span>
            {kw.found_in_cv && kw.locations && kw.locations.length > 0 && (
              <span className="text-xs text-slate-400 truncate max-w-[100px]">{kw.locations[0]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const SECTION_LABELS = {
  summary: 'Summary',
  experience: 'Experience Bullet',
  skills: 'Skills Section',
}

function SuggestionCard({ suggestion, onAccept, onReject, isAccepted, isRejected }) {
  const label = SECTION_LABELS[suggestion.section] || suggestion.section

  return (
    <div className={`rounded-lg border text-xs transition-opacity ${
      isAccepted
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        : isRejected
        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-40'
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-700">
        <span className="font-semibold text-slate-600 dark:text-slate-300">{label}</span>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {(suggestion.keywords_added || []).map((kw) => (
            <span key={kw} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-[10px] font-medium">
              +{kw}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-2">
        {suggestion.original && suggestion.section !== 'skills' && (
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-medium mb-0.5">Current</p>
            <p className="text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">{suggestion.original}</p>
          </div>
        )}
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-medium mb-0.5">Suggested</p>
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{suggestion.suggested}</p>
        </div>
      </div>

      {/* Footer actions */}
      {isAccepted ? (
        <div className="flex items-center gap-1.5 px-3 py-2 border-t border-green-100 dark:border-green-800 text-xs text-green-600 dark:text-green-400">
          <CheckCircle size={11} />
          <span>Applied</span>
        </div>
      ) : !isRejected ? (
        <div className="flex gap-2 px-3 py-2 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onAccept}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors font-medium"
          >
            <Check size={11} /> Apply
          </button>
          <button
            onClick={onReject}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <X size={11} /> Dismiss
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function JobDescriptionAnalyzer() {
  const {
    cvData,
    setJdAnalysis,
    jdAnalysis,
    setIsAnalyzing,
    isAnalyzing,
    updateSummary,
    updateExperienceBullet,
  } = useCvStore()

  const [jdText, setJdText] = useState('')
  const [accepted, setAccepted] = useState({})
  const [rejected, setRejected] = useState({})

  const analyze = async () => {
    if (!jdText.trim()) return
    setIsAnalyzing(true)
    setAccepted({})
    setRejected({})
    try {
      const res = await fetch('/api/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jdText, cvData }),
      })
      const data = await res.json()
      setJdAnalysis(data)
    } catch {
      toast.error('Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const applySuggestion = (suggestion, index) => {
    if (suggestion.section === 'summary') {
      updateSummary(suggestion.suggested)
      toast.success('Summary updated')
    } else if (suggestion.section === 'experience') {
      updateExperienceBullet(suggestion.experience_id, suggestion.bullet_index, suggestion.suggested)
      toast.success('Bullet updated')
    } else if (suggestion.section === 'skills') {
      toast('Add the listed skills to your Skills section', { icon: '💡' })
    }
    setAccepted((prev) => ({ ...prev, [index]: true }))
  }

  const dismissSuggestion = (index) => {
    setRejected((prev) => ({ ...prev, [index]: true }))
  }

  const suggestions = jdAnalysis?.suggestions || []
  const pendingSuggestions = suggestions.filter((_, i) => !accepted[i] && !rejected[i])

  return (
    <Accordion title="Job Description Analyzer" icon={Search}>
      <Textarea
        label="Paste job description"
        placeholder="Paste the full job description here..."
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        className="min-h-[120px]"
      />

      <Button onClick={analyze} disabled={!jdText.trim() || isAnalyzing} className="w-full">
        {isAnalyzing ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Analyzing…
          </>
        ) : (
          <>
            <Search size={14} />
            Analyze Keywords
          </>
        )}
      </Button>

      {jdAnalysis && (
        <div className="space-y-4 pt-2">
          {/* Match score */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-800 border border-blue-100 dark:border-blue-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Match Score</span>
              <span className={`text-lg font-bold ${
                jdAnalysis.match_score >= 70 ? 'text-green-600' :
                jdAnalysis.match_score >= 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>{jdAnalysis.match_score}%</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  jdAnalysis.match_score >= 70 ? 'bg-green-500' :
                  jdAnalysis.match_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${jdAnalysis.match_score}%` }}
              />
            </div>
          </div>

          {/* Missing critical */}
          {jdAnalysis.missing_critical && jdAnalysis.missing_critical.length > 0 && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">Critical Missing Keywords</p>
              <div className="flex flex-wrap gap-1">
                {jdAnalysis.missing_critical.map((kw) => (
                  <span key={kw} className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Auto-Optimize suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={13} className="text-blue-500" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Optimization Suggestions</p>
                </div>
                {pendingSuggestions.length > 0 && (
                  <span className="text-xs text-slate-400">{pendingSuggestions.length} pending</span>
                )}
              </div>
              {suggestions.map((s, i) => (
                <SuggestionCard
                  key={i}
                  suggestion={s}
                  isAccepted={!!accepted[i]}
                  isRejected={!!rejected[i]}
                  onAccept={() => applySuggestion(s, i)}
                  onReject={() => dismissSuggestion(i)}
                />
              ))}
            </div>
          )}

          {/* Keyword groups */}
          {jdAnalysis.keywords && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Keyword Breakdown</p>
              <KeywordGroup title="Hard Skills" keywords={jdAnalysis.keywords.hard_skills} />
              <KeywordGroup title="Soft Skills" keywords={jdAnalysis.keywords.soft_skills} />
              <KeywordGroup title="Languages" keywords={jdAnalysis.keywords.languages} />
              <KeywordGroup title="Certifications" keywords={jdAnalysis.keywords.certifications} />
            </div>
          )}
        </div>
      )}
    </Accordion>
  )
}
