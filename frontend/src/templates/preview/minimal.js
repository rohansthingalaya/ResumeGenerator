import { formatDateRange, LEVEL_LABELS } from '../../utils/templateHelpers'

export function renderMinimal(cv) {
  const { personal, summary, experience, education, skills, languages, certifications, interests, settings } = cv
  const escape = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const sectionHeading = (title) => `
    <div style="margin-top:20px;margin-bottom:8px;">
      <div style="font-size:11pt;font-weight:700;color:#111;letter-spacing:0.06em;text-transform:uppercase;">${escape(title)}</div>
    </div>
  `

  const bullet = (text) => `
    <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:4px;">
      <span style="font-size:10pt;line-height:1.6;flex-shrink:0;color:#444;">•</span>
      <span style="font-size:10pt;line-height:1.6;color:#333;">${escape(text)}</span>
    </div>
  `

  return `
    <div style="font-family:Calibri,'Segoe UI',Arial,sans-serif;padding:32px 36px;max-width:794px;min-height:1123px;background:#fff;box-sizing:border-box;color:#222;">
      <!-- Header -->
      <div style="margin-bottom:20px;">
        <div style="font-size:24pt;font-weight:700;color:#111;letter-spacing:0.01em;">${escape(personal.fullName)}</div>
        <div style="font-size:9.5pt;color:#555;margin-top:6px;line-height:1.6;">
          ${[personal.email, personal.phone, personal.address, personal.linkedin].filter(Boolean).map(escape).join(' &nbsp;&nbsp; ')}
        </div>
      </div>

      ${summary ? `${sectionHeading('Profile')}<p style="font-size:10pt;line-height:1.7;color:#333;">${escape(summary)}</p>` : ''}

      ${experience.length > 0 ? `
        ${sectionHeading('Experience')}
        ${experience.map((exp) => `
          <div style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
              <span style="font-size:10.5pt;font-weight:700;color:#111;">${escape(exp.title)}</span>
              <span style="font-size:9pt;color:#666;">${escape(formatDateRange(exp.startDate, exp.endDate, exp.current))}</span>
            </div>
            ${exp.company ? `<div style="font-size:10pt;color:#555;margin-bottom:4px;">${escape(exp.company)}${exp.location ? `, ${escape(exp.location)}` : ''}</div>` : ''}
            ${(exp.bullets || []).filter(Boolean).map(bullet).join('')}
          </div>
        `).join('')}
      ` : ''}

      ${education.length > 0 ? `
        ${sectionHeading('Education')}
        ${education.map((edu) => `
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
            <div>
              <span style="font-size:10.5pt;font-weight:700;color:#111;">${escape(edu.degree)}</span>
              ${edu.institution ? `<div style="font-size:10pt;color:#555;">${escape(edu.institution)}${edu.location ? `, ${escape(edu.location)}` : ''}</div>` : ''}
              ${edu.details ? `<div style="font-size:9.5pt;color:#666;">${escape(edu.details)}</div>` : ''}
            </div>
            <span style="font-size:9pt;color:#666;white-space:nowrap;margin-left:8px;">${escape(formatDateRange(edu.startDate, edu.endDate, false))}</span>
          </div>
        `).join('')}
      ` : ''}

      ${skills.length > 0 ? `
        ${sectionHeading('Skills')}
        ${skills.map((s) => `<div style="margin-bottom:4px;font-size:10pt;"><strong style="color:#111;">${escape(s.category)}:</strong> <span style="color:#444;">${(s.items || []).map(escape).join(' · ')}</span></div>`).join('')}
      ` : ''}

      ${languages.length > 0 ? `
        ${sectionHeading('Languages')}
        <div style="display:flex;flex-wrap:wrap;gap:16px;">
          ${languages.map((l) => `<span style="font-size:10pt;color:#333;"><strong>${escape(l.language)}</strong> — ${escape(LEVEL_LABELS[l.level] || l.level)}</span>`).join('')}
        </div>
      ` : ''}

      ${certifications.length > 0 ? `
        ${sectionHeading('Certifications')}
        ${certifications.map((c) => `<div style="font-size:10pt;margin-bottom:3px;color:#333;">${escape(c.name)}${c.issuer ? ` <span style="color:#777;">· ${escape(c.issuer)}</span>` : ''}${c.date ? ` <span style="color:#999;">(${escape(c.date)})</span>` : ''}</div>`).join('')}
      ` : ''}

      ${settings.showInterests && interests ? `${sectionHeading('Interests')}<p style="font-size:10pt;color:#444;">${escape(interests)}</p>` : ''}
    </div>
  `
}
