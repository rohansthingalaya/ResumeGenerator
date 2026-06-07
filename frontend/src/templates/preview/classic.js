/**
 * Template 1: Professional Classic
 * Faithfully replicates Lebenslauf_Rohan_Thingalaya_EN.pdf
 *
 * Verified from PDF binary extraction (pdfminer):
 *   Page:       595.3 × 841.9pt (A4), margins 42.5pt all sides
 *   Photo:      LEFT side of header, 100pt wide × 128pt tall (3.5 × 4.5cm at 72dpi)
 *               Name/headline sit to the RIGHT of the photo at x=150.9pt
 *   Name:       Helvetica-Bold 22pt
 *   Headline:   Helvetica-Oblique 10.5pt, accent colour
 *   Contact:    Helvetica 8.5pt, sandwiched between TWO horizontal rules
 *   Sec hdg:    Helvetica-Bold 11pt + 1pt accent rule
 *   Exp title:  Helvetica-Bold 10pt
 *   Company:    Helvetica 9.5pt
 *   Date/loc:   Helvetica-Oblique 8.5pt
 *   Ach label:  Helvetica-Oblique 8.5pt
 *   Bullets:    Helvetica 9pt, indent 12pt
 *   Summary:    Helvetica 9.5pt, line-height 1.4
 *   Skills:     Helvetica 8.5pt, full-width 4-col table
 *   Edu degree: Helvetica-Bold 9.5pt
 *   Edu inst:   Helvetica 9.5pt
 *   Edu detail: Helvetica-Oblique 8.5pt
 *   Languages:  Helvetica-Bold name + Helvetica-Oblique description, 9.5pt
 *   Interests:  Helvetica 8.5pt, full-width horizontal table
 */

import { formatDate, formatClassicDate, LEVEL_LABELS } from '../../utils/templateHelpers'

const ACCENT = '#1B5E9E'
const F = "Helvetica, Arial, sans-serif"

const e = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')


function sectionHeading(title) {
  return `
    <div style="margin-top:14pt;margin-bottom:4pt;">
      <div style="font-size:11pt;font-weight:700;color:${ACCENT};letter-spacing:0.05em;font-family:${F};">${e(title)}</div>
      <div style="height:1px;background:${ACCENT};margin-top:2pt;"></div>
    </div>
  `
}

export function renderClassic(cv) {
  const { personal, summary, experience, education, skills, languages, certifications, interests, settings } = cv
  const showPhoto = settings.showPhoto && personal.photoPath

  // ── HEADER ──────────────────────────────────────────────────────────────
  // Photo sits on the LEFT; name + headline are to its right (matching reference PDF).
  // When photo is shown, contact items appear as stacked lines below the headline
  // (inside the right column). Without photo, a bordered contact bar is shown instead.
  const photoHtml = showPhoto ? `
    <div style="flex-shrink:0;width:100pt;height:128pt;margin-right:10pt;">
      <img src="${personal.photoPath}" alt="photo"
        style="width:100%;height:100%;object-fit:cover;display:block;" />
    </div>
  ` : ''

  const contactItems = [personal.email, personal.phone, personal.address, personal.linkedin].filter(Boolean)

  // Contacts as stacked lines (used when photo is present)
  const contactLinesHtml = contactItems.length > 0 ? `
    <div style="margin-top:7pt;">
      ${contactItems.map((item) =>
        `<div style="font-size:8.5pt;color:#444;font-family:${F};line-height:1.6;">${e(item)}</div>`
      ).join('')}
    </div>
  ` : ''

  // Contacts as a row between two rules (used when no photo)
  const contactBarHtml = contactItems.length > 0 ? `
    <div style="border-top:1pt solid #999;border-bottom:1pt solid #999;padding:5pt 0 4pt;margin-bottom:0;">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4pt;">
        ${contactItems.map((item) =>
          `<span style="font-size:8.5pt;color:#333;font-family:${F};">${e(item)}</span>`
        ).join('')}
      </div>
    </div>
  ` : ''

  const headerHtml = `
    <div style="display:flex;align-items:flex-start;${showPhoto ? 'min-height:128pt;' : ''}margin-bottom:8pt;">
      ${photoHtml}
      <div style="flex:1;min-width:0;">
        <div style="font-size:22pt;font-weight:700;color:#111;letter-spacing:0.01em;line-height:1.15;font-family:${F};">${e(personal.fullName)}</div>
        ${personal.headline ? `<div style="font-size:10.5pt;color:${ACCENT};font-style:italic;margin-top:3pt;font-family:${F};">${e(personal.headline)}</div>` : ''}
        ${showPhoto ? contactLinesHtml : ''}
      </div>
    </div>
    ${showPhoto
      ? `<div style="height:1px;background:#999;margin-bottom:0;"></div>`
      : contactBarHtml}
  `

  // ── OPTIONAL PERSONAL DETAILS ────────────────────────────────────────────
  const dobLine = (() => {
    const parts = []
    if (settings.showDob && personal.dob) parts.push(`Born: ${personal.dob}`)
    if (settings.showNationality && personal.placeOfBirth) parts.push(`Place of birth: ${personal.placeOfBirth}`)
    if (settings.showNationality && personal.nationality) parts.push(`Nationality: ${personal.nationality}`)
    return parts.length ? `<p style="font-size:8.5pt;color:#555;font-style:italic;margin:6pt 0 0;font-family:${F};">${parts.map(e).join('&nbsp;&nbsp;&nbsp;')}</p>` : ''
  })()

  // ── SUMMARY ──────────────────────────────────────────────────────────────
  const summaryHtml = summary ? `
    ${sectionHeading('PROFESSIONAL SUMMARY')}
    <p style="font-size:9.5pt;line-height:1.4;color:#222;margin:0 0 4pt;font-family:${F};">${e(summary)}</p>
  ` : ''

  // ── EXPERIENCE ───────────────────────────────────────────────────────────
  const expHtml = experience.length > 0 ? `
    ${sectionHeading('WORK EXPERIENCE')}
    ${experience.map((exp) => {
      const dateLocation = [
        formatClassicDate(exp.startDate, exp.endDate, exp.current),
        exp.location,
      ].filter(Boolean).join('  ')
      const bullets = (exp.bullets || []).filter(Boolean)
      return `
        <div class="cv-entry" style="margin-bottom:12pt;">
          <div style="font-size:10pt;font-weight:700;color:#111;font-family:${F};margin-bottom:1pt;">${e(exp.title)}</div>
          ${exp.company ? `<div style="font-size:9.5pt;color:#222;font-family:${F};margin-bottom:1pt;">${e(exp.company)}</div>` : ''}
          ${dateLocation ? `<div style="font-size:8.5pt;color:#444;font-style:italic;font-family:${F};margin-bottom:2pt;">${e(dateLocation)}</div>` : ''}
          ${bullets.length > 0 ? `
            <div style="font-size:8.5pt;color:#444;font-style:italic;font-family:${F};margin-bottom:3pt;">Achievements / Tasks</div>
            ${bullets.map((b) => `
              <div style="display:flex;align-items:flex-start;gap:5pt;margin-bottom:2pt;margin-left:12pt;">
                <span style="font-size:9pt;line-height:1.4;flex-shrink:0;color:#333;font-family:${F};">•</span>
                <span style="font-size:9pt;line-height:1.4;color:#222;font-family:${F};">${e(b)}</span>
              </div>
            `).join('')}
          ` : ''}
        </div>
      `
    }).join('')}
  ` : ''

  // ── SKILLS ───────────────────────────────────────────────────────────────
  const skillsHtml = skills.length > 0 ? `
    ${sectionHeading('SKILLS')}
    <div style="margin-bottom:4pt;">
      ${skills.filter((s) => s.category || (s.items && s.items.length > 0)).map((s) => {
        const items = s.items && s.items.length > 0 ? s.items : []
        return `
          <div style="font-size:8.5pt;font-family:${F};margin-bottom:3pt;line-height:1.4;">
            ${s.category ? `<strong style="color:#111;">${e(s.category)}:</strong>` : ''}
            <span style="color:#444;margin-left:3pt;">${items.map(e).join(', ')}</span>
          </div>
        `
      }).join('')}
    </div>
  ` : ''

  // ── EDUCATION ────────────────────────────────────────────────────────────
  const eduHtml = education.length > 0 ? `
    ${sectionHeading('EDUCATION')}
    ${education.map((edu) => `
      <div class="cv-entry" style="margin-bottom:9pt;">
        <div style="font-size:9.5pt;font-weight:700;color:#111;font-family:${F};margin-bottom:1pt;">${e(edu.degree)}</div>
        ${edu.institution ? `<div style="font-size:9.5pt;color:#222;font-family:${F};margin-bottom:1pt;">${e(edu.institution)}${edu.location ? `, ${e(edu.location)}` : ''}</div>` : ''}
        ${edu.details ? `<div style="font-size:8.5pt;color:#444;font-style:italic;font-family:${F};margin-bottom:1pt;">${e(edu.details)}</div>` : ''}
        ${(edu.startDate || edu.endDate) ? `<div style="font-size:8.5pt;color:#444;font-style:italic;font-family:${F};">${e(formatDate(edu.startDate))}${edu.endDate ? ` – ${e(formatDate(edu.endDate))}` : ''}</div>` : ''}
      </div>
    `).join('')}
  ` : ''

  // ── LANGUAGES ────────────────────────────────────────────────────────────
  const langHtml = languages.length > 0 ? `
    ${sectionHeading('LANGUAGES')}
    <div style="margin-bottom:4pt;">
      ${languages.map((l) => {
        const displayLevel = LEVEL_LABELS[l.level] || l.level
        const cefrCode = l.level !== 'Native' ? l.level : ''
        return `
        <div style="font-size:9.5pt;margin-bottom:3pt;font-family:${F};">
          <strong style="color:#111;">${e(l.language)}:</strong>
          <em style="color:#444;margin-left:3pt;">${e(displayLevel)}${settings.showCefr && cefrCode ? ` (${cefrCode})` : ''}</em>
        </div>`
      }).join('')}
    </div>
  ` : ''

  // ── CERTIFICATIONS ───────────────────────────────────────────────────────
  const certHtml = certifications.length > 0 ? `
    ${sectionHeading('CERTIFICATIONS')}
    ${certifications.map((c) => `
      <div style="display:flex;justify-content:space-between;margin-bottom:3pt;font-family:${F};">
        <span style="font-size:9.5pt;color:#222;">${e(c.name)}${c.issuer ? ` <span style="color:#666;font-size:8.5pt;">· ${e(c.issuer)}</span>` : ''}</span>
        ${c.date ? `<span style="font-size:8.5pt;color:#666;">${e(c.date)}</span>` : ''}
      </div>
    `).join('')}
  ` : ''

  // ── INTERESTS ────────────────────────────────────────────────────────────
  const interestsHtml = settings.showInterests && interests ? `
    ${sectionHeading('INTERESTS')}
    <table style="width:100%;border-collapse:collapse;margin-bottom:4pt;">
      <tbody><tr>
        ${interests.split(',').map((i) => i.trim()).filter(Boolean).map((i) => `
          <td style="border:1px solid #ccc;padding:3pt 6pt;font-size:8.5pt;color:#222;font-family:${F};text-align:center;">${e(i)}</td>
        `).join('')}
      </tr></tbody>
    </table>
  ` : ''

  return `
    <div style="font-family:${F};padding:57px;max-width:794px;min-height:1123px;background:#fff;box-sizing:border-box;color:#222;">
      ${headerHtml}
      ${dobLine}
      ${summaryHtml}
      ${expHtml}
      ${skillsHtml}
      ${eduHtml}
      ${langHtml}
      ${certHtml}
      ${interestsHtml}
    </div>
  `
}

