// DOCX text extraction script - called as a child process
// Usage: node extract-docx.js <base64-encoded-docx>
// Outputs: extracted text to stdout

const mammoth = require('mammoth')

async function main() {
  const base64 = process.argv[2]
  if (!base64) {
    console.error('No base64 input provided')
    process.exit(1)
  }

  try {
    const buffer = Buffer.from(base64, 'base64')
    const result = await mammoth.extractRawText({ buffer })
    process.stdout.write(result.value || '')
  } catch (e) {
    console.error('DOCX extraction error:', e.message)
    process.exit(1)
  }
}

main()
