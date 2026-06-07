import { useState } from 'react'
import { Code, Plus, Trash2, X, GripVertical } from 'lucide-react'
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

function SortableSkillCategory({ skill }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: skill.id })
  const { updateSkillCategory, removeSkillCategory } = useCvStore()
  const [inputValue, setInputValue] = useState('')

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const addItem = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    const newItems = trimmed.split(',').map((s) => s.trim()).filter(Boolean)
    const merged = [...new Set([...(skill.items || []), ...newItems])]
    updateSkillCategory(skill.id, 'items', merged)
    setInputValue('')
  }

  const removeItem = (item) => {
    updateSkillCategory(skill.id, 'items', (skill.items || []).filter((i) => i !== item))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addItem()
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="text-slate-300 dark:text-slate-600 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none"
            title="Drag to reorder"
          >
            <GripVertical size={14} />
          </button>
          <div className="flex-1">
            <Input
              label="Category Name"
              placeholder="Programming Languages"
              value={skill.category}
              onChange={(e) => updateSkillCategory(skill.id, 'category', e.target.value)}
            />
          </div>
          <Button variant="danger" size="sm" onClick={() => removeSkillCategory(skill.id)} className="mt-5 shrink-0">
            <Trash2 size={12} />
          </Button>
        </div>

        {/* Skill tags */}
        <div className="flex flex-wrap gap-1.5 min-h-[28px]">
          {(skill.items || []).map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
            >
              {item}
              <button onClick={() => removeItem(item)} className="hover:text-blue-900 dark:hover:text-blue-100">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add skill — Enter or comma to confirm"
            className="flex-1 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button variant="secondary" size="sm" onClick={addItem}>
            <Plus size={12} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function Skills() {
  const { cvData, addSkillCategory, reorderSkills } = useCvStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = cvData.skills.findIndex((s) => s.id === active.id)
      const newIndex = cvData.skills.findIndex((s) => s.id === over.id)
      reorderSkills(arrayMove(cvData.skills, oldIndex, newIndex))
    }
  }

  return (
    <Accordion title="Kenntnisse (Skills)" icon={Code}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={cvData.skills.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {cvData.skills.map((skill) => (
              <SortableSkillCategory key={skill.id} skill={skill} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button variant="secondary" size="sm" onClick={addSkillCategory} className="w-full">
        <Plus size={14} />
        Add Skill Category
      </Button>
    </Accordion>
  )
}
