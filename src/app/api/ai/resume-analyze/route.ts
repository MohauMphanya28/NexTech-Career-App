import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { PDFParse } from 'pdf-parse'
import path from 'path'
import mammoth from 'mammoth'

// Resume Analyzer API Route
// Extracts text from PDF/DOCX directly (no external mini-service needed)
// Then uses LLM (z-ai-web-dev-sdk) for analysis

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

// --- Text Extraction ---

async function extractTextFromPdf(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, 'base64')
  const uint8 = new Uint8Array(buffer)
  let standardFontDataUrl: string | undefined
  try {
    const pdfjsDistPath = require.resolve('pdfjs-dist/package.json')
    standardFontDataUrl = path.join(path.dirname(pdfjsDistPath), 'standard_fonts') + '/'
  } catch {
    // No standard fonts available
  }
  const parser = new PDFParse(uint8, standardFontDataUrl ? { standardFontDataUrl } : {})
  await parser.load()
  const result = await parser.getText()
  return result.text || ''
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
  weaknesses.push('Full AI analysis unavailable')

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
    issue: 'Full AI analysis is not available',
    suggestion: 'Ensure the AI service is connected for detailed feedback',
    example: 'Connect to the AI service to get detailed analysis and an improved resume',
  })

  return {
    overallScore: score,
    atsCompatibility: {
      score: Math.max(score - 5, 20),
      issues: ['Full ATS analysis unavailable'],
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
      ? 'Your resume has all the key sections. Connect to the AI service for a detailed analysis and an improved version.'
      : 'Your resume is missing some key sections. Focus on adding a professional summary, experience, education, and skills.',
  }
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
      console.error('Document extraction error:', extractError)
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

    // Step 2: Try AI analysis with LLM
    let analysis
    try {
      const zai = await getZAI()

      const jobContext = jobTarget
        ? 'The user is targeting this type of role: "' + jobTarget + '". Evaluate the resume fitness for this specific role.'
        : 'Evaluate the resume for general professional opportunities in the South African job market.'

      const systemPrompt = [
        'You are an expert resume analyst and career coach specializing in the South African job market.',
        'You provide thorough, honest, and constructive resume analyses.',
        'You understand ATS systems, recruiter expectations, and what makes a resume stand out.',
        'You evaluate resumes on multiple dimensions: content quality, formatting, ATS compatibility, impact, and relevance.',
      ].join(' ')

      const userPrompt = [
        'Analyze this resume thoroughly and provide a comprehensive evaluation. ' + jobContext,
        '',
        'RESUME CONTENT:',
        extractedContent,
        '',
        'Provide your analysis as a JSON object with EXACTLY this structure:',
        '{',
        '  "overallScore": <number 0-100>,',
        '  "atsCompatibility": {',
        '    "score": <number 0-100>,',
        '    "issues": ["list of ATS compatibility issues found"],',
        '    "tips": ["list of ATS optimization tips"]',
        '  },',
        '  "contentAnalysis": {',
        '    "summary": { "score": <0-100>, "feedback": "detailed feedback", "hasSummary": true/false },',
        '    "experience": { "score": <0-100>, "feedback": "detailed feedback", "issues": ["list"], "strengths": ["list"] },',
        '    "education": { "score": <0-100>, "feedback": "detailed feedback", "issues": ["list"], "strengths": ["list"] },',
        '    "skills": { "score": <0-100>, "feedback": "detailed feedback", "missing": ["list"], "irrelevant": ["list"] }',
        '  },',
        '  "strengths": ["top 5 overall strengths"],',
        '  "weaknesses": ["top 5 overall weaknesses"],',
        '  "improvementPlan": [',
        '    { "priority": "high|medium|low", "section": "section name", "issue": "description", "suggestion": "actionable suggestion", "example": "example of improved content" }',
        '  ],',
        '  "improvedResume": {',
        '    "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "linkedin": "" },',
        '    "summary": "improved professional summary 2-3 sentences",',
        '    "experience": [{ "title": "", "company": "", "period": "", "description": "improved with action verbs" }],',
        '    "education": [{ "degree": "", "institution": "", "year": "" }],',
        '    "skills": ["comprehensive improved skills list"],',
        '    "atsScore": <0-100>',
        '  },',
        '  "keyInsight": "one powerful personalized insight about this resume"',
        '}',
        '',
        'IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no extra text. All text in UK English. Be specific and actionable.',
      ].join('\n')

      const analysisResponse = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        thinking: { type: 'disabled' },
      })

      let analysisText = analysisResponse.choices[0]?.message?.content || ''

      // Extract JSON from response if wrapped in markdown code fences
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisText = jsonMatch[0]
      }

      try {
        analysis = JSON.parse(analysisText)
      } catch {
        console.error('Failed to parse resume analysis JSON:', analysisText.substring(0, 200))
        analysis = getFallbackAnalysis(extractedContent)
      }
    } catch (llmError) {
      console.error('LLM analysis failed, using fallback:', llmError)
      analysis = getFallbackAnalysis(extractedContent)
    }

    return NextResponse.json({
      success: true,
      extractedContent,
      analysis,
    })
  } catch (error) {
    console.error('Resume analysis error:', error)
    const message = error instanceof Error ? error.message : 'Failed to analyze resume. Please try again.'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
