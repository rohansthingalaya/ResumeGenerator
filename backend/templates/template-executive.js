/**
 * Template 5: Executive
 * Large thin name, gold accent dividers, left sidebar stripe effect.
 * Designed for senior / leadership roles.
 */

import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import {
  titleParagraph, subtitleParagraph, dateLocationParagraph, achievementsLabel,
  languageRow, skillRow, formatDateRange, formatDate, sectionHeading,
  LEVEL_LABELS, MARGIN_TWIPS,
} from './base-generator.js'

const GOLD = '8B6914'
const GOLD_DIM = '5a4a00'
const FONT = 'Arial'

function execHeading(text) {
  return [
    new Paragraph({
      children: [new TextRun({ text: text.toUpperCase(), font: FONT, size: 21, color: GOLD_DIM, characterSpacing: 100 })],
      spacing: { before: 280, after: 60 },
      border: { bottom: { style: 'single', size: 6, color: GOLD } },
    }),
    new Paragraph({ spacing: { after: 60 } }),
  ]
}

export async function generateExecutive(cvData) {
  const { personal, summary, experience, education, skills, languages, certifications, interests, settings } = cvData
  const body = []

  // Large thin name
  body.push(new Paragraph({
    children: [new TextRun({ text: personal.fullName || '', font: FONT, size: 52, color: '1a1a1a' })],
    spacing: { after: 80 },
    border: { bottom: { style: 'single', size: 12, color: GOLD } },
  }))

  if (personal.headline) {
    body.push(new Paragraph({
      children: [new TextRun({ text: personal.headline, font: FONT, size: 20, color: '555555' })],
      spacing: { after: 60 },
    }))
  }

  const contactItems = [personal.email, personal.phone, personal.address, personal.linkedin].filter(Boolean)
  if (contactItems.length > 0) {
    body.push(new Paragraph({
      children: [new TextRun({ text: contactItems.join('      '), font: FONT, size: 18, color: '555555' })],
      spacing: { after: 200 },
    }))
  }

  if (summary) {
    body.push(...execHeading('Executive Summary'))
    body.push(new Paragraph({ children: [new TextRun({ text: summary, font: FONT, size: 20, color: '2a2a2a' })], spacing: { after: 80 } }))
  }

  if (experience && experience.length > 0) {
    body.push(...execHeading('Professional Experience'))
    for (const exp of experience) {
      if (exp.title) body.push(titleParagraph(exp.title, { font: FONT }))
      if (exp.company) body.push(new Paragraph({
        children: [new TextRun({ text: [exp.company, exp.location].filter(Boolean).join(' · '), font: FONT, size: 20, color: '555555', bold: true })],
        spacing: { after: 20 },
      }))
      const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.current)
      if (dateRange) body.push(new Paragraph({ children: [new TextRun({ text: dateRange, font: FONT, size: 18, color: GOLD, italic: true })], spacing: { after: 20 } }))
      const bullets = (exp.bullets || []).filter(Boolean)
      for (const b of bullets) {
        body.push(new Paragraph({
          children: [
            new TextRun({ text: '◆  ', color: GOLD, font: FONT, size: 19 }),
            new TextRun({ text: b, font: FONT, size: 20, color: '2a2a2a' }),
          ],
          spacing: { after: 40 }, indent: { left: 240 },
        }))
      }
      body.push(new Paragraph({ spacing: { after: 60 } }))
    }
  }

  if (education && education.length > 0) {
    body.push(...execHeading('Education'))
    for (const edu of education) {
      if (edu.degree) body.push(titleParagraph(edu.degree, { font: FONT }))
      const instLocation = [edu.institution, edu.location].filter(Boolean).join(', ')
      if (instLocation) body.push(subtitleParagraph(instLocation, { font: FONT }))
      if (edu.details) body.push(new Paragraph({ children: [new TextRun({ text: edu.details, italic: true, font: FONT, size: 18, color: '666666' })], spacing: { after: 20 } }))
      const dateStr = [formatDate(edu.startDate), formatDate(edu.endDate)].filter(Boolean).join(' – ')
      if (dateStr) body.push(new Paragraph({ children: [new TextRun({ text: dateStr, font: FONT, size: 18, color: GOLD, italic: true })], spacing: { after: 80 } }))
    }
  }

  if (skills && skills.length > 0) {
    body.push(...execHeading('Core Competencies'))
    for (const s of skills) body.push(skillRow(s.category, s.items || [], { font: FONT, accentColor: GOLD_DIM }))
  }

  if (languages && languages.length > 0) {
    body.push(...execHeading('Languages'))
    for (const l of languages) body.push(languageRow(l.language, LEVEL_LABELS[l.level] || l.level, l.level !== 'Native' ? l.level : '', settings?.showCefr, { font: FONT }))
  }

  if (certifications && certifications.length > 0) {
    body.push(...execHeading('Certifications'))
    for (const c of certifications) {
      body.push(new Paragraph({
        children: [
          new TextRun({ text: c.name, font: FONT, size: 20 }),
          c.issuer ? new TextRun({ text: ` · ${c.issuer}`, font: FONT, size: 20, color: '777777' }) : null,
          c.date ? new TextRun({ text: ` (${c.date})`, font: FONT, size: 18, color: GOLD }) : null,
        ].filter(Boolean),
        spacing: { after: 40 },
      }))
    }
  }

  if (settings?.showInterests && interests) {
    body.push(...execHeading('Interests'))
    body.push(new Paragraph({ children: [new TextRun({ text: interests, font: FONT, size: 20, color: '444444' })], spacing: { after: 80 } }))
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: MARGIN_TWIPS, bottom: MARGIN_TWIPS, left: 1440, right: MARGIN_TWIPS }, size: { width: 11906, height: 16838 } } },
      children: body,
    }],
  })

  return Packer.toBuffer(doc)
}
