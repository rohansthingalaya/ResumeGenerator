import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function Accordion({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
      >
        <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
          {Icon && <Icon size={16} className="text-blue-600 dark:text-blue-400" />}
          {title}
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/*
        CSS Grid trick for smooth height animation without knowing content height.
        grid-template-rows: 0fr → 1fr collapses/expands smoothly.
        The inner div needs overflow:hidden for it to work.
      */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 200ms ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
