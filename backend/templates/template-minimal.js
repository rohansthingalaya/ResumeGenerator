/**
 * Template 2: Modern Minimal
 * Black and white only, bold headings, generous whitespace, Scandinavian feel.
 */

import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import {
  titleParagraph, subtitleParagraph, dateLocationParagraph, achievementsLabel,
  bulletParagraph, languageRow, skillRow, formatDateRange, formatDate,
  LEVEL_LABELS, MARGIN_TWIPS,
} from './base-generator.js'

const FONT = 'Calibri'
const BLACK = '111111'

function heading(text) {
  return new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true, font: FONT, size: 22, color: BLACK, characterSpacing: 60 })],
    spacing: { before: 300, after: 120 },
    border: { bottom: { style: 'none' } },
  })
}

export async function generateMinimal(cvData) {
  const { personal, summary, experience, education, skills, languages, certifications, interests, settings } = cvData
  const body = []

  // Header
  body.push(new Paragraph({
    children: [new TextRun({ text: personal.fullName || '', bold: true, font: FONT, size: 48, color: BLACK })],
    spacing: { after: 80 },
  }))

  if (personal.headline) {
    body.push(new Paragraph({
      children: [new TextRun({ text: personal.headline, font: FONT, size: 22, color: '444444' })],
      spacing: { after: 80 },
    }))
  }

  const contactItems = [personal.email, personal.phone, personal.address, personal.linkedin].filter(Boolean)
  if (contactItems.length > 0) {
    body.push(new Paragraph({
      children: [new TextRun({ text: contactItems.join('    '), font: FONT, size: 18, color: '555555' })],
      spacing: { after: 240 },
    }))
  }

  if (summary) {
    body.push(heading('Profile'))
    body.push(new Paragraph({ children: [new TextRun({ text: summary, font: FONT, size: 20, color: '333333' })], spacing: { after: 80 } }))
  }

  if (experience && experience.length > 0) {
    body.push(heading('Experience'))
    for (const exp of experience) {
      if (exp.title) body.push(titleParagraph(exp.title, { font: FONT }))
      const companyLocation = [exp.company, exp.location].filter(Boolean).join(', ')
      if (companyLocation) body.push(subtitleParagraph(companyLocation, { font: FONT }))
      const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.current)
      if (dateRange) body.push(dateLocationParagraph(dateRange, { font: FONT }))
      const bullets = (exp.bullets || []).filter(Boolean)
      if (bullets.length > 0) {
        for (const b of bullets) body.push(bulletParagraph(b, { font: FONT }))
      }
      body.push(new Paragraph({ spacing: { after: 80 } }))
    }
  }

  if (education && education.length > 0) {
    body.push(heading('Education'))
    for (const edu of education) {
      if (edu.degree) body.push(titleParagraph(edu.degree, { font: FONT }))
      const instLocation = [edu.institution, edu.location].filter(Boolean).join(', ')
      if (instLocation) body.push(subtitleParagraph(instLocation, { font: FONT }))
      if (edu.details) body.push(new Paragraph({ children: [new TextRun({ text: edu.details, italic: true, font: FONT, size: 18, color: '555555' })], spacing: { after: 20 } }))
      const dateStr = [formatDate(edu.startDate), formatDate(edu.endDate)].filter(Boolean).join(' – ')
      if (dateStr) body.push(new Paragraph({ children: [new TextRun({ text: dateStr, italic: true, font: FONT, size: 18, color: '555555' })], spacing: { after: 80 } }))
    }
  }

  if (skills && skills.length > 0) {
    body.push(heading('Skills'))
    for (const s of skills) body.push(skillRow(s.category, s.items || [], { font: FONT, accentColor: BLACK }))
  }

  if (languages && languages.length > 0) {
    body.push(heading('Languages'))
    for (const l of languages) body.push(languageRow(l.language, LEVEL_LABELS[l.level] || l.level, l.level !== 'Native' ? l.level : '', settings?.showCefr, { font: FONT }))
  }

  if (certifications && certifications.length > 0) {
    body.push(heading('Certifications'))
    for (const c of certifications) {
      body.push(new Paragraph({
        children: [
          new TextRun({ text: c.name, font: FONT, size: 20 }),
          c.issuer ? new TextRun({ text: ` · ${c.issuer}`, font: FONT, size: 20, color: '777777' }) : null,
          c.date ? new TextRun({ text: ` (${c.date})`, font: FONT, size: 18, color: '999999' }) : null,
        ].filter(Boolean),
        spacing: { after: 40 },
      }))
    }
  }

  if (settings?.showInterests && interests) {
    body.push(heading('Interests'))
    body.push(new Paragraph({ children: [new TextRun({ text: interests, font: FONT, size: 20, color: '444444' })], spacing: { after: 80 } }))
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 1440, bottom: 1440, left: 1260, right: 1260 }, size: { width: 11906, height: 16838 } } },
      children: body,
    }],
  })

  return Packer.toBuffer(doc)
}
