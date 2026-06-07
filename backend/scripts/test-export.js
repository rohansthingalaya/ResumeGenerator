/**
 * Test script — generates DOCX files for all 5 templates using Rohan's reference CV data.
 * Run with: node scripts/test-export.js
 * Outputs to: backend/scripts/output/
 */

import { writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import { generateClassic } from '../templates/template-classic.js'
import { generateMinimal } from '../templates/template-minimal.js'
import { generateBerlinTech } from '../templates/template-berlin-tech.js'
import { generateCorporate } from '../templates/template-corporate.js'
import { generateExecutive } from '../templates/template-executive.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, 'output')

// Sample CV data matching the reference CV
const sampleCvData = {
  personal: {
    fullName: 'Rohan Shekar Thingalaya',
    headline: 'Senior Software Engineer • Solution Architect • Technical Lead',
    email: 'rohansthingalaya@gmail.com',
    phone: '+49 176 26857571',
    address: 'Berlin, Germany',
    linkedin: 'linkedin.com/in/rohanthingalaya',
    dob: '',
    placeOfBirth: '',
    nationality: '',
  },
  summary: 'Results-driven Senior Software Engineer with 6+ years of experience architecting enterprise APIs, Azure-based cloud solutions, and cross-system integrations in regulated environments. Proven ability to bridge the gap between business stakeholders and engineering teams, translating complex requirements into scalable, high-performance technical solutions.',
  experience: [
    {
      id: '1',
      title: 'Senior Software Engineer & Product-Focused Technical Lead',
      company: 'KPMG AG',
      location: 'Berlin, Germany',
      startDate: '09/2019',
      endDate: '',
      current: true,
      bullets: [
        'Architected and delivered scalable Azure solutions (App Services, API Management, SQL Server, Containers) underpinning enterprise mobility platforms serving thousands of users across multiple business units.',
        'Engineered REST API integrations with 3+ external enterprise systems — including CRM, ERP, and Identity Management — eliminating 80% of manual data transfer overhead.',
        'Drove a 20% improvement in application responsiveness and 30% overall performance gain through targeted architectural refactoring, query optimisation, and caching strategies.',
        'Designed and automated CI/CD pipelines using Azure DevOps and PowerShell, compressing deployment cycles by 40% and eliminating manual release risk.',
        'Developed Python-based test automation frameworks, reducing regression testing time by 50% and increasing release reliability.',
      ],
    },
    {
      id: '2',
      title: 'Working Student – Process Automation & Data Transformation',
      company: 'Ernst & Young GmbH',
      location: 'Mannheim, Germany',
      startDate: '10/2018',
      endDate: '06/2019',
      current: false,
      bullets: [
        'Automated high-frequency financial reporting processes using PowerShell and VBA, reducing manual effort by 30%.',
        'Built Python-based data transformation pipelines that improved reporting accuracy and cut end-of-period processing time.',
        'Developed internal .NET tools for process automation, streamlining recurring operational workflows.',
      ],
    },
    {
      id: '3',
      title: 'Business Analyst / Software Analyst',
      company: 'Accenture Services Pvt. Ltd.',
      location: 'Bengaluru, India',
      startDate: '12/2013',
      endDate: '08/2016',
      current: false,
      bullets: [
        'Served as primary liaison between business stakeholders and development teams on large-scale insurance-domain transformation programmes.',
        'Facilitated structured requirements workshops and translated complex business processes into clear technical specifications, UML diagrams, and BPMN flows.',
        'Contributed to Agile SDLC ceremonies — sprint planning, test strategy definition, and executive stakeholder reporting.',
      ],
    },
  ],
  education: [
    {
      id: '1',
      degree: 'M.Sc. Computer Science',
      institution: 'Technical University of Kaiserslautern, Germany',
      location: '',
      startDate: '09/2016',
      endDate: '06/2019',
      details: 'Focus: Software Engineering, System Design, Natural Language Processing (NLP).',
    },
    {
      id: '2',
      degree: 'B.E. Information Science & Engineering',
      institution: 'Ramaiah Institute of Technology, Bengaluru, India',
      location: '',
      startDate: '09/2009',
      endDate: '06/2013',
      details: 'Foundation in software development, data structures, and enterprise systems.',
    },
  ],
  skills: [
    { id: '1', category: 'Languages', items: ['C#', 'Python', 'TypeScript', 'JavaScript'] },
    { id: '2', category: 'Cloud & DevOps', items: ['Microsoft Azure', 'App Services', 'CI/CD', 'PowerShell'] },
    { id: '3', category: 'Backend', items: ['ASP.NET Core', 'REST API', 'Entity Framework', 'SQL Server'] },
    { id: '4', category: 'Testing', items: ['Selenium', 'Scrum', 'Kanban', 'BPMN', 'UML'] },
  ],
  languages: [
    { id: '1', language: 'English', level: 'Verhandlungssicher' },
    { id: '2', language: 'German', level: 'Gute Kenntnisse' },
    { id: '3', language: 'Hindi', level: 'Fließend' },
    { id: '4', language: 'Kannada', level: 'Muttersprache' },
  ],
  certifications: [],
  interests: 'Product Innovation, Food Fusion, Sports, Volleyball',
  settings: {
    selectedTemplate: 'classic',
    showPhoto: false,
    showDob: false,
    showNationality: false,
    showInterests: true,
    showCefr: false,
    theme: 'light',
  },
}

const GENERATORS = [
  { name: 'classic', fn: generateClassic },
  { name: 'minimal', fn: generateMinimal },
  { name: 'berlin-tech', fn: generateBerlinTech },
  { name: 'corporate', fn: generateCorporate },
  { name: 'executive', fn: generateExecutive },
]

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })
  console.log('Testing all 5 DOCX template generators...\n')

  const results = []
  for (const { name, fn } of GENERATORS) {
    process.stdout.write(`  [${name}] Generating...`)
    const start = Date.now()
    try {
      const buffer = await fn({ ...sampleCvData, settings: { ...sampleCvData.settings, selectedTemplate: name } })
      const ms = Date.now() - start
      const path = join(OUTPUT_DIR, `test-${name}.docx`)
      await writeFile(path, buffer)
      const kb = Math.round(buffer.length / 1024)
      console.log(` ✓ ${kb}KB in ${ms}ms → output/test-${name}.docx`)
      results.push({ name, ok: true, kb, ms })
    } catch (err) {
      console.log(` ✗ FAILED: ${err.message}`)
      results.push({ name, ok: false, error: err.message })
    }
  }

  const passed = results.filter((r) => r.ok).length
  const failed = results.filter((r) => !r.ok).length
  console.log(`\n${passed}/${GENERATORS.length} templates generated successfully.`)
  if (failed > 0) {
    console.log(`\nFailed templates:`)
    results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.name}: ${r.error}`))
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
