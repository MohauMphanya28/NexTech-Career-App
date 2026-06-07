import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

// ─── Timeout helper ──────────────────────────────────────────────────────────
// Wraps a promise with a timeout so we fail fast when the AI service is
// unreachable (e.g. ConnectTimeoutError) instead of hanging indefinitely.

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    promise
      .then((val) => { clearTimeout(timer); resolve(val) })
      .catch((err) => { clearTimeout(timer); reject(err) })
  })
}

// ─── Request Queue ──────────────────────────────────────────────────────────
// Prevents overwhelming the ASR API by processing one request at a time.
// If the queue exceeds MAX_QUEUE_SIZE, new requests receive HTTP 429.

let activeAsrRequests = 0
const MAX_CONCURRENT_ASR = 1
const MAX_QUEUE_SIZE = 5
const pendingQueue: Array<{ resolve: () => void; reject: (error: Error) => void }> = []

function enqueueAsrRequest(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (activeAsrRequests < MAX_CONCURRENT_ASR) {
      activeAsrRequests++
      resolve()
    } else if (pendingQueue.length < MAX_QUEUE_SIZE) {
      pendingQueue.push({ resolve, reject })
    } else {
      reject(new Error('Too many concurrent requests'))
    }
  })
}

function dequeueAsrRequest() {
  activeAsrRequests--
  const next = pendingQueue.shift()
  if (next) {
    activeAsrRequests++
    next.resolve()
  }
}

// ─── ASR with Retry ────────────────────────────────────────────────────────
// Retries transient ASR SDK errors with exponential backoff.
// Non-retryable errors (format/duration) are thrown immediately.

async function asrWithRetry(zai: any, base64Data: string, maxRetries = 1, baseDelay = 1000): Promise<any> {
  let lastError: any
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Wrap each ASR call in a timeout so we don't hang on network issues
      return await withTimeout(
        zai.audio.asr.create({
          file_base64: base64Data,
          format: 'wav',
        } as any),
        15000, // 15s timeout per ASR attempt
        'ASR API call'
      )
    } catch (error: any) {
      lastError = error
      const msg = error?.message || String(error)

      // Don't retry on timeout, format/duration errors — these aren't transient
      if (
        msg.includes('timed out') ||
        msg.includes('unsupported') ||
        msg.includes('时长限制') ||
        /duration.*limit/i.test(msg)
      ) {
        throw error
      }
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        console.warn(`ASR retry ${attempt + 1}/${maxRetries} after ${delay}ms:`, msg)
        await new Promise(r => setTimeout(r, delay))
      }
    }
  }
  throw lastError
}

export async function POST(req: NextRequest) {
  try {
    const { audioBase64 } = await req.json()

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return NextResponse.json({ error: 'Audio base64 data is required' }, { status: 400 })
    }

    // Enqueue request — returns 429 if queue is too long
    try {
      await enqueueAsrRequest()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a moment and try again.', isEmpty: true },
        { status: 429 },
      )
    }

    // Initialize ZAI with timeout — fail fast if the SDK can't connect
    let zai: Awaited<ReturnType<typeof ZAI.create>>
    try {
      zai = await withTimeout(getZAI(), 5000, 'ZAI initialization')
    } catch (initError) {
      console.error('ASR ZAI init failed:', initError)
      return NextResponse.json(
        {
          success: false,
          error: 'Speech recognition service is currently unavailable. Please use text input instead.',
          isEmpty: true,
          fallback: 'text',
        },
        { status: 503 },
      )
    }

    // Strip data URL prefix if present (e.g., "data:audio/wav;base64,")
    // Note: Client-side now converts to WAV before sending, so format should be detectable
    const base64Data = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64

    try {
      const response = await asrWithRetry(zai, base64Data)

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

      // If the error is about timeout (service unreachable)
      if (errorMessage.includes('timed out')) {
        console.error('ASR service timed out:', errorMessage)
        return NextResponse.json({
          success: false,
          error: 'Speech recognition timed out. Please try again or use text input.',
          isEmpty: true,
          fallback: 'text',
        }, { status: 503 })
      }

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
  } finally {
    dequeueAsrRequest()
  }
}
