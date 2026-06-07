/**
 * Template 4: Corporate Germany
 * Navy serif font, conservative layout for banks and consulting.
 */

import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import {
  titleParagraph, subtitleParagraph, dateLocationParagraph, achievementsLabel,
  languageRow, skillRow, formatDateRange, formatDate, sectionHeading,
  LEVEL_LABELS, MARGIN_TWIPS,
} from './base-generator.js'

const NAVY = '003366'
const FONT = 'Georgia'

export async function generateCorporate(cvData) {
  const { personal, summary, experience, education, skills, languages, certifications, interests, settings } = cvData
  const body = []

  // Header
  body.push(new Paragraph({
    children: [new TextRun({ text: personal.fullName || '', bold: true, font: FONT, size: 40, color: NAVY })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    border: { bottom: { style: 'single', size: 16, color: NAVY } },
  }))

  if (personal.headline) {
    body.push(new Paragraph({
      children: [new TextRun({ text: personal.headline, italic: true, font: FONT, size: 20, color: '555555' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }))
  }

  const contactItems = [personal.email, personal.phone, personal.address, personal.linkedin].filter(Boolean)
  if (contactItems.length > 0) {
    body.push(new Paragraph({
      children: [new TextRun({ text: contactItems.join('   |   '), font: FONT, size: 18, color: '555555' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }))
  }

  if (settings?.showDob && personal.dob) {
    const dobParts = [
      `Geburtsdatum: ${personal.dob}`,
      settings.showNationality && personal.placeOfBirth ? `Geburtsort: ${personal.placeOfBirth}` : null,
      settings.showNationality && personal.nationality ? `Nationalität: ${personal.nationality}` : null,
    ].filter(Boolean).join('     ')
    body.push(new Paragraph({
      children: [new TextRun({ text: dobParts, font: FONT, size: 18, italic: true, color: '555555' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
    }))
  } else {
    body.push(new Paragraph({ spacing: { after: 140 } }))
  }

  if (summary) {
    body.push(...sectionHeading('Kurzprofil', { color: NAVY, font: FONT }))
    body.push(new Paragraph({ children: [new TextRun({ text: summary, font: FONT, size: 20, color: '333333', italic: true })], spacing: { after: 80 } }))
  }

  if (experience && experience.length > 0) {
    body.push(...sectionHeading('Berufserfahrung', { color: NAVY, font: FONT }))
    for (const exp of experience) {
      if (exp.title) body.push(titleParagraph(exp.title, { font: FONT }))
      if (exp.company) body.push(subtitleParagraph([exp.company, exp.location].filter(Boolean).join(', '), { font: FONT, italic: true }))
      const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.current)
      if (dateRange) body.push(dateLocationParagraph(dateRange, { font: FONT }))
      const bullets = (exp.bullets || []).filter(Boolean)
      for (const b of bullets) {
        body.push(new Paragraph({
          children: [new TextRun({ text: b, font: FONT, size: 20, color: '333333' })],
          bullet: { level: 0 }, spacing: { after: 40 },
        }))
      }
      body.push(new Paragraph({ spacing: { after: 60 } }))
    }
  }

  if (education && education.length > 0) {
    body.push(...sectionHeading('Ausbildung', { color: NAVY, font: FONT }))
    for (const edu of education) {
      if (edu.degree) body.push(titleParagraph(edu.degree, { font: FONT }))
      const instLocation = [edu.institution, edu.location].filter(Boolean).join(', ')
      if (instLocation) body.push(subtitleParagraph(instLocation, { font: FONT, italic: true }))
      if (edu.details) body.push(new Paragraph({ children: [new TextRun({ text: edu.details, italic: true, font: FONT, size: 18, color: '666666' })], spacing: { after: 20 } }))
      const dateStr = [formatDate(edu.startDate), formatDate(edu.endDate)].filter(Boolean).join(' – ')
      if (dateStr) body.push(new Paragraph({ children: [new TextRun({ text: dateStr, italic: true, font: FONT, size: 18, color: '444444' })], spacing: { after: 80 } }))
    }
  }

  if (skills && skills.length > 0) {
    body.push(...sectionHeading('Kenntnisse', { color: NAVY, font: FONT }))
    for (const s of skills) body.push(skillRow(s.category, s.items || [], { font: FONT, accentColor: NAVY }))
  }

  if (languages && languages.length > 0) {
    body.push(...sectionHeading('Sprachen', { color: NAVY, font: FONT }))
    for (const l of languages) body.push(languageRow(l.language, LEVEL_LABELS[l.level] || l.level, l.level !== 'Native' ? l.level : '', settings?.showCefr, { font: FONT }))
  }

  if (certifications && certifications.length > 0) {
    body.push(...sectionHeading('Zertifizierungen', { color: NAVY, font: FONT }))
    for (const c of certifications) {
      body.push(new Paragraph({
        children: [
          new TextRun({ text: c.name, font: FONT, size: 20 }),
          c.issuer ? new TextRun({ text: ` · ${c.issuer}`, font: FONT, size: 20, color: '777777', italic: true }) : null,
          c.date ? new TextRun({ text: ` (${c.date})`, font: FONT, size: 18, color: '777777' }) : null,
        ].filter(Boolean),
        spacing: { after: 40 },
      }))
    }
  }

  if (settings?.showInterests && interests) {
    body.push(...sectionHeading('Interessen', { color: NAVY, font: FONT }))
    body.push(new Paragraph({ children: [new TextRun({ text: interests, font: FONT, size: 20, color: '444444' })], spacing: { after: 80 } }))
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: MARGIN_TWIPS, bottom: MARGIN_TWIPS, left: MARGIN_TWIPS, right: MARGIN_TWIPS }, size: { width: 11906, height: 16838 } } },
      children: body,
    }],
  })

  return Packer.toBuffer(doc)
}
