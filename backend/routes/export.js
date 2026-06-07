import { Router } from 'express'
import { generateClassic } from '../templates/template-classic.js'
import { generateMinimal } from '../templates/template-minimal.js'
import { generateBerlinTech } from '../templates/template-berlin-tech.js'
import { generateCorporate } from '../templates/template-corporate.js'
import { generateExecutive } from '../templates/template-executive.js'
import { convertDocxToPdf } from '../services/pdfConverter.js'

export const router = Router()

const GENERATORS = {
  classic: generateClassic,
  minimal: generateMinimal,
  'berlin-tech': generateBerlinTech,
  corporate: generateCorporate,
  executive: generateExecutive,
}

async function getDocxBuffer(cvData) {
  const template = cvData.settings?.selectedTemplate || 'classic'
  const generator = GENERATORS[template] || generateClassic
  return generator(cvData)
}

router.post('/docx', async (req, res) => {
  try {
    const { cvData, filename = 'Lebenslauf' } = req.body
    if (!cvData) return res.status(400).json({ error: 'cvData is required' })

    const buffer = await getDocxBuffer(cvData)
    const safeName = filename.replace(/[^a-zA-Z0-9_\-]/g, '_')

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.docx"`)
    res.send(buffer)
  } catch (err) {
    console.error('DOCX export error:', err)
    res.status(500).json({ error: err.message })
  }
})

router.post('/pdf', async (req, res) => {
  try {
    const { cvData, filename = 'Lebenslauf', renderedHtml } = req.body
    if (!cvData) return res.status(400).json({ error: 'cvData is required' })

    const docxBuffer = await getDocxBuffer(cvData)

    // Use the full rendered HTML from the frontend if provided, otherwise fall back to stub
    const htmlFallback = renderedHtml ? wrapForPrint(renderedHtml) : buildHtmlFallback(cvData)
    const pdfBuffer = await convertDocxToPdf(docxBuffer, htmlFallback)

    const safeName = filename.replace(/[^a-zA-Z0-9_\-]/g, '_')
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.pdf"`)
    res.send(pdfBuffer)
  } catch (err) {
    console.error('PDF export error:', err)
    res.status(500).json({ error: err.message })
  }
})

/**
 * Wrap the CV inner HTML (from the frontend renderer) in a full print-ready page.
 * Puppeteer renders this to get a pixel-accurate PDF matching the preview.
 */
function wrapForPrint(innerHtml) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body { background: white; margin: 0; padding: 0; }

  /*
   * Set proper page margins for ALL pages — including after every page break.
   * 43pt ≈ 42.5pt, matching the reference PDF (Lebenslauf_Rohan_Thingalaya_EN.pdf).
   * This replaces the outer div's padding which only applies to the first/last page.
   */
  @page { size: A4; margin: 43pt; }

  /*
   * Strip the template outer div's inline padding/constraints.
   * @page margin now handles spacing on every page, so the outer div padding
   * would double-indent the content on single-page renders and is irrelevant
   * on multi-page renders (page breaks ignore element padding).
   */
  body > div {
    padding: 0 !important;
    max-width: none !important;
    min-height: 0 !important;
    width: 100% !important;
  }

  /* Prevent experience/education entry headers from being orphaned at page bottom */
  .cv-entry { page-break-inside: avoid; }
</style>
</head>
<body>${innerHtml}</body>
</html>`
}

/**
 * Minimal fallback — only used if frontend failed to send renderedHtml
 */
function buildHtmlFallback(cvData) {
  const escape = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const { personal } = cvData
  return wrapForPrint(`
    <div style="font-family:Arial,sans-serif;padding:40px;color:#222;">
      <h1 style="font-size:24pt;color:#1e3a5f;">${escape(personal?.fullName || '')}</h1>
      <p>${[personal?.email, personal?.phone, personal?.address].filter(Boolean).map(escape).join(' | ')}</p>
      <p><em>Open the DOCX file for full formatting.</em></p>
    </div>`)
}
