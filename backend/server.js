import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { router as cvRouter } from './routes/cv.js'
import { router as exportRouter } from './routes/export.js'
import { router as analyzeRouter } from './routes/analyze.js'
import { router as templatesRouter } from './routes/templates.js'
import { router as importRouter } from './routes/import.js'
import { isLibreOfficeAvailable } from './services/pdfConverter.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
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

// Global error handler — catches any errors passed via next(err) or thrown in async routes
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`CV Generator backend running on http://localhost:${PORT}`)
})
