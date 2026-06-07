import { FileText, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PersonalInfo } from '../components/Editor/PersonalInfo'
import { Summary } from '../components/Editor/Summary'
import { Experience } from '../components/Editor/Experience'
import { Education } from '../components/Editor/Education'
import { Skills } from '../components/Editor/Skills'
import { Languages } from '../components/Editor/Languages'
import { Certifications } from '../components/Editor/Certifications'
import { Interests } from '../components/Editor/Interests'
import { JobDescriptionAnalyzer } from '../components/Editor/JobDescriptionAnalyzer'
import { PreviewPanel } from '../components/Preview/PreviewPanel'
import { ThemeToggle } from '../components/UI/ThemeToggle'
import { SaveIndicator } from '../components/UI/SaveIndicator'
import { useAutoSave } from '../hooks/useAutoSave'

export function Editor() {
  useAutoSave()

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            state={{ fromEditor: true }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title="Back to dashboard"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">CV Editor</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SaveIndicator />
          <ThemeToggle />
        </div>
      </div>

      {/* Main split layout — fills remaining height exactly */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — input form */}
        <div className="w-[460px] shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
          <div className="p-4 space-y-2.5 pb-8">
            <PersonalInfo />
            <Summary />
            <Experience />
            <Education />
            <Skills />
            <Languages />
            <Certifications />
            <Interests />
            <JobDescriptionAnalyzer />
          </div>
        </div>

        {/* Right panel — live preview */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <PreviewPanel />
        </div>
      </div>
    </div>
  )
}
