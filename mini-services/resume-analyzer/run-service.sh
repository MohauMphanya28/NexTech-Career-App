#!/bin/bash
cd /home/z/my-project
exec node -e '
const http = require("http")
const ZAI = require("z-ai-web-dev-sdk").default
const { PDFParse } = require("pdf-parse")
const path = require("path")
const mammoth = require("mammoth")

process.on("uncaughtException", (err) => { console.error("UNCAUGHT:", err.message); process.exit(1) })
process.on("unhandledRejection", (r) => { console.error("REJECTION:", r); process.exit(1) })

const PORT = 3031

let zaiInstance = null
async function getZAI() {
  if (!zaiInstance) zaiInstance = await ZAI.create()
  return zaiInstance
}

async function extractTextFromPdf(base64) {
  const buffer = Buffer.from(base64, "base64")
  const uint8 = new Uint8Array(buffer)
  let opts = {}
  try {
    const p = require.resolve("pdfjs-dist/package.json")
    opts = { standardFontDataUrl: path.join(path.dirname(p), "standard_fonts") + "/" }
  } catch {}
  const parser = new PDFParse(uint8, opts)
  await parser.load()
  const result = await parser.getText()
  return result.text || ""
}

async function extractTextFromDocx(base64) {
  const buffer = Buffer.from(base64, "base64")
  const result = await mammoth.extractRawText({ buffer })
  return result.value || ""
}

function extractTextFromTxt(base64) {
  return Buffer.from(base64, "base64").toString("utf-8")
}

async function extractText(base64, mimeType) {
  if (mimeType === "application/pdf") return extractTextFromPdf(base64)
  if (mimeType.includes("word") || mimeType.includes("document")) return extractTextFromDocx(base64)
  return extractTextFromTxt(base64)
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return }
  if (req.method !== "POST") { res.writeHead(405); res.end(); return }

  let body = ""
  req.on("data", chunk => { body += chunk })
  req.on("end", async () => {
    try {
      const { fileBase64, mimeType, jobTarget } = JSON.parse(body)
      console.log("Request:", mimeType)
      if (!fileBase64 || !mimeType) { res.writeHead(400); res.end(JSON.stringify({error:"Missing fields"})); return }

      let extractedContent = ""
      try { extractedContent = await extractText(fileBase64, mimeType) }
      catch(e) { console.error("Extract err:", e.message); res.writeHead(400); res.end(JSON.stringify({error:"Could not read the resume file. Please ensure it is a valid PDF, DOCX, or TXT file."})); return }

      if (!extractedContent.trim()) { res.writeHead(400); res.end(JSON.stringify({error:"No text extracted"})); return }

      const zai = await getZAI()
      const ctx = jobTarget ? "Target role: "+jobTarget : "General SA job market"
      const r = await zai.chat.completions.create({
        messages: [
          {role:"assistant",content:"You are a resume analyst for the SA job market. Return ONLY valid JSON."},
          {role:"user",content:"Analyze resume. "+ctx+"\\n\\nRESUME:\\n"+extractedContent+"\\n\\nReturn JSON: {overallScore,atsCompatibility:{score,issues:[],tips:[]},contentAnalysis:{summary:{score,feedback,hasSummary},experience:{score,feedback,issues:[],strengths:[]},education:{score,feedback,issues:[],strengths:[]},skills:{score,feedback,missing:[],irrelevant:[]}},strengths:[],weaknesses:[],improvementPlan:[{priority,section,issue,suggestion,example}],improvedResume:{personalInfo:{fullName,email,phone,location,linkedin},summary,experience:[{title,company,period,description}],education:[{degree,institution,year}],skills:[],atsScore},keyInsight}. UK English."}
        ],
        thinking:{type:"disabled"}
      })

      let t = r.choices[0]?.message?.content || ""
      const m = t.match(/\\{[\\s\\S]*\\}/)
      if (m) t = m[0]
      let analysis
      try { analysis = JSON.parse(t) } catch { analysis = {overallScore:50,atsCompatibility:{score:45,issues:[],tips:[]},contentAnalysis:{summary:{score:40,feedback:"Needs improvement",hasSummary:false},experience:{score:45,feedback:"Needs detail",issues:[],strengths:[]},education:{score:50,feedback:"Adequate",issues:[],strengths:[]},skills:{score:40,feedback:"Expand",missing:[],irrelevant:[]}},strengths:[],weaknesses:[],improvementPlan:[],improvedResume:null,keyInsight:"Keep improving!"} }

      console.log("Done, score:", analysis.overallScore)
      res.writeHead(200,{"Content-Type":"application/json"})
      res.end(JSON.stringify({success:true,extractedContent,analysis}))
    } catch(e) {
      console.error("Error:", e.message)
      if (!res.headersSent) { res.writeHead(500); res.end(JSON.stringify({error:e.message})) }
    }
  })
})

server.timeout = 180000
server.listen(PORT, () => { console.log("Resume Analyzer on port "+PORT); getZAI().then(()=>console.log("ZAI ready")) })
'
