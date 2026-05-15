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
    const { message, context, type } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const zai = await getZAI()

    let systemPrompt = 'You are NexTech, a friendly and supportive AI career mentor for young South African job seekers (ages 15-34). You guide users with warmth, encouragement, and practical advice. Keep responses concise and actionable. Always be supportive but honest.'

    if (type === 'onboarding') {
      systemPrompt = `You are NexTech, a friendly AI career mentor guiding a new user through onboarding. Your role is to give brief, warm encouragement after each answer. Do NOT ask questions — the system handles question flow automatically. Keep responses to 1 short sentence max. Be warm and supportive. South African context: many users are first-time job seekers with limited digital skills.`
    } else if (type === 'resume') {
      systemPrompt = `You are NexTech, an expert ATS-optimized resume writer. Help users create professional, ATS-friendly resumes. Provide specific, actionable suggestions. Format content professionally. South African context: include relevant SA qualifications, use UK English spelling, and consider local industry standards. Keep responses focused and practical.`
    } else if (type === 'cover-letter') {
      systemPrompt = `You are NexTech, an expert cover letter writer. Create tailored, professional cover letters that match job descriptions. Adjust tone as requested (formal, confident, entry-level). Use the user's profile and resume data to personalize content. South African context: professional UK English, local business conventions. Keep letters concise and impactful.`
    } else if (type === 'interview') {
      systemPrompt = `You are NexTech, an expert interview coach conducting a mock interview. Ask one question at a time. After each answer, provide brief constructive feedback on: answer quality, confidence level, and communication clarity. Then ask the next question. Be encouraging but honest. South African context: include questions about local work environments, B-BBEE, and local industry knowledge.`
    }

    const messages = [
      { role: 'assistant' as const, content: systemPrompt },
      ...(context || []).map((m: { role: string; content: string }) => ({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    })

    const response = completion.choices[0]?.message?.content

    return NextResponse.json({ success: true, response })
  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response. Please try again.' },
      { status: 500 }
    )
  }
}
