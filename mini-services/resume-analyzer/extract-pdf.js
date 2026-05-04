// PDF text extraction script - called as a child process
// Usage: node extract-pdf.js <base64-encoded-pdf>
// Outputs: extracted text to stdout

const { PDFParse } = require('pdf-parse')
const path = require('path')

async function main() {
  const base64 = process.argv[2]
  if (!base64) {
    console.error('No base64 input provided')
    process.exit(1)
  }

  try {
    const buffer = Buffer.from(base64, 'base64')
    const uint8 = new Uint8Array(buffer)
    let opts = {}
    try {
      const p = require.resolve('pdfjs-dist/package.json')
      opts = { standardFontDataUrl: path.join(path.dirname(p), 'standard_fonts') + '/' }
    } catch {}

    const parser = new PDFParse(uint8, opts)
    await parser.load()
    const result = await parser.getText()
    const text = result.text || ''
    process.stdout.write(text)
  } catch (e) {
    console.error('PDF extraction error:', e.message)
    process.exit(1)
  }
}

main()
