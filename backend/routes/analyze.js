import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { analyzeJobDescription, optimizeCv } from '../services/keywordEngine.js'

export const router = Router()

const client = new Anthropic() // reads ANTHROPIC_API_KEY from env

router.post('/analyze-jd', (req, res) => {
  try {
    const { jobDescription, cvData } = req.body
    if (!jobDescription) {
      return res.status(400).json({ error: 'jobDescription is required' })
    }
    const result = analyzeJobDescription(jobDescription, cvData || {})
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/optimize', (req, res) => {
  try {
    const { cvData, jobDescription } = req.body
    if (!jobDescription) {
      return res.status(400).json({ error: 'jobDescription is required' })
    }
    const result = optimizeCv(cvData || {}, jobDescription)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// AI-powered enhancement — uses Claude to rewrite summary and bullets
router.post('/ai-enhance', async (req, res) => {
  try {
    const { jobDescription, cvData } = req.body
    if (!jobDescription || !cvData) {
      return res.status(400).json({ error: 'jobDescription and cvData are required' })
    }

    // Run rule-based analysis first to get the keyword gap
    const analysis = analyzeJobDescription(jobDescription, cvData)

    const cvContext = JSON.stringify({
      summary: cvData.summary,
      experience: (cvData.experience || []).map((exp) => ({
        id: exp.id,
        title: exp.title,
        company: exp.company,
        bullets: exp.bullets,
      })),
      skills: cvData.skills,
    })

    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: `You are an expert resume writer and ATS optimization specialist.
You enhance CV content to match job requirements naturally and compellingly,
without fabricating experience. Only improve what already exists.`,
      messages: [
        {
          role: 'user',
          content: `Optimize this CV for the job below. Do not invent skills or experience the candidate doesn't have.

MISSING KEYWORDS identified by analysis: ${analysis.missing_critical.join(', ')}

JOB DESCRIPTION:
${jobDescription}

CURRENT CV:
${cvContext}

Return JSON in this exact shape — nothing else:
{
  "optimized_summary": "rewritten summary, incorporating missing keywords naturally",
  "bullet_rewrites": [
    {
      "experience_id": "id from the cv",
      "bullet_index": 0,
      "original": "exact original bullet text",
      "suggested": "enhanced bullet with 1-2 keywords added naturally",
      "keywords_added": ["keyword"]
    }
  ],
  "skills_to_add": ["skill1", "skill2"]
}`,
        },
      ],
      output_config: {
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: {
              optimized_summary: { type: 'string' },
              bullet_rewrites: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    experience_id: { type: 'string' },
                    bullet_index: { type: 'integer' },
                    original: { type: 'string' },
                    suggested: { type: 'string' },
                    keywords_added: { type: 'array', items: { type: 'string' } },
                  },
                  required: ['experience_id', 'bullet_index', 'original', 'suggested', 'keywords_added'],
                  additionalProperties: false,
                },
              },
              skills_to_add: { type: 'array', items: { type: 'string' } },
            },
            required: ['optimized_summary', 'bullet_rewrites', 'skills_to_add'],
            additionalProperties: false,
          },
        },
      },
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    const aiResult = JSON.parse(textBlock.text)

    res.json({ ...analysis, ai_enhanced: aiResult })
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(401).json({ error: 'Invalid API key — check ANTHROPIC_API_KEY in .env' })
    }
    res.status(500).json({ error: err.message })
  }
})
