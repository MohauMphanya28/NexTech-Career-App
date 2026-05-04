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
    const { personalInfo, summary, experience, education, skills, template } = await req.json()

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
      return NextResponse.json({ success: true, resume: parsed })
    } catch {
      return NextResponse.json({
        success: true,
        resume: {
          personalInfo,
          summary: summary || 'Professional seeking new opportunities',
          experience: experience || [],
          education: education || [],
          skills: skills || [],
          atsScore: 65,
          suggestions: ['Add a professional summary', 'Include quantifiable achievements', 'Add more relevant skills']
        }
      })
    }
  } catch (error) {
    console.error('Resume generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    )
  }
}
