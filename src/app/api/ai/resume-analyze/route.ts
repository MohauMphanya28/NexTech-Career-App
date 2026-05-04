import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

// ─── Document Text Extraction ────────────────────────────────────────────────

async function extractTextFromPdf(base64: string): Promise<string> {
  const { PDFParse } = await import('pdf-parse')
  const path = await import('path')
  const buffer = Buffer.from(base64, 'base64')
  const uint8 = new Uint8Array(buffer)
  const pdfjsDistPath = require.resolve('pdfjs-dist/package.json')
  const parser = new PDFParse(uint8, {
    standardFontDataUrl: path.join(path.dirname(pdfjsDistPath), 'standard_fonts') + '/',
  })
  await parser.load()
  const result = await parser.getText()
  return result.text || result.pages?.map((p: any) => p.text).join('\n\n') || ''
}

async function extractTextFromDocx(base64: string): Promise<string> {
  const mammoth = await import('mammoth')
  const buffer = Buffer.from(base64, 'base64')
  const result = await mammoth.extractRawText({ buffer })
  return result.value || ''
}

function extractTextFromTxt(base64: string): string {
  return Buffer.from(base64, 'base64').toString('utf-8')
}

async function extractText(base64: string, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractTextFromPdf(base64)
  }
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return extractTextFromDocx(base64)
  }
  // text/plain or fallback
  return extractTextFromTxt(base64)
}

// ─── Main Handler ────────────────────────────────────────────────────────────

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

    // Check base64 size — roughly 10MB raw = ~13.3MB base64
    const base64SizeBytes = Math.ceil((fileBase64.length * 3) / 4)
    if (base64SizeBytes > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File is too large. Please upload a resume under 10MB.' },
        { status: 400 }
      )
    }

    // Step 1: Extract text from the document
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
        { error: 'Could not extract any text from the resume. The file may be empty, image-based, or corrupted. Please try a different file.' },
        { status: 400 }
      )
    }

    // Step 2: Analyze the extracted content using LLM
    const zai = await getZAI()
    const jobContext = jobTarget
      ? `The user is targeting this type of role: "${jobTarget}". Evaluate the resume's fitness for this specific role.`
      : 'Evaluate the resume for general professional opportunities in the South African job market.'

    const analysisResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `You are an expert resume analyst and career coach specializing in the South African job market. You provide thorough, honest, and constructive resume analyses. You understand ATS systems, recruiter expectations, and what makes a resume stand out. You evaluate resumes on multiple dimensions: content quality, formatting, ATS compatibility, impact, and relevance.`,
        },
        {
          role: 'user',
          content: `Analyze this resume thoroughly and provide a comprehensive evaluation. ${jobContext}

RESUME CONTENT:
${extractedContent}

Provide your analysis as a JSON object with EXACTLY this structure:
{
  "overallScore": <number 0-100>,
  "atsCompatibility": {
    "score": <number 0-100>,
    "issues": ["list of ATS compatibility issues found"],
    "tips": ["list of ATS optimization tips specific to this resume"]
  },
  "contentAnalysis": {
    "summary": {
      "score": <number 0-100>,
      "feedback": "detailed feedback on the summary/objective section",
      "hasSummary": true/false
    },
    "experience": {
      "score": <number 0-100>,
      "feedback": "detailed feedback on experience section",
      "issues": ["list of specific issues with experience entries"],
      "strengths": ["list of what's done well in experience"]
    },
    "education": {
      "score": <number 0-100>,
      "feedback": "detailed feedback on education section",
      "issues": ["list of issues"],
      "strengths": ["list of strengths"]
    },
    "skills": {
      "score": <number 0-100>,
      "feedback": "detailed feedback on skills section",
      "missing": ["list of skills that should be added based on the resume content"],
      "irrelevant": ["skills that don't add value"]
    }
  },
  "strengths": ["top 5 overall strengths of this resume"],
  "weaknesses": ["top 5 overall weaknesses or areas for improvement"],
  "improvementPlan": [
    {
      "priority": "high" | "medium" | "low",
      "section": "which section this improvement relates to",
      "issue": "description of the issue",
      "suggestion": "specific, actionable suggestion to fix it",
      "example": "example of how the improved content should look"
    }
  ],
  "improvedResume": {
    "personalInfo": {
      "fullName": "extracted or improved name",
      "email": "extracted email",
      "phone": "extracted phone",
      "location": "extracted location",
      "linkedin": "extracted linkedin or empty string"
    },
    "summary": "an improved professional summary (2-3 sentences, action-oriented, with quantifiable achievements where possible)",
    "experience": [
      {
        "title": "improved job title",
        "company": "company name",
        "period": "improved period format (e.g. Jan 2020 - Dec 2022)",
        "description": "improved description with action verbs, quantifiable achievements, and professional language"
      }
    ],
    "education": [
      {
        "degree": "improved degree name",
        "institution": "institution name",
        "year": "year"
      }
    ],
    "skills": ["comprehensive improved skills list"],
    "atsScore": <number 0-100, the projected ATS score after improvements>
  },
  "keyInsight": "one powerful, personalized insight about this resume that would motivate the user to improve it"
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no extra text. All text should be in UK English (South African standard). Be specific and actionable in all feedback.`,
        },
      ],
      thinking: { type: 'disabled' },
    })

    let analysisText = analysisResponse.choices[0]?.message?.content || ''

    // Extract JSON from response if wrapped in markdown code fences
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      analysisText = jsonMatch[0]
    }

    let analysis
    try {
      analysis = JSON.parse(analysisText)
    } catch {
      console.error('Failed to parse resume analysis JSON:', analysisText.substring(0, 200))
      return NextResponse.json({
        success: true,
        extractedContent,
        analysis: {
          overallScore: 50,
          atsCompatibility: {
            score: 45,
            issues: ['Could not complete full ATS analysis'],
            tips: ['Ensure your resume uses standard section headings', 'Include relevant keywords from job postings'],
          },
          contentAnalysis: {
            summary: { score: 40, feedback: 'Summary section needs improvement', hasSummary: false },
            experience: { score: 45, feedback: 'Experience descriptions need more detail and action verbs', issues: ['Add quantifiable achievements'], strengths: [] },
            education: { score: 50, feedback: 'Education section is adequate', issues: [], strengths: [] },
            skills: { score: 40, feedback: 'Skills section needs expansion', missing: ['Add more relevant skills'], irrelevant: [] },
          },
          strengths: ['Resume has been created and submitted for analysis'],
          weaknesses: ['Full analysis could not be completed - please try again'],
          improvementPlan: [],
          improvedResume: null,
          keyInsight: 'Your resume is a work in progress - every improvement brings you closer to your dream job!',
        },
      })
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
