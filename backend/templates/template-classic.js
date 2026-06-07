/**
 * Template 1: Professional Classic
 * Matches Lebenslauf_Rohan_Thingalaya_EN.pdf as closely as DOCX allows.
 *
 * Sizes (DOCX `size` field = half-points, so size:X → X/2 pt):
 *   Name:        44 = 22pt bold
 *   Headline:    21 = 10.5pt italic
 *   Contact:     17 = 8.5pt
 *   Sec heading: 22 = 11pt bold
 *   Exp title:   20 = 10pt bold
 *   Company:     19 = 9.5pt
 *   Date/loc:    17 = 8.5pt italic
 *   Ach label:   17 = 8.5pt italic
 *   Bullets:     18 = 9pt
 *   Summary:     19 = 9.5pt
 *   Skills:      17 = 8.5pt
 *   Edu degree:  19 = 9.5pt bold
 *   Edu inst:    19 = 9.5pt
 *   Edu detail:  17 = 8.5pt italic
 *   Languages:   19 = 9.5pt
 *   Interests:   17 = 8.5pt
 *
 * Photo: LEFT column of borderless 2-col table, 100pt × 128pt (3.5 × 4.5cm at 72dpi)
 * Contact bar: two horizontal rules (before and after the contact paragraph)
 */

import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  ImageRun, Table, TableRow, TableCell, WidthType, VerticalAlign, BorderStyle,
} from 'docx'
import {
  sectionHeading,
  bulletParagraph,
  titleParagraph,
  subtitleParagraph,
  dateLocationParagraph,
  achievementsLabel,
  interestsTable,
  languageRow,
  horizontalRule,
  formatDate,
  formatClassicDate,
  LEVEL_LABELS,
  MARGIN_TWIPS,
} from './base-generator.js'

const ACCENT = '1B5E9E'
const FONT = 'Helvetica'


const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const ALL_NO_BORDER = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER }

export async function generateClassic(cvData) {
  const { personal, summary, experience, education, skills, languages, certifications, interests, settings } = cvData

  const body = []

  // ── NAME + HEADLINE (with optional photo on LEFT) ─────────────────────────
  const hasPhoto = settings?.showPhoto && personal.photoPath && personal.photoPath.startsWith('data:image/')

  if (hasPhoto) {
    const base64Data = personal.photoPath.split(',')[1]
    const imageBuffer = Buffer.from(base64Data, 'base64')
    const mimeType = personal.photoPath.split(';')[0].split(':')[1]
    const imageType = mimeType.includes('png') ? 'png' : 'jpg'

    // Photo: 3.5cm × 4.5cm at 72dpi = 99pt × 128pt
    const PHOTO_W = 99
    const PHOTO_H = 128

    // LEFT cell: photo
    const photoCell = new TableCell({
      children: [new Paragraph({
        children: [new ImageRun({ data: imageBuffer, transformation: { width: PHOTO_W, height: PHOTO_H }, type: imageType })],
        alignment: AlignmentType.LEFT,
      })],
      verticalAlign: VerticalAlign.TOP,
      margins: { top: 0, bottom: 0, left: 0, right: 100 },
      borders: ALL_NO_BORDER,
    })

    const contactItems = [personal.email, personal.address, personal.linkedin].filter(Boolean)

    // RIGHT cell: name + headline + contact lines
    const nameCell = new TableCell({
      children: [
        new Paragraph({
          children: [new TextRun({ text: personal.fullName || '', bold: true, font: FONT, size: 44, color: '111111' })],
          spacing: { after: 40 },
        }),
        ...(personal.headline ? [new Paragraph({
          children: [new TextRun({ text: personal.headline, italic: true, font: FONT, size: 21, color: ACCENT })],
          spacing: { after: 60 },
        })] : []),
        ...contactItems.map((item) => new Paragraph({
          children: [new TextRun({ text: item, font: FONT, size: 17, color: '444444' })],
          spacing: { after: 20 },
        })),
      ],
      verticalAlign: VerticalAlign.TOP,
      borders: ALL_NO_BORDER,
    })

    body.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: [photoCell, nameCell] })],
      borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER, insideH: NO_BORDER, insideV: NO_BORDER },
    }))
    // Single thin rule below header block (replaces two-line contact bar)
    body.push(new Paragraph({ spacing: { after: 20 } }))
    body.push(horizontalRule('999999', 4))
    body.push(new Paragraph({ spacing: { after: 100 } }))
  } else {
    body.push(new Paragraph({
      children: [new TextRun({ text: personal.fullName || '', bold: true, font: FONT, size: 44, color: '111111' })],
      spacing: { after: 40 },
    }))
    if (personal.headline) {
      body.push(new Paragraph({
        children: [new TextRun({ text: personal.headline, italic: true, font: FONT, size: 21, color: ACCENT })],
        spacing: { after: 80 },
      }))
    }

    // Contact bar — two horizontal rules sandwiching the contact line (no-photo layout)
    const contactItems = [personal.email, personal.address, personal.linkedin].filter(Boolean)
    body.push(horizontalRule('999999', 4))
    if (contactItems.length > 0) {
      body.push(new Paragraph({
        children: contactItems.map((item, i) => [
          i > 0 ? new TextRun({ text: '     ', font: FONT, size: 17 }) : null,
          new TextRun({ text: item, font: FONT, size: 17, color: '333333' }),
        ]).flat().filter(Boolean),
        spacing: { before: 60, after: 60 },
      }))
    }
    body.push(horizontalRule('999999', 4))
    body.push(new Paragraph({ spacing: { after: 100 } }))
  }

  // ── OPTIONAL PERSONAL DETAILS ─────────────────────────────────────────────
  if (settings?.showDob && personal.dob) {
    const parts = [
      `Born: ${personal.dob}`,
      settings.showNationality && personal.placeOfBirth ? `Place of birth: ${personal.placeOfBirth}` : null,
      settings.showNationality && personal.nationality ? `Nationality: ${personal.nationality}` : null,
    ].filter(Boolean).join('     ')
    body.push(new Paragraph({
      children: [new TextRun({ text: parts, font: FONT, size: 17, color: '555555', italic: true })],
      spacing: { after: 80 },
    }))
  }

  // ── PROFESSIONAL SUMMARY ──────────────────────────────────────────────────
  if (summary) {
    body.push(...sectionHeading('PROFESSIONAL SUMMARY', { color: ACCENT, font: FONT, fontSize: 22 }))
    body.push(new Paragraph({
      children: [new TextRun({ text: summary, font: FONT, size: 19, color: '222222' })],
      spacing: { after: 80 },
    }))
  }

  // ── WORK EXPERIENCE ───────────────────────────────────────────────────────
  if (experience && experience.length > 0) {
    body.push(...sectionHeading('WORK EXPERIENCE', { color: ACCENT, font: FONT, fontSize: 22 }))
    for (const exp of experience) {
      if (exp.title) body.push(titleParagraph(exp.title, { font: FONT, fontSize: 20 }))
      if (exp.company) body.push(subtitleParagraph(exp.company, { font: FONT, fontSize: 19 }))
      const dateLocation = [formatClassicDate(exp.startDate, exp.endDate, exp.current), exp.location].filter(Boolean).join('  ')
      if (dateLocation) body.push(dateLocationParagraph(dateLocation, { font: FONT, fontSize: 17 }))
      const validBullets = (exp.bullets || []).filter(Boolean)
      if (validBullets.length > 0) {
        body.push(achievementsLabel({ font: FONT, fontSize: 17 }))
        for (const bullet of validBullets) {
          body.push(bulletParagraph(bullet, { font: FONT, fontSize: 18 }))
        }
      }
      body.push(new Paragraph({ spacing: { after: 80 } }))
    }
  }

  // ── SKILLS ────────────────────────────────────────────────────────────────
  if (skills && skills.length > 0) {
    body.push(...sectionHeading('SKILLS', { color: ACCENT, font: FONT, fontSize: 22 }))
    for (const s of skills) {
      if (!s.category && (!s.items || s.items.length === 0)) continue
      const items = s.items && s.items.length > 0 ? s.items : []
      body.push(new Paragraph({
        children: [
          ...(s.category ? [new TextRun({ text: `${s.category}: `, bold: true, font: FONT, size: 17, color: '111111' })] : []),
          new TextRun({ text: items.join(', '), font: FONT, size: 17, color: '444444' }),
        ],
        spacing: { after: 40 },
      }))
    }
    body.push(new Paragraph({ spacing: { after: 60 } }))
  }

  // ── EDUCATION ─────────────────────────────────────────────────────────────
  if (education && education.length > 0) {
    body.push(...sectionHeading('EDUCATION', { color: ACCENT, font: FONT, fontSize: 22 }))
    for (const edu of education) {
      if (edu.degree) body.push(titleParagraph(edu.degree, { font: FONT, fontSize: 19 }))
      const instLocation = [edu.institution, edu.location].filter(Boolean).join(', ')
      if (instLocation) body.push(subtitleParagraph(instLocation, { font: FONT, fontSize: 19 }))
      if (edu.details) {
        body.push(new Paragraph({
          children: [new TextRun({ text: edu.details, italic: true, font: FONT, size: 17, color: '444444' })],
          spacing: { after: 20 },
        }))
      }
      const dateStr = [formatDate(edu.startDate), formatDate(edu.endDate)].filter(Boolean).join(' – ')
      if (dateStr) {
        body.push(new Paragraph({
          children: [new TextRun({ text: dateStr, italic: true, font: FONT, size: 17, color: '444444' })],
          spacing: { after: 80 },
        }))
      } else {
        body.push(new Paragraph({ spacing: { after: 60 } }))
      }
    }
  }

  // ── LANGUAGES ─────────────────────────────────────────────────────────────
  if (languages && languages.length > 0) {
    body.push(...sectionHeading('LANGUAGES', { color: ACCENT, font: FONT, fontSize: 22 }))
    for (const l of languages) {
      const displayLevel = LEVEL_LABELS[l.level] || l.level
      const cefrCode = l.level !== 'Native' ? l.level : ''
      body.push(languageRow(l.language, displayLevel, cefrCode, settings?.showCefr, { font: FONT, fontSize: 19 }))
    }
    body.push(new Paragraph({ spacing: { after: 60 } }))
  }

  // ── CERTIFICATIONS ────────────────────────────────────────────────────────
  if (certifications && certifications.length > 0) {
    body.push(...sectionHeading('CERTIFICATIONS', { color: ACCENT, font: FONT, fontSize: 22 }))
    for (const c of certifications) {
      const parts = [c.name, c.issuer ? `· ${c.issuer}` : null, c.date ? `(${c.date})` : null].filter(Boolean)
      body.push(new Paragraph({
        children: [new TextRun({ text: parts.join('  '), font: FONT, size: 19, color: '333333' })],
        spacing: { after: 40 },
      }))
    }
    body.push(new Paragraph({ spacing: { after: 60 } }))
  }

  // ── INTERESTS ─────────────────────────────────────────────────────────────
  if (settings?.showInterests && interests) {
    body.push(...sectionHeading('INTERESTS', { color: ACCENT, font: FONT, fontSize: 22 }))
    const interestItems = interests.split(',').map((i) => i.trim()).filter(Boolean)
    if (interestItems.length > 0) {
      const table = interestsTable(interestItems, { font: FONT, fontSize: 17 })
      if (table) body.push(table)
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: MARGIN_TWIPS, bottom: MARGIN_TWIPS, left: MARGIN_TWIPS, right: MARGIN_TWIPS },
          size: { width: 11906, height: 16838 }, // A4
        },
      },
      children: body,
    }],
  })

  return Packer.toBuffer(doc)
}
