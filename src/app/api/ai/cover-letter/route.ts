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
    const { jobTitle, company, jobDescription, userProfile, tone, resumeData } = await req.json()

    const zai = await getZAI()

    const toneDescriptions: Record<string, string> = {
      formal: 'highly professional and formal',
      confident: 'confident and assertive, showing strong belief in abilities',
      'entry-level': 'enthusiastic and eager to learn, suitable for first-time job seekers',
      warm: 'warm and personable while remaining professional',
      concise: 'brief, direct, and impactful',
    }

    const selectedTone = toneDescriptions[tone] || toneDescriptions.formal

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `You are an expert cover letter writer. Create a compelling, personalized cover letter that matches the job description and highlights the candidate's relevant skills and experience. Use UK English spelling. South African professional standards.`
        },
        {
          role: 'user',
          content: `Write a cover letter with a ${selectedTone} tone for:

Position: ${jobTitle}
Company: ${company}
Job Description: ${jobDescription}

Candidate Profile:
${userProfile ? JSON.stringify(userProfile) : 'No profile data available'}

Resume Summary:
${resumeData?.summary || 'No resume data'}

Key Skills: ${resumeData?.skills?.join(', ') || 'Not specified'}
Experience: ${resumeData?.experience?.map((e: { title: string; company: string; description: string }) => `${e.title} at ${e.company}: ${e.description}`).join('; ') || 'Not specified'}

Write a complete, professional cover letter (300-400 words) that:
1. Opens with a strong hook
2. Connects their experience to the job requirements
3. Shows enthusiasm for the company
4. Closes with a confident call to action

Return only the cover letter text, properly formatted.`
        }
      ],
      thinking: { type: 'disabled' },
    })

    const response = completion.choices[0]?.message?.content

    return NextResponse.json({ success: true, coverLetter: response })
  } catch (error) {
    console.error('Cover letter generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate cover letter' },
      { status: 500 }
    )
  }
}
