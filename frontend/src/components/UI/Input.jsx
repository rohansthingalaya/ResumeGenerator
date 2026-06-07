export function Input({ label, hint, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${className}`}
        {...props}
      />
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export function Textarea({ label, hint, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-y min-h-[100px] ${className}`}
        {...props}
      />
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
