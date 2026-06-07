import { GraduationCap, Plus, Trash2 } from 'lucide-react'
import { Accordion } from '../UI/Accordion'
import { Input } from '../UI/Input'
import { Button } from '../UI/Button'
import useCvStore from '../../store/cvStore'

function EducationEntry({ edu, index }) {
  const { updateEducation, removeEducation } = useCvStore()

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-3 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">Education {index + 1}</span>
        <Button variant="danger" size="sm" onClick={() => removeEducation(edu.id)}>
          <Trash2 size={12} />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <Input
            label="Degree / Qualification"
            placeholder="M.Sc. Computer Science"
            value={edu.degree}
            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
          />
        </div>
        <Input
          label="Institution"
          placeholder="TU Berlin"
          value={edu.institution}
          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
        />
        <Input
          label="Location"
          placeholder="Berlin, Germany"
          value={edu.location}
          onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
        />
        <Input
          label="Start Date"
          placeholder="MM/YYYY"
          value={edu.startDate}
          onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
        />
        <Input
          label="End Date"
          placeholder="MM/YYYY"
          value={edu.endDate}
          onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
        />
        <div className="col-span-2">
          <Input
            label="Details (optional)"
            placeholder="GPA: 1.5, Thesis: ..."
            value={edu.details}
            onChange={(e) => updateEducation(edu.id, 'details', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export function Education() {
  const { cvData, addEducation } = useCvStore()

  return (
    <Accordion title="Ausbildung (Education)" icon={GraduationCap}>
      <div className="space-y-3">
        {cvData.education.map((edu, i) => (
          <EducationEntry key={edu.id} edu={edu} index={i} />
        ))}
        <Button variant="secondary" size="sm" onClick={addEducation} className="w-full">
          <Plus size={14} />
          Add Education
        </Button>
      </div>
    </Accordion>
  )
}
