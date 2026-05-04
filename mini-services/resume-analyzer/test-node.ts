import { createServer } from 'http'
import ZAI from 'z-ai-web-dev-sdk'
import { PDFParse } from 'pdf-parse'
import path from 'path'

const PORT = 3031

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

const server = createServer(async (req, res) => {
  console.log('Request received:', req.method)
  
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.writeHead(405)
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  try {
    let body = ''
    for await (const chunk of req) {
      body += chunk
    }
    const { fileBase64, mimeType, jobTarget } = JSON.parse(body)
    console.log('Body parsed, mimeType:', mimeType)

    if (!fileBase64 || !mimeType) {
      res.writeHead(400)
      res.end(JSON.stringify({ error: 'Missing fields' }))
      return
    }

    // Extract text
    let extractedContent = ''
    if (mimeType === 'text/plain') {
      extractedContent = Buffer.from(fileBase64, 'base64').toString('utf-8')
    } else if (mimeType === 'application/pdf') {
      console.log('Parsing PDF...')
      const buffer = Buffer.from(fileBase64, 'base64')
      const uint8 = new Uint8Array(buffer)
      let standardFontDataUrl: string | undefined
      try {
        const pdfjsDistPath = require.resolve('pdfjs-dist/package.json')
        standardFontDataUrl = path.join(path.dirname(pdfjsDistPath), 'standard_fonts') + '/'
      } catch {}
      const parser = new PDFParse(uint8, standardFontDataUrl ? { standardFontDataUrl } : {})
      await parser.load()
      const result = await parser.getText()
      extractedContent = result.text || ''
      console.log('PDF parsed, text length:', extractedContent.length)
    }

    console.log('Extracted text:', extractedContent.substring(0, 100))

    // Analyze with LLM
    console.log('Calling LLM...')
    const zai = await getZAI()
    const analysisResponse = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'You are a resume analyst. Return valid JSON only.' },
        { role: 'user', content: `Analyze this resume text and return a JSON with: overallScore, atsCompatibility:{score,issues:[],tips:[]}, contentAnalysis:{summary:{score,feedback,hasSummary},experience:{score,feedback,issues:[],strengths:[]},education:{score,feedback,issues:[],strengths:[]},skills:{score,feedback,missing:[],irrelevant:[]}}, strengths:[], weaknesses:[], improvementPlan:[], improvedResume:null, keyInsight:"". Resume: ${extractedContent}` }
      ],
      thinking: { type: 'disabled' },
    })

    let analysisText = analysisResponse.choices[0]?.message?.content || ''
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    if (jsonMatch) analysisText = jsonMatch[0]
    
    let analysis
    try { analysis = JSON.parse(analysisText) } catch { analysis = { overallScore: 50, keyInsight: 'Analysis parsing error' } }

    console.log('Analysis complete')
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ success: true, extractedContent, analysis }))
  } catch(e: any) {
    console.error('Error:', e.message)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: e.message }))
  }
})

server.listen(PORT, () => {
  console.log(`Resume Analyzer Node service running on port ${PORT}`)
})
