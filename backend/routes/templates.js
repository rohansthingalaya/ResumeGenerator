import { Router } from 'express'

export const router = Router()

router.get('/templates', (req, res) => {
  res.json([
    { id: 'classic', name: 'Professional Classic', description: 'Navy headings, clean dividers — based on reference CV', accent: '#1e3a5f' },
    { id: 'minimal', name: 'Modern Minimal', description: 'Black & white, generous whitespace, Scandinavian feel', accent: '#111111' },
    { id: 'berlin-tech', name: 'Berlin Tech', description: 'Teal accents, charcoal header — for tech & startup roles', accent: '#0D7377' },
    { id: 'corporate', name: 'Corporate Germany', description: 'Navy serif, alternating bands — for banks & consulting', accent: '#003366' },
    { id: 'executive', name: 'Executive', description: 'Gold accents, sidebar stripe — for senior leadership', accent: '#8B6914' },
  ])
})
