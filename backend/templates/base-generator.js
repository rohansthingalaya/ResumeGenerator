/**
 * Shared helpers for all DOCX CV templates.
 * Uses the `docx` npm package v9+.
 */

import {
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  TabStopType,
  WidthType,
  Table,
  TableRow,
  TableCell,
  VerticalAlign,
  TableBorders,
  BorderStyle as BS,
} from 'docx'

export const A4_WIDTH_TWIPS = 11906  // 210mm in twips
export const MARGIN_TWIPS = 1080     // ~1.9cm margins (~19mm)

// ── DATE FORMATTING ──────────────────────────────────────────────────────────

/** Format date input to MM.YYYY dot notation (matching reference CV) */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const s = dateStr.trim().toLowerCase()
  if (s === 'present' || s === 'heute' || s === 'now') return 'Heute'

  // MM/YYYY
  const slash = dateStr.match(/^(\d{1,2})\/(\d{4})$/)
  if (slash) return `${slash[1].padStart(2, '0')}.${slash[2]}`

  // MM.YYYY
  const dot = dateStr.match(/^(\d{1,2})\.(\d{4})$/)
  if (dot) return `${dot[1].padStart(2, '0')}.${dot[2]}`

  // YYYY-MM-DD (date picker)
  const iso = dateStr.match(/^(\d{4})-(\d{2})-\d{2}$/)
  if (iso) return `${iso[2]}.${iso[1]}`

  return dateStr
}

/** "MM.YYYY – Present" for current, "MM.YYYY – MM.YYYY" for past */
export function formatClassicDate(start, end, current) {
  const s = formatDate(start)
  if (current && s) return `${s} – Present`
  const e = formatDate(end)
  if (s && e) return `${s} – ${e}`
  if (s) return s
  return ''
}

export function formatDateRange(start, end, current) {
  const s = formatDate(start)
  const e = current ? 'Heute' : formatDate(end)
  if (s && e) return `${s} – ${e}`
  if (s) return s
  return ''
}

// ── DOCX PARAGRAPH HELPERS ───────────────────────────────────────────────────

/** Thin horizontal rule paragraph */
export function horizontalRule(color = '1B5E9E', thickness = 6) {
  return new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: thickness, color },
    },
    spacing: { after: 0, before: 0 },
  })
}

/** Section heading: UPPERCASE text + thin horizontal rule underneath */
export function sectionHeading(text, { color = '1B5E9E', font = 'Arial', fontSize = 21 } = {}) {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: text.toUpperCase(),
          bold: true,
          color,
          font,
          size: fontSize,
          characterSpacing: 60,
        }),
      ],
      spacing: { before: 240, after: 40 },
    }),
    horizontalRule(color),
    new Paragraph({ spacing: { after: 60 } }),
  ]
}

/** Bullet point with a • character */
export function bulletParagraph(text, { font = 'Arial', fontSize = 19, indent = 200 } = {}) {
  return new Paragraph({
    children: [
      new TextRun({ text: '•  ', font, size: fontSize, color: '333333' }),
      new TextRun({ text, font, size: fontSize, color: '222222' }),
    ],
    indent: { left: indent },
    spacing: { after: 40 },
  })
}

/** "Achievements / Tasks" italic label */
export function achievementsLabel({ font = 'Arial', fontSize = 18 } = {}) {
  return new Paragraph({
    children: [new TextRun({ text: 'Achievements / Tasks', italic: true, font, size: fontSize, color: '555555' })],
    spacing: { after: 40 },
  })
}

/** Job/edu title (bold) paragraph */
export function titleParagraph(text, { font = 'Arial', fontSize = 21 } = {}) {
  return new Paragraph({
    children: [new TextRun({ text: text || '', bold: true, font, size: fontSize, color: '111111' })],
    spacing: { after: 20 },
  })
}

/** Subtitle paragraph (company, institution) */
export function subtitleParagraph(text, { font = 'Arial', fontSize = 20, italic = false } = {}) {
  return new Paragraph({
    children: [new TextRun({ text: text || '', font, size: fontSize, color: '222222', italic })],
    spacing: { after: 20 },
  })
}

/** Date + location italic line */
export function dateLocationParagraph(dateLocation, { font = 'Arial', fontSize = 18 } = {}) {
  return new Paragraph({
    children: [new TextRun({ text: dateLocation, italic: true, font, size: fontSize, color: '444444' })],
    spacing: { after: 20 },
  })
}

/** Bold text paragraph */
export function textParagraph(text, { font = 'Arial', fontSize = 20, color = '333333', bold = false, italic = false, spacing = { after: 80 } } = {}) {
  return new Paragraph({
    children: [new TextRun({ text: text || '', font, size: fontSize, color, bold, italic })],
    spacing,
  })
}

/** Skills table — 4 columns, like the reference CV */
export function skillsTable(allItems, { font = 'Arial', fontSize = 19 } = {}) {
  const COLS = 4
  const rows = []
  for (let i = 0; i < allItems.length; i += COLS) {
    const chunk = allItems.slice(i, i + COLS)
    while (chunk.length < COLS) chunk.push('')
    rows.push(
      new TableRow({
        children: chunk.map((item) =>
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: item, font, size: fontSize, color: '222222' })],
              alignment: AlignmentType.CENTER,
            })],
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
          })
        ),
      })
    )
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'cccccc' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'cccccc' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'cccccc' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'cccccc' },
      insideH: { style: BorderStyle.SINGLE, size: 4, color: 'cccccc' },
      insideV: { style: BorderStyle.SINGLE, size: 4, color: 'cccccc' },
    },
  })
}

/** Interests table — horizontal row, like the reference CV */
export function interestsTable(items, { font = 'Arial', fontSize = 19 } = {}) {
  if (!items || items.length === 0) return null
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: items.map((item) =>
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: item.trim(), font, size: fontSize, color: '222222' })],
              alignment: AlignmentType.CENTER,
            })],
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
          })
        ),
      }),
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'cccccc' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'cccccc' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'cccccc' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'cccccc' },
      insideH: { style: BorderStyle.SINGLE, size: 4, color: 'cccccc' },
      insideV: { style: BorderStyle.SINGLE, size: 4, color: 'cccccc' },
    },
  })
}

/** Language row: Bold name + italic description */
export function languageRow(language, level, cefr, showCefr, { font = 'Arial', fontSize = 20 } = {}) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${language}: `, bold: true, font, size: fontSize, color: '111111' }),
      new TextRun({
        text: level + (showCefr && cefr ? ` (${cefr})` : ''),
        italic: true, font, size: fontSize, color: '444444',
      }),
    ],
    spacing: { after: 40 },
  })
}

/** Simple skill row: "Category: item1, item2" */
export function skillRow(category, items, { font = 'Arial', accentColor = '1B5E9E', fontSize = 20 } = {}) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${category}: `, bold: true, font, size: fontSize, color: accentColor }),
      new TextRun({ text: (items || []).join(', '), font, size: fontSize, color: '333333' }),
    ],
    spacing: { after: 40 },
  })
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
