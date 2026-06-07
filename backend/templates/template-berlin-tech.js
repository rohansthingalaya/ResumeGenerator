/**
 * Template 3: Berlin Tech
 * Charcoal header block, teal accent headings, monospace skills section.
 */

import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import {
  titleParagraph, subtitleParagraph, dateLocationParagraph, achievementsLabel,
  languageRow, skillRow, formatDateRange, formatDate, sectionHeading,
  LEVEL_LABELS, MARGIN_TWIPS,
} from './base-generator.js'

const TEAL = '0D7377'
const CHARCOAL = '2d2d2d'
const FONT = 'Arial'
const MONO = 'Courier New'

export async function generateBerlinTech(cvData) {
  const { personal, summary, experience, education, skills, languages, certifications, interests, settings } = cvData
  const body = []

  // Header (charcoal color — can't do background fill easily in docx without tables)
  body.push(new Paragraph({
    children: [new TextRun({ text: personal.fullName || '', bold: true, font: FONT, size: 40, color: CHARCOAL })],
    spacing: { after: 60 },
  }))

  if (personal.headline) {
    body.push(new Paragraph({
      children: [new TextRun({ text: personal.headline, font: FONT, size: 20, color: TEAL })],
      spacing: { after: 60 },
    }))
  }

  const contactItems = [personal.email, personal.phone, personal.address, personal.linkedin].filter(Boolean)
  if (contactItems.length > 0) {
    body.push(new Paragraph({
      children: [new TextRun({ text: contactItems.join('   |   '), font: FONT, size: 18, color: '555555' })],
      spacing: { after: 200 },
    }))
  }

  if (summary) {
    body.push(...sectionHeading('Profile', { color: TEAL, font: FONT, fontSize: 20 }))
    body.push(new Paragraph({ children: [new TextRun({ text: summary, font: FONT, size: 19, color: '2a2a2a' })], spacing: { after: 80 } }))
  }

  if (experience && experience.length > 0) {
    body.push(...sectionHeading('Berufserfahrung', { color: TEAL, font: FONT, fontSize: 20 }))
    for (const exp of experience) {
      if (exp.title) body.push(titleParagraph(exp.title, { font: FONT }))
      if (exp.company) {
        body.push(new Paragraph({
          children: [new TextRun({ text: [exp.company, exp.location].filter(Boolean).join(' · '), font: FONT, size: 19, color: TEAL, bold: true })],
          spacing: { after: 20 },
        }))
      }
      const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.current)
      if (dateRange) body.push(dateLocationParagraph(dateRange, { font: FONT }))
      const bullets = (exp.bullets || []).filter(Boolean)
      if (bullets.length > 0) {
        for (const b of bullets) {
          body.push(new Paragraph({
            children: [
              new TextRun({ text: '›  ', color: TEAL, font: FONT, size: 19 }),
              new TextRun({ text: b, font: FONT, size: 19, color: '2a2a2a' }),
            ],
            spacing: { after: 40 }, indent: { left: 240 },
          }))
        }
      }
      body.push(new Paragraph({ spacing: { after: 60 } }))
    }
  }

  if (education && education.length > 0) {
    body.push(...sectionHeading('Ausbildung', { color: TEAL, font: FONT, fontSize: 20 }))
    for (const edu of education) {
      if (edu.degree) body.push(titleParagraph(edu.degree, { font: FONT }))
      const instLocation = [edu.institution, edu.location].filter(Boolean).join(', ')
      if (instLocation) body.push(subtitleParagraph(instLocation, { font: FONT }))
      if (edu.details) body.push(new Paragraph({ children: [new TextRun({ text: edu.details, italic: true, font: FONT, size: 18, color: '666666' })], spacing: { after: 20 } }))
      const dateStr = [formatDate(edu.startDate), formatDate(edu.endDate)].filter(Boolean).join(' – ')
      if (dateStr) body.push(new Paragraph({ children: [new TextRun({ text: dateStr, italic: true, font: FONT, size: 18, color: '555555' })], spacing: { after: 80 } }))
    }
  }

  if (skills && skills.length > 0) {
    body.push(...sectionHeading('Kenntnisse', { color: TEAL, font: FONT, fontSize: 20 }))
    for (const s of skills) {
      body.push(new Paragraph({
        children: [
          new TextRun({ text: `${s.category}: `, bold: true, font: FONT, size: 19, color: '2a2a2a' }),
          new TextRun({ text: (s.items || []).join(' · '), font: MONO, size: 18, color: TEAL }),
        ],
        spacing: { after: 40 },
      }))
    }
  }

  if (languages && languages.length > 0) {
    body.push(...sectionHeading('Sprachen', { color: TEAL, font: FONT, fontSize: 20 }))
    for (const l of languages) body.push(languageRow(l.language, LEVEL_LABELS[l.level] || l.level, l.level !== 'Native' ? l.level : '', settings?.showCefr, { font: FONT }))
  }

  if (certifications && certifications.length > 0) {
    body.push(...sectionHeading('Zertifizierungen', { color: TEAL, font: FONT, fontSize: 20 }))
    for (const c of certifications) {
      body.push(new Paragraph({
        children: [
          new TextRun({ text: c.name, font: FONT, size: 19 }),
          c.issuer ? new TextRun({ text: ` · ${c.issuer}`, font: FONT, size: 18, color: '777777' }) : null,
          c.date ? new TextRun({ text: ` (${c.date})`, font: FONT, size: 17, color: '999999' }) : null,
        ].filter(Boolean),
        spacing: { after: 40 },
      }))
    }
  }

  if (settings?.showInterests && interests) {
    body.push(...sectionHeading('Interessen', { color: TEAL, font: FONT, fontSize: 20 }))
    body.push(new Paragraph({ children: [new TextRun({ text: interests, font: FONT, size: 19, color: '444444' })], spacing: { after: 80 } }))
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 900, bottom: 900, left: MARGIN_TWIPS, right: MARGIN_TWIPS }, size: { width: 11906, height: 16838 } } },
      children: body,
    }],
  })

  return Packer.toBuffer(doc)
}
