import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null
let zaiInitPromise: Promise<Awaited<ReturnType<typeof ZAI.create>>> | null = null
let zaiInitFailed = false
// Track whether the AI chat service is reachable — once a call fails,
// skip AI calls for the next 60 seconds to avoid the 10s timeout penalty
let aiServiceDown = false
let aiServiceDownSince = 0
const AI_SERVICE_COOLDOWN_MS = 60_000 // 1 minute

function isAiServiceAvailable(): boolean {
  if (!aiServiceDown) return true
  // Check if cooldown has elapsed — try again after 60s
  if (Date.now() - aiServiceDownSince > AI_SERVICE_COOLDOWN_MS) {
    aiServiceDown = false
    return true
  }
  return false
}

function markAiServiceDown() {
  aiServiceDown = true
  aiServiceDownSince = Date.now()
}

async function getZAI(): Promise<Awaited<ReturnType<typeof ZAI.create>> | null> {
  // If we already know init fails, don't retry every request
  if (zaiInitFailed) return null
  if (zaiInstance) return zaiInstance
  // Deduplicate concurrent init calls
  if (!zaiInitPromise) {
    zaiInitPromise = ZAI.create().then((z) => {
      zaiInstance = z
      zaiInitFailed = false
      return z
    }).catch((err) => {
      // Mark as failed so subsequent requests skip the slow init
      zaiInitFailed = true
      zaiInitPromise = null
      console.warn('ZAI init failed:', err instanceof Error ? err.message : String(err))
      return null
    })
  }
  return zaiInitPromise
}

// Start ZAI init in the background (non-blocking)
function warmUpZAI() {
  if (!zaiInstance && !zaiInitPromise && !zaiInitFailed) {
    getZAI() // fire and forget — result is cached for later
  }
}

// ─── Timeout helper ──────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    promise
      .then((val) => { clearTimeout(timer); resolve(val) })
      .catch((err) => { clearTimeout(timer); reject(err) })
  })
}

interface HistoryEntry {
  role: 'ai' | 'user'
  content: string
}

// ─── Fallback Questions ─────────────────────────────────────────────────────
// Used when the AI service is unreachable so the interview still works.

const FALLBACK_QUESTIONS: Record<string, string[]> = {
  Technology: [
    "Welcome! Let's get started. Can you tell me about yourself and why you're interested in a career in technology?",
    "Describe a technical challenge you've faced and how you solved it.",
    "How do you stay current with emerging technologies and industry trends?",
    "Tell me about a time you had to learn a new technology quickly. How did you approach it?",
    "How do you handle disagreements with teammates about technical decisions?",
    "Describe your experience with agile methodologies or project management frameworks.",
    "What's the most interesting project you've worked on, and what was your role?",
    "How do you approach debugging a complex issue in production?",
    "Tell me about a time you received critical feedback. How did you respond?",
    "Where do you see yourself in the tech industry in five years?",
  ],
  Finance: [
    "Welcome! Let's get started. Can you tell me about yourself and why you're interested in a career in finance?",
    "How do you stay updated on financial markets and economic trends?",
    "Describe a time when you had to analyse complex data to make a decision.",
    "How would you explain a complex financial concept to someone without a finance background?",
    "Tell me about a time you had to meet a tight deadline. How did you manage?",
    "What do you consider the biggest challenge facing the financial industry today?",
    "Describe a situation where attention to detail was critical to your success.",
    "How do you handle ethical dilemmas in a professional setting?",
    "Tell me about a time you worked in a team to achieve a financial goal.",
    "Where do you see your career in finance heading in the next five years?",
  ],
  Healthcare: [
    "Welcome! Let's get started. Can you tell me about yourself and why you're interested in healthcare?",
    "How do you handle high-pressure situations or emergencies?",
    "Describe a time when you had to communicate difficult information to someone.",
    "What does patient-centred care mean to you?",
    "How do you stay current with medical advancements and best practices?",
    "Tell me about a time you had to work with a difficult patient or colleague.",
    "How would you handle a situation where you disagreed with a superior's clinical decision?",
    "Describe your approach to maintaining work-life balance in a demanding field.",
    "What do you think is the biggest challenge in healthcare today?",
    "Where do you see yourself making the biggest impact in healthcare?",
  ],
  Retail: [
    "Welcome! Let's get started. Tell me about yourself and why you're interested in retail.",
    "How do you handle difficult customers or complaints?",
    "Describe a time you went above and beyond for a customer.",
    "How do you stay motivated during busy or stressful periods?",
    "Tell me about a time you worked as part of a team to achieve a sales target.",
    "How would you deal with a situation where a product was out of stock but a customer insisted?",
    "What strategies would you use to increase sales in a slow period?",
    "Describe a time you had to learn a new process quickly.",
    "How do you prioritise tasks when everything seems urgent?",
    "What does excellent customer service mean to you?",
  ],
  Government: [
    "Welcome! Let's get started. Can you tell me about yourself and your interest in public service?",
    "How do you handle working within strict regulations and procedures?",
    "Describe a time you had to serve the public or your community.",
    "How would you handle a situation where a member of the public was frustrated with government processes?",
    "What does accountability mean to you in a public service role?",
    "Tell me about a time you had to adapt to a significant policy change.",
    "How do you maintain objectivity when dealing with sensitive issues?",
    "Describe your experience working with diverse communities.",
    "How do you balance efficiency with following proper procedures?",
    "What motivates you to work in the public sector?",
  ],
  Education: [
    "Welcome! Let's get started. Tell me about yourself and why you want to work in education.",
    "How do you adapt your teaching style for different learning needs?",
    "Describe a time you helped someone understand a difficult concept.",
    "How do you handle disruptive behaviour in a learning environment?",
    "What's your approach to giving constructive feedback?",
    "Tell me about a time you had to be creative to solve a problem.",
    "How do you stay updated on educational best practices?",
    "Describe your experience working with diverse groups of learners.",
    "How would you handle a situation where a learner was struggling despite your best efforts?",
    "What impact do you hope to have in education?",
  ],
  Engineering: [
    "Welcome! Let's get started. Can you tell me about yourself and your interest in engineering?",
    "Describe a technical problem you've solved and your approach.",
    "How do you ensure safety and quality in your work?",
    "Tell me about a time you had to work under a tight project deadline.",
    "How do you approach troubleshooting a complex system failure?",
    "Describe your experience working in multidisciplinary teams.",
    "How do you balance innovation with following established standards?",
    "Tell me about a project that didn't go as planned. What did you learn?",
    "How do you communicate technical concepts to non-technical stakeholders?",
    "Where do you see the engineering field heading in the next decade?",
  ],
  Creative: [
    "Welcome! Let's get started. Tell me about yourself and your creative background.",
    "How do you stay inspired and come up with fresh ideas?",
    "Describe a creative project you're particularly proud of.",
    "How do you handle creative differences with clients or teammates?",
    "What's your process for taking a brief from concept to finished work?",
    "Tell me about a time you had to adapt your creative vision based on feedback.",
    "How do you balance creativity with meeting business objectives?",
    "Describe how you manage multiple projects with competing deadlines.",
    "What trends in the creative industry excite you right now?",
    "Where do you see your creative career heading?",
  ],
  General: [
    "Welcome! Let's get started. Can you tell me about yourself and what kind of role you're looking for?",
    "What are your greatest strengths and how have they helped you?",
    "Describe a challenge you've overcome and what you learned from it.",
    "Where do you see yourself in five years?",
    "Tell me about a time you worked effectively as part of a team.",
    "How do you handle pressure and stressful situations?",
    "Describe a time you showed leadership, even without a formal title.",
    "What motivates you to do your best work?",
    "Tell me about a time you had to learn something new quickly.",
    "Why should we hire you for this position?",
  ],
}

const DEFAULT_FEEDBACK = [
  "That's a solid answer. You communicated your point clearly.",
  "Good response. I can see you've thought about this.",
  "I appreciate that perspective. You make a valid point.",
  "Interesting answer. Let me follow up on something.",
  "That's a thoughtful response. Well articulated.",
]

const DEFAULT_TIPS = [
  "Try to include specific examples to back up your points.",
  "Consider using the STAR method: Situation, Task, Action, Result.",
  "Practice being more concise — aim for 60-90 seconds per answer.",
  "Show enthusiasm! Let your passion for the role come through.",
  "Don't forget to connect your answers back to the role you're applying for.",
]

function getFallbackQuestion(industry: string, questionNumber: number): string {
  const questions = FALLBACK_QUESTIONS[industry] || FALLBACK_QUESTIONS['General']
  const index = (questionNumber - 1) % questions.length
  return questions[index]
}

function getFallbackFeedback(questionNum: number): string {
  return DEFAULT_FEEDBACK[questionNum % DEFAULT_FEEDBACK.length]
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
      candidateContext = null,
    } = await req.json()

    // Try to get ZAI — returns null quickly if previously failed
    // Start background warmup for next request
    warmUpZAI()

    const zai = await getZAI()
    const aiAvailable = zai !== null && isAiServiceAvailable()

    // Build candidate context text if available
    let candidateContextText = ''
    if (candidateContext) {
      const ctx = candidateContext as {
        jobTitle?: string
        company?: string
        summary?: string
        skills?: string[]
        experience?: Array<{ title: string; company: string; period: string; description: string }>
        education?: Array<{ degree: string; institution: string; year: string }>
        hasCoverLetter?: boolean
        coverLetterJobTitle?: string
        coverLetterCompany?: string
      }
      const parts: string[] = []
      if (ctx.jobTitle) parts.push(`- Target Job Title: ${ctx.jobTitle}`)
      if (ctx.company) parts.push(`- Target Company: ${ctx.company}`)
      if (ctx.summary) parts.push(`- Summary: ${ctx.summary}`)
      if (ctx.skills && ctx.skills.length > 0) parts.push(`- Key Skills: ${ctx.skills.join(', ')}`)
      if (ctx.experience && ctx.experience.length > 0) {
        const expLines = ctx.experience.map(e => `  * ${e.title} at ${e.company} (${e.period})`).join('\n')
        parts.push(`- Experience:\n${expLines}`)
      }
      if (ctx.education && ctx.education.length > 0) {
        const eduLines = ctx.education.map(e => `  * ${e.degree} from ${e.institution} (${e.year})`).join('\n')
        parts.push(`- Education:\n${eduLines}`)
      }
      if (ctx.hasCoverLetter) {
        const clTarget = ctx.coverLetterJobTitle || ctx.jobTitle || 'the role'
        const clCompany = ctx.coverLetterCompany || ctx.company || 'the company'
        parts.push(`- Has prepared a cover letter: Yes, for ${clTarget} at ${clCompany}`)
      }
      if (parts.length > 0) {
        candidateContextText = `\nCANDIDATE CONTEXT:\n${parts.join('\n')}\n\nIMPORTANT: Use this context to tailor your questions specifically to this candidate's background and career goals. Ask questions relevant to their target role and company. If they have no experience in the field, acknowledge this and ask about transferable skills and motivation.\n`
      }
    }

    // Build personality-aware system prompt
    const personalityInstruction = interviewerPersonality
      ? `${interviewerPersonality} `
      : ''
    const namePrefix = interviewerName ? `Your name is ${interviewerName}. ` : ''

    if (action === 'start') {
      // ─── Fallback: AI unavailable ──────────────────────────────────────
      if (!aiAvailable || !zai) {
        const question = getFallbackQuestion(industry || 'General', 1)
        // Add personality flavor to the fallback question
        const personalizedQuestion = interviewerName
          ? question.replace("Welcome! Let's get started.", `Hey there! I'm ${interviewerName}, and I'll be your interview coach today.`)
          : question
        return NextResponse.json({
          success: true,
          question: personalizedQuestion,
          questionNumber: 1,
          fallback: true,
        })
      }

      // ─── AI Available ──────────────────────────────────────────────────
      const systemPrompt = `${personalityInstruction}${namePrefix}You are conducting a mock interview for a ${industry || 'general'} position in South Africa.
${candidateContextText}
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

      try {
        const completion = await withTimeout(
          zai.chat.completions.create({
            messages,
            thinking: { type: 'disabled' },
          }),
          15000,
          'Interview start AI call'
        )

        const response = completion.choices[0]?.message?.content
        return NextResponse.json({ success: true, question: response, questionNumber: 1 })
      } catch (aiError) {
        console.warn('Interview start AI call failed, using fallback:', aiError instanceof Error ? aiError.message : String(aiError))
        markAiServiceDown()
        const question = getFallbackQuestion(industry || 'General', 1)
        const personalizedQuestion = interviewerName
          ? question.replace("Welcome! Let's get started.", `Hey there! I'm ${interviewerName}, and I'll be your interview coach today.`)
          : question
        return NextResponse.json({
          success: true,
          question: personalizedQuestion,
          questionNumber: 1,
          fallback: true,
        })
      }
    }

    if (action === 'evaluate') {
      const isLastQuestion = questionNumber >= totalQuestions

      // ─── Fallback: AI unavailable ──────────────────────────────────────
      if (!aiAvailable || !zai) {
        const feedback = getFallbackFeedback(questionNumber)
        const nextQuestion = isLastQuestion ? '' : getFallbackQuestion(industry || 'General', questionNumber + 1)
        const closingMessage = isLastQuestion
          ? "That wraps up our session! You've done well. Keep practicing and you'll keep improving. Good luck with your interviews!"
          : undefined

        // Generate reasonable scores (slight variation for realism)
        const baseScore = 5 + Math.floor(Math.random() * 3) // 5-7
        const variation = () => Math.max(3, Math.min(9, baseScore + Math.floor(Math.random() * 3) - 1))

        return NextResponse.json({
          success: true,
          feedback: isLastQuestion ? closingMessage : `${feedback} ${nextQuestion ? `Now, ${nextQuestion}` : ''}`,
          scores: { relevance: variation(), clarity: variation(), confidence: variation() },
          nextQuestion,
          closingMessage,
          isComplete: isLastQuestion,
          fallback: true,
        })
      }

      // ─── AI Available ──────────────────────────────────────────────────
      // Build candidate context reminder for evaluate
      let evaluateContextReminder = ''
      if (candidateContext) {
        const ctx = candidateContext as { jobTitle?: string; company?: string }
        const jobTitle = ctx.jobTitle || 'the role'
        const company = ctx.company || 'the company'
        evaluateContextReminder = `\nRemember: This candidate is targeting a ${jobTitle} role at ${company}. Evaluate their answers in the context of this specific role.\n`
      }

      const systemPrompt = `${personalityInstruction}${namePrefix}You are an expert interview coach conducting a mock interview.
${evaluateContextReminder}
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

      // Build conversation history messages for context continuity
      const historyMessages: { role: 'assistant' | 'user'; content: string }[] = []
      if (Array.isArray(conversationHistory)) {
        for (const entry of conversationHistory.slice(-10)) {
          if (entry.role === 'ai') {
            historyMessages.push({ role: 'assistant', content: entry.content })
          } else if (entry.role === 'user') {
            historyMessages.push({ role: 'user', content: entry.content })
          }
        }
      }

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

      try {
        const completion = await withTimeout(
          zai.chat.completions.create({
            messages,
            thinking: { type: 'disabled' },
          }),
          20000,
          'Interview evaluate AI call'
        )

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
      } catch (aiError) {
        console.warn('Interview evaluate AI call failed, using fallback:', aiError instanceof Error ? aiError.message : String(aiError))
        markAiServiceDown()
        // AI call failed — use fallback
        const feedback = getFallbackFeedback(questionNumber)
        const nextQuestion = isLastQuestion ? '' : getFallbackQuestion(industry || 'General', questionNumber + 1)
        const closingMessage = isLastQuestion
          ? "That wraps up our session! You've done well. Keep practicing and you'll keep improving. Good luck with your interviews!"
          : undefined

        const baseScore = 5 + Math.floor(Math.random() * 3)
        const variation = () => Math.max(3, Math.min(9, baseScore + Math.floor(Math.random() * 3) - 1))

        return NextResponse.json({
          success: true,
          feedback: isLastQuestion ? closingMessage : `${feedback} ${nextQuestion ? `Now, ${nextQuestion}` : ''}`,
          scores: { relevance: variation(), clarity: variation(), confidence: variation() },
          nextQuestion,
          closingMessage,
          isComplete: isLastQuestion,
          fallback: true,
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
