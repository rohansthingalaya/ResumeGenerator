# German CV Generator App

## Project Overview
A local web application for creating ATS-friendly German CVs (Lebenslauf). Users input career data via a structured form, paste job descriptions for keyword analysis, choose from 5 professional templates, preview the CV in real-time, and export as PDF or DOCX. Runs entirely locally — no cloud dependencies, no accounts.

---

## Tech Stack
- **Frontend**: React 18 + Vite 5 + Tailwind CSS 3
- **Backend**: Node.js + Express 4
- **CV Generation**: `docx` npm package (programmatic DOCX creation)
- **PDF Conversion**: LibreOffice headless (DOCX → PDF for export); Puppeteer (HTML → PDF fallback)
- **State Management**: Zustand — chosen over React Context because CV data is deeply nested, shared across many components, and requires debounced auto-save. Zustand's flat store API and built-in middleware make this significantly simpler than Context + useReducer.
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Drag & Drop**: @dnd-kit/core (for skill category reordering)

---

## Architecture

```
ResumeGenerator/
├── frontend/          # Vite + React app (port 5173)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level page components
│   │   ├── store/          # Zustand store
│   │   ├── hooks/          # Custom React hooks
│   │   ├── templates/      # HTML/CSS CV preview renderers (5 templates)
│   │   └── utils/          # Shared utilities
│   └── ...
├── backend/           # Express API server (port 3001)
│   ├── routes/        # API route handlers
│   ├── templates/     # DOCX generation templates
│   └── services/      # Keyword analysis, PDF conversion
└── data/              # Persisted CV data (cv-data.json)
```

Frontend communicates with backend via REST API. The preview panel renders HTML/CSS (fast, real-time). Export uses the backend DOCX engine (accurate, standards-compliant).

---

## File Map

### Root
| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project documentation and living memory |
| `Lebenslauf_Rohan_Thingalaya_EN.pdf` | Reference CV — basis for Template 1 |

### Frontend (`frontend/`)
| File | Purpose |
|------|---------|
| `package.json` | Frontend dependencies |
| `vite.config.js` | Vite config with proxy to backend |
| `tailwind.config.js` | Tailwind config with custom colors |
| `index.html` | HTML entry point |
| `src/main.jsx` | React entry, mounts App |
| `src/App.jsx` | Router and layout wrapper |
| `src/index.css` | Global styles, Tailwind imports, Inter font |
| `src/store/cvStore.js` | Zustand store — all CV data + settings |
| `src/hooks/useAutoSave.js` | Debounced auto-save hook |
| `src/pages/Dashboard.jsx` | Landing page with create/load actions |
| `src/pages/Editor.jsx` | Main editor — left form + right preview |
| `src/pages/Export.jsx` | Export modal/page |
| `src/components/Editor/PersonalInfo.jsx` | Personal info accordion section — includes photo upload (Bewerbungsfoto) with base64 preview |
| `src/components/Editor/Summary.jsx` | Professional summary with JD optimizer |
| `src/components/Editor/Experience.jsx` | Work experience repeatable section |
| `src/components/Editor/Education.jsx` | Education repeatable section |
| `src/components/Editor/Skills.jsx` | Skills category manager |
| `src/components/Editor/Languages.jsx` | Languages section |
| `src/components/Editor/Certifications.jsx` | Certifications section |
| `src/components/Editor/Interests.jsx` | Interests section |
| `src/components/Editor/JobDescriptionAnalyzer.jsx` | JD keyword analyzer UI |
| `src/components/Preview/PreviewPanel.jsx` | Right panel — live preview host |
| `src/components/Preview/TemplateSelector.jsx` | 5 template cards |
| `src/components/Preview/PreviewRenderer.jsx` | HTML/CSS CV renderer |
| `src/components/UI/Accordion.jsx` | Collapsible accordion |
| `src/components/UI/Button.jsx` | Reusable button |
| `src/components/UI/Tag.jsx` | Skill tag chip |
| `src/components/UI/ThemeToggle.jsx` | Dark/light mode toggle |
| `src/templates/preview/classic.js` | Template 1 HTML preview — flex header with photo top-right (132×170px = 3.5×4.5cm) |
| `src/templates/preview/` | HTML/CSS renderers for each template (preview) |

### Backend (`backend/`)
| File | Purpose |
|------|---------|
| `package.json` | Backend dependencies |
| `server.js` | Express app entry point |
| `routes/cv.js` | Save/load CV data routes |
| `routes/export.js` | DOCX and PDF export routes |
| `routes/analyze.js` | Job description analysis routes |
| `routes/templates.js` | Template metadata route |
| `routes/import.js` | CV import route — accepts PDF/DOCX upload (25 MB limit), extracts text, returns parsed CV data |
| `services/keywordEngine.js` | Rule-based keyword extraction and matching |
| `services/pdfConverter.js` | LibreOffice + Puppeteer PDF conversion |
| `services/resumeParser.js` | CV text extraction (pdf-parse v2 + mammoth) and structured parsing — sections, experience, education, skills, languages, certifications |
| `templates/base-generator.js` | Shared DOCX helpers |
| `templates/template-classic.js` | Template 1: Professional Classic — includes photo via ImageRun in borderless 2-col table header |
| `templates/template-minimal.js` | Template 2: Modern Minimal |
| `templates/template-berlin-tech.js` | Template 3: Berlin Tech |
| `templates/template-corporate.js` | Template 4: Corporate Germany |
| `templates/template-executive.js` | Template 5: Executive |

### Data
| File | Purpose |
|------|---------|
| `data/cv-data.json` | Persisted CV data between sessions |

---

## Templates

| # | Name | Style | Font | Best For |
|---|------|-------|------|----------|
| 1 | Professional Classic | Navy headings, horizontal dividers, en-dash bullets | Arial | General applications, replicates reference CV |
| 2 | Modern Minimal | B&W only, bold headings, generous whitespace | Calibri | Clean modern roles |
| 3 | Berlin Tech | Charcoal header, teal (#0D7377) accents, monospace skills | Consolas/Arial | Tech/startup Berlin |
| 4 | Corporate Germany | Navy (#003366), serif body, alternating gray bands, photo slot | Georgia | Banks, consulting, traditional German companies |
| 5 | Executive | Large thin name, gold (#8B6914) dividers, left accent stripe | Arial | Senior/leadership roles |

---

## Commands

```bash
# Install all dependencies (run from project root)
npm run install:all

# Start both frontend (port 5173) and backend (port 3001)
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Build frontend for production
npm run build

# Test DOCX/PDF generation
npm run export:test
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/save` | Save CV data to data/cv-data.json |
| GET | `/api/load` | Load saved CV data |
| POST | `/api/analyze-jd` | Analyze job description, extract keywords |
| POST | `/api/optimize` | Return optimized CV suggestions |
| POST | `/api/export/docx` | Generate DOCX file |
| POST | `/api/export/pdf` | Generate PDF file |
| GET | `/api/templates` | Return template list with metadata |
| POST | `/api/import-resume` | Upload PDF or DOCX (multipart, field: `file`, max 25 MB) — returns parsed CV JSON |

---

## CV Data Schema

```json
{
  "last_updated": "ISO timestamp",
  "personal": {
    "fullName": "", "email": "", "phone": "", "address": "",
    "linkedin": "", "dob": "", "placeOfBirth": "", "nationality": "",
    "photoPath": ""  // base64 data URL (e.g. "data:image/jpeg;base64,...")
  },
  "summary": "",
  "experience": [
    {
      "id": "uuid",
      "title": "", "company": "", "location": "",
      "startDate": "", "endDate": "", "current": false,
      "bullets": [""]
    }
  ],
  "education": [
    { "id": "uuid", "degree": "", "institution": "", "location": "", "startDate": "", "endDate": "", "details": "" }
  ],
  "skills": [
    { "id": "uuid", "category": "", "items": [] }
  ],
  "languages": [
    { "id": "uuid", "language": "", "level": "" }
  ],
  "certifications": [
    { "id": "uuid", "name": "", "issuer": "", "date": "" }
  ],
  "interests": "",
  "settings": {
    "selectedTemplate": "classic",
    "showPhoto": false,
    "showDob": false,
    "showNationality": false,
    "showInterests": true,
    "showCefr": false,
    "theme": "light"
  }
}
```

---

## Decision Log

| Date | Decision | Reasoning |
|------|----------|-----------|
| 2026-03-03 | Zustand over React Context | CV data is deeply nested and shared across 8+ form sections. Zustand's middleware (persist, devtools) and simpler API vs Context+useReducer made it the clear choice. |
| 2026-03-03 | LibreOffice headless for PDF | Produces the highest-fidelity DOCX→PDF conversion. Puppeteer is the fallback for systems without LibreOffice. |
| 2026-03-03 | Separate frontend/backend packages | Cleaner dependency management — `docx`, `puppeteer`, LibreOffice bindings stay server-side. Vite dev server proxies `/api` to Express. |
| 2026-03-03 | Rule-based keyword engine (no AI API) | Per requirements. Fast, local, no rate limits. Can be extended with Anthropic API later. |
| 2026-03-03 | HTML/CSS for CV preview | Real-time previewing a live DOCX would be too slow. HTML/CSS mirrors the template visuals with sub-100ms updates. Final export uses the real DOCX engine. |
| 2026-03-03 | @dnd-kit for drag-and-drop | Lightweight, accessible, works well with React 18. |
| 2026-03-03 | Tailwind v4 `@custom-variant dark` | Tailwind v4 defaults dark mode to OS media query. Added `@custom-variant dark (&:where(.dark, .dark *))` to index.css for class-based dark mode. |
| 2026-03-03 | Preview zoom with `position:absolute` inner div | `transform: scale()` doesn't shrink layout footprint. Fixed by using a clipping outer container at `width × zoom` / `height × zoom`, with the inner div `position:absolute` and scaled via `transformOrigin: top left`. Height measured via `ref.scrollHeight` after each render. |
| 2026-03-03 | CSS Grid accordion animation | `max-h` animation is slow and janky for unknown content heights. Replaced with CSS Grid `grid-template-rows: 0fr → 1fr` trick which animates smoothly at any content height. |
| 2026-03-03 | Theme flash prevention via localStorage | Dark mode is stored in Zustand (async) and also localStorage (sync). `main.jsx` reads localStorage before first render to prevent light-mode flash for dark-mode users. |
| 2026-03-03 | Added `personal.headline` field | Reference PDF analysis revealed a subtitle line (e.g. "Senior Software Engineer • Solution Architect") below the name. Added as a separate field to the store and PersonalInfo form. |
| 2026-03-11 | Skills changed from 4-column table to category-grouped lines | The bordered 4-column table was replaced with "**Category:** item1, item2, …" lines across all 5 HTML preview templates and all 5 DOCX generators. More ATS-friendly (no tables) and preserves category grouping. `LEVEL_LABELS` export added to `base-generator.js` and `templateHelpers.js` as the shared label map. |
| 2026-03-03 | Date format MM.YYYY dot notation | Reference CV uses German dot-notation dates (09.2019) and "since MM.YYYY" for current roles. `formatClassicDate()` helper handles this; other templates use MM.YYYY – MM.YYYY range format. |
| 2026-03-03 | Entry structure: multi-line, no right-aligned dates | Reference CV puts dates on a separate italic line below company name (not right-aligned). Updated all DOCX generators and HTML preview renderer accordingly. |
| 2026-03-05 | Photo stored as base64 data URL in `personal.photoPath` | No separate upload endpoint or file system needed. FileReader converts the picked image to a data URL stored directly in Zustand/cv-data.json. Works for both HTML preview (`<img src>`) and DOCX export (`ImageRun` with Buffer). Keeps the app fully self-contained. |
| 2026-03-05 | DOCX photo layout uses borderless 2-col Table (photo LEFT) | Word has no native float/flex. A borderless 2-column Table (left: ImageRun, right: name+headline+contacts) matches the reference PDF layout. |
| 2026-03-05 | Contact info placement depends on photo visibility | With photo: email/city/linkedin appear as stacked lines below the headline in the right column; single thin rule separates header from body. Without photo: classic two-line bordered contact bar is used. |
| 2026-03-11 | Language levels stored as CEFR codes, displayed as descriptive labels | Dropdown now uses CEFR codes as stored values (`Native`, `C2`…`A1`) including B1 and A1 which were missing before. A shared `LEVEL_LABELS` map (in `templateHelpers.js` and `base-generator.js`) converts codes to descriptive English for CV display. "Show CEFR codes" checkbox still appends the code e.g. "Fluent (C1)". `CEFR_MAP` removed from `base-generator.js`. |
| 2026-03-05 | Puppeteer PDF multi-page margins via `@page` | `@page { margin: 43pt }` in `wrapForPrint` ensures correct top/bottom margins on every page including after page breaks. Outer div padding is zeroed via `!important` since `@page` now owns the spacing. `.cv-entry { page-break-inside: avoid }` prevents entry headers from being orphaned at page bottom. |
| 2026-03-07 | pdf-parse v2 uses class-based API | `pdf-parse@2.x` exports `{ PDFParse }` class, not a plain function. Use `new PDFParse({ data: buffer })` then `.getText()` → `result.text`. The old `createRequire` + function-call pattern from v1 is broken. |
| 2026-03-07 | resumeParser section detection: exclude `achievements?`/`awards?` from certifications header | "Achievements / Tasks" label in classic CV format was matching the certifications section regex, causing all experience bullets to be misclassified as certifications. Removed those terms from the section header pattern. |
| 2026-03-07 | resumeParser: `SINCE_DATE_RE` for current roles | "since MM.YYYY" date format (used in this CV for KPMG) doesn't have a range separator so `DATE_RANGE_RE` didn't match. Added `SINCE_DATE_RE = /(?:since|ab|seit)\s+(\d{1,2}[./]\d{4}|\d{4})/i` and updated block splitting and date extraction accordingly. |
| 2026-03-07 | resumeParser: lookback to reassign orphaned title/company lines | When splitting experience blocks on a new date line, the next entry's title and company have already been appended to the current block (they arrive before their date). A lookback from the end of the current block moves capital-starting lines to the new block. Wrapped bullet continuations start with lowercase so they are correctly left behind. |
| 2026-03-07 | resumeParser: merge PDF-wrapped bullet continuations | Long bullets are split across multiple lines in extracted PDF text. Continuation lines (no `•` prefix) are merged back into the preceding bullet. If the block uses `•` prefixes, only `•`-prefixed lines start a new bullet; all others are merged. |
| 2026-03-07 | resumeParser: education split on degree keyword | Education only split on a second date range, so multi-degree CVs collapsed into one entry. Now also splits when a new `DEGREE_RE` match appears and the current block already has a degree + date. Added `b.e.`, `b.tech`, `m.tech` to `DEGREE_RE`. |
| 2026-03-07 | resumeParser: tab-separated skills | PDF-extracted skill grids use `\t` as separator. Added `\t` to the skill-item split pattern alongside `,;|•`. |
| 2026-03-07 | resumeParser: strip page markers globally | "-- N of M --" PDF page markers were leaking into section content. Now filtered from the lines array at the top of `parseResumeText` before any section detection. |
| 2026-03-07 | resumeParser: address false match from year digits | Zip+city regex `\d{4,5}\s+[A-Z]...` was matching "2019 Berlin" from "since 09.2019 Berlin". Fixed with negative lookbehind `(?<![./])` to exclude digits preceded by a dot or slash. |

---

## Known Issues / TODOs

- [x] Phase 1: Foundation — scaffold, CLAUDE.md, data persistence
- [x] Phase 2: CV Generation Engine — reference PDF analyzed, all 5 DOCX templates tested & working, PDF pipeline built
- [x] Phase 3: UI — Core Editor — all bugs fixed, DnD wired, dark mode class strategy, preview zoom fixed, full round-trip tested
- [x] Phase 4: Keyword Analysis — extraction engine (SKILL_REGISTRY ~85 entries), weighted scoring, suggestions, Auto-Optimize panel with Accept/Reject per suggestion
- [x] Phase 5: Polish — export step progress, ATS validation, LibreOffice warning, ErrorBoundary, auto-save retry
- [x] Post-launch: Photo upload (Bewerbungsfoto) — UI upload, HTML preview (132×170px), DOCX export (ImageRun, 99×128pt)
- [x] Post-launch: CV import — upload PDF/DOCX (25 MB), extract text via pdf-parse v2 + mammoth, parse into full CV data schema

### Phase 2 — What was verified from reference PDF:
- Header: large bold name + italic headline subtitle
- Thin horizontal rule separating name from contact bar
- Contact items spaced with tabs (no pipes/separators)
- Section headings: UPPERCASE + colored rule (blue #1B5E9E)
- Experience entries: title → company → *date location* (italic) → *Achievements / Tasks* (italic label) → bullet points (•)
- Skills: 4-column centered table
- Education: degree (bold) → institution → *focus details* (italic) → *date range* (italic)
- Languages: **bold name:** *italic description*
- Interests: single horizontal table row

---

## Change History

| Date | Change |
|------|--------|
| 2026-03-03 | Initial CLAUDE.md created with full architecture plan |
| 2026-03-03 | Phase 1: Project scaffold — Vite+React+Tailwind frontend, Express backend, Zustand store, basic save/load API, routing |
| 2026-03-03 | Phase 2: CV generation engine — analyzed reference PDF, rewrote Template 1 (Classic) HTML preview + DOCX generator to match reference exactly, updated all 5 DOCX generators, built PDF conversion pipeline, added `headline` field, tested all endpoints |
| 2026-03-03 | Phase 3: Editor UI — fixed Accordion CSS Grid animation, fixed Tailwind v4 `@custom-variant dark` class strategy, fixed preview zoom with clipping container + height measurement, wired @dnd-kit DnD for Skills and Experience, fixed localStorage theme persistence, Dashboard shows saved CV name, all 5 API round-trips verified |
| 2026-03-03 | Phase 5: Polish — export page rebuilt with step-by-step progress (DOCX/PDF steps), ATS readiness warnings (missing name/email/experience/skills), LibreOffice availability banner fetched from /api/health at mount, retry button on failure; backend /api/health now reports libreOfficeAvailable with cached result; global Express error handler added; React ErrorBoundary wraps entire app with Try Again / Reload Page fallback; useAutoSave now retries once after 6s on failure using useCvStore.getState() to avoid stale closure |
| 2026-03-03 | Phase 4: Keyword Analysis — rewrote keywordEngine.js with SKILL_REGISTRY (~85 entries, aliases, weights, categories), CANONICAL_MAP for O(1) alias lookup, pre-compiled regex patterns, weighted scoring (hard skills ×2), generateSuggestions() with summary/bullet/skills suggestions, optimizeCv() export; fixed broken import in analyze.js; rebuilt JobDescriptionAnalyzer.jsx with SuggestionCard components showing Apply/Dismiss per suggestion, applied suggestions update store directly (updateSummary / updateExperienceBullet) |
| 2026-03-05 | Photo upload (Bewerbungsfoto) — added photo upload UI to PersonalInfo.jsx (checkbox toggle, dashed upload target, thumbnail preview with remove button); updated classic.js HTML preview to render photo top-right in a flex header at 132×170px (3.5×4.5cm @96dpi); updated template-classic.js DOCX generator to embed photo via ImageRun in a borderless 2-col Table at 99×128pt (3.5×4.5cm @72dpi Word equivalent); photo stored as base64 data URL in personal.photoPath |
| 2026-03-07 | CV import feature — added routes/import.js (multer, 25 MB limit, PDF/DOCX filter) and services/resumeParser.js (pdf-parse v2 ESM import, mammoth for DOCX); fixed 8 parser bugs: section misclassification via "Achievements" regex, "since MM.YYYY" date format, experience block splitting with lookback, PDF-wrapped bullet merging, multi-degree education splitting, tab-separated skills, page marker stripping, address false match from year digits |
| 2026-03-11 | Skills section reformatted: 4-column bordered table → category-grouped lines ("Category: item1, item2, …") in all 5 HTML previews and all 5 DOCX templates |
| 2026-03-11 | Language level dropdown changed to CEFR codes (A1–C2 + Native); stored value is now the CEFR code; `LEVEL_LABELS` shared map added to `templateHelpers.js` and `base-generator.js`; `CEFR_MAP` removed |
