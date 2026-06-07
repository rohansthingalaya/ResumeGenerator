import { formatDateRange, LEVEL_LABELS } from '../../utils/templateHelpers'

export function renderBerlinTech(cv) {
  const { personal, summary, experience, education, skills, languages, certifications, interests, settings } = cv
  const escape = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const sectionHeading = (title) => `
    <div style="margin-top:16px;margin-bottom:6px;">
      <div style="font-size:10.5pt;font-weight:700;color:#0D7377;letter-spacing:0.08em;text-transform:uppercase;border-bottom:2px solid #0D7377;padding-bottom:2px;">${escape(title)}</div>
    </div>
  `

  const bullet = (text) => `
    <div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:3px;">
      <span style="color:#0D7377;font-size:10pt;line-height:1.5;flex-shrink:0;">›</span>
      <span style="font-size:9.5pt;line-height:1.5;color:#2a2a2a;">${escape(text)}</span>
    </div>
  `

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:794px;min-height:1123px;background:#fff;box-sizing:border-box;color:#222;">
      <!-- Charcoal header -->
      <div style="background:#2d2d2d;padding:20px 24px;color:#fff;">
        <div style="font-size:20pt;font-weight:700;letter-spacing:0.02em;">${escape(personal.fullName)}</div>
        <div style="font-size:9pt;color:#ccc;margin-top:5px;line-height:1.7;">
          ${[personal.email, personal.phone, personal.address, personal.linkedin].filter(Boolean).map(escape).join(' &nbsp;|&nbsp; ')}
        </div>
      </div>

      <!-- Body -->
      <div style="padding:16px 24px;">
        ${summary ? `${sectionHeading('Profile')}<p style="font-size:9.5pt;line-height:1.6;color:#2a2a2a;">${escape(summary)}</p>` : ''}

        ${experience.length > 0 ? `
          ${sectionHeading('Berufserfahrung')}
          ${experience.map((exp) => `
            <div style="margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;">
                <span style="font-size:10pt;font-weight:700;color:#111;">${escape(exp.title)}</span>
                <span style="font-size:8.5pt;color:#555;white-space:nowrap;">${escape(formatDateRange(exp.startDate, exp.endDate, exp.current))}</span>
              </div>
              ${exp.company ? `<div style="font-size:9.5pt;color:#0D7377;font-weight:500;margin-bottom:3px;">${escape(exp.company)}${exp.location ? ` · ${escape(exp.location)}` : ''}</div>` : ''}
              ${(exp.bullets || []).filter(Boolean).map(bullet).join('')}
            </div>
          `).join('')}
        ` : ''}

        ${education.length > 0 ? `
          ${sectionHeading('Ausbildung')}
          ${education.map((edu) => `
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
              <div>
                <span style="font-size:10pt;font-weight:700;color:#111;">${escape(edu.degree)}</span>
                ${edu.institution ? `<span style="font-size:9.5pt;color:#555;"> · ${escape(edu.institution)}${edu.location ? `, ${escape(edu.location)}` : ''}</span>` : ''}
                ${edu.details ? `<div style="font-size:9pt;color:#666;">${escape(edu.details)}</div>` : ''}
              </div>
              <span style="font-size:8.5pt;color:#555;white-space:nowrap;margin-left:8px;">${escape(formatDateRange(edu.startDate, edu.endDate, false))}</span>
            </div>
          `).join('')}
        ` : ''}

        ${skills.length > 0 ? `
          ${sectionHeading('Kenntnisse')}
          ${skills.map((s) => `
            <div style="margin-bottom:4px;">
              <span style="font-size:9.5pt;font-weight:700;color:#2a2a2a;">${escape(s.category)}: </span>
              <span style="font-family:Consolas,'Courier New',monospace;font-size:9pt;color:#0D7377;">${(s.items || []).map(escape).join(' · ')}</span>
            </div>
          `).join('')}
        ` : ''}

        ${languages.length > 0 ? `
          ${sectionHeading('Sprachen')}
          <div style="display:flex;flex-wrap:wrap;gap:12px;">
            ${languages.map((l) => `<span style="font-size:9.5pt;color:#333;"><strong>${escape(l.language)}</strong>: ${escape(LEVEL_LABELS[l.level] || l.level)}</span>`).join('')}
          </div>
        ` : ''}

        ${certifications.length > 0 ? `
          ${sectionHeading('Zertifizierungen')}
          ${certifications.map((c) => `<div style="font-size:9.5pt;margin-bottom:3px;color:#2a2a2a;">${escape(c.name)}${c.issuer ? ` <span style="color:#777;">· ${escape(c.issuer)}</span>` : ''}${c.date ? ` <span style="color:#999;">(${escape(c.date)})</span>` : ''}</div>`).join('')}
        ` : ''}

        ${settings.showInterests && interests ? `${sectionHeading('Interessen')}<p style="font-size:9.5pt;color:#444;">${escape(interests)}</p>` : ''}
      </div>
    </div>
  `
}
