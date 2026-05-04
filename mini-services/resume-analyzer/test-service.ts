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

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    console.log('Request received:', req.method)
    
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } })
    }

    try {
      const body = await req.json()
      console.log('Body parsed, mimeType:', body.mimeType)
      
      const { fileBase64, mimeType, jobTarget } = body

      if (!fileBase64 || !mimeType) {
        return Response.json({ error: 'Missing fields' }, { status: 400 })
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

      console.log('Analysis complete, returning response')
      return Response.json({ success: true, extractedContent, analysis }, { headers: { 'Access-Control-Allow-Origin': '*' } })
    } catch(e: any) {
      console.error('Error:', e.message)
      return Response.json({ error: e.message }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } })
    }
  },
})

console.log(`Test service running on port ${PORT}`)
