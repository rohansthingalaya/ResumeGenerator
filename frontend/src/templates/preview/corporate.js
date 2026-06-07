import { formatDateRange, LEVEL_LABELS } from '../../utils/templateHelpers'

export function renderCorporate(cv) {
  const { personal, summary, experience, education, skills, languages, certifications, interests, settings } = cv
  const escape = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  let rowBg = false
  const sectionHeading = (title) => {
    rowBg = !rowBg
    return `
      <div style="margin-top:0;margin-bottom:0;background:${rowBg ? '#f0f4f8' : '#fff'};padding:10px 12px;">
        <div style="font-size:11pt;font-weight:700;color:#003366;letter-spacing:0.06em;text-transform:uppercase;font-family:Georgia,Garamond,serif;">${escape(title)}</div>
      </div>
    `
  }

  const bullet = (text) => `
    <div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:3px;">
      <span style="color:#003366;font-size:10pt;flex-shrink:0;">•</span>
      <span style="font-size:10pt;line-height:1.5;color:#333;">${escape(text)}</span>
    </div>
  `

  const wrapSection = (title, content) => {
    if (!content) return ''
    rowBg = !rowBg
    return `
      <div style="background:${rowBg ? '#f0f4f8' : '#fff'};padding:10px 16px 12px;">
        <div style="font-size:11pt;font-weight:700;color:#003366;letter-spacing:0.06em;text-transform:uppercase;font-family:Georgia,Garamond,serif;border-bottom:1px solid #003366;padding-bottom:3px;margin-bottom:8px;">${escape(title)}</div>
        ${content}
      </div>
    `
  }

  const summaryContent = summary ? `<p style="font-size:10pt;line-height:1.6;color:#333;font-family:Georgia,serif;">${escape(summary)}</p>` : null

  const expContent = experience.length > 0 ? experience.map((exp) => `
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;">
        <span style="font-size:10.5pt;font-weight:700;color:#222;font-family:Georgia,serif;">${escape(exp.title)}</span>
        <span style="font-size:9pt;color:#666;">${escape(formatDateRange(exp.startDate, exp.endDate, exp.current))}</span>
      </div>
      ${exp.company ? `<div style="font-size:10pt;color:#555;font-style:italic;margin-bottom:4px;">${escape(exp.company)}${exp.location ? `, ${escape(exp.location)}` : ''}</div>` : ''}
      ${(exp.bullets || []).filter(Boolean).map(bullet).join('')}
    </div>
  `).join('') : null

  const eduContent = education.length > 0 ? education.map((edu) => `
    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
      <div>
        <span style="font-size:10.5pt;font-weight:700;font-family:Georgia,serif;">${escape(edu.degree)}</span>
        ${edu.institution ? `<div style="font-size:10pt;color:#555;font-style:italic;">${escape(edu.institution)}${edu.location ? `, ${escape(edu.location)}` : ''}</div>` : ''}
        ${edu.details ? `<div style="font-size:9.5pt;color:#666;">${escape(edu.details)}</div>` : ''}
      </div>
      <span style="font-size:9pt;color:#666;white-space:nowrap;margin-left:8px;">${escape(formatDateRange(edu.startDate, edu.endDate, false))}</span>
    </div>
  `).join('') : null

  const skillsContent = skills.length > 0 ? skills.map((s) => `
    <div style="margin-bottom:3px;font-size:10pt;"><strong style="color:#003366;">${escape(s.category)}:</strong> <span style="color:#444;">${(s.items || []).map(escape).join(', ')}</span></div>
  `).join('') : null

  const langContent = languages.length > 0 ? languages.map((l) => {
    const displayLevel = LEVEL_LABELS[l.level] || l.level
    const cefrCode = l.level !== 'Native' ? l.level : ''
    return `<div style="font-size:10pt;margin-bottom:2px;"><strong>${escape(l.language)}:</strong> ${escape(displayLevel)}${settings.showCefr && cefrCode ? ` (${cefrCode})` : ''}</div>`
  }).join('') : null

  const certContent = certifications.length > 0 ? certifications.map((c) => `
    <div style="font-size:10pt;margin-bottom:3px;">${escape(c.name)}${c.issuer ? ` · <em>${escape(c.issuer)}</em>` : ''}${c.date ? ` (${escape(c.date)})` : ''}</div>
  `).join('') : null

  return `
    <div style="font-family:Georgia,Garamond,serif;max-width:794px;min-height:1123px;background:#fff;box-sizing:border-box;color:#222;">
      <!-- Header -->
      <div style="background:#003366;padding:18px 20px;color:#fff;text-align:center;">
        <div style="font-size:20pt;font-weight:700;letter-spacing:0.04em;">${escape(personal.fullName)}</div>
        <div style="font-size:9pt;color:#aac4e8;margin-top:5px;line-height:1.6;">
          ${[personal.email, personal.phone, personal.address, personal.linkedin].filter(Boolean).map(escape).join(' &nbsp;|&nbsp; ')}
        </div>
        ${settings.showDob && personal.dob ? `<div style="font-size:8.5pt;color:#aac4e8;margin-top:2px;">Born: ${escape(personal.dob)}${settings.showNationality && personal.nationality ? ` · ${escape(personal.nationality)}` : ''}</div>` : ''}
      </div>

      ${wrapSection('Kurzprofil', summaryContent)}
      ${wrapSection('Berufserfahrung', expContent)}
      ${wrapSection('Ausbildung', eduContent)}
      ${wrapSection('Kenntnisse', skillsContent)}
      ${wrapSection('Sprachen', langContent)}
      ${wrapSection('Zertifizierungen', certContent)}
      ${settings.showInterests && interests ? wrapSection('Interessen', `<p style="font-size:10pt;color:#444;">${escape(interests)}</p>`) : ''}
    </div>
  `
}
