import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

/**
 * Concatenate multiple WAV buffers into a single valid WAV file.
 * Strips headers from all chunks except the first, then updates the RIFF size.
 */
function concatWavBuffers(buffers: Buffer[]): Buffer {
  if (buffers.length === 0) return Buffer.alloc(0)
  if (buffers.length === 1) return buffers[0]

  // WAV header is 44 bytes (standard PCM)
  const HEADER_SIZE = 44

  // Collect data sections (skip headers from chunk 1 onward)
  const dataSections: Buffer[] = []
  let totalDataSize = 0

  for (let i = 0; i < buffers.length; i++) {
    if (i === 0) {
      // First chunk: we'll replace its header later
      const dataLen = buffers[i].length - HEADER_SIZE
      dataSections.push(buffers[i].subarray(HEADER_SIZE))
      totalDataSize += dataLen
    } else {
      // Subsequent chunks: strip the header
      const dataLen = buffers[i].length - HEADER_SIZE
      if (dataLen > 0) {
        dataSections.push(buffers[i].subarray(HEADER_SIZE))
        totalDataSize += dataLen
      }
    }
  }

  // Build new WAV file from the first chunk's header
  const firstHeader = buffers[0].subarray(0, HEADER_SIZE)
  const result = Buffer.alloc(HEADER_SIZE + totalDataSize)
  firstHeader.copy(result, 0)

  // Update RIFF chunk size (offset 4): total file size - 8
  result.writeUInt32LE(totalDataSize + HEADER_SIZE - 8, 4)

  // Update data sub-chunk size (offset 40)
  result.writeUInt32LE(totalDataSize, 40)

  // Copy data sections
  let offset = HEADER_SIZE
  for (const section of dataSections) {
    section.copy(result, offset)
    offset += section.length
  }

  return result
}

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

    // Use wav format (the most reliably supported format for the TTS API)
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

    // For longer text, split into chunks and concatenate as valid WAV
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

    // Properly concatenate WAV files (strip headers from subsequent chunks)
    const combinedBuffer = concatWavBuffers(audioBuffers)

    return new NextResponse(combinedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
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
