/**
 * Rule-based keyword extraction and CV optimization engine.
 * No external AI API calls — fully local, fast, works offline.
 *
 * Approach:
 *  1. Extract keywords from JD using curated lists + regex
 *  2. Match against CV sections using normalized text search + alias expansion
 *  3. Score the match and identify critical gaps
 *  4. Generate natural-language suggestions for summary & bullets
 */

// ── SKILL REGISTRY ──────────────────────────────────────────────────────────
// Each entry: { canonical, aliases, category, weight }
// weight: 3=critical, 2=important, 1=nice-to-have

const SKILL_REGISTRY = [
  // ── Cloud & Infrastructure ──────────────────────────────────────────────
  { canonical: 'AWS',              aliases: ['Amazon Web Services', 'Amazon AWS'],         category: 'cloud',      weight: 3 },
  { canonical: 'Azure',            aliases: ['Microsoft Azure', 'Azure Cloud'],            category: 'cloud',      weight: 3 },
  { canonical: 'GCP',              aliases: ['Google Cloud', 'Google Cloud Platform'],     category: 'cloud',      weight: 3 },
  { canonical: 'Kubernetes',       aliases: ['K8s', 'k8s'],                                category: 'devops',     weight: 3 },
  { canonical: 'Docker',           aliases: ['containerization', 'containers'],            category: 'devops',     weight: 3 },
  { canonical: 'Terraform',        aliases: ['IaC', 'infrastructure as code'],             category: 'devops',     weight: 3 },
  { canonical: 'Ansible',          aliases: [],                                            category: 'devops',     weight: 2 },
  { canonical: 'Helm',             aliases: [],                                            category: 'devops',     weight: 2 },
  { canonical: 'CI/CD',            aliases: ['continuous integration', 'continuous deployment', 'continuous delivery', 'pipeline'], category: 'devops', weight: 3 },
  { canonical: 'Jenkins',          aliases: [],                                            category: 'devops',     weight: 2 },
  { canonical: 'GitHub Actions',   aliases: ['GitHub CI'],                                 category: 'devops',     weight: 2 },
  { canonical: 'GitLab CI',        aliases: ['GitLab'],                                    category: 'devops',     weight: 2 },
  { canonical: 'Azure DevOps',     aliases: ['ADO', 'VSTS'],                               category: 'devops',     weight: 2 },
  { canonical: 'ArgoCD',           aliases: ['Argo CD'],                                   category: 'devops',     weight: 2 },
  { canonical: 'Prometheus',       aliases: [],                                            category: 'monitoring', weight: 2 },
  { canonical: 'Grafana',          aliases: [],                                            category: 'monitoring', weight: 2 },
  { canonical: 'Datadog',          aliases: [],                                            category: 'monitoring', weight: 2 },
  { canonical: 'Splunk',           aliases: [],                                            category: 'monitoring', weight: 1 },
  { canonical: 'ELK',              aliases: ['Elastic Stack', 'Elasticsearch Logstash Kibana'], category: 'monitoring', weight: 1 },
  { canonical: 'Elasticsearch',    aliases: ['Elastic'],                                   category: 'data',       weight: 2 },

  // ── Programming Languages ────────────────────────────────────────────────
  { canonical: 'Python',           aliases: ['py'],                                        category: 'language',   weight: 3 },
  { canonical: 'JavaScript',       aliases: ['JS', 'ECMAScript', 'ES6'],                  category: 'language',   weight: 3 },
  { canonical: 'TypeScript',       aliases: ['TS'],                                        category: 'language',   weight: 3 },
  { canonical: 'Java',             aliases: [],                                            category: 'language',   weight: 3 },
  { canonical: 'Kotlin',           aliases: [],                                            category: 'language',   weight: 2 },
  { canonical: 'Go',               aliases: ['Golang'],                                    category: 'language',   weight: 2 },
  { canonical: 'Rust',             aliases: [],                                            category: 'language',   weight: 2 },
  { canonical: 'C#',               aliases: ['C sharp', 'CSharp', 'dotnet', '.NET lang'], category: 'language',   weight: 3 },
  { canonical: 'C++',              aliases: ['C plus plus', 'cpp'],                        category: 'language',   weight: 2 },
  { canonical: 'Ruby',             aliases: [],                                            category: 'language',   weight: 1 },
  { canonical: 'PHP',              aliases: [],                                            category: 'language',   weight: 1 },
  { canonical: 'Scala',            aliases: [],                                            category: 'language',   weight: 2 },
  { canonical: 'Swift',            aliases: [],                                            category: 'language',   weight: 2 },
  { canonical: 'Bash',             aliases: ['shell scripting', 'shell script'],           category: 'language',   weight: 2 },
  { canonical: 'PowerShell',       aliases: ['PS1'],                                       category: 'language',   weight: 2 },
  { canonical: 'SQL',              aliases: ['T-SQL', 'PL/SQL'],                           category: 'language',   weight: 3 },

  // ── Web Frameworks ────────────────────────────────────────────────────────
  { canonical: 'React',            aliases: ['React.js', 'ReactJS'],                      category: 'frontend',   weight: 3 },
  { canonical: 'Angular',          aliases: ['AngularJS'],                                 category: 'frontend',   weight: 2 },
  { canonical: 'Vue',              aliases: ['Vue.js', 'VueJS'],                           category: 'frontend',   weight: 2 },
  { canonical: 'Next.js',          aliases: ['NextJS'],                                    category: 'frontend',   weight: 2 },
  { canonical: 'Node.js',          aliases: ['NodeJS', 'Node'],                            category: 'backend',    weight: 3 },
  { canonical: 'Express',          aliases: ['Express.js'],                                category: 'backend',    weight: 2 },
  { canonical: 'FastAPI',          aliases: [],                                            category: 'backend',    weight: 2 },
  { canonical: 'Django',           aliases: [],                                            category: 'backend',    weight: 2 },
  { canonical: 'Flask',            aliases: [],                                            category: 'backend',    weight: 2 },
  { canonical: 'Spring Boot',      aliases: ['Spring Framework', 'Spring'],                category: 'backend',    weight: 3 },
  { canonical: '.NET',             aliases: ['ASP.NET', 'ASP.NET Core', 'dotnet'],        category: 'backend',    weight: 3 },
  { canonical: 'GraphQL',          aliases: [],                                            category: 'api',        weight: 2 },
  { canonical: 'REST API',         aliases: ['REST', 'RESTful', 'RESTful API'],            category: 'api',        weight: 3 },
  { canonical: 'gRPC',             aliases: [],                                            category: 'api',        weight: 2 },

  // ── Databases ─────────────────────────────────────────────────────────────
  { canonical: 'PostgreSQL',       aliases: ['Postgres'],                                  category: 'database',   weight: 3 },
  { canonical: 'MySQL',            aliases: [],                                            category: 'database',   weight: 2 },
  { canonical: 'MongoDB',          aliases: ['Mongo'],                                     category: 'database',   weight: 2 },
  { canonical: 'Redis',            aliases: [],                                            category: 'database',   weight: 2 },
  { canonical: 'SQL Server',       aliases: ['MSSQL', 'Microsoft SQL Server'],             category: 'database',   weight: 2 },
  { canonical: 'Cosmos DB',        aliases: ['CosmosDB', 'Azure CosmosDB'],                category: 'database',   weight: 2 },
  { canonical: 'DynamoDB',         aliases: [],                                            category: 'database',   weight: 2 },
  { canonical: 'Cassandra',        aliases: [],                                            category: 'database',   weight: 1 },
  { canonical: 'Snowflake',        aliases: [],                                            category: 'data',       weight: 2 },
  { canonical: 'BigQuery',         aliases: [],                                            category: 'data',       weight: 2 },

  // ── Data & ML ─────────────────────────────────────────────────────────────
  { canonical: 'TensorFlow',       aliases: ['TF'],                                        category: 'ml',         weight: 2 },
  { canonical: 'PyTorch',          aliases: [],                                            category: 'ml',         weight: 2 },
  { canonical: 'scikit-learn',     aliases: ['sklearn'],                                   category: 'ml',         weight: 2 },
  { canonical: 'Pandas',           aliases: [],                                            category: 'data',       weight: 2 },
  { canonical: 'Apache Spark',     aliases: ['Spark', 'PySpark'],                          category: 'data',       weight: 2 },
  { canonical: 'Kafka',            aliases: ['Apache Kafka'],                              category: 'data',       weight: 2 },
  { canonical: 'Airflow',          aliases: ['Apache Airflow'],                            category: 'data',       weight: 2 },
  { canonical: 'dbt',              aliases: [],                                            category: 'data',       weight: 2 },
  { canonical: 'Power BI',         aliases: ['PowerBI'],                                   category: 'reporting',  weight: 2 },
  { canonical: 'Tableau',          aliases: [],                                            category: 'reporting',  weight: 2 },

  // ── Methodologies ─────────────────────────────────────────────────────────
  { canonical: 'Agile',            aliases: ['agile methodology', 'agile development'],    category: 'methodology', weight: 3 },
  { canonical: 'Scrum',            aliases: ['scrum framework'],                           category: 'methodology', weight: 3 },
  { canonical: 'Kanban',           aliases: [],                                            category: 'methodology', weight: 2 },
  { canonical: 'SAFe',             aliases: ['Scaled Agile', 'SAFe Framework'],            category: 'methodology', weight: 2 },
  { canonical: 'DevOps',           aliases: ['Dev Ops'],                                   category: 'methodology', weight: 3 },
  { canonical: 'SRE',              aliases: ['Site Reliability'],                          category: 'methodology', weight: 2 },
  { canonical: 'TDD',              aliases: ['Test-Driven', 'test driven development'],    category: 'methodology', weight: 2 },
  { canonical: 'Microservices',    aliases: ['microservice', 'micro-services'],            category: 'architecture', weight: 3 },
  { canonical: 'Event-Driven',     aliases: ['event driven architecture', 'EDA'],         category: 'architecture', weight: 2 },

  // ── Security ──────────────────────────────────────────────────────────────
  { canonical: 'OAuth',            aliases: ['OAuth2', 'OAuth 2.0'],                       category: 'security',   weight: 2 },
  { canonical: 'JWT',              aliases: ['JSON Web Token'],                            category: 'security',   weight: 2 },
  { canonical: 'SAML',             aliases: [],                                            category: 'security',   weight: 1 },
  { canonical: 'OpenID',           aliases: ['OIDC', 'OpenID Connect'],                   category: 'security',   weight: 1 },
  { canonical: 'SIEM',             aliases: [],                                            category: 'security',   weight: 1 },

  // ── Testing ───────────────────────────────────────────────────────────────
  { canonical: 'Selenium',         aliases: [],                                            category: 'testing',    weight: 2 },
  { canonical: 'Jest',             aliases: [],                                            category: 'testing',    weight: 2 },
  { canonical: 'Pytest',           aliases: [],                                            category: 'testing',    weight: 2 },
  { canonical: 'Cypress',          aliases: [],                                            category: 'testing',    weight: 2 },
  { canonical: 'JUnit',            aliases: [],                                            category: 'testing',    weight: 2 },
  { canonical: 'Playwright',       aliases: [],                                            category: 'testing',    weight: 2 },
  { canonical: 'Postman',          aliases: [],                                            category: 'testing',    weight: 1 },

  // ── Enterprise / German-market ────────────────────────────────────────────
  { canonical: 'SAP',              aliases: ['SAP ERP', 'SAP S/4HANA'],                   category: 'enterprise', weight: 3 },
  { canonical: 'DATEV',            aliases: [],                                            category: 'enterprise', weight: 2 },
  { canonical: 'Salesforce',       aliases: ['SFDC'],                                      category: 'enterprise', weight: 2 },
  { canonical: 'Dynamics 365',     aliases: ['Dynamics', 'Microsoft Dynamics'],            category: 'enterprise', weight: 2 },
  { canonical: 'SharePoint',       aliases: [],                                            category: 'enterprise', weight: 1 },
  { canonical: 'ServiceNow',       aliases: [],                                            category: 'enterprise', weight: 2 },

  // ── Other tools ───────────────────────────────────────────────────────────
  { canonical: 'Git',              aliases: ['GitHub', 'GitLab', 'version control'],       category: 'tool',       weight: 2 },
  { canonical: 'JIRA',             aliases: ['Jira'],                                      category: 'tool',       weight: 2 },
  { canonical: 'Confluence',       aliases: [],                                            category: 'tool',       weight: 1 },
  { canonical: 'Figma',            aliases: [],                                            category: 'design',     weight: 2 },
  { canonical: 'Linux',            aliases: ['Unix'],                                      category: 'tool',       weight: 2 },

  // ── Project / Architecture roles ──────────────────────────────────────────
  { canonical: 'Solution Architecture', aliases: ['solution architect', 'technical architecture'], category: 'role', weight: 2 },
  { canonical: 'API Management',   aliases: ['APIM', 'API Gateway'],                      category: 'api',        weight: 2 },
  { canonical: 'Cloud Architecture', aliases: [],                                         category: 'cloud',      weight: 2 },
  { canonical: 'System Design',    aliases: [],                                            category: 'architecture', weight: 2 },
  { canonical: 'UML',              aliases: [],                                            category: 'methodology', weight: 1 },
  { canonical: 'BPMN',             aliases: [],                                            category: 'methodology', weight: 1 },
  { canonical: 'Entity Framework', aliases: ['EF Core'],                                  category: 'backend',    weight: 2 },
]

// ── Soft skills (detected but not aliased in registry) ───────────────────────
const SOFT_SKILLS = [
  'leadership', 'communication', 'teamwork', 'collaboration', 'problem-solving',
  'analytical', 'creative', 'innovative', 'mentoring', 'coaching', 'presentation',
  'stakeholder management', 'project management', 'time management', 'adaptability',
  'cross-functional', 'strategic thinking', 'customer-focused', 'results-driven',
  'self-motivated', 'detail-oriented', 'ownership', 'initiative',
  // German
  'Teamfähigkeit', 'Kommunikation', 'Führung', 'Eigeninitiative', 'Flexibilität',
  'Selbstständigkeit', 'Verantwortungsbewusstsein',
]

// ── Certifications ───────────────────────────────────────────────────────────
const CERTIFICATIONS = [
  'AWS Certified', 'Azure Certified', 'GCP Certified', 'Google Certified',
  'CKA', 'CKAD', 'CKS', 'Certified Kubernetes',
  'PMP', 'PMI-ACP', 'Prince2', 'ITIL',
  'Scrum Master', 'CSM', 'PSM', 'CSPO', 'Product Owner',
  'SAFe Agilist', 'SAFe',
  'CISSP', 'CISM', 'CEH', 'OSCP',
  'TOGAF', 'Six Sigma', 'ISO 27001',
]

// ── Language requirements ─────────────────────────────────────────────────────
const HUMAN_LANGUAGES = [
  'English', 'German', 'Deutsch', 'French', 'Spanish', 'Mandarin', 'Hindi',
  'Italian', 'Portuguese', 'Dutch', 'Russian', 'Japanese', 'Korean', 'Arabic',
  'Englisch', 'Französisch', 'Spanisch', 'Chinesisch', 'Japanisch', 'Russisch',
]

// ── Category labels for suggestions ─────────────────────────────────────────
const CATEGORY_LABELS = {
  cloud: 'cloud & infrastructure',
  devops: 'DevOps & CI/CD',
  monitoring: 'monitoring & observability',
  language: 'programming languages',
  frontend: 'frontend development',
  backend: 'backend development',
  api: 'API design',
  database: 'databases',
  data: 'data engineering',
  ml: 'machine learning',
  methodology: 'methodologies',
  architecture: 'software architecture',
  security: 'security',
  testing: 'testing & QA',
  enterprise: 'enterprise software',
  tool: 'tools & platforms',
  role: 'solution architecture',
}

// ── Build lookup maps for fast matching ──────────────────────────────────────
const CANONICAL_MAP = new Map() // alias/canonical → entry
for (const entry of SKILL_REGISTRY) {
  CANONICAL_MAP.set(entry.canonical.toLowerCase(), entry)
  for (const alias of entry.aliases) {
    CANONICAL_MAP.set(alias.toLowerCase(), entry)
  }
}

// ── Normalization ─────────────────────────────────────────────────────────────
function norm(str) {
  return (str || '').toLowerCase().replace(/[-_]/g, ' ').trim()
}

// ── Build regex for a skill entry ─────────────────────────────────────────────
function buildPattern(entry) {
  const terms = [entry.canonical, ...entry.aliases].map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  )
  return new RegExp(`\\b(${terms.join('|')})\\b`, 'i')
}

// Pre-compile all patterns
const PATTERNS = SKILL_REGISTRY.map((entry) => ({
  entry,
  pattern: buildPattern(entry),
}))

// ── findInCv: returns list of human-readable locations ───────────────────────
function findInCv(keyword, cvData) {
  const candidates = [keyword.toLowerCase()]
  const entry = CANONICAL_MAP.get(norm(keyword))
  if (entry) {
    candidates.push(...[entry.canonical, ...entry.aliases].map((s) => s.toLowerCase()))
  }

  const matchesText = (text) => {
    if (!text) return false
    const t = norm(text)
    return candidates.some((c) => t.includes(norm(c)))
  }

  const locations = []

  if (matchesText(cvData.summary)) locations.push('summary')

  ;(cvData.experience || []).forEach((exp, i) => {
    if (matchesText(exp.title) || matchesText(exp.company)) {
      locations.push(`experience[${i}].title`)
    }
    ;(exp.bullets || []).forEach((b, j) => {
      if (matchesText(b)) locations.push(`experience[${i}].bullet[${j}]`)
    })
  })

  ;(cvData.skills || []).forEach((cat) => {
    if (matchesText(cat.category) || (cat.items || []).some(matchesText)) {
      locations.push(`skills.${cat.category || '?'}`)
    }
  })

  ;(cvData.certifications || []).forEach((c) => {
    if (matchesText(c.name)) locations.push('certifications')
  })

  ;(cvData.languages || []).forEach((l) => {
    if (matchesText(l.language)) locations.push('languages')
  })

  return locations
}

// ── extractKeywords: detect skills/soft/certs/languages in JD ────────────────
export function extractKeywords(jdText) {
  const hard_skills = []
  const seenCanonicals = new Set()

  for (const { entry, pattern } of PATTERNS) {
    if (seenCanonicals.has(entry.canonical)) continue
    if (pattern.test(jdText)) {
      hard_skills.push(entry.canonical)
      seenCanonicals.add(entry.canonical)
    }
  }

  const soft_skills = SOFT_SKILLS.filter((s) =>
    new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(jdText)
  )

  const certifications = CERTIFICATIONS.filter((c) =>
    new RegExp(c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(jdText)
  )

  const languages = HUMAN_LANGUAGES.filter((l) =>
    new RegExp(`\\b${l}\\b`, 'i').test(jdText)
  )

  return { hard_skills, soft_skills, certifications, languages }
}

// ── analyzeJobDescription: full analysis with suggestions ─────────────────────
export function analyzeJobDescription(jdText, cvData) {
  const extracted = extractKeywords(jdText)

  const mapKeywords = (list) =>
    list.map((keyword) => {
      const locations = findInCv(keyword, cvData)
      return { keyword, found_in_cv: locations.length > 0, locations }
    })

  const keywords = {
    hard_skills: mapKeywords(extracted.hard_skills),
    soft_skills: mapKeywords(extracted.soft_skills),
    certifications: mapKeywords(extracted.certifications),
    languages: mapKeywords(extracted.languages),
  }

  // Weighted score: hard skills count double
  const weightedTotal =
    keywords.hard_skills.length * 2 +
    keywords.soft_skills.length +
    keywords.certifications.length +
    keywords.languages.length

  const weightedFound =
    keywords.hard_skills.filter((k) => k.found_in_cv).length * 2 +
    keywords.soft_skills.filter((k) => k.found_in_cv).length +
    keywords.certifications.filter((k) => k.found_in_cv).length +
    keywords.languages.filter((k) => k.found_in_cv).length

  const match_score = weightedTotal > 0 ? Math.round((weightedFound / weightedTotal) * 100) : 0

  // Missing critical: missing hard skills sorted by weight desc
  const missing_critical = keywords.hard_skills
    .filter((k) => !k.found_in_cv)
    .sort((a, b) => {
      const wa = CANONICAL_MAP.get(norm(a.keyword))?.weight ?? 1
      const wb = CANONICAL_MAP.get(norm(b.keyword))?.weight ?? 1
      return wb - wa
    })
    .slice(0, 8)
    .map((k) => k.keyword)

  const suggestions = generateSuggestions(cvData, keywords, missing_critical)

  return { keywords, match_score, missing_critical, suggestions }
}

// ── Suggestion generator ──────────────────────────────────────────────────────
function generateSuggestions(cvData, keywords, missing_critical) {
  const suggestions = []

  const missingHard = keywords.hard_skills.filter((k) => !k.found_in_cv).map((k) => k.keyword)
  if (missingHard.length === 0) return suggestions

  // Group missing skills by category
  const byCategory = {}
  for (const skill of missingHard) {
    const entry = CANONICAL_MAP.get(norm(skill))
    const cat = entry?.category || 'tool'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(skill)
  }

  // ── 1. Summary suggestion ──────────────────────────────────────────────────
  const summary = cvData.summary || ''
  if (missingHard.length > 0) {
    const top5 = missingHard.slice(0, 5)
    const optimizedSummary = buildSummarySuggestion(summary, top5, byCategory)
    if (optimizedSummary !== summary) {
      suggestions.push({
        section: 'summary',
        original: summary,
        suggested: optimizedSummary,
        keywords_added: top5,
      })
    }
  }

  // ── 2. Experience bullet suggestions ──────────────────────────────────────
  const bulletSuggestions = generateBulletSuggestions(cvData.experience || [], byCategory, missingHard)
  suggestions.push(...bulletSuggestions)

  // ── 3. Skills section suggestion ─────────────────────────────────────────
  if (missing_critical.length > 0) {
    const allSkillItems = (cvData.skills || []).flatMap((s) => s.items || [])
    const missFromSkills = missing_critical.filter(
      (k) => !allSkillItems.some((i) => norm(i).includes(norm(k)))
    )
    if (missFromSkills.length > 0) {
      suggestions.push({
        section: 'skills',
        original: null,
        suggested: `Add these to your Skills section: ${missFromSkills.join(', ')}`,
        keywords_added: missFromSkills,
      })
    }
  }

  return suggestions
}

function buildSummarySuggestion(original, missingKeywords, byCategory) {
  if (!original) {
    const cats = Object.keys(byCategory).slice(0, 2).map((c) => CATEGORY_LABELS[c] || c)
    return `Experienced professional with expertise in ${missingKeywords.slice(0, 4).join(', ')} and ${cats.join(', ')}.`
  }

  let result = original.trimEnd()

  // Append a targeted phrase based on the most important missing category
  const topCat = Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length)[0]
  if (!topCat) return result

  const [cat, skills] = topCat
  const top3 = skills.slice(0, 3)

  const templates = {
    cloud:       `Hands-on experience with ${top3.join(', ')} for cloud-native deployments.`,
    devops:      `Strong background in ${top3.join(', ')} for automated, production-grade pipelines.`,
    language:    `Proficient in ${top3.join(', ')} for building robust backend systems.`,
    backend:     `Experienced in ${top3.join(', ')} for scalable service development.`,
    frontend:    `Skilled in ${top3.join(', ')} for delivering modern, responsive UIs.`,
    database:    `Working knowledge of ${top3.join(', ')} for high-performance data persistence.`,
    methodology: `Strong command of ${top3.join(', ')} frameworks for efficient team delivery.`,
    architecture:`Deep experience in ${top3.join(', ')} for robust, enterprise-grade systems.`,
    data:        `Experience with ${top3.join(', ')} for large-scale data processing pipelines.`,
    ml:          `Practical background in ${top3.join(', ')} for machine learning solutions.`,
    testing:     `Experienced in ${top3.join(', ')} to ensure high-quality, reliable software.`,
    enterprise:  `Proven track record with ${top3.join(', ')} in enterprise environments.`,
    security:    `Knowledge of ${top3.join(', ')} for secure application development.`,
    api:         `Expertise in ${top3.join(', ')} for designing scalable integration layers.`,
  }

  const phrase = templates[cat] || `Practical experience with ${top3.join(', ')}.`
  // Avoid appending if the phrase essentially repeats what's there
  if (!top3.some((s) => norm(result).includes(norm(s)))) {
    result += ' ' + phrase
  }

  return result
}

function generateBulletSuggestions(experience, byCategory, missingKeywords) {
  const suggestions = []

  // Map category → related bullet indicators
  const CATEGORY_SIGNALS = {
    cloud:       ['cloud', 'azure', 'aws', 'gcp', 'infrastructure', 'deployment', 'service'],
    devops:      ['pipeline', 'ci', 'cd', 'deploy', 'automation', 'devops', 'release', 'build', 'container'],
    language:    ['developed', 'built', 'wrote', 'implemented', 'coded', 'engineered'],
    backend:     ['api', 'service', 'server', 'backend', 'endpoint', 'integration', 'rest'],
    frontend:    ['ui', 'frontend', 'interface', 'react', 'angular', 'component'],
    database:    ['database', 'query', 'sql', 'data', 'storage', 'migration', 'schema'],
    methodology: ['agile', 'scrum', 'sprint', 'planning', 'ceremony', 'team', 'delivery'],
    testing:     ['test', 'automation', 'qa', 'regression', 'selenium', 'quality'],
    data:        ['data', 'pipeline', 'etl', 'processing', 'analytics', 'reporting'],
    monitoring:  ['monitor', 'alert', 'observab', 'logging', 'metric', 'dashboard'],
    architecture:['architect', 'design', 'system', 'pattern', 'microservice', 'scalab'],
    security:    ['secur', 'auth', 'iam', 'identity', 'permiss', 'encryp'],
    enterprise:  ['enterprise', 'erp', 'crm', 'sap', 'integration', 'business'],
  }

  for (const [cat, skills] of Object.entries(byCategory)) {
    if (skills.length === 0) continue
    const signals = CATEGORY_SIGNALS[cat] || []
    const top2Missing = skills.slice(0, 2)

    // Find the best matching bullet across all experience entries
    let bestMatch = null
    let bestScore = 0
    let bestExpId = null
    let bestBulletIdx = -1

    for (const exp of experience) {
      for (let bi = 0; bi < (exp.bullets || []).length; bi++) {
        const bullet = exp.bullets[bi]
        if (!bullet) continue
        const bulletNorm = norm(bullet)
        const score = signals.filter((sig) => bulletNorm.includes(sig)).length
        if (score > bestScore) {
          bestScore = score
          bestMatch = bullet
          bestExpId = exp.id
          bestBulletIdx = bi
        }
      }
    }

    // Only suggest if we found a relevant bullet and have something to add
    if (bestMatch && bestScore > 0) {
      const enhanced = enhanceBullet(bestMatch, top2Missing)
      if (enhanced && enhanced !== bestMatch) {
        suggestions.push({
          section: 'experience',
          experience_id: bestExpId,
          bullet_index: bestBulletIdx,
          original: bestMatch,
          suggested: enhanced,
          keywords_added: top2Missing,
        })
      }
    }
  }

  // Deduplicate by bullet
  const seen = new Set()
  return suggestions.filter((s) => {
    if (s.section !== 'experience') return true
    const key = s.original
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Enhance a bullet by naturally inserting missing keywords.
 * Uses simple heuristics: inject after "using", "with", "via", or at the end.
 */
function enhanceBullet(bullet, missingKeywords) {
  if (!missingKeywords || missingKeywords.length === 0) return null

  // Don't suggest if keywords already appear in bullet
  const bulletNorm = norm(bullet)
  const truly_missing = missingKeywords.filter((k) => !bulletNorm.includes(norm(k)))
  if (truly_missing.length === 0) return null

  const additions = truly_missing.slice(0, 2).join(' and ')

  // Injection point 1: after "using <tool>" pattern → append to the list
  const usingMatch = bullet.match(/(using\s+[\w\s,+#.]+?)(\s*[,\.—]|$)/i)
  if (usingMatch) {
    return bullet.replace(usingMatch[0], `${usingMatch[0].trimEnd()}, and ${additions}${usingMatch[0].match(/[,\.—]$/) ? usingMatch[0].slice(-1) : ''}`)
  }

  // Injection point 2: period at end → replace with ", leveraging <keyword>."
  if (bullet.match(/\.$/)) {
    return bullet.replace(/\.$/, `, leveraging ${additions}.`)
  }

  // Default: append
  return bullet.trimEnd() + ` (incorporating ${additions})`
}

// ── Optimize endpoint function ────────────────────────────────────────────────
export function optimizeCv(cvData, jdText) {
  const { keywords, missing_critical, suggestions } = analyzeJobDescription(jdText, cvData)

  const summarySuggestion = suggestions.find((s) => s.section === 'summary')
  const bulletSuggestions = suggestions.filter((s) => s.section === 'experience')
  const skillsSuggestion = suggestions.find((s) => s.section === 'skills')

  return {
    summary: summarySuggestion?.suggested || cvData.summary,
    keywords_added: summarySuggestion?.keywords_added || [],
    bullet_suggestions: bulletSuggestions,
    skills_suggestion: skillsSuggestion,
    missing_critical,
  }
}
