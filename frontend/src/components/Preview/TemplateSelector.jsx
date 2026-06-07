import { TEMPLATE_META } from '../../utils/templateHelpers'
import useCvStore from '../../store/cvStore'

export function TemplateSelector() {
  const { cvData, updateSetting } = useCvStore()
  const selected = cvData.settings?.selectedTemplate || 'classic'

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {TEMPLATE_META.map((t) => (
        <button
          key={t.id}
          onClick={() => updateSetting('selectedTemplate', t.id)}
          className={`flex-shrink-0 flex flex-col items-start p-2.5 rounded-lg border-2 transition-all text-left w-36 ${
            selected === t.id
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
          }`}
        >
          {/* Color swatch */}
          <div
            className="w-full h-1.5 rounded-full mb-2"
            style={{ background: t.accent }}
          />
          <span className={`text-xs font-semibold leading-tight ${selected === t.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
            {t.name}
          </span>
          <span className="text-xs text-slate-400 mt-0.5 leading-tight line-clamp-2">
            {t.description}
          </span>
        </button>
      ))}
    </div>
  )
}
