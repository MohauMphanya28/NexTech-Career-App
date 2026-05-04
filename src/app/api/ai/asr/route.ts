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

    // Strip data URL prefix if present (e.g., "data:audio/webm;base64,")
    const base64Data = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64

    const response = await zai.audio.asr.create({
      file_base64: base64Data,
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
  } catch (error) {
    console.error('ASR API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}
