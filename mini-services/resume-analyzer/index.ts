// Document text extraction service only - no z-ai-web-dev-sdk
// Runs on port 3031 as a separate process
// Handles: PDF, DOCX, TXT text extraction

import { PDFParse } from 'pdf-parse'
import path from 'path'
import mammoth from 'mammoth'

const PORT = 3031

async function extractTextFromPdf(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, 'base64')
  const uint8 = new Uint8Array(buffer)
  let opts: any = {}
  try {
    const pdfjsDistPath = require.resolve('pdfjs-dist/package.json')
    opts = { standardFontDataUrl: path.join(path.dirname(pdfjsDistPath), 'standard_fonts') + '/' }
  } catch {}
  const parser = new PDFParse(uint8, opts)
  await parser.load()
  const result = await parser.getText()
  return result.text || ''
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

Bun.serve({
  port: PORT,
  async fetch(req) {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
      })
    }

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 })
    }

    try {
      const body = await req.json()
      const { fileBase64, mimeType } = body

      if (!fileBase64 || !mimeType) {
        return Response.json({ error: 'Missing fields' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } })
      }

      const base64SizeBytes = Math.ceil((fileBase64.length * 3) / 4)
      if (base64SizeBytes > 10 * 1024 * 1024) {
        return Response.json({ error: 'File too large' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } })
      }

      console.log('Extracting text, mimeType:', mimeType)
      const extractedContent = await extractText(fileBase64, mimeType)
      console.log('Extraction complete, length:', extractedContent.length)

      return Response.json(
        { success: true, extractedContent },
        { headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    } catch (error: any) {
      console.error('Extraction error:', error.message)
      return Response.json(
        { error: 'Could not read the resume file. Please ensure it is a valid PDF, DOCX, or TXT file.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }
  },
})

console.log(`Document Extraction service running on port ${PORT}`)
