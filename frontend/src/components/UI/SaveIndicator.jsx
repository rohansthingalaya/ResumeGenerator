import { Check, Loader2, AlertCircle } from 'lucide-react'
import useCvStore from '../../store/cvStore'

export function SaveIndicator() {
  const { isDirty, isSaving, lastSaved, saveError } = useCvStore()

  if (saveError) {
    return (
      <span className="flex items-center gap-1 text-xs text-red-500">
        <AlertCircle size={12} />
        Save failed
      </span>
    )
  }

  if (isSaving) {
    return (
      <span className="flex items-center gap-1 text-xs text-slate-400">
        <Loader2 size={12} className="animate-spin" />
        Saving…
      </span>
    )
  }

  if (isDirty) {
    return (
      <span className="text-xs text-slate-400">Unsaved changes</span>
    )
  }

  if (lastSaved) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
        <Check size={12} />
        Saved
      </span>
    )
  }

  return null
}
