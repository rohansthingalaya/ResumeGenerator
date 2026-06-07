import { useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import useCvStore from '../store/cvStore'

const DEBOUNCE_MS = 2000
const RETRY_MS = 6000

export function useAutoSave() {
  const { cvData, isDirty, setSaving, setLastSaved, setSaveError } = useCvStore()
  const debounceRef = useRef(null)
  const retryRef = useRef(null)

  const save = async (data) => {
    setSaving(true)
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Save failed')
      setLastSaved(new Date().toISOString())
      setSaveError(null)
      // Clear any pending retry on success
      if (retryRef.current) {
        clearTimeout(retryRef.current)
        retryRef.current = null
      }
    } catch (err) {
      setSaveError(err.message)
      toast.error('Auto-save failed — will retry')
      // Schedule one retry
      if (!retryRef.current) {
        retryRef.current = setTimeout(() => {
          retryRef.current = null
          save(useCvStore.getState().cvData)
        }, RETRY_MS)
      }
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!isDirty) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => save(cvData), DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [cvData, isDirty]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup retry on unmount
  useEffect(() => {
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current)
    }
  }, [])
}
