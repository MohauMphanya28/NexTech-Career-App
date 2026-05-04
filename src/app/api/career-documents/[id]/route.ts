import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/career-documents/[id]?type=resume — Get a single document
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const type = req.nextUrl.searchParams.get('type')

    if (!type) {
      return NextResponse.json({ error: 'Type parameter required' }, { status: 400 })
    }

    let document

    if (type === 'resume') {
      document = await db.resume.findUnique({ where: { id } })
      if (document) {
        document.personalInfo = JSON.parse(document.personalInfo || '{}')
        document.experience = JSON.parse(document.experience || '[]')
        document.education = JSON.parse(document.education || '[]')
        document.skills = JSON.parse(document.skills || '[]')
        document.content = JSON.parse(document.content || '{}')
        document.analysisData = JSON.parse(document.analysisData || '{}')
      }
    } else if (type === 'cover-letter') {
      document = await db.coverLetter.findUnique({ where: { id } })
    } else if (type === 'interview') {
      document = await db.interview.findUnique({ where: { id } })
      if (document) {
        document.questions = JSON.parse(document.questions || '[]')
        document.answers = JSON.parse(document.answers || '[]')
        document.feedback = JSON.parse(document.feedback || '[]')
      }
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, document })
  } catch (error) {
    console.error('Fetch document error:', error)
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
  }
}
