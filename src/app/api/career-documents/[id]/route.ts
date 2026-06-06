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

// PUT /api/career-documents/[id] — Update an existing document
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { type, ...docData } = body

    if (!type) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 })
    }

    const validTypes = ['resume', 'cover-letter', 'interview']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid document type. Must be one of: resume, cover-letter, interview' }, { status: 400 })
    }

    let updatedDoc

    if (type === 'resume') {
      // Verify the resume exists
      const existing = await db.resume.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
      }

      // Build update data — only include fields that are provided
      const updateData: Record<string, unknown> = {}
      if (docData.title !== undefined) updateData.title = docData.title
      if (docData.subType !== undefined) updateData.type = docData.subType
      if (docData.personalInfo !== undefined) updateData.personalInfo = JSON.stringify(docData.personalInfo)
      if (docData.summary !== undefined) updateData.summary = docData.summary
      if (docData.experience !== undefined) updateData.experience = JSON.stringify(docData.experience)
      if (docData.education !== undefined) updateData.education = JSON.stringify(docData.education)
      if (docData.skills !== undefined) updateData.skills = JSON.stringify(docData.skills)
      if (docData.template !== undefined) updateData.template = docData.template
      if (docData.atsScore !== undefined) updateData.atsScore = docData.atsScore
      if (docData.content !== undefined) updateData.content = JSON.stringify(docData.content)
      if (docData.analysisData !== undefined) updateData.analysisData = JSON.stringify(docData.analysisData)
      if (docData.originalFileName !== undefined) updateData.originalFileName = docData.originalFileName

      updatedDoc = await db.resume.update({
        where: { id },
        data: updateData,
      })
    } else if (type === 'cover-letter') {
      // Verify the cover letter exists
      const existing = await db.coverLetter.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 })
      }

      const updateData: Record<string, unknown> = {}
      if (docData.title !== undefined) updateData.title = docData.title
      if (docData.jobTitle !== undefined) updateData.jobTitle = docData.jobTitle
      if (docData.company !== undefined) updateData.company = docData.company
      if (docData.jobDesc !== undefined) updateData.jobDesc = docData.jobDesc
      if (docData.content !== undefined) updateData.content = docData.content
      if (docData.tone !== undefined) updateData.tone = docData.tone

      updatedDoc = await db.coverLetter.update({
        where: { id },
        data: updateData,
      })
    } else if (type === 'interview') {
      // Verify the interview exists
      const existing = await db.interview.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
      }

      const updateData: Record<string, unknown> = {}
      if (docData.interviewType !== undefined) updateData.type = docData.interviewType
      if (docData.industry !== undefined) updateData.industry = docData.industry
      if (docData.questions !== undefined) updateData.questions = JSON.stringify(docData.questions)
      if (docData.answers !== undefined) updateData.answers = JSON.stringify(docData.answers)
      if (docData.feedback !== undefined) updateData.feedback = JSON.stringify(docData.feedback)
      if (docData.overallScore !== undefined) updateData.overallScore = docData.overallScore
      if (docData.confidence !== undefined) updateData.confidence = docData.confidence
      if (docData.clarity !== undefined) updateData.clarity = docData.clarity
      if (docData.relevance !== undefined) updateData.relevance = docData.relevance
      if (docData.completed !== undefined) updateData.completed = docData.completed

      updatedDoc = await db.interview.update({
        where: { id },
        data: updateData,
      })
    }

    return NextResponse.json({ success: true, document: updatedDoc })
  } catch (error) {
    console.error('Update document error:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}
