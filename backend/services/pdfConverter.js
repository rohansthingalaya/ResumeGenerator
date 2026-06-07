/**
 * PDF conversion service.
 * Primary: LibreOffice headless (DOCX → PDF)
 * Fallback: Puppeteer (HTML → PDF)
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, readFile, unlink, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'

const execAsync = promisify(exec)
const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Convert a DOCX buffer to PDF using LibreOffice headless.
 * Returns a PDF buffer.
 */
export async function docxToPdfLibreOffice(docxBuffer) {
  const id = randomUUID()
  const tmpDir = tmpdir()
  const docxPath = join(tmpDir, `cv_${id}.docx`)
  const pdfPath = join(tmpDir, `cv_${id}.pdf`)

  await writeFile(docxPath, docxBuffer)

  try {
    await execAsync(
      `libreoffice --headless --convert-to pdf --outdir "${tmpDir}" "${docxPath}"`,
      { timeout: 30000 }
    )
    const pdfBuffer = await readFile(pdfPath)
    return pdfBuffer
  } finally {
    // Cleanup temp files
    await unlink(docxPath).catch(() => {})
    await unlink(pdfPath).catch(() => {})
  }
}

/**
 * Convert HTML to PDF using Puppeteer.
 * Fallback when LibreOffice is not available.
 */
export async function htmlToPdfPuppeteer(htmlContent) {
  const { default: puppeteer } = await import('puppeteer')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    })
    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

/**
 * Check if LibreOffice is available
 */
export async function isLibreOfficeAvailable() {
  try {
    await execAsync('libreoffice --version', { timeout: 5000 })
    return true
  } catch {
    return false
  }
}

/**
 * Convert DOCX buffer to PDF — tries LibreOffice first, falls back to Puppeteer+HTML
 */
export async function convertDocxToPdf(docxBuffer, htmlFallback) {
  const hasLibreOffice = await isLibreOfficeAvailable()

  if (hasLibreOffice) {
    return docxToPdfLibreOffice(docxBuffer)
  } else if (htmlFallback) {
    return htmlToPdfPuppeteer(htmlFallback)
  } else {
    throw new Error('Neither LibreOffice nor HTML fallback available for PDF conversion')
  }
}
