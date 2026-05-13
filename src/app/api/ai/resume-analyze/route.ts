import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { PDFParse } from 'pdf-parse'
import path from 'path'
import mammoth from 'mammoth'

// ─── Resume Analyzer API Route ──────────────────────────────────────────────
// Extracts text from PDF/DOCX directly (no external mini-service needed)
// Then uses LLM (z-ai-web-dev-sdk) for analysis

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

// ─── Text Extraction (inline — no mini-service needed) ──────────────────────

async function extractTextFromPdf(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, 'base64')
  const uint8 = new Uint8Array(buffer)
  let standardFontDataUrl: string | undefined
  try {
    const pdfjsDistPath = require.resolve('pdfjs-dist/package.json')
    standardFontDataUrl = path.join(path.dirname(pdfjsDistPath), 'standard_fonts') + '/'
  } catch {
    // No standard fonts available — will still work for most PDFs
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

// ─── Fallback Analysis ──────────────────────────────────────────────────────

function getFallbackAnalysis(extractedContent: string) {
  // Try to give a basic analysis based on the extracted content
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

  return {
    overallScore: score,
    atsCompatibility: {
      score: Math.max(score - 5, 20),
      issues: ['Full ATS analysis unavailable — AI service not connected'],
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
          ? 'A summary section was detected. Ensure it is concise (2-3 sentences), highlights your key qualifications, and includes relevant keywords.'
          : 'No professional summary detected. Add a 2-3 sentence summary at the top highlighting your key skills, experience level, and career goals.',
        hasSummary,
      },
      experience: {
        score: hasExperience ? 50 : 20,
        feedback: hasExperience
          ? 'Experience section found. Use strong action verbs (managed, developed, implemented), include quantifiable achievements, and tailor descriptions to the role you want.'
          : 'No experience section detected. List your work experience with job titles, companies, dates, and achievement-focused descriptions.',
        issues: hasExperience ? ['Add more quantifiable achievements (numbers, percentages, metrics)'] : ['No experience section found'],
        strengths: hasExperience ? ['Experience section is present'] : [],
      },
      education: {
        score: hasEducation ? 55 : 25,
        feedback: hasEducation
          ? 'Education section detected. Include degree, institution, year, and any relevant achievements or coursework.'
          : 'No education section detected. Add your qualifications including degree, institution, and year.',
        issues: hasEducation ? [] : ['No education section found'],
        strengths: hasEducation ? ['Education section is present'] : [],
      },
      skills: {
        score: hasSkills ? 50 : 20,
        feedback: hasSkills
          ? 'Skills section found. Ensure you include both technical and soft skills relevant to your target role.'
          : 'No dedicated skills section detected. Add a skills section listing both technical abilities and soft skills relevant to your field.',
        missing: ['Add skills relevant to your target role'],
        irrelevant: [],
      },
    },
    strengths: [
      'Resume has been submitted for analysis',
      ...(hasSummary ? ['Professional summary is present'] : []),
      ...(hasExperience ? ['Work experience section is present'] : []),
      ...(hasEducation ? ['Education section is present'] : []),
      ...(hasSkills ? ['Skills section is present'] : []),
    ].slice(0, 5),
    weaknesses: [
      ...(!hasSummary ? ['Missing professional summary — critical for first impressions'] : []),
      ...(!hasExperience ? ['Missing work experience section'] : []),
      ...(!hasEducation ? ['Missing education section'] : []),
      ...(!hasSkills ? ['Missing skills section — important for ATS and recruiter scanning'] : []),
      'Full AI analysis unavailable — connect to AI service for detailed feedback',
    ].slice(0, 5),
    improvementPlan: [
      ...(!hasSummary ? [{
        priority: 'high' as const,
        section: 'Summary',
        issue: 'No professional summary found',
        suggestion: 'Add a 2-3 sentence professional summary at the top of your resume',
        example: 'Dynamic and detail-oriented Computer Science graduate with hands-on experience in full-stack development. Proven ability to deliver user-focused solutions through internships and academic projects. Seeking to leverage technical skills in a junior developer role.',
      }] : []),
      ...(!hasSkills ? [{
        priority: 'high' as const,
        section: 'Skills',
        issue: 'No skills section found',
        suggestion: 'Add a skills section listing your technical and soft skills',
        example: 'Skills: JavaScript, Python, React, Node.js, SQL, Git, Problem-Solving, Team Collaboration, Communication',
      }] : []),
      {
        priority: 'medium' as const,
        section: 'General',
        issue: 'Full AI analysis is not available',
        suggestion: 'Ensure the AI service is connected for detailed, personalised feedback with an improved resume',
        example: 'Connect to the AI service to get: ATS score breakdown, section-by-section analysis, improved resume, and actionable improvement plan',
      },
    ],
    improvedResume: null,
    keyInsight: hasSummary && hasExperience && hasEducation
      ? 'Your resume has all the key sections — connect to the AI service for a detailed analysis and an improved version!'
      : 'Your resume is missing some key sections. Focus on adding a professional summary, experience, education, and skills to make it stand out!',
  }
}

// ─── API Route Handler ──────────────────────────────────────────────────────

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

    // Check base64 size
    const base64SizeBytes = Math.ceil((fileBase64.length * 3) / 4)
    if (base64SizeBytes > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File is too large. Please upload a resume under 10MB.' },
        { status: 400 }
      )
    }

    // Step 1: Extract text from document (directly — no mini-service)
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

    // Step 2: Try AI analysis with LLM
    let analysis
    try {
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
