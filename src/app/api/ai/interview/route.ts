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
    const { action, industry, questionNumber, answer, totalQuestions, interviewerPersonality, interviewerName } = await req.json()

    const zai = await getZAI()

    // Build personality-aware system prompt
    const personalityInstruction = interviewerPersonality
      ? `${interviewerPersonality} `
      : ''
    const namePrefix = interviewerName ? `Your name is ${interviewerName}. ` : ''

    if (action === 'start') {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: `${personalityInstruction}${namePrefix}You are conducting a mock interview for a ${industry || 'general'} position in South Africa. Start by greeting the candidate warmly and asking the first interview question. Ask ONE question at a time. Be professional yet encouraging. Include a mix of behavioral, situational, and technical questions appropriate for the industry.`
          },
          {
            role: 'user',
            content: `Start a mock interview for a ${industry || 'general'} position. This is question 1 of ${totalQuestions || 5}. Greet the candidate and ask the first question.`
          }
        ],
        thinking: { type: 'disabled' },
      })

      const response = completion.choices[0]?.message?.content
      return NextResponse.json({ success: true, question: response, questionNumber: 1 })
    }

    if (action === 'evaluate') {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: `${personalityInstruction}${namePrefix}You are an expert interview coach. Evaluate the candidate's answer briefly and constructively, then ask the next question. Format your response as JSON: { "feedback": "brief constructive feedback, 2-3 sentences", "scores": { "relevance": 0-10, "clarity": 0-10, "confidence": 0-10 }, "nextQuestion": "the next interview question" }. If this is the last question, set nextQuestion to empty string and include a "closingMessage" field with encouraging final feedback.`
          },
          {
            role: 'user',
            content: `The candidate answered question ${questionNumber} of ${totalQuestions}:

Their answer: "${answer}"

Evaluate this answer and ${questionNumber >= totalQuestions ? 'provide a closing summary with overall feedback.' : 'ask the next question.'}

Return JSON only.`
          }
        ],
        thinking: { type: 'disabled' },
      })

      let response = completion.choices[0]?.message?.content || ''

      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          response = jsonMatch[0]
        }
        const parsed = JSON.parse(response)
        return NextResponse.json({
          success: true,
          feedback: parsed.feedback,
          scores: parsed.scores,
          nextQuestion: parsed.nextQuestion,
          closingMessage: parsed.closingMessage,
          isComplete: questionNumber >= totalQuestions,
        })
      } catch {
        return NextResponse.json({
          success: true,
          feedback: 'Thank you for your answer. Let me think about the next question.',
          scores: { relevance: 7, clarity: 7, confidence: 7 },
          nextQuestion: questionNumber < totalQuestions ? 'Can you tell me about a time you worked in a team to solve a problem?' : '',
          closingMessage: questionNumber >= totalQuestions ? 'Great effort! You showed good communication skills. Keep practicing!' : undefined,
          isComplete: questionNumber >= totalQuestions,
        })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Interview error:', error)
    return NextResponse.json(
      { error: 'Failed to process interview request' },
      { status: 500 }
    )
  }
}
