/**
 * Format a date string input by the user.
 * Accepts: "MM/YYYY", "MM.YYYY", plain text like "Present"
 * Returns dot-format: "09.2019" — matching the reference CV style.
 */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const s = dateStr.trim().toLowerCase()
  if (s === 'present' || s === 'heute' || s === 'now') return 'Present'

  // MM/YYYY → MM.YYYY
  const slash = dateStr.match(/^(\d{1,2})\/(\d{4})$/)
  if (slash) return `${slash[1].padStart(2, '0')}.${slash[2]}`

  // Already MM.YYYY
  const dot = dateStr.match(/^(\d{1,2})\.(\d{4})$/)
  if (dot) return `${dot[1].padStart(2, '0')}.${dot[2]}`

  // YYYY-MM-DD (from date picker)
  const iso = dateStr.match(/^(\d{4})-(\d{2})-\d{2}$/)
  if (iso) return `${iso[2]}.${iso[1]}`

  return dateStr
}

export function formatDateRange(start, end, current) {
  const s = formatDate(start)
  const e = current ? 'Present' : formatDate(end)
  if (s && e) return `${s} – ${e}`
  if (s) return s
  return ''
}

/** Format for Classic template: "MM.YYYY – Present" for current, "MM.YYYY – MM.YYYY" for past */
export function formatClassicDate(start, end, current) {
  const s = formatDate(start)
  if (current && s) return `${s} – Present`
  const e = formatDate(end)
  if (s && e) return `${s} – ${e}`
  if (s) return s
  return ''
}

/** Maps CEFR code (stored value) → human-readable label for CV display */
export const LEVEL_LABELS = {
  'Native': 'Native',
  'C2': 'Full Professional Proficiency',
  'C1': 'Fluent',
  'B2': 'Good Working Proficiency',
  'B1': 'Intermediate',
  'A2': 'Elementary',
  'A1': 'Beginner',
}

export const TEMPLATE_META = [
  {
    id: 'classic',
    name: 'Professional Classic',
    description: 'Navy headings, clean dividers — based on reference CV',
    accent: '#1e3a5f',
    preview_color: '#1e3a5f',
  },
  {
    id: 'minimal',
    name: 'Modern Minimal',
    description: 'Black & white, generous whitespace, Scandinavian feel',
    accent: '#111111',
    preview_color: '#111111',
  },
  {
    id: 'berlin-tech',
    name: 'Berlin Tech',
    description: 'Teal accents, charcoal header — for tech & startup roles',
    accent: '#0D7377',
    preview_color: '#0D7377',
  },
  {
    id: 'corporate',
    name: 'Corporate Germany',
    description: 'Navy serif, alternating bands — for banks & consulting',
    accent: '#003366',
    preview_color: '#003366',
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Gold accents, sidebar stripe — for senior leadership',
    accent: '#8B6914',
    preview_color: '#8B6914',
  },
]
