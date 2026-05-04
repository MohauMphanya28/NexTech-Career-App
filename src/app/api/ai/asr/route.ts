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
    const { audioBase64 } = await req.json()

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return NextResponse.json({ error: 'Audio base64 data is required' }, { status: 400 })
    }

    const zai = await getZAI()

    // Strip data URL prefix if present (e.g., "data:audio/wav;base64,")
    // Note: Client-side now converts to WAV before sending, so format should be detectable
    const base64Data = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64

    try {
      const response = await zai.audio.asr.create({
        file_base64: base64Data,
        format: 'wav',
      })

      const transcription = response.text || ''

      if (!transcription.trim()) {
        return NextResponse.json({
          success: true,
          transcription: '',
          isEmpty: true,
        })
      }

      return NextResponse.json({
        success: true,
        transcription: transcription.trim(),
        isEmpty: false,
      })
    } catch (asrError: unknown) {
      const errorMessage = asrError instanceof Error ? asrError.message : String(asrError)

      // If the error is about unsupported format
      if (errorMessage.includes('unsupported audio format') || errorMessage.includes('unknown')) {
        console.error('ASR format detection failed. Error:', errorMessage)
        return NextResponse.json({
          success: false,
          error: 'Audio format not recognized. Please try recording again or use text input.',
          isEmpty: true,
        }, { status: 400 })
      }

      // If duration exceeds 30 seconds
      if (errorMessage.includes('时长限制') || /duration.*limit/i.test(errorMessage) || /30\s*sec/i.test(errorMessage)) {
        return NextResponse.json({
          success: false,
          error: 'Recording too long. Please keep answers under 25 seconds.',
          isEmpty: true,
        }, { status: 400 })
      }

      // Re-throw other errors
      throw asrError
    }
  } catch (error) {
    console.error('ASR API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transcribe audio',
        isEmpty: true,
      },
      { status: 500 }
    )
  }
}
