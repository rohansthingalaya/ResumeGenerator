import { Languages as LanguagesIcon, Plus, Trash2 } from 'lucide-react'
import { Accordion } from '../UI/Accordion'
import { Input, Select } from '../UI/Input'
import { Button } from '../UI/Button'
import useCvStore from '../../store/cvStore'

const LEVELS = [
  { value: 'Native', label: 'Native' },
  { value: 'C2', label: 'C2 – Full Professional Proficiency' },
  { value: 'C1', label: 'C1 – Fluent' },
  { value: 'B2', label: 'B2 – Good Working Proficiency' },
  { value: 'B1', label: 'B1 – Intermediate' },
  { value: 'A2', label: 'A2 – Elementary' },
  { value: 'A1', label: 'A1 – Beginner' },
]

function LanguageEntry({ lang }) {
  const { updateLanguage, removeLanguage } = useCvStore()

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Input
          label="Language"
          placeholder="Deutsch"
          value={lang.language}
          onChange={(e) => updateLanguage(lang.id, 'language', e.target.value)}
        />
      </div>
      <div className="flex-1">
        <Select
          label="Proficiency"
          value={lang.level}
          onChange={(e) => updateLanguage(lang.id, 'level', e.target.value)}
        >
          <option value="">Select level</option>
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </Select>
      </div>
      <Button variant="danger" size="sm" onClick={() => removeLanguage(lang.id)} className="mb-0.5">
        <Trash2 size={12} />
      </Button>
    </div>
  )
}

export function Languages() {
  const { cvData, addLanguage, updateSetting } = useCvStore()
  const { settings } = cvData

  return (
    <Accordion title="Sprachen (Languages)" icon={LanguagesIcon}>
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showCefr}
            onChange={(e) => updateSetting('showCefr', e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-slate-600 dark:text-slate-400">Show CEFR codes (A1-C2) in CV</span>
        </label>

        {cvData.languages.map((lang) => (
          <LanguageEntry key={lang.id} lang={lang} />
        ))}
        <Button variant="secondary" size="sm" onClick={addLanguage} className="w-full">
          <Plus size={14} />
          Add Language
        </Button>
      </div>
    </Accordion>
  )
}
