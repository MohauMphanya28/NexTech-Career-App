import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/career-documents — Fetch all documents for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')

    if (!userId) {
      // Get the most recent user if no userId provided
      const users = await db.user.findMany({ take: 1, orderBy: { createdAt: 'desc' } })
      if (users.length === 0) {
        return NextResponse.json({ success: true, documents: [] })
      }
    }

    const effectiveUserId = userId || (await db.user.findFirst({ orderBy: { createdAt: 'desc' } }))?.id

    if (!effectiveUserId) {
      return NextResponse.json({ success: true, documents: [] })
    }

    const [resumes, coverLetters, interviews] = await Promise.all([
      db.resume.findMany({
        where: { userId: effectiveUserId },
        orderBy: { createdAt: 'desc' },
      }),
      db.coverLetter.findMany({
        where: { userId: effectiveUserId },
        orderBy: { createdAt: 'desc' },
      }),
      db.interview.findMany({
        where: { userId: effectiveUserId },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Combine into a unified timeline
    const documents = [
      ...resumes.map((r) => ({
        id: r.id,
        type: 'resume' as const,
        subType: r.type as 'built' | 'analyzed' | 'improved',
        title: r.title,
        atsScore: r.atsScore,
        originalFileName: r.originalFileName,
        createdAt: r.createdAt.toISOString(),
        summary: r.summary,
        skills: (() => { try { return JSON.parse(r.skills) } catch { return [] } })(),
        personalInfo: (() => { try { return JSON.parse(r.personalInfo) } catch { return {} } })(),
        hasAnalysis: r.analysisData && r.analysisData !== '{}',
      })),
      ...coverLetters.map((cl) => ({
        id: cl.id,
        type: 'cover-letter' as const,
        subType: 'generated' as const,
        title: cl.title,
        jobTitle: cl.jobTitle,
        company: cl.company,
        tone: cl.tone,
        createdAt: cl.createdAt.toISOString(),
        wordCount: cl.content ? cl.content.trim().split(/\s+/).filter(Boolean).length : 0,
      })),
      ...interviews.map((iv) => ({
        id: iv.id,
        type: 'interview' as const,
        subType: 'practice' as const,
        title: `${iv.industry} Interview`,
        industry: iv.industry,
        overallScore: iv.overallScore,
        confidence: iv.confidence,
        clarity: iv.clarity,
        relevance: iv.relevance,
        completed: iv.completed,
        createdAt: iv.createdAt.toISOString(),
      })),
    ]

    // Sort by creation date (newest first)
    documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ success: true, documents, userId: effectiveUserId })
  } catch (error) {
    console.error('Fetch documents error:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

// POST /api/career-documents — Save a document
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { docType, userId, ...docData } = data

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    let result

    if (docType === 'resume') {
      result = await db.resume.create({
        data: {
          userId,
          title: docData.title || 'Untitled Resume',
          type: docData.subType || 'built',
          personalInfo: JSON.stringify(docData.personalInfo || {}),
          summary: docData.summary || '',
          experience: JSON.stringify(docData.experience || []),
          education: JSON.stringify(docData.education || []),
          skills: JSON.stringify(docData.skills || []),
          template: docData.template || 'modern',
          atsScore: docData.atsScore || 0,
          content: JSON.stringify(docData.content || {}),
          analysisData: JSON.stringify(docData.analysisData || {}),
          originalFileName: docData.originalFileName || '',
        },
      })
    } else if (docType === 'cover-letter') {
      result = await db.coverLetter.create({
        data: {
          userId,
          title: docData.title || `${docData.jobTitle} at ${docData.company}`,
          jobTitle: docData.jobTitle || '',
          company: docData.company || '',
          jobDesc: docData.jobDesc || '',
          content: docData.content || '',
          tone: docData.tone || 'formal',
        },
      })
    } else if (docType === 'interview') {
      result = await db.interview.create({
        data: {
          userId,
          type: docData.interviewType || 'general',
          industry: docData.industry || 'general',
          questions: JSON.stringify(docData.questions || []),
          answers: JSON.stringify(docData.answers || []),
          feedback: JSON.stringify(docData.feedback || []),
          overallScore: docData.overallScore || 0,
          confidence: docData.confidence || 0,
          clarity: docData.clarity || 0,
          relevance: docData.relevance || 0,
          completed: docData.completed ?? true,
        },
      })
    } else {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, document: result })
  } catch (error) {
    console.error('Save document error:', error)
    return NextResponse.json({ error: 'Failed to save document' }, { status: 500 })
  }
}

// DELETE /api/career-documents?id=xxx&type=resume — Delete a document
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    const type = req.nextUrl.searchParams.get('type')

    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type required' }, { status: 400 })
    }

    if (type === 'resume') {
      await db.resume.delete({ where: { id } })
    } else if (type === 'cover-letter') {
      await db.coverLetter.delete({ where: { id } })
    } else if (type === 'interview') {
      await db.interview.delete({ where: { id } })
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
