import { formatDateRange, LEVEL_LABELS } from '../../utils/templateHelpers'

export function renderExecutive(cv) {
  const { personal, summary, experience, education, skills, languages, certifications, interests, settings } = cv
  const escape = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const sectionHeading = (title) => `
    <div style="margin-top:16px;margin-bottom:8px;display:flex;align-items:center;gap:10px;">
      <div style="font-size:10.5pt;font-weight:600;color:#5a4a00;letter-spacing:0.1em;text-transform:uppercase;">${escape(title)}</div>
      <div style="flex:1;height:1px;background:#8B6914;opacity:0.5;"></div>
    </div>
  `

  const bullet = (text) => `
    <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:4px;">
      <span style="color:#8B6914;font-size:10pt;flex-shrink:0;line-height:1.5;">◆</span>
      <span style="font-size:10pt;line-height:1.5;color:#2a2a2a;">${escape(text)}</span>
    </div>
  `

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:794px;min-height:1123px;background:#fff;box-sizing:border-box;display:flex;">
      <!-- Left accent stripe -->
      <div style="width:6px;background:linear-gradient(to bottom, #8B6914, #c4960a);flex-shrink:0;"></div>

      <!-- Content -->
      <div style="flex:1;padding:24px 28px;">
        <!-- Header -->
        <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid #8B6914;">
          <div style="font-size:26pt;font-weight:300;color:#1a1a1a;letter-spacing:0.04em;">${escape(personal.fullName)}</div>
          <div style="font-size:9.5pt;color:#555;margin-top:6px;line-height:1.6;">
            ${[personal.email, personal.phone, personal.address, personal.linkedin].filter(Boolean).map(escape).join(' &nbsp;&nbsp; ')}
          </div>
        </div>

        ${summary ? `${sectionHeading('Executive Summary')}<p style="font-size:10pt;line-height:1.7;color:#2a2a2a;">${escape(summary)}</p>` : ''}

        ${experience.length > 0 ? `
          ${sectionHeading('Professional Experience')}
          ${experience.map((exp) => `
            <div style="margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;">
                <span style="font-size:10.5pt;font-weight:700;color:#111;">${escape(exp.title)}</span>
                <span style="font-size:9pt;color:#8B6914;white-space:nowrap;">${escape(formatDateRange(exp.startDate, exp.endDate, exp.current))}</span>
              </div>
              ${exp.company ? `<div style="font-size:10pt;font-weight:500;color:#555;margin-bottom:5px;">${escape(exp.company)}${exp.location ? ` · ${escape(exp.location)}` : ''}</div>` : ''}
              ${(exp.bullets || []).filter(Boolean).map(bullet).join('')}
            </div>
          `).join('')}
        ` : ''}

        ${education.length > 0 ? `
          ${sectionHeading('Education')}
          ${education.map((edu) => `
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
              <div>
                <span style="font-size:10.5pt;font-weight:700;">${escape(edu.degree)}</span>
                ${edu.institution ? `<div style="font-size:10pt;color:#555;">${escape(edu.institution)}${edu.location ? `, ${escape(edu.location)}` : ''}</div>` : ''}
                ${edu.details ? `<div style="font-size:9.5pt;color:#666;">${escape(edu.details)}</div>` : ''}
              </div>
              <span style="font-size:9pt;color:#8B6914;white-space:nowrap;margin-left:8px;">${escape(formatDateRange(edu.startDate, edu.endDate, false))}</span>
            </div>
          `).join('')}
        ` : ''}

        ${skills.length > 0 ? `
          ${sectionHeading('Core Competencies')}
          ${skills.map((s) => `<div style="margin-bottom:3px;font-size:10pt;"><strong style="color:#5a4a00;">${escape(s.category)}:</strong> <span style="color:#333;">${(s.items || []).map(escape).join(' · ')}</span></div>`).join('')}
        ` : ''}

        ${languages.length > 0 ? `
          ${sectionHeading('Languages')}
          <div style="display:flex;flex-wrap:wrap;gap:16px;">
            ${languages.map((l) => `<span style="font-size:10pt;color:#333;"><strong>${escape(l.language)}</strong> — ${escape(LEVEL_LABELS[l.level] || l.level)}</span>`).join('')}
          </div>
        ` : ''}

        ${certifications.length > 0 ? `
          ${sectionHeading('Certifications')}
          ${certifications.map((c) => `<div style="font-size:10pt;margin-bottom:3px;">${escape(c.name)}${c.issuer ? ` <span style="color:#777;">· ${escape(c.issuer)}</span>` : ''}${c.date ? ` <span style="color:#8B6914;">(${escape(c.date)})</span>` : ''}</div>`).join('')}
        ` : ''}

        ${settings.showInterests && interests ? `${sectionHeading('Interests')}<p style="font-size:10pt;color:#444;">${escape(interests)}</p>` : ''}
      </div>
    </div>
  `
}
