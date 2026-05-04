import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

interface HistoryEntry {
  role: 'ai' | 'user'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const {
      action,
      industry,
      questionNumber,
      answer,
      totalQuestions,
      interviewerPersonality,
      interviewerName,
      conversationHistory = [],
    } = await req.json()

    const zai = await getZAI()

    // Build personality-aware system prompt
    const personalityInstruction = interviewerPersonality
      ? `${interviewerPersonality} `
      : ''
    const namePrefix = interviewerName ? `Your name is ${interviewerName}. ` : ''

    // Build conversation history messages for context continuity
    const historyMessages: { role: 'assistant' | 'user'; content: string }[] = []
    if (Array.isArray(conversationHistory)) {
      for (const entry of conversationHistory.slice(-10)) { // Keep last 10 exchanges for context
        if (entry.role === 'ai') {
          historyMessages.push({ role: 'assistant', content: entry.content })
        } else if (entry.role === 'user') {
          historyMessages.push({ role: 'user', content: entry.content })
        }
      }
    }

    if (action === 'start') {
      const systemPrompt = `${personalityInstruction}${namePrefix}You are conducting a mock interview for a ${industry || 'general'} position in South Africa.

IMPORTANT CONVERSATION RULES:
- Speak naturally, like a real human interviewer having a conversation — NOT like a robot reading a script.
- Use natural conversational fillers occasionally: "Hmm", "I see", "That's interesting", "Right", "Okay".
- Keep your responses concise and conversational — aim for 2-4 short sentences for feedback, then ask the next question.
- Show genuine reactions to the candidate's answers before giving feedback.
- Vary your sentence structure — don't always start with "Great" or "Good".
- Use contractions naturally: "you're", "that's", "I'd", "let's", "we've".
- Avoid overly formal language unless it fits your personality.
- Transition naturally between feedback and the next question.
- STAY IN CHARACTER: Your accent, dialect, and expressions must be consistent throughout. Never break character or switch to a generic speaking style.

Start by greeting the candidate warmly and asking the first interview question. Ask ONE question at a time. Be professional yet encouraging. Include a mix of behavioral, situational, and technical questions appropriate for the industry.`

      const messages = [
        { role: 'assistant' as const, content: systemPrompt },
        {
          role: 'user' as const,
          content: `Start a mock interview for a ${industry || 'general'} position. This is question 1 of ${totalQuestions || 5}. Greet the candidate and ask the first question.`,
        },
      ]

      const completion = await zai.chat.completions.create({
        messages,
        thinking: { type: 'disabled' },
      })

      const response = completion.choices[0]?.message?.content
      return NextResponse.json({ success: true, question: response, questionNumber: 1 })
    }

    if (action === 'evaluate') {
      const isLastQuestion = questionNumber >= totalQuestions

      const systemPrompt = `${personalityInstruction}${namePrefix}You are an expert interview coach conducting a mock interview.

IMPORTANT CONVERSATION RULES:
- Speak naturally, like a real human interviewer — NOT like a robot reading a script.
- Use natural conversational fillers occasionally: "Hmm", "I see", "That's interesting", "Right", "Okay".
- Show genuine reactions before giving feedback — react like a human would.
- Keep feedback concise and conversational — 2-3 short sentences maximum.
- Use contractions naturally: "you're", "that's", "I'd", "let's", "we've".
- Vary your sentence structure — don't always start with "Great" or "Good".
- Transition smoothly from feedback to the next question.
- STAY IN CHARACTER: Your accent, dialect, and expressions must be consistent throughout. Never break character or switch to a generic speaking style.
${isLastQuestion ? `- This is the LAST question. After giving feedback, provide a warm, encouraging closing summary that acknowledges their effort and highlights one key strength and one area to improve.` : `- After your brief feedback, naturally transition into asking the next question.`}

You MUST format your response as JSON with these fields:
{
  "spokenText": "Your complete natural, conversational response — this is what you SAY to the candidate. Include your reaction, brief feedback, and the next question (or closing if last). Write this exactly as you would speak it — naturally and conversationally.",
  "scores": { "relevance": 0-10, "clarity": 0-10, "confidence": 0-10 },
  "nextQuestion": "Just the next interview question text, or empty string if this is the last question",
  "closingMessage": "A warm closing summary if this is the last question, otherwise omit this field"
}

The spokenText field is CRITICAL — it's what the candidate hears. Make it sound like a real human conversation, not a formal evaluation report.`

      // Build messages with conversation history for context
      const messages: { role: 'assistant' | 'user'; content: string }[] = [
        { role: 'assistant', content: systemPrompt },
        ...historyMessages,
        {
          role: 'user',
          content: `The candidate just answered question ${questionNumber} of ${totalQuestions}:

Their answer: "${answer}"

${isLastQuestion ? 'This was the last question. Give brief feedback and a warm closing summary.' : 'Give brief, natural feedback and ask the next question.'}

Return JSON only.`,
        },
      ]

      const completion = await zai.chat.completions.create({
        messages,
        thinking: { type: 'disabled' },
      })

      let responseText = completion.choices[0]?.message?.content || ''

      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          responseText = jsonMatch[0]
        }
        const parsed = JSON.parse(responseText)

        return NextResponse.json({
          success: true,
          feedback: parsed.spokenText || parsed.feedback || 'Good point. Let me think about the next question.',
          scores: parsed.scores || { relevance: 7, clarity: 7, confidence: 7 },
          nextQuestion: parsed.nextQuestion || '',
          closingMessage: parsed.closingMessage,
          isComplete: isLastQuestion,
        })
      } catch {
        // Fallback — try to construct a reasonable response
        return NextResponse.json({
          success: true,
          feedback: "That's a thoughtful answer. Let me follow up with something else.",
          scores: { relevance: 7, clarity: 7, confidence: 7 },
          nextQuestion: isLastQuestion ? '' : 'Can you tell me about a time you worked in a team to solve a problem?',
          closingMessage: isLastQuestion ? 'Great effort! You showed good communication skills throughout. Keep practicing and you\'ll get even better!' : undefined,
          isComplete: isLastQuestion,
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
