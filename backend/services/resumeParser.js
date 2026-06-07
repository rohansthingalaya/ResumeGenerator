import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'

// ─── Text Extraction ─────────────────────────────────────────────────────────

export async function extractText(buffer, mimetype) {
  if (mimetype === 'application/pdf') {
    const parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    return result.text
  }
  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }
  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.')
}

// ─── Section Detection ───────────────────────────────────────────────────────

const SECTION_HEADERS = {
  summary: /^(summary|profile|professional\s+summary|career\s+objective|objective|about\s+me|berufsprofil|profil|über\s+mich|executive\s+summary|kurzprofil)/i,
  experience: /^(experience|work\s+experience|professional\s+experience|employment(\s+history)?|berufserfahrung|arbeitserfahrung|berufliche\s+erfahrung|tätigkeiten|beruflicher\s+werdegang|career\s+history)/i,
  education: /^(education|academic(\s+background)?|qualifications?|ausbildung|studium|bildung|akademischer\s+werdegang|bildungsweg|schooling)/i,
  skills: /^(skills|technical\s+skills|core\s+competencies|key\s+skills|areas?\s+of\s+expertise|kenntnisse|fähigkeiten|kompetenzen|it-kenntnisse|edv-kenntnisse|technische\s+kenntnisse)/i,
  languages: /^(languages?|language\s+skills?|sprachen|sprachkenntnisse)/i,
  certifications: /^(certifications?|certificates?|professional\s+development|courses?|trainings?|zertifikate|zertifizierungen|weiterbildungen?)/i,
  interests: /^(interests?|hobbies|activities|volunteer|interessen|hobbys|freizeit|ehrenamt|außerberuflich)/i,
}

function detectSections(lines) {
  const sections = [{ name: 'header', startLine: 0, endLine: -1 }]
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (!trimmed || trimmed.length > 80) continue
    for (const [name, pattern] of Object.entries(SECTION_HEADERS)) {
      if (pattern.test(trimmed)) {
        sections[sections.length - 1].endLine = i - 1
        sections.push({ name, startLine: i + 1, endLine: -1 })
        break
      }
    }
  }
  sections[sections.length - 1].endLine = lines.length - 1
  return sections
}

function getSectionLines(lines, sections, name) {
  const sec = sections.find((s) => s.name === name)
  if (!sec) return []
  return lines.slice(sec.startLine, sec.endLine + 1)
}

// ─── Regex Helpers ───────────────────────────────────────────────────────────

const EMAIL_RE = /[\w.+'-]+@[\w-]+\.[a-zA-Z]{2,}/
const SINCE_DATE_RE = /(?:since|ab|seit)\s+(\d{1,2}[./]\d{4}|\d{4})/i
const PHONE_RE = /(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{3,5}(?:[\s.-]?\d{2,4})?/
const LINKEDIN_RE = /linkedin\.com\/in\/([\w-]+)/i
const DATE_RANGE_RE = /(\d{1,2}[./]\d{4}|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|januar|februar|m[aä]rz|mai|juni|juli|august|september|oktober|november|dezember)\s+\d{4}|\d{4})\s*[–\-–—]+\s*(present|current|today|heute|now|bis\s+heute|\d{1,2}[./]\d{4}|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|januar|februar|m[aä]rz|mai|juni|juli|august|september|oktober|november|dezember)\s+\d{4}|\d{4})/i

const MONTH_EN = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04', jun: '06', jul: '07',
  aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}
const MONTH_DE = {
  januar: '01', februar: '02', 'märz': '03', 'marz': '03', april: '04', mai: '05',
  juni: '06', juli: '07', august: '08', september: '09', oktober: '10',
  november: '11', dezember: '12',
}

function parseDateToken(token) {
  if (!token) return ''
  const t = token.trim().toLowerCase()
  if (/^(present|current|today|heute|now|bis\s*heute)$/.test(t)) return ''
  // MM.YYYY or MM/YYYY
  const dotMatch = t.match(/^(\d{1,2})[./](\d{4})$/)
  if (dotMatch) return `${dotMatch[1].padStart(2, '0')}/${dotMatch[2]}`
  // Month YYYY
  const monthYear = t.match(/^([a-zäöü]+)\s+(\d{4})$/)
  if (monthYear) {
    const m = MONTH_EN[monthYear[1]] || MONTH_DE[monthYear[1]] || '01'
    return `${m}/${monthYear[2]}`
  }
  // Just YYYY
  if (/^\d{4}$/.test(t)) return t
  return token.trim()
}

// ─── Personal Info ───────────────────────────────────────────────────────────

function extractPersonal(headerLines, fullText) {
  const personal = {
    fullName: '', headline: '', email: '', phone: '',
    address: '', linkedin: '', dob: '', placeOfBirth: '', nationality: '', photoPath: '',
  }

  const emailMatch = fullText.match(EMAIL_RE)
  if (emailMatch) personal.email = emailMatch[0]

  const linkedinMatch = fullText.match(LINKEDIN_RE)
  if (linkedinMatch) personal.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`

  // Phone — match after stripping email to avoid false positives
  const textNoEmail = fullText.replace(EMAIL_RE, '')
  const phoneMatch = textNoEmail.match(PHONE_RE)
  if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 7) {
    personal.phone = phoneMatch[0].trim()
  }

  // DOB
  const dobMatch = fullText.match(/(?:born|dob|date\s+of\s+birth|geburtsdatum|geb\.?|geboren(?:\s+am)?)[:\s]+(\d{1,2}[./]\d{1,2}[./]\d{4})/i)
  if (dobMatch) personal.dob = dobMatch[1]

  // Nationality
  const natMatch = fullText.match(/(?:nationality|staatsbürgerschaft|nationalität)[:\s]+([A-Za-zÄÖÜäöüß]+)/i)
  if (natMatch) personal.nationality = natMatch[1]

  // Name + headline from first meaningful header lines (skip contact lines)
  const contactREs = [EMAIL_RE, PHONE_RE, LINKEDIN_RE, /linkedin/i, /github/i, /\d{5}/, /www\./i]
  const meaningful = headerLines
    .map((l) => l.trim())
    .filter((l) => l.length > 1 && !contactREs.some((re) => re.test(l)))

  if (meaningful[0]) personal.fullName = meaningful[0]
  // Headline: second line only if it's not another person's data line
  if (meaningful[1] && meaningful[1].length < 100) personal.headline = meaningful[1]

  // Address: look for zip+city pattern — require digits not preceded by . or / (avoids matching years like 09.2019)
  const zipCity = fullText.match(/(?<![./])\b\d{4,5}\s+[A-ZÄÖÜ][a-zäöüA-ZÄÖÜ\s]+/)
  if (zipCity) personal.address = zipCity[0].trim()

  return personal
}

// ─── Experience Parsing ──────────────────────────────────────────────────────

const NOISE_LINE_RE = /^(achievements?\s*[/\\]?\s*tasks?|tasks?|responsibilities|tätigkeiten|--\s*\d+\s*of\s*\d+\s*--)$/i

function parseExperienceBlock(block) {
  const dateLineIdx = block.findIndex((l) => DATE_RANGE_RE.test(l) || SINCE_DATE_RE.test(l))
  const isCurrent =
    dateLineIdx >= 0 &&
    (/present|current|today|heute|now|bis\s*heute/i.test(block[dateLineIdx]) ||
      SINCE_DATE_RE.test(block[dateLineIdx]))

  const entry = {
    id: crypto.randomUUID(),
    title: '', company: '', location: '',
    startDate: '', endDate: '',
    current: isCurrent,
    bullets: [''],
  }

  if (dateLineIdx >= 0) {
    const sinceMatch = block[dateLineIdx].match(SINCE_DATE_RE)
    if (sinceMatch) {
      entry.startDate = parseDateToken(sinceMatch[1])
      entry.endDate = ''
      entry.current = true
      const loc = block[dateLineIdx].replace(SINCE_DATE_RE, '').replace(/^[\s,|•·–]+/, '').trim()
      if (loc && loc.length < 50) entry.location = loc
    } else {
      const m = block[dateLineIdx].match(DATE_RANGE_RE)
      entry.startDate = parseDateToken(m[1])
      entry.endDate = isCurrent ? '' : parseDateToken(m[2])
      const loc = block[dateLineIdx].replace(DATE_RANGE_RE, '').replace(/^[\s,|•·–]+/, '').trim()
      if (loc && loc.length < 50) entry.location = loc
    }

    // Lines before date = title + company
    const before = block.slice(0, dateLineIdx).filter((l) => l.trim())
    if (before[0]) entry.title = before[0].trim()
    if (before[1]) entry.company = before[1].trim()
    if (before[2] && !entry.location) entry.location = before[2].trim()

    // Lines after date = bullet points, merging PDF-wrapped continuations
    const rawBulletLines = block
      .slice(dateLineIdx + 1)
      .filter((l) => l.trim())
      .filter((l) => !NOISE_LINE_RE.test(l.trim()))
    const usesBulletPrefix = rawBulletLines.some((l) => /^[•\-–*]/.test(l))
    const bullets = []
    for (const l of rawBulletLines) {
      const cleaned = l.replace(/^[•\-–*]\s*/, '').trim()
      if (!cleaned) continue
      const isBulletStart = usesBulletPrefix ? /^[•\-–*]/.test(l) : true
      if (isBulletStart) {
        bullets.push(cleaned)
      } else if (bullets.length > 0) {
        bullets[bullets.length - 1] += ' ' + cleaned
      } else {
        bullets.push(cleaned)
      }
    }
    entry.bullets = bullets.length > 0 ? bullets : ['']
  } else {
    const nonEmpty = block.filter((l) => l.trim())
    if (nonEmpty[0]) entry.title = nonEmpty[0].trim()
    if (nonEmpty[1]) entry.company = nonEmpty[1].trim()
  }

  return entry
}

function parseExperienceSection(lines) {
  const blocks = []
  let current = []

  const hasAnyDate = (l) => DATE_RANGE_RE.test(l) || SINCE_DATE_RE.test(l)
  const isBulletOrNoise = (l) =>
    /^[•\-–*]/.test(l) || NOISE_LINE_RE.test(l) || hasAnyDate(l) || !l.trim()
  // A line is a moveable header (title/company) if it starts with a capital letter.
  // Wrapped bullet continuations almost always start with lowercase.
  const isMoveableHeader = (l) => {
    const t = l.trim()
    return t && !isBulletOrNoise(t) && /^[A-ZÄÖÜ]/.test(t)
  }

  for (const line of lines) {
    const trimmed = line.trim()
    const hasDate = hasAnyDate(trimmed)
    const currentHasDate = current.some(hasAnyDate)

    // If we see a date and current block already has one → new entry
    if (hasDate && currentHasDate) {
      // Look back after the current entry's date line for capital-starting lines —
      // these are the next entry's title/company that arrived before its date.
      // Wrapped bullet continuations start with lowercase so they won't be moved.
      const currentDateIdx = current.findIndex(hasAnyDate)
      let splitIdx = current.length
      for (let i = current.length - 1; i > currentDateIdx; i--) {
        if (!isMoveableHeader(current[i])) break
        splitIdx = i
      }
      const prevBlock = current.slice(0, splitIdx).filter((l) => l.trim())
      const movedLines = current.slice(splitIdx).filter((l) => l.trim())
      if (prevBlock.length > 0) blocks.push(prevBlock)
      current = [...movedLines, trimmed]
    } else {
      current.push(trimmed)
    }
  }
  if (current.filter((l) => l.trim()).length > 0) blocks.push(current.filter((l) => l.trim()))

  return blocks
    .map(parseExperienceBlock)
    .filter((e) => e.title || e.company)
}

// ─── Education Parsing ───────────────────────────────────────────────────────

const DEGREE_RE = /\b(bachelor|master|mba|phd|ph\.d|doctorate|diplom|m\.sc|b\.sc|m\.a\.|b\.a\.|b\.e\.|b\.e|b\.eng|b\.tech|m\.eng|m\.tech|associate|staatsexamen|magister)\b/i

function parseEducationBlock(block) {
  const dateLineIdx = block.findIndex((l) => DATE_RANGE_RE.test(l))
  const entry = {
    id: crypto.randomUUID(),
    degree: '', institution: '', location: '',
    startDate: '', endDate: '', details: '',
  }

  if (dateLineIdx >= 0) {
    const m = block[dateLineIdx].match(DATE_RANGE_RE)
    entry.startDate = parseDateToken(m[1])
    entry.endDate = parseDateToken(m[2])

    const before = block.slice(0, dateLineIdx).filter((l) => l.trim())
    // Find which line has a degree keyword
    const degreeLineIdx = before.findIndex((l) => DEGREE_RE.test(l))
    if (degreeLineIdx >= 0) {
      entry.degree = before[degreeLineIdx].trim()
      entry.institution = before.find((l, i) => i !== degreeLineIdx && l.trim())?.trim() || ''
    } else {
      if (before[0]) entry.degree = before[0].trim()
      if (before[1]) entry.institution = before[1].trim()
    }

    const details = block.slice(dateLineIdx + 1).filter((l) => l.trim()).join('; ')
    if (details) entry.details = details
  } else {
    const nonEmpty = block.filter((l) => l.trim())
    if (nonEmpty[0]) entry.degree = nonEmpty[0].trim()
    if (nonEmpty[1]) entry.institution = nonEmpty[1].trim()
    if (nonEmpty[2]) entry.details = nonEmpty[2].trim()
  }

  return entry
}

function parseEducationSection(lines) {
  const blocks = []
  let current = []

  for (const line of lines) {
    const trimmed = line.trim()
    const hasDate = DATE_RANGE_RE.test(trimmed)
    const currentHasDate = current.some((l) => DATE_RANGE_RE.test(l))
    const hasDegree = DEGREE_RE.test(trimmed)
    const currentHasDegree = current.some((l) => DEGREE_RE.test(l))

    // Start a new block on a new date range OR a new degree keyword after current block is complete
    if ((hasDate && currentHasDate) || (hasDegree && currentHasDegree && currentHasDate)) {
      if (current.filter((l) => l.trim()).length > 0) blocks.push(current.filter((l) => l.trim()))
      current = [trimmed]
    } else {
      current.push(trimmed)
    }
  }
  if (current.filter((l) => l.trim()).length > 0) blocks.push(current.filter((l) => l.trim()))

  return blocks
    .map(parseEducationBlock)
    .filter((e) => e.degree || e.institution)
}

// ─── Skills Parsing ──────────────────────────────────────────────────────────

function parseSkillsSection(lines) {
  const categories = []
  const categoryLineRE = /^([^:]{2,40}):\s*(.+)$/

  const ungrouped = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const catMatch = trimmed.match(categoryLineRE)
    if (catMatch) {
      const items = catMatch[2].split(/[,;|•\t]+/).map((s) => s.trim()).filter(Boolean)
      if (items.length > 0) {
        categories.push({ id: crypto.randomUUID(), category: catMatch[1].trim(), items })
      }
    } else {
      // Might be comma/bullet list
      const items = trimmed.split(/[,;|•\t]+/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 40)
      ungrouped.push(...items)
    }
  }

  if (ungrouped.length > 0) {
    categories.push({ id: crypto.randomUUID(), category: 'Skills', items: ungrouped })
  }

  return categories
}

// ─── Languages Parsing ───────────────────────────────────────────────────────

const LEVEL_MAP = {
  // English → German store values (to match existing dropdown options)
  native: 'Muttersprache', 'mother tongue': 'Muttersprache', muttersprache: 'Muttersprache',
  fluent: 'Verhandlungssicher', 'business fluent': 'Verhandlungssicher', verhandlungssicher: 'Verhandlungssicher',
  advanced: 'Fließend', fließend: 'Fließend', proficient: 'Fließend',
  intermediate: 'Konversationssicher', konversationssicher: 'Konversationssicher', conversational: 'Konversationssicher',
  basic: 'Grundkenntnisse', beginner: 'Grundkenntnisse', grundkenntnisse: 'Grundkenntnisse', elementary: 'Grundkenntnisse',
  // CEFR
  c2: 'Verhandlungssicher', c1: 'Fließend', b2: 'Fließend', b1: 'Konversationssicher',
  a2: 'Grundkenntnisse', a1: 'Grundkenntnisse',
}

function parseLanguagesSection(lines) {
  const languages = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Pattern: "Language: Level" or "Language - Level" or "Language (Level)" or "Language Level"
    const match = trimmed.match(/^([A-Za-zÄÖÜäöüß]+)\s*[:\-–(]\s*([^)]+)\)?$/)
    if (match) {
      const lang = match[1].trim()
      const levelRaw = match[2].trim().toLowerCase()
      const level = LEVEL_MAP[levelRaw] || match[2].trim()
      languages.push({ id: crypto.randomUUID(), language: lang, level })
    } else if (trimmed.length < 60) {
      // Single-word or "Language Level" (two tokens)
      const parts = trimmed.split(/\s+/)
      if (parts.length === 2) {
        const levelRaw = parts[1].toLowerCase()
        const level = LEVEL_MAP[levelRaw] || parts[1]
        languages.push({ id: crypto.randomUUID(), language: parts[0], level })
      }
    }
  }
  return languages
}

// ─── Certifications Parsing ──────────────────────────────────────────────────

function parseCertificationsSection(lines) {
  const certs = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    // Look for "Name, Issuer, Date" or "Name – Issuer (Date)"
    const yearMatch = trimmed.match(/(\d{4})/)
    const parts = trimmed.split(/[,–\-|]/).map((s) => s.trim()).filter(Boolean)
    certs.push({
      id: crypto.randomUUID(),
      name: parts[0] || trimmed,
      issuer: parts[1] || '',
      date: yearMatch ? yearMatch[1] : '',
    })
  }
  return certs
}

// ─── Summary Parsing ─────────────────────────────────────────────────────────

function parseSummarySection(lines) {
  return lines
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' ')
}

// ─── Main Parser ─────────────────────────────────────────────────────────────

export function parseResumeText(text) {
  // Strip PDF page markers ("-- 1 of 2 --") before any parsing
  const lines = text.split('\n').filter((l) => !/^--\s*\d+\s*of\s*\d+\s*--$/i.test(l.trim()))
  const sections = detectSections(lines)

  const headerSec = sections.find((s) => s.name === 'header')
  const headerLines = headerSec ? lines.slice(headerSec.startLine, headerSec.endLine + 1) : []

  const personal = extractPersonal(headerLines, text)

  const summary = parseSummarySection(getSectionLines(lines, sections, 'summary'))
  const experience = parseExperienceSection(getSectionLines(lines, sections, 'experience'))
  const education = parseEducationSection(getSectionLines(lines, sections, 'education'))
  const skills = parseSkillsSection(getSectionLines(lines, sections, 'skills'))
  const languages = parseLanguagesSection(getSectionLines(lines, sections, 'languages'))
  const certifications = parseCertificationsSection(getSectionLines(lines, sections, 'certifications'))

  const interestsLines = getSectionLines(lines, sections, 'interests')
  const interests = interestsLines.map((l) => l.trim()).filter(Boolean).join(', ')

  return {
    last_updated: new Date().toISOString(),
    personal,
    summary,
    experience,
    education,
    skills,
    languages,
    certifications,
    interests,
    settings: {
      selectedTemplate: 'classic',
      showPhoto: false,
      showDob: !!personal.dob,
      showNationality: !!personal.nationality,
      showInterests: !!interests,
      showCefr: false,
      theme: 'light',
    },
  }
}
