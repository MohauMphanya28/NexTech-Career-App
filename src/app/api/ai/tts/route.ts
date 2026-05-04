import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

/**
 * Split text into chunks of max 1000 characters at sentence boundaries
 * to stay within the 1024-char TTS API limit
 */
function splitTextIntoChunks(text: string, maxLength = 1000): string[] {
  const chunks: string[] = []
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

  let currentChunk = ''
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence
    } else {
      if (currentChunk) chunks.push(currentChunk.trim())
      currentChunk = sentence
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim())

  return chunks
}

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'kazi', speed = 1.0 } = await req.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const trimmedText = text.trim()
    if (trimmedText.length === 0) {
      return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 })
    }

    const zai = await getZAI()

    // If text is within limit, single request
    if (trimmedText.length <= 1000) {
      const response = await zai.audio.tts.create({
        input: trimmedText,
        voice: voice as 'kazi',
        speed: Math.max(0.5, Math.min(2.0, speed)),
        response_format: 'wav',
        stream: false,
      })

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(new Uint8Array(arrayBuffer))

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/wav',
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    // For longer text, split into chunks and concatenate
    const chunks = splitTextIntoChunks(trimmedText)
    const audioBuffers: Buffer[] = []

    for (const chunk of chunks) {
      if (chunk.length === 0) continue
      const response = await zai.audio.tts.create({
        input: chunk,
        voice: voice as 'kazi',
        speed: Math.max(0.5, Math.min(2.0, speed)),
        response_format: 'wav',
        stream: false,
      })

      const arrayBuffer = await response.arrayBuffer()
      audioBuffers.push(Buffer.from(new Uint8Array(arrayBuffer)))
    }

    const combinedBuffer = Buffer.concat(audioBuffers)

    return new NextResponse(combinedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': combinedBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('TTS API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate speech' },
      { status: 500 }
    )
  }
}
