import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

/**
 * All available TTS voices from the z-ai-web-dev-sdk
 * - tongtong: 温暖亲切 (Warm and friendly)
 * - chuichui: 活泼可爱 (Lively and cute)
 * - xiaochen: 沉稳专业 (Calm and professional)
 * - jam: 英音绅士 (British gentleman)
 * - kazi: 清晰标准 (Clear and standard)
 * - douji: 自然流畅 (Natural and smooth)
 * - luodo: 富有感染力 (Infectious/expressive)
 */
type TTSVoice = 'tongtong' | 'chuichui' | 'xiaochen' | 'jam' | 'kazi' | 'douji' | 'luodo'

/**
 * Preprocess text for TTS to improve naturalness:
 * - Expand common abbreviations for better pronunciation
 * - Remove JSON artifacts and markdown formatting
 * - Clean up special characters that TTS engines struggle with
 * - Add natural pauses with punctuation where needed
 */
function preprocessTextForTTS(text: string): string {
  let cleaned = text

  // Remove JSON-like artifacts (e.g., {"key": "value"}, [1, 2, 3])
  cleaned = cleaned.replace(/\{[^}]*\}/g, '')
  cleaned = cleaned.replace(/\[[^\]]*\]/g, '')

  // Remove markdown formatting
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1') // bold
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1') // italic
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1') // code
  cleaned = cleaned.replace(/#{1,6}\s/g, '') // headings

  // Remove emoji-like characters that TTS might stumble on
  cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]/gu, '')
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
  cleaned = cleaned.replace(/[\u{1F680}-\u{1F6FF}]/gu, '')

  // Expand common abbreviations for better TTS pronunciation
  const abbreviations: Record<string, string> = {
    "Dr.": "Doctor",
    "Mr.": "Mister",
    "Mrs.": "Misses",
    "Ms.": "Miss",
    "Prof.": "Professor",
    "etc.": "et cetera",
    "e.g.": "for example",
    "i.e.": "that is",
    "CV": "C V",
    "IT": "I T",
    "HR": "H R",
    "CEO": "C E O",
    "CFO": "C F O",
    "CTO": "C T O",
    "MBA": "M B A",
    "PhD": "Ph D",
    "BSc": "B Sc",
    "BA": "B A",
    "MA": "M A",
    "QA": "Q A",
    "KPI": "K P I",
    "B2B": "B to B",
    "B2C": "B to C",
  }

  for (const [abbr, full] of Object.entries(abbreviations)) {
    cleaned = cleaned.replace(new RegExp(`\\b${abbr}\\b`, 'g'), full)
  }

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  // Remove leading/trailing punctuation that doesn't make sense in speech
  cleaned = cleaned.replace(/^[-–—•·]+/, '').trim()

  // Ensure text ends with sentence-ending punctuation for natural TTS pause
  if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
    cleaned += '.'
  }

  return cleaned
}

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
    const {
      text,
      voice = 'kazi',
      speed = 1.2,
      volume = 1.5,
    } = await req.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Preprocess text for more natural TTS output
    const processedText = preprocessTextForTTS(text)

    if (processedText.length === 0) {
      return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 })
    }

    const zai = await getZAI()

    // Clamp parameters to valid ranges
    const clampedSpeed = Math.max(0.5, Math.min(2.0, speed))
    const clampedVolume = Math.max(0.1, Math.min(10.0, volume))

    // Use wav format (the most reliably supported format for the TTS API)
    // If text is within limit, single request
    if (processedText.length <= 1000) {
      const response = await zai.audio.tts.create({
        input: processedText,
        voice: voice as TTSVoice,
        speed: clampedSpeed,
        volume: clampedVolume,
        response_format: 'wav',
        stream: false,
      } as any)

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
    const chunks = splitTextIntoChunks(processedText)
    const audioBuffers: Buffer[] = []

    for (const chunk of chunks) {
      if (chunk.length === 0) continue
      const response = await zai.audio.tts.create({
        input: chunk,
        voice: voice as TTSVoice,
        speed: clampedSpeed,
        volume: clampedVolume,
        response_format: 'wav',
        stream: false,
      } as any)

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
