import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import mammoth from 'mammoth'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

// --- Text Extraction ---

async function extractTextFromPdf(base64: string): Promise<string> {
  // Use unpdf — a serverless-friendly PDF parser that doesn't need web workers
  // (pdfjs-dist requires a worker that Next.js can't bundle; pdf2json has format issues)
  const { getDocumentProxy, extractText } = await import('unpdf')

  const buffer = Buffer.from(base64, 'base64')
  const uint8 = new Uint8Array(buffer)

  const pdf = await getDocumentProxy(uint8)
  const result = await extractText(pdf)

  // unpdf returns { totalPages, text: string[] }
  if (result && Array.isArray(result.text)) {
    return result.text.join('\n')
  }

  return ''
}

async function extractTextFromDocx(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, 'base64')
  const result = await mammoth.extractRawText({ buffer })
  return result.value || ''
}

function extractTextFromTxt(base64: string): string {
  return Buffer.from(base64, 'base64').toString('utf-8')
}

async function extractText(base64: string, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') return extractTextFromPdf(base64)
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) return extractTextFromDocx(base64)
  return extractTextFromTxt(base64)
}

// --- Robust JSON Extraction from LLM responses ---

function extractJsonFromLlmResponse(text: string): string | null {
  // Strategy 1: Strip markdown code fences first
  let cleaned = text.trim()

  // Remove ```json ... ``` or ``` ... ``` wrappers
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim()
  }

  // Strategy 2: Try to find a JSON object using balanced braces
  const firstBrace = cleaned.indexOf('{')
  if (firstBrace === -1) return null

  let depth = 0
  let inString = false
  let escape = false
  let lastValidEnd = -1

  for (let i = firstBrace; i < cleaned.length; i++) {
    const ch = cleaned[i]

    if (escape) {
      escape = false
      continue
    }

    if (ch === '\\' && inString) {
      escape = true
      continue
    }

    if (ch === '"') {
      inString = !inString
      continue
    }

    if (inString) continue

    if (ch === '{') depth++
    if (ch === '}') {
      depth--
      if (depth === 0) {
        lastValidEnd = i + 1
        break
      }
    }
  }

  if (lastValidEnd > firstBrace) {
    return cleaned.substring(firstBrace, lastValidEnd)
  }

  // Strategy 3: Fallback regex (greedy match)
  const regexMatch = cleaned.match(/\{[\s\S]*\}/)
  if (regexMatch) return regexMatch[0]

  return null
}

function tryParseJson(text: string): any | null {
  try {
    return JSON.parse(text)
  } catch {
    // Fix trailing commas before } or ]
    let fixed = text.replace(/,\s*([\]}])/g, '$1')

    try {
      return JSON.parse(fixed)
    } catch {
      // Continue to more aggressive fixes
    }

    // Fix unescaped newlines in string values
    fixed = fixed.replace(/:\s*"([^"]*)\n([^"]*)"/g, (match, p1, p2) => {
      return ': "' + p1 + '\\n' + p2 + '"'
    })

    try {
      return JSON.parse(fixed)
    } catch {
      return null
    }
  }
}

// --- Fallback Analysis ---

function getFallbackAnalysis(extractedContent: string) {
  const hasSummary = /summary|objective|profile|about/i.test(extractedContent)
  const hasExperience = /experience|employment|work history/i.test(extractedContent)
  const hasEducation = /education|qualification|degree/i.test(extractedContent)
  const hasSkills = /skills|competencies|technologies/i.test(extractedContent)
  const wordCount = extractedContent.split(/\s+/).length

  let score = 30
  if (hasSummary) score += 10
  if (hasExperience) score += 15
  if (hasEducation) score += 10
  if (hasSkills) score += 10
  if (wordCount > 100) score += 5
  if (wordCount > 300) score += 10
  score = Math.min(score, 75)

  const strengths: string[] = ['Resume has been submitted for analysis']
  if (hasSummary) strengths.push('Professional summary is present')
  if (hasExperience) strengths.push('Work experience section is present')
  if (hasEducation) strengths.push('Education section is present')
  if (hasSkills) strengths.push('Skills section is present')

  const weaknesses: string[] = []
  if (!hasSummary) weaknesses.push('Missing professional summary')
  if (!hasExperience) weaknesses.push('Missing work experience section')
  if (!hasEducation) weaknesses.push('Missing education section')
  if (!hasSkills) weaknesses.push('Missing skills section')
  weaknesses.push('AI-powered detailed analysis temporarily unavailable')

  const improvementPlan: Array<{
    priority: 'high' | 'medium' | 'low'
    section: string
    issue: string
    suggestion: string
    example: string
  }> = []

  if (!hasSummary) {
    improvementPlan.push({
      priority: 'high',
      section: 'Summary',
      issue: 'No professional summary found',
      suggestion: 'Add a 2-3 sentence professional summary at the top of your resume',
      example: 'Dynamic and detail-oriented Computer Science graduate with hands-on experience in full-stack development. Proven ability to deliver user-focused solutions through internships and academic projects. Seeking to leverage technical skills in a junior developer role.',
    })
  }

  if (!hasSkills) {
    improvementPlan.push({
      priority: 'high',
      section: 'Skills',
      issue: 'No skills section found',
      suggestion: 'Add a skills section listing your technical and soft skills',
      example: 'Skills: JavaScript, Python, React, Node.js, SQL, Git, Problem-Solving, Team Collaboration, Communication',
    })
  }

  improvementPlan.push({
    priority: 'medium',
    section: 'General',
    issue: 'AI-powered detailed analysis is temporarily unavailable',
    suggestion: 'Try again in a moment for a full AI-powered analysis with an improved resume',
    example: 'The full AI service will provide: ATS score breakdown, section-by-section analysis, improved resume, and actionable improvement plan',
  })

  return {
    overallScore: score,
    atsCompatibility: {
      score: Math.max(score - 5, 20),
      issues: ['Full ATS analysis unavailable - AI service is warming up'],
      tips: [
        'Use standard section headings (Summary, Experience, Education, Skills)',
        'Include keywords from job postings you are targeting',
        'Avoid tables, graphics, or unusual fonts that ATS cannot parse',
        'Save as PDF with standard formatting for best ATS compatibility',
      ],
    },
    contentAnalysis: {
      summary: {
        score: hasSummary ? 55 : 25,
        feedback: hasSummary
          ? 'A summary section was detected. Ensure it is concise and highlights your key qualifications.'
          : 'No professional summary detected. Add a 2-3 sentence summary highlighting your key skills and career goals.',
        hasSummary,
      },
      experience: {
        score: hasExperience ? 50 : 20,
        feedback: hasExperience
          ? 'Experience section found. Use strong action verbs and include quantifiable achievements.'
          : 'No experience section detected. List your work experience with job titles, companies, and dates.',
        issues: hasExperience ? ['Add more quantifiable achievements'] : ['No experience section found'],
        strengths: hasExperience ? ['Experience section is present'] : [],
      },
      education: {
        score: hasEducation ? 55 : 25,
        feedback: hasEducation
          ? 'Education section detected. Include degree, institution, year, and any relevant achievements.'
          : 'No education section detected. Add your qualifications including degree, institution, and year.',
        issues: hasEducation ? [] : ['No education section found'],
        strengths: hasEducation ? ['Education section is present'] : [],
      },
      skills: {
        score: hasSkills ? 50 : 20,
        feedback: hasSkills
          ? 'Skills section found. Ensure you include both technical and soft skills relevant to your target role.'
          : 'No dedicated skills section detected. Add a skills section listing both technical abilities and soft skills.',
        missing: ['Add skills relevant to your target role'],
        irrelevant: [],
      },
    },
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    improvementPlan,
    improvedResume: null,
    keyInsight: hasSummary && hasExperience && hasEducation
      ? 'Your resume has all the key sections! Try the analysis again in a moment for a detailed AI-powered review with an improved version.'
      : 'Your resume is missing some key sections. Focus on adding a professional summary, experience, education, and skills.',
  }
}

// --- LLM Analysis with Retry ---

async function getLlmAnalysis(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  extractedContent: string,
  jobTarget?: string
): Promise<any | null> {
  const jobContext = jobTarget
    ? 'The user is targeting this type of role: "' + jobTarget + '". Evaluate the resume fitness for this specific role.'
    : 'Evaluate the resume for general professional opportunities in the South African job market.'

  const systemPrompt = [
    'You are an expert resume analyst and career coach specializing in the South African job market.',
    'You provide thorough, honest, and constructive resume analyses.',
    'You understand ATS systems, recruiter expectations, and what makes a resume stand out.',
    'You evaluate resumes on content quality, formatting, ATS compatibility, impact, and relevance.',
    'You ALWAYS respond with valid JSON only. No markdown. No code fences. No extra text.',
  ].join(' ')

  const userPrompt = [
    'Analyze this resume and return a JSON object. ' + jobContext,
    '',
    'RESUME CONTENT:',
    extractedContent.substring(0, 4000),
    '',
    'Return this JSON structure (fill in all fields):',
    '{"overallScore":0-100,"atsCompatibility":{"score":0-100,"issues":["issue1"],"tips":["tip1"]},"contentAnalysis":{"summary":{"score":0-100,"feedback":"feedback","hasSummary":true},"experience":{"score":0-100,"feedback":"feedback","issues":["issue"],"strengths":["strength"]},"education":{"score":0-100,"feedback":"feedback","issues":["issue"],"strengths":["strength"]},"skills":{"score":0-100,"feedback":"feedback","missing":["skill"],"irrelevant":[]}},"strengths":["s1","s2","s3","s4","s5"],"weaknesses":["w1","w2","w3","w4","w5"],"improvementPlan":[{"priority":"high","section":"Summary","issue":"issue desc","suggestion":"actionable suggestion","example":"example text"}],"improvedResume":{"personalInfo":{"fullName":"","email":"","phone":"","location":"","linkedin":""},"summary":"improved summary","experience":[{"title":"","company":"","period":"","description":"improved description"}],"education":[{"degree":"","institution":"","year":""}],"skills":["skill1","skill2"],"atsScore":0-100},"keyInsight":"one powerful insight"}',
    '',
    'CRITICAL: Return ONLY valid JSON. No markdown code fences. No extra text before or after. UK English spelling.',
  ].join('\n')

  // Try up to 2 times
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      console.log('[resume-analyze] LLM attempt', attempt + 1, 'content length:', extractedContent.length)

      const analysisResponse = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        thinking: { type: 'disabled' },
      })

      const rawContent = analysisResponse.choices[0]?.message?.content || ''
      console.log('[resume-analyze] LLM response length:', rawContent.length, 'first 100 chars:', rawContent.substring(0, 100))

      // Extract JSON from the response
      const jsonStr = extractJsonFromLlmResponse(rawContent)
      if (!jsonStr) {
        console.log('[resume-analyze] No JSON found in LLM response, attempt', attempt + 1)
        if (attempt === 0) continue
        return null
      }

      // Parse JSON with fallback for common issues
      const parsed = tryParseJson(jsonStr)
      if (!parsed) {
        console.log('[resume-analyze] JSON parse failed, attempt', attempt + 1, 'json length:', jsonStr.length)
        if (attempt === 0) continue
        return null
      }

      // Validate the parsed object has required fields
      if (typeof parsed.overallScore === 'number' && parsed.contentAnalysis) {
        console.log('[resume-analyze] Successfully parsed analysis, score:', parsed.overallScore)
        return parsed
      }

      console.log('[resume-analyze] Parsed JSON missing required fields, attempt', attempt + 1)
      if (attempt === 0) continue
      return null
    } catch (err) {
      console.error('[resume-analyze] LLM call error, attempt', attempt + 1, ':', err)
      if (attempt === 0) continue
      return null
    }
  }

  return null
}

// --- API Route Handler ---

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fileBase64, mimeType, fileName, jobTarget } = body

    if (!fileBase64 || !mimeType) {
      return NextResponse.json(
        { error: 'File data and mime type are required' },
        { status: 400 }
      )
    }

    const base64SizeBytes = Math.ceil((fileBase64.length * 3) / 4)
    if (base64SizeBytes > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File is too large. Please upload a resume under 10MB.' },
        { status: 400 }
      )
    }

    // Step 1: Extract text from document
    let extractedContent = ''

    try {
      extractedContent = await extractText(fileBase64, mimeType)
    } catch (extractError) {
      console.error('[resume-analyze] Document extraction error:', extractError)
      return NextResponse.json(
        { error: 'Could not read the resume file. Please ensure it is a valid PDF, DOCX, or TXT file.' },
        { status: 400 }
      )
    }

    if (!extractedContent.trim()) {
      return NextResponse.json(
        { error: 'Could not extract any text from the resume. The file may be empty or image-based. Please try a different file.' },
        { status: 400 }
      )
    }

    console.log('[resume-analyze] Extracted', extractedContent.length, 'chars from', mimeType)

    // Step 2: Try AI analysis with LLM (with retry)
    let analysis = null
    try {
      const zai = await getZAI()
      analysis = await getLlmAnalysis(zai, extractedContent, jobTarget)
    } catch (llmError) {
      console.error('[resume-analyze] LLM setup failed:', llmError)
    }

    // Step 3: Fallback if LLM failed
    if (!analysis) {
      console.log('[resume-analyze] Using fallback analysis')
      analysis = getFallbackAnalysis(extractedContent)
    }

    return NextResponse.json({
      success: true,
      extractedContent,
      analysis,
    })
  } catch (error) {
    console.error('[resume-analyze] Route error:', error)
    const message = error instanceof Error ? error.message : 'Failed to analyze resume. Please try again.'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
