import { Heart } from 'lucide-react'
import { Accordion } from '../UI/Accordion'
import { Input } from '../UI/Input'
import useCvStore from '../../store/cvStore'

export function Interests() {
  const { cvData, updateInterests, updateSetting } = useCvStore()
  const { settings } = cvData

  return (
    <Accordion title="Interessen (Interests)" icon={Heart}>
      <label className="flex items-center gap-2 cursor-pointer mb-2">
        <input
          type="checkbox"
          checked={settings.showInterests}
          onChange={(e) => updateSetting('showInterests', e.target.checked)}
          className="rounded"
        />
        <span className="text-xs text-slate-600 dark:text-slate-400">Show interests on CV</span>
      </label>

      <Input
        label="Interests (comma-separated)"
        placeholder="Mountaineering, Open Source, Photography"
        value={cvData.interests}
        onChange={(e) => updateInterests(e.target.value)}
        disabled={!settings.showInterests}
      />
    </Accordion>
  )
}
