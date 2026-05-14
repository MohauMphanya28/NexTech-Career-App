import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { personalInfo, summary, experience, education, skills, template } = body

    if (!personalInfo) {
      return NextResponse.json(
        { error: 'Personal information is required.' },
        { status: 400 }
      )
    }

    // Try AI-powered generation
    try {
      const zai = await getZAI()

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: `You are an expert ATS-optimized resume formatter. Given raw resume data, generate a polished, professional resume in structured JSON format. Improve wording, fix grammar, optimize for ATS scanning, and ensure South African professional standards. Output valid JSON only.`
          },
          {
            role: 'user',
            content: `Generate a professional ATS-optimized resume from this data. Template style: ${template || 'modern'}.

Personal Info: ${JSON.stringify(personalInfo)}
Summary: ${summary || 'Generate a compelling professional summary based on the experience and skills'}
Experience: ${JSON.stringify(experience)}
Education: ${JSON.stringify(education)}
Skills: ${JSON.stringify(skills)}

Output a JSON object with these fields:
{
  "personalInfo": { "fullName", "email", "phone", "location", "linkedin" },
  "summary": "polished professional summary, 2-3 sentences",
  "experience": [{ "title", "company", "period", "description": "with action verbs and quantifiable achievements" }],
  "education": [{ "degree", "institution", "year" }],
  "skills": ["categorized skills list"],
  "atsScore": 0-100 score,
  "suggestions": ["list of improvement suggestions"]
}`
          }
        ],
        thinking: { type: 'disabled' },
      })

      let response = completion.choices[0]?.message?.content || ''

      // Extract JSON from response if wrapped in markdown
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        response = jsonMatch[0]
      }

      try {
        const parsed = JSON.parse(response)
        if (parsed.personalInfo || parsed.summary) {
          return NextResponse.json({ success: true, resume: parsed })
        }
      } catch {
        // JSON parse failed, fall through to fallback
      }
    } catch (sdkError) {
      console.error('Resume generation SDK error:', sdkError)
      // Fall through to fallback
    }

    // Fallback: Return user's data formatted nicely with a basic ATS score
    const fallbackResume = {
      personalInfo: {
        fullName: personalInfo.fullName || '',
        email: personalInfo.email || '',
        phone: personalInfo.phone || '',
        location: personalInfo.location || '',
        linkedin: personalInfo.linkedin || '',
      },
      summary: summary || 'Professional seeking new opportunities in the South African job market.',
      experience: (experience || []).map((e: { title?: string; company?: string; period?: string; description?: string }) => ({
        title: e.title || '',
        company: e.company || '',
        period: e.period || '',
        description: e.description || '',
      })),
      education: (education || []).map((e: { degree?: string; institution?: string; year?: string }) => ({
        degree: e.degree || '',
        institution: e.institution || '',
        year: e.year || '',
      })),
      skills: skills || [],
      atsScore: 60,
      suggestions: [
        'Add a professional summary to make a strong first impression',
        'Include quantifiable achievements in your experience descriptions',
        'Add more relevant skills for your target role',
        'Use action verbs to start bullet points',
        'Try generating again for AI-enhanced content',
      ],
    }

    return NextResponse.json({ success: true, resume: fallbackResume })
  } catch (error) {
    console.error('Resume generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate resume. Please check your input and try again.' },
      { status: 500 }
    )
  }
}
