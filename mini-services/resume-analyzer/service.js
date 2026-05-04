const http = require('http')
const ZAI = require('z-ai-web-dev-sdk').default
const { PDFParse } = require('pdf-parse')
const path = require('path')
const mammoth = require('mammoth')

const PORT = 3031

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason)
})

let zaiInstance = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

async function extractTextFromPdf(base64) {
  const buffer = Buffer.from(base64, 'base64')
  const uint8 = new Uint8Array(buffer)
  let standardFontDataUrl
  try {
    const pdfjsDistPath = require.resolve('pdfjs-dist/package.json')
    standardFontDataUrl = path.join(path.dirname(pdfjsDistPath), 'standard_fonts') + '/'
  } catch {}
  const parser = new PDFParse(uint8, standardFontDataUrl ? { standardFontDataUrl } : {})
  await parser.load()
  const result = await parser.getText()
  return result.text || ''
}

async function extractTextFromDocx(base64) {
  const buffer = Buffer.from(base64, 'base64')
  const result = await mammoth.extractRawText({ buffer })
  return result.value || ''
}

function extractTextFromTxt(base64) {
  return Buffer.from(base64, 'base64').toString('utf-8')
}

async function extractText(base64, mimeType) {
  if (mimeType === 'application/pdf') return extractTextFromPdf(base64)
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') return extractTextFromDocx(base64)
  return extractTextFromTxt(base64)
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  try {
    let body = ''
    for await (const chunk of req) body += chunk
    const { fileBase64, mimeType, jobTarget } = JSON.parse(body)
    console.log('Request received, mimeType:', mimeType)

    if (!fileBase64 || !mimeType) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'File data and mime type are required' }))
      return
    }

    const base64SizeBytes = Math.ceil((fileBase64.length * 3) / 4)
    if (base64SizeBytes > 10 * 1024 * 1024) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'File is too large. Please upload a resume under 10MB.' }))
      return
    }

    // Step 1: Extract text
    let extractedContent = ''
    try {
      extractedContent = await extractText(fileBase64, mimeType)
      console.log('Text extracted, length:', extractedContent.length)
    } catch (extractError) {
      console.error('Document extraction error:', extractError.message)
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Could not read the resume file. Please ensure it is a valid PDF, DOCX, or TXT file.' }))
      return
    }

    if (!extractedContent.trim()) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Could not extract any text from the resume. The file may be empty, image-based, or corrupted.' }))
      return
    }

    // Step 2: Analyze with LLM
    console.log('Calling LLM for analysis...')
    const zai = await getZAI()
    const jobContext = jobTarget
      ? `The user is targeting this type of role: "${jobTarget}". Evaluate the resume's fitness for this specific role.`
      : 'Evaluate the resume for general professional opportunities in the South African job market.'

    const analysisResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: 'You are an expert resume analyst and career coach specializing in the South African job market. You provide thorough, honest, and constructive resume analyses. You understand ATS systems, recruiter expectations, and what makes a resume stand out. You evaluate resumes on multiple dimensions: content quality, formatting, ATS compatibility, impact, and relevance.',
        },
        {
          role: 'user',
          content: `Analyze this resume thoroughly and provide a comprehensive evaluation. ${jobContext}\n\nRESUME CONTENT:\n${extractedContent}\n\nProvide your analysis as a JSON object with EXACTLY this structure:\n{\n  "overallScore": <number 0-100>,\n  "atsCompatibility": {\n    "score": <number 0-100>,\n    "issues": ["list of ATS compatibility issues found"],\n    "tips": ["list of ATS optimization tips specific to this resume"]\n  },\n  "contentAnalysis": {\n    "summary": {\n      "score": <number 0-100>,\n      "feedback": "detailed feedback on the summary/objective section",\n      "hasSummary": true/false\n    },\n    "experience": {\n      "score": <number 0-100>,\n      "feedback": "detailed feedback on experience section",\n      "issues": ["list of specific issues with experience entries"],\n      "strengths": ["list of what's done well in experience"]\n    },\n    "education": {\n      "score": <number 0-100>,\n      "feedback": "detailed feedback on education section",\n      "issues": ["list of issues"],\n      "strengths": ["list of strengths"]\n    },\n    "skills": {\n      "score": <number 0-100>,\n      "feedback": "detailed feedback on skills section",\n      "missing": ["list of skills that should be added based on the resume content"],\n      "irrelevant": ["skills that don't add value"]\n    }\n  },\n  "strengths": ["top 5 overall strengths of this resume"],\n  "weaknesses": ["top 5 overall weaknesses or areas for improvement"],\n  "improvementPlan": [\n    {\n      "priority": "high" | "medium" | "low",\n      "section": "which section this improvement relates to",\n      "issue": "description of the issue",\n      "suggestion": "specific, actionable suggestion to fix it",\n      "example": "example of how the improved content should look"\n    }\n  ],\n  "improvedResume": {\n    "personalInfo": {\n      "fullName": "extracted or improved name",\n      "email": "extracted email",\n      "phone": "extracted phone",\n      "location": "extracted location",\n      "linkedin": "extracted linkedin or empty string"\n    },\n    "summary": "an improved professional summary (2-3 sentences, action-oriented, with quantifiable achievements where possible)",\n    "experience": [\n      {\n        "title": "improved job title",\n        "company": "company name",\n        "period": "improved period format (e.g. Jan 2020 - Dec 2022)",\n        "description": "improved description with action verbs, quantifiable achievements, and professional language"\n      }\n    ],\n    "education": [\n      {\n        "degree": "improved degree name",\n        "institution": "institution name",\n        "year": "year"\n      }\n    ],\n    "skills": ["comprehensive improved skills list"],\n    "atsScore": <number 0-100, the projected ATS score after improvements>\n  },\n  "keyInsight": "one powerful, personalized insight about this resume that would motivate the user to improve it"\n}\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no extra text. All text should be in UK English (South African standard). Be specific and actionable in all feedback.`,
        },
      ],
      thinking: { type: 'disabled' },
    })

    let analysisText = analysisResponse.choices[0]?.message?.content || ''
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    if (jsonMatch) analysisText = jsonMatch[0]

    let analysis
    try {
      analysis = JSON.parse(analysisText)
    } catch {
      console.error('Failed to parse JSON')
      analysis = {
        overallScore: 50,
        atsCompatibility: { score: 45, issues: ['Could not complete full ATS analysis'], tips: ['Ensure your resume uses standard section headings'] },
        contentAnalysis: {
          summary: { score: 40, feedback: 'Summary section needs improvement', hasSummary: false },
          experience: { score: 45, feedback: 'Experience descriptions need more detail', issues: ['Add quantifiable achievements'], strengths: [] },
          education: { score: 50, feedback: 'Education section is adequate', issues: [], strengths: [] },
          skills: { score: 40, feedback: 'Skills section needs expansion', missing: ['Add more relevant skills'], irrelevant: [] },
        },
        strengths: ['Resume has been submitted for analysis'],
        weaknesses: ['Full analysis could not be completed'],
        improvementPlan: [],
        improvedResume: null,
        keyInsight: 'Your resume is a work in progress - every improvement brings you closer to your dream job!',
      }
    }

    console.log('Analysis complete, score:', analysis.overallScore)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ success: true, extractedContent, analysis }))
  } catch (error) {
    console.error('Resume analysis error:', error.message)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: error.message || 'Failed to analyze resume. Please try again.' }))
  }
})

server.listen(PORT, () => {
  console.log(`Resume Analyzer service running on port ${PORT}`)
})
