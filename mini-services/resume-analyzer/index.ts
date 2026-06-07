// Document text extraction service - Node.js/Express version
// Runs on port 3031 as a separate process
// Handles: PDF (via unpdf), DOCX (via mammoth), TXT text extraction
// No Bun dependency — runs with plain Node.js + Express
//
// Usage:
//   npm install          (first time)
//   npm run dev          (development with auto-reload)
//   npm start            (production)

import express from 'express'
import mammoth from 'mammoth'

const app = express()
const PORT = 3031

// Middleware
app.use(express.json({ limit: '15mb' }))

// CORS headers
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

// Handle OPTIONS preflight
app.options('*', (_req, res) => {
  res.status(204).end()
})

// --- Text Extraction Functions ---

async function extractTextFromPdf(base64: string): Promise<string> {
  // Use unpdf — serverless-friendly PDF parser (same as the main Next.js app)
  const { getDocumentProxy, extractText } = await import('unpdf')
  const buffer = Buffer.from(base64, 'base64')
  const uint8 = new Uint8Array(buffer)
  const pdf = await getDocumentProxy(uint8)
  const result = await extractText(pdf)
  return result && Array.isArray(result.text) ? result.text.join('\n') : ''
}

async function extractTextFromDocx(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, 'base64')
  const result = await mammoth.extractRawText({ buffer })
  return result.value || ''
}

function extractTextFromTxt(base64: string): string {
  return Buffer.from(base64, 'base64').toString('utf-8')
}

async function extractText(base64: string, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') return extractTextFromPdf(base64)
  if (mimeType.includes('word') || mimeType.includes('document')) return extractTextFromDocx(base64)
  return extractTextFromTxt(base64)
}

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'resume-analyzer', port: PORT })
})

// --- Main Extraction Endpoint ---
app.post('/', async (req, res) => {
  try {
    const { fileBase64, mimeType } = req.body

    if (!fileBase64 || !mimeType) {
      return res.status(400).json({ error: 'Missing fields' })
    }

    const base64SizeBytes = Math.ceil((fileBase64.length * 3) / 4)
    if (base64SizeBytes > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large' })
    }

    console.log('Extracting text, mimeType:', mimeType)
    const extractedContent = await extractText(fileBase64, mimeType)
    console.log('Extraction complete, length:', extractedContent.length)

    return res.json({ success: true, extractedContent })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Extraction error:', msg)
    return res.status(400).json({
      error: 'Could not read the resume file. Please ensure it is a valid PDF, DOCX, or TXT file.',
    })
  }
})

// --- Start Server ---
const server = app.listen(PORT, () => {
  console.log(`Document Extraction service running on port ${PORT}`)
})

server.on('error', (err: Error) => {
  console.error('Server error:', err)
})

process.on('uncaughtException', (err: Error) => {
  console.error('[FATAL] Uncaught Exception:', err)
})

process.on('unhandledRejection', (reason: unknown) => {
  console.error('[FATAL] Unhandled Rejection:', reason)
})
