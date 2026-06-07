import { Briefcase, Plus, Trash2, GripVertical, TrendingUp } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Accordion } from '../UI/Accordion'
import { Input } from '../UI/Input'
import { Button } from '../UI/Button'
import useCvStore from '../../store/cvStore'

const HAS_METRIC = /\d[\s%x]|\d+[\s]+(?:users|clients|teams?|engineers?|people)|increased|decreased|reduced|improved|grew|saved|\$\d+|€\d+|\d+%/i

function hasQuantifiedAchievement(text) {
  return HAS_METRIC.test(text)
}

function ExperienceEntry({ exp, index, dragHandle }) {
  const {
    updateExperience,
    removeExperience,
    addExperienceBullet,
    updateExperienceBullet,
    removeExperienceBullet,
  } = useCvStore()

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-3 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dragHandle}
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Position {index + 1}</span>
        </div>
        <Button variant="danger" size="sm" onClick={() => removeExperience(exp.id)}>
          <Trash2 size={12} />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <Input
            label="Job Title"
            placeholder="Senior Software Engineer"
            value={exp.title}
            onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
          />
        </div>
        <Input
          label="Company"
          placeholder="KPMG AG"
          value={exp.company}
          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
        />
        <Input
          label="Location"
          placeholder="Berlin, Germany"
          value={exp.location}
          onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
        />
        <Input
          label="Start Date"
          placeholder="MM/YYYY"
          value={exp.startDate}
          onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
        />
        <div className="space-y-1">
          <Input
            label="End Date"
            placeholder="MM/YYYY"
            value={exp.current ? '' : exp.endDate}
            disabled={exp.current}
            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
          />
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={exp.current}
              onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
              className="rounded"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">Present / Current</span>
          </label>
        </div>
      </div>

      {/* Bullet points */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Achievements / Responsibilities</p>
        {exp.bullets.map((bullet, bIdx) => (
          <div key={bIdx} className="flex items-start gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={bullet}
                onChange={(e) => updateExperienceBullet(exp.id, bIdx, e.target.value)}
                placeholder="Architected and delivered..."
                className="w-full px-3 py-1.5 pr-8 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {bullet && hasQuantifiedAchievement(bullet) && (
                <TrendingUp
                  size={12}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500"
                  title="Contains quantified achievement"
                />
              )}
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => removeExperienceBullet(exp.id, bIdx)}
              className="mt-0.5 shrink-0"
            >
              <Trash2 size={12} />
            </Button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={() => addExperienceBullet(exp.id)}>
          <Plus size={12} />
          Add bullet
        </Button>
      </div>
    </div>
  )
}

function SortableExperienceEntry({ exp, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exp.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const dragHandle = (
    <button
      {...attributes}
      {...listeners}
      className="text-slate-300 dark:text-slate-600 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none"
      title="Drag to reorder"
    >
      <GripVertical size={14} />
    </button>
  )

  return (
    <div ref={setNodeRef} style={style}>
      <ExperienceEntry exp={exp} index={index} dragHandle={dragHandle} />
    </div>
  )
}

export function Experience() {
  const { cvData, addExperience, reorderExperience } = useCvStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = cvData.experience.findIndex((e) => e.id === active.id)
      const newIndex = cvData.experience.findIndex((e) => e.id === over.id)
      reorderExperience(arrayMove(cvData.experience, oldIndex, newIndex))
    }
  }

  return (
    <Accordion title="Berufserfahrung (Work Experience)" icon={Briefcase}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={cvData.experience.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {cvData.experience.map((exp, i) => (
              <SortableExperienceEntry key={exp.id} exp={exp} index={i} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button variant="secondary" size="sm" onClick={addExperience} className="w-full mt-2">
        <Plus size={14} />
        Add Position
      </Button>
    </Accordion>
  )
}
