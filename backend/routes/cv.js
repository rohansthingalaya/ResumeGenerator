import { Router } from 'express'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, '../../data/cv-data.json')

export const router = Router()

router.get('/load', async (req, res) => {
  try {
    const raw = await readFile(DATA_PATH, 'utf-8')
    res.json(JSON.parse(raw))
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.json({})
    } else {
      res.status(500).json({ error: err.message })
    }
  }
})

router.post('/save', async (req, res) => {
  try {
    const data = { ...req.body, last_updated: new Date().toISOString() }
    await mkdir(join(__dirname, '../../data'), { recursive: true })
    await writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
    res.json({ ok: true, last_updated: data.last_updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
