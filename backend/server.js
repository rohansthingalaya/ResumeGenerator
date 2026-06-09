import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { router as cvRouter } from './routes/cv.js'
import { router as exportRouter } from './routes/export.js'
import { router as analyzeRouter } from './routes/analyze.js'
import { router as templatesRouter } from './routes/templates.js'
import { router as importRouter } from './routes/import.js'
import { isLibreOfficeAvailable } from './services/pdfConverter.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const IS_PROD = process.env.NODE_ENV === 'production'

// CORS only needed in development (Vite dev server on 5173 → Express on 3001)
if (!IS_PROD) {
  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
}
app.use(express.json({ limit: '50mb' }))

app.use('/api', cvRouter)
app.use('/api/export', exportRouter)
app.use('/api', analyzeRouter)
app.use('/api', templatesRouter)
app.use('/api', importRouter)

// Cache LibreOffice availability at first health check (avoids re-running on every request)
let _libreOfficeAvailable = null

app.get('/api/health', async (_, res) => {
  if (_libreOfficeAvailable === null) {
    _libreOfficeAvailable = await isLibreOfficeAvailable().catch(() => false)
  }
  res.json({ ok: true, libreOfficeAvailable: _libreOfficeAvailable })
})

// In production, serve the built Vite frontend and handle SPA routing
if (IS_PROD) {
  const distPath = join(__dirname, '../frontend/dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => res.sendFile(join(distPath, 'index.html')))
}

// Global error handler — catches any errors passed via next(err) or thrown in async routes
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`CV Generator backend running on http://localhost:${PORT}`)
})
