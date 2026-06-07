import express from 'express'
import multer from 'multer'
import { extractText, parseResumeText } from '../services/resumeParser.js'

export const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter(req, file, cb) {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ]
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF and DOCX files are supported.'))
    }
  },
})

router.post('/import-resume', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' })
    }

    const text = await extractText(req.file.buffer, req.file.mimetype)
    if (!text || text.trim().length < 20) {
      return res.status(422).json({ error: 'Could not extract readable text from this file.' })
    }

    const parsed = parseResumeText(text)
    res.json({ ok: true, data: parsed })
  } catch (err) {
    next(err)
  }
})
